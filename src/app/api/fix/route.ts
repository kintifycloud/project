import { logs } from '@opentelemetry/api-logs';
import '../../../lib/otel-init';
import { supabase } from '../../../lib/supabase';
import { classifyIssue, type IssueClassification } from '@/lib/classifier';
import { routeFixDecision } from '@/lib/llmRouter';
import { VAGUE_INPUT_DECISION, toStrictDecision, type FixDecision } from '@/lib/normalize';
import { type FixThreadContext, type FixThreadTurn } from '@/lib/fixPrompt';
import { assertHighQuality } from '@/lib/qualityCheck';
import { rewriteDecisionToNaturalText } from '@/lib/outputRewriter';
// import { buildTracePrompt } from '@/lib/tracePrompt'; // Unused - reserved for future trace feature

type ProviderName = "gemini" | "deepseek" | "mistral" | "openrouter";

const FIX_RATE_LIMIT_MAX_REQUESTS = 5;
const FIX_RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000;
const FIX_FREE_LIMIT = 5;
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
      error: 'Free limit reached',
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

function buildEmergencyDecision(classification: IssueClassification): FixDecision {
  if (classification === 'api') {
    return {
      action: 'Inspect distributed traces for slow endpoints and database connection pool saturation before rolling back the deployment',
      confidence: '82',
      blastRadius: 'service',
      safety: 'Preserve current deployment revision and distributed trace data before revert',
    };
  }

  if (classification === 'kubernetes') {
    return {
      action: 'Inspect pod events for exit codes, probe failures, or OOMKill events to identify startup failure cause',
      confidence: '80',
      blastRadius: 'pod',
      safety: 'Keep previous ReplicaSet ready for immediate rollback if config issue confirmed',
    };
  }

  if (classification === 'docker') {
    return {
      action: 'Inspect container exit code and restart count to identify entrypoint failure or resource constraint',
      confidence: '78',
      blastRadius: 'pod',
      safety: 'Preserve current container configuration and environment variables before image replacement',
    };
  }

  if (classification === 'infra') {
    return {
      action: 'Inspect certificate chain validity and DNS record propagation before reverting infrastructure changes',
      confidence: '81',
      blastRadius: 'infra',
      safety: 'Export current certificate bundle and DNS records before any modifications',
    };
  }

  return {
    action: 'Inspect error patterns and recent configuration changes to identify the specific failure point',
    confidence: '74',
    blastRadius: 'unknown',
    safety: 'Document current state and preserve configuration snapshots before any changes',
  };
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

    const body = await req.json();
    const input = body.input?.trim();
    const browserId = body.browserId?.trim() || '';
    const threadContext = parseThreadContext(body.thread);

    const rateLimitResponse = getRateLimitResponse(req);
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

    // Check Supabase usage limit if browser_id is provided
    let usageCount = 0;
    let usageLimitReached = false;

    if (browserId && supabase) {
      try {
        const { data, error } = await supabase
          .from('fix_usage')
          .select('usage_count')
          .eq('browser_id', browserId)
          .maybeSingle();

        if (error) {
          console.warn('[Supabase] Usage check failed:', error);
        } else if (data && data.usage_count !== undefined) {
          usageCount = data.usage_count;
          if (usageCount >= FIX_FREE_LIMIT) {
            usageLimitReached = true;
          }
        }
      } catch (error) {
        console.warn('[Supabase] Usage check error:', error);
      }
    }

    if (usageLimitReached) {
      logger.emit({
        severityText: 'WARN',
        body: 'Free limit reached',
        attributes: {
          'api.route': '/api/fix',
          'browser_id': browserId,
          'usage_count': String(usageCount),
        },
      });
      return Response.json({
        error: 'Free limit reached',
      }, {
        status: 429,
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
      saveFixHistory(input, naturalText, "openrouter");

      // Increment usage count in Supabase on successful vague input fallback response
      if (browserId && supabase) {
        try {
          const { error: upsertError } = await supabase
            .from('fix_usage')
            .upsert({
              browser_id: browserId,
              usage_count: usageCount + 1,
              last_used_at: new Date().toISOString(),
            }, {
              onConflict: 'browser_id',
            });

          if (upsertError) {
            console.warn('[Supabase] Usage increment failed:', upsertError);
          } else {
            console.log('[Supabase] Usage incremented successfully for browser:', browserId);
          }
        } catch (error) {
          console.warn('[Supabase] Usage increment error:', error);
        }
      }

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
      const decision = assertHighQuality(toStrictDecision(routed.decision), input);
      const naturalText = rewriteDecisionToNaturalText(decision);

      // Generate trace summary
      const traceText = buildContextualTrace(classification.type, input, decision.action);

      console.log(`[Fix API] Using provider ${routed.provider}`);
      saveFixHistory(input, naturalText, routed.provider);

      // Increment usage count in Supabase on successful response
      if (browserId && supabase) {
        try {
          const { error: upsertError } = await supabase
            .from('fix_usage')
            .upsert({
              browser_id: browserId,
              usage_count: usageCount + 1,
              last_used_at: new Date().toISOString(),
            }, {
              onConflict: 'browser_id',
            });

          if (upsertError) {
            console.warn('[Supabase] Usage increment failed:', upsertError);
          } else {
            console.log('[Supabase] Usage incremented successfully for browser:', browserId);
          }
        } catch (error) {
          console.warn('[Supabase] Usage increment error:', error);
        }
      }

      logger.emit({
        severityText: 'INFO',
        body: 'Decision generated successfully',
        attributes: {
          'api.route': '/api/fix',
          'provider': routed.provider,
          'classification.type': classification.type,
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
          'X-Fix-Provider': routed.provider,
          'X-Fix-Classification': classification.type,
        },
      });
    } catch (error) {
      const fallbackDecision = buildEmergencyDecision(classification.type);
      const safeDecision = assertHighQuality(toStrictDecision(fallbackDecision), input);
      const naturalText = rewriteDecisionToNaturalText(safeDecision);
      const traceText = buildContextualTrace(classification.type, input, safeDecision.action);
      const message = error instanceof Error ? error.message : String(error);

      console.log(`[Fix API] Falling back to emergency decision: ${message}`);
      saveFixHistory(input, naturalText, 'openrouter');

      // Increment usage count in Supabase on successful emergency fallback response
      if (browserId && supabase) {
        try {
          const { error: upsertError } = await supabase
            .from('fix_usage')
            .upsert({
              browser_id: browserId,
              usage_count: usageCount + 1,
              last_used_at: new Date().toISOString(),
            }, {
              onConflict: 'browser_id',
            });

          if (upsertError) {
            console.warn('[Supabase] Usage increment failed:', upsertError);
          } else {
            console.log('[Supabase] Usage incremented successfully for browser:', browserId);
          }
        } catch (error) {
          console.warn('[Supabase] Usage increment error:', error);
        }
      }

      logger.emit({
        severityText: 'WARN',
        body: 'Provider failed, using emergency decision',
        attributes: {
          'api.route': '/api/fix',
          'error.message': message,
          'response.type': 'emergency',
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
