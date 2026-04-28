import { logs } from '@opentelemetry/api-logs';
import '../../../lib/otel-init';
import { supabase } from '../../../lib/supabase';
import { isKeyRateLimited, validateApiKey } from '@/lib/auth';
import { classifyIssue, type IssueClassification } from '@/lib/classifier';
import { routeFixDecision } from '@/lib/llmRouter';
import { VAGUE_INPUT_DECISION, toStrictDecision } from '@/lib/normalize';
import { type FixThreadContext, type FixThreadTurn } from '@/lib/fixPrompt';
import { rewriteDecisionToNaturalText } from '@/lib/outputRewriter';
import { recordQuery, recordQueryResponse } from '@/lib/queryStore';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { createEvaluationRecord, cacheResponse, getCachedResponse } from '@/lib/evaluation';

type ProviderName = "gemini" | "deepseek" | "mistral" | "openrouter" | "fallback" | "cache";

const FIX_RATE_LIMIT_MAX_REQUESTS = 5; // STEP 9: Max 5 requests per IP
const FIX_RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000; // 1 hour window
const fixRateLimitStore = new Map<string, { count: number; resetAt: number }>();

function getClientIp(request: Request): string {
  const forwardedFor = request.headers.get('x-forwarded-for');
  if (forwardedFor) {
    return forwardedFor.split(',')[0]?.trim() || 'unknown';
  }
  return request.headers.get('x-real-ip')?.trim() || 'unknown';
}

function getRateLimitResponse(request: Request): Response | null {
  const ip = getClientIp(request);
  const now = Date.now();
  const current = fixRateLimitStore.get(ip);

  if (!current || current.resetAt <= now) {
    fixRateLimitStore.set(ip, {
      count: 1,
      resetAt: now + FIX_RATE_LIMIT_WINDOW_MS,
    });
    return null;
  }

  if (current.count >= FIX_RATE_LIMIT_MAX_REQUESTS) {
    return Response.json({
      error: 'Too many requests. Try again shortly.',
    }, {
      status: 429,
      headers: {
        'Retry-After': String(Math.max(Math.ceil((current.resetAt - now) / 1000), 1)),
      },
    });
  }

  current.count += 1;
  fixRateLimitStore.set(ip, current);
  return null;
}

// Build contextual trace based on classification and input
function buildContextualTrace(
  classification: IssueClassification,
  input: string,
  _action: string
): string {
  // Context: _action parameter reserved for future trace context enrichment
  void _action;
  const lowerInput = input.toLowerCase();

  // API/Latency specific traces
  if (classification === 'api' || lowerInput.includes('latency') || lowerInput.includes('slow')) {
    if (lowerInput.includes('deploy') || lowerInput.includes('after')) {
      return 'Recent deployment likely introduced inefficient queries or resource contention, causing response time degradation under production load.';
    }
    if (lowerInput.includes('database') || lowerInput.includes('query')) {
      return 'Database query patterns likely changed, causing increased response times and potential connection pool exhaustion.';
    }
    return 'Recent changes likely affected API response patterns, causing increased latency under production load conditions.';
  }

  // Kubernetes/CrashLoopBackOff traces
  if (classification === 'kubernetes' || lowerInput.includes('crashloop') || lowerInput.includes('oom')) {
    if (lowerInput.includes('config') || lowerInput.includes('probe')) {
      return 'Configuration changes likely triggered probe failures or startup errors, causing the container to repeatedly restart.';
    }
    if (lowerInput.includes('resource') || lowerInput.includes('memory') || lowerInput.includes('oom')) {
      return 'Resource constraints likely caused the container to exceed memory limits, triggering OOMKilled events and restart cycles.';
    }
    return 'Container configuration changes likely triggered startup failures, resulting in repeated restart cycles under health checks.';
  }

  // Docker traces
  if (classification === 'docker') {
    if (lowerInput.includes('image') || lowerInput.includes('pull')) {
      return 'Image changes likely introduced entrypoint failures or missing dependencies during container initialization.';
    }
    return 'Container configuration or image updates likely introduced compatibility issues during startup.';
  }

  // Infrastructure/DNS/SSL traces
  if (classification === 'infra') {
    if (lowerInput.includes('ssl') || lowerInput.includes('tls') || lowerInput.includes('cert')) {
      return 'Certificate changes likely caused TLS handshake failures or validation errors, blocking secure connections.';
    }
    if (lowerInput.includes('dns') || lowerInput.includes('resolve')) {
      return 'DNS record changes likely caused resolution failures or propagation delays, preventing service connectivity.';
    }
    if (lowerInput.includes('cloudflare') || lowerInput.includes('cdn')) {
      return 'Edge configuration changes likely caused cache misses or origin connectivity issues, affecting request routing.';
    }
    return 'Infrastructure changes likely caused connectivity or configuration validation issues between services.';
  }

  return 'Recent system changes likely triggered the observed failure pattern.';
}

function toThreadText(value: unknown, maxLength: number): string {
  if (typeof value !== "string") {
    return "";
  }
  return value.trim().slice(0, maxLength);
}

function parseThreadContext(raw: unknown): FixThreadContext | null {
  if (!raw || typeof raw !== "object") {
    return null;
  }

  const maybe = raw as {
    sessionId?: unknown;
    originalIssue?: unknown;
    previousAnswer?: unknown;
    recentMessages?: unknown;
    isFollowUp?: unknown;
  };

  const originalIssue = toThreadText(maybe.originalIssue, 1200);
  const previousAnswer = toThreadText(maybe.previousAnswer, 1200);
  const sessionId = toThreadText(maybe.sessionId, 120);
  const isFollowUp = maybe.isFollowUp === true;
  const recentMessages = Array.isArray(maybe.recentMessages)
    ? maybe.recentMessages
        .map((entry) => {
          const item = entry as { user?: unknown; assistant?: unknown } | null;
          const user = toThreadText(item?.user, 600);
          const assistant = toThreadText(item?.assistant, 600);

          if (!user || !assistant) {
            return null;
          }

          return { user, assistant } satisfies FixThreadTurn;
        })
        .filter((entry): entry is FixThreadTurn => entry !== null)
        .slice(-3)
    : [];

  if (!isFollowUp || !originalIssue || !previousAnswer) {
    return null;
  }

  return {
    ...(sessionId ? { sessionId } : {}),
    originalIssue,
    previousAnswer,
    recentMessages,
    isFollowUp: true,
  };
}

async function saveFixHistory(userInput: string, aiOutput: string, provider: ProviderName): Promise<void> {
  if (!supabase) {
    console.warn('[Supabase] Fix history not saved - client not initialized');
    return;
  }

  try {
    const { error } = await supabase
      .from('fix_history')
      .insert({
        user_input: userInput,
        ai_output: aiOutput,
        provider: provider,
      });

    if (error) {
      console.error('[Supabase] Failed to save fix history:', error);
    } else {
      console.log('[Supabase] Fix history saved');
    }
  } catch (error) {
    console.error('[Supabase] Error saving fix history:', error);
  }
}

async function recordEnterpriseApiAudit(payload: {
  action: string;
  userEmail: string;
  organizationId: string;
  metadata?: Record<string, unknown>;
}): Promise<void> {
  if (!supabaseAdmin) {
    return;
  }

  try {
    const { error } = await supabaseAdmin.from('audit_logs').insert({
      action: payload.action,
      organization_id: payload.organizationId,
      user_id: null,
      user_email: payload.userEmail,
      metadata: payload.metadata ?? {},
    });

    if (error) {
      console.error('[Enterprise Audit] Failed to record audit log:', error.message);
    }
  } catch (error) {
    console.error('[Enterprise Audit] Error recording audit log:', error);
  }
}

export async function POST(req: Request) {
  try {
    const logger = logs.getLogger('kintifycloud');
    const startTime = Date.now();

    const logRecord = {
      severityText: 'INFO',
      body: 'SRE-grade decision engine request',
      attributes: {
        'service.name': 'kintifycloud',
        'service.version': '0.1.0',
        'api.route': '/api/fix',
        'request.timestamp': new Date().toISOString(),
      },
    };
    logger.emit(logRecord);

    const apiKey = req.headers.get('x-api-key');
    const apiKeyAuth = apiKey ? validateApiKey(apiKey) : null;

    if (apiKey && (!apiKeyAuth || !apiKeyAuth.valid)) {
      return Response.json({
        error: apiKeyAuth?.error ?? 'Invalid API key.',
      }, { status: 401 });
    }

    const body = await req.json();
    const input = body.input?.trim();
    const threadContext = parseThreadContext(body.thread);
    // const browserIdRaw = body.browserId?.trim() || req.headers.get('x-kintify-browser-id')?.trim();
    // const browserId = browserIdRaw || undefined;

    const isEnterpriseApiRequest = apiKeyAuth?.valid === true && apiKeyAuth.meta.tier === 'enterprise';
    const isPriorityRequest = req.headers.get('x-kintify-priority') === 'true' || body.priority === true || isEnterpriseApiRequest;
    const enterpriseUserEmail = req.headers.get('x-enterprise-user-email')?.trim().toLowerCase() || 'enterprise-api@kintify.cloud';
    const priorityTier = isEnterpriseApiRequest ? 'enterprise' : isPriorityRequest ? 'paid' : 'standard';

    if (apiKeyAuth?.valid) {
      if (isKeyRateLimited(apiKeyAuth.meta.id, apiKeyAuth.meta.rateLimit)) {
        return Response.json({
          error: 'API key rate limit exceeded. Try again shortly.',
        }, { status: 429 });
      }
    }

    const rateLimitResponse = apiKeyAuth?.valid ? null : getRateLimitResponse(req);
    if (rateLimitResponse) {
      logger.emit({
        severityText: 'WARN',
        body: 'Rate limit exceeded',
        attributes: {
          'api.route': '/api/fix',
          'rate.limit.exceeded': 'true',
        },
      });
      return rateLimitResponse;
    }

    if (!input) {
      logger.emit({
        severityText: 'WARN',
        body: 'Invalid request: missing input',
        attributes: {
          'api.route': '/api/fix',
          'error.type': 'validation',
        },
      });
      return Response.json({
        error: "Input is required",
      }, { status: 400 });
    }

    await recordQuery({ text: input });

    // Check cache for proven patterns (Data Moat: STEP 5)
    const cachedResponse = await getCachedResponse(input);
    if (cachedResponse) {
      const classification = await classifyIssue(input);
      const traceText = buildContextualTrace(classification.type, input, cachedResponse);
      await recordQueryResponse(input, cachedResponse);
      saveFixHistory(input, cachedResponse, "cache");

      logger.emit({
        severityText: 'INFO',
        body: 'Returning cached response from proven patterns',
        attributes: {
          'api.route': '/api/fix',
          'response.type': 'cached',
          'processing.time.ms': String(Date.now() - startTime),
        },
      });

      return Response.json({
        answer: cachedResponse,
        trace: traceText,
      }, {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'X-Fix-Provider': 'cache',
          'X-Fix-Classification': classification.type,
          'X-Kintify-Priority-Tier': priorityTier,
        },
      });
    }

    if (!process.env.GEMINI_API_KEY && !process.env.DEEPSEEK_API_KEY && !process.env.MISTRAL_API_KEY && !process.env.OPENROUTER_API_KEY) {
      logger.emit({
        severityText: 'ERROR',
        body: 'Server not configured: no API keys available',
        attributes: {
          'api.route': '/api/fix',
          'error.type': 'configuration',
        },
      });
      return Response.json({
        error: "Server is not configured",
      }, { status: 500 });
    }

    const classification = await classifyIssue(input);
    console.log(`[Fix API] Classification ${classification.type}: ${classification.reason}`);
    
    if (threadContext?.isFollowUp) {
      console.log(`[Fix API] Continuing issue thread${threadContext.sessionId ? ` ${threadContext.sessionId}` : ""} with ${threadContext.recentMessages.length} prior follow-up turns`);
    }

    logger.emit({
      severityText: 'INFO',
      body: 'Issue classified',
      attributes: {
        'api.route': '/api/fix',
        'classification.type': classification.type,
        'classification.isVague': String(classification.isVague),
      },
    });

    if (classification.isVague) {
      const decision = toStrictDecision(VAGUE_INPUT_DECISION);
      const naturalText = rewriteDecisionToNaturalText(decision);
      const traceText = buildContextualTrace(classification.type, input, decision.action);
      await recordQueryResponse(input, naturalText);
      saveFixHistory(input, naturalText, "openrouter");

      logger.emit({
        severityText: 'INFO',
        body: 'Vague input detected, returning fallback response',
        attributes: {
          'api.route': '/api/fix',
          'response.type': 'fallback',
          'processing.time.ms': String(Date.now() - startTime),
        },
      });

      return Response.json({
        answer: naturalText,
        trace: traceText,
      }, {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'X-Fix-Provider': 'fallback',
          'X-Fix-Classification': classification.type,
          'X-Kintify-Priority-Tier': priorityTier,
        },
      });
    }

    try {
      const routed = await routeFixDecision(threadContext ? {
        input,
        classification: classification.type,
        threadContext,
      } : {
        input,
        classification: classification.type,
      });
      
      // New format: raw is plain text, use directly
      const naturalText = routed.raw;

      // Generate trace summary (use plain text as action)
      const traceText = buildContextualTrace(classification.type, input, naturalText);

      console.log(`[Fix API] Using provider ${routed.provider}`);
      await recordQueryResponse(input, naturalText);
      saveFixHistory(input, naturalText, routed.provider);

      // Create evaluation record (STEP 1 & 5)
      const evaluation = await createEvaluationRecord({
        input,
        output: naturalText,
        modelUsed: routed.provider,
      });
      console.log(`[Fix API] Evaluation score: ${evaluation.score}, valid: ${evaluation.isValid}`);

      // Cache high-quality responses (STEP 11)
      if (evaluation.score >= 70) {
        await cacheResponse({
          input,
          output: naturalText,
          modelUsed: routed.provider,
          score: evaluation.score,
        });
      }

      logger.emit({
        severityText: 'INFO',
        body: 'Decision generated successfully',
        attributes: {
          'api.route': '/api/fix',
          'provider': routed.provider,
          'classification.type': classification.type,
          'priority.tier': priorityTier,
          'processing.time.ms': String(Date.now() - startTime),
        },
      });

      if (isEnterpriseApiRequest && apiKeyAuth.meta.organizationId) {
        await recordEnterpriseApiAudit({
          action: 'fix.api.generated',
          organizationId: apiKeyAuth.meta.organizationId,
          userEmail: enterpriseUserEmail,
          metadata: {
            classification: classification.type,
            provider: routed.provider,
            priorityTier,
          },
        });
      }

      return Response.json({
        answer: naturalText,
        trace: traceText,
        evaluationId: evaluation.isValid ? null : undefined, // Only include if we want to track feedback
      }, {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'X-Fix-Provider': routed.provider,
          'X-Fix-Classification': classification.type,
          'X-Kintify-Priority-Tier': priorityTier,
        },
      });
    } catch (error) {
      // New format fallback message
      const naturalText = "Likely unclear issue. Check logs and recent changes to isolate failure.";
      const traceText = buildContextualTrace(classification.type, input, naturalText);
      const message = error instanceof Error ? error.message : String(error);

      console.log(`[Fix API] Falling back to emergency decision: ${message}`);
      await recordQueryResponse(input, naturalText);
      saveFixHistory(input, naturalText, 'fallback');

      // Create evaluation record for fallback (STEP 1 & 5)
      const evaluation = await createEvaluationRecord({
        input,
        output: naturalText,
        modelUsed: 'fallback',
      });
      console.log(`[Fix API] Fallback evaluation score: ${evaluation.score}, valid: ${evaluation.isValid}`);

      logger.emit({
        severityText: 'WARN',
        body: 'Provider failed, using emergency decision',
        attributes: {
          'api.route': '/api/fix',
          'error.message': message,
          'response.type': 'emergency',
          'priority.tier': priorityTier,
          'processing.time.ms': String(Date.now() - startTime),
        },
      });

      if (isEnterpriseApiRequest && apiKeyAuth.meta.organizationId) {
        await recordEnterpriseApiAudit({
          action: 'fix.api.fallback',
          organizationId: apiKeyAuth.meta.organizationId,
          userEmail: enterpriseUserEmail,
          metadata: {
            classification: classification.type,
            priorityTier,
            error: message,
          },
        });
      }

      return Response.json({
        answer: naturalText,
        trace: traceText,
      }, {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'X-Fix-Provider': 'fallback',
          'X-Fix-Classification': classification.type,
          'X-Kintify-Priority-Tier': priorityTier,
        },
      });
    }
  } catch (error) {
    const logger = logs.getLogger('kintifycloud');
    const message = error instanceof Error ? error.message : String(error);
    
    logger.emit({
      severityText: 'ERROR',
      body: 'Unhandled error in decision engine',
      attributes: {
        'api.route': '/api/fix',
        'error.message': message,
      },
    });
    
    return Response.json({
      error: "Failed to analyze issue. Please try again.",
    }, { status: 500 });
  }
}
