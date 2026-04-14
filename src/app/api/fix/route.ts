import { logs } from '@opentelemetry/api-logs';
import '../../../lib/otel-init';
import { supabase } from '../../../lib/supabase';
import { classifyIssue, type IssueClassification } from '@/lib/classifier';
import { routeFixDecision } from '@/lib/llmRouter';
import { VAGUE_INPUT_DECISION, toStrictDecision, type FixDecision } from '@/lib/normalize';
import { type FixThreadContext, type FixThreadTurn } from '@/lib/fixPrompt';
import { assertHighQuality } from '@/lib/qualityCheck';
import { rewriteDecisionToNaturalText } from '@/lib/outputRewriter';

type ProviderName = "gemini" | "deepseek" | "mistral" | "openrouter";

const FIX_RATE_LIMIT_MAX_REQUESTS = 5;
const FIX_RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000;
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
      action: 'Rollback the most recent service deploy or shift traffic to the last stable version before deeper debugging',
      confidence: '82',
      blastRadius: 'service',
      safety: 'Confirm the last healthy release target is available before rollback or traffic shift',
    };
  }

  if (classification === 'kubernetes') {
    return {
      action: 'Pause the rollout and inspect the last terminated pod before applying more cluster changes',
      confidence: '80',
      blastRadius: 'pod',
      safety: 'Keep the previous ReplicaSet ready so you can undo the rollout immediately',
    };
  }

  if (classification === 'docker') {
    return {
      action: 'Stop restart churn and compare the running image and environment against the last healthy container',
      confidence: '78',
      blastRadius: 'pod',
      safety: 'Preserve the last known good image tag and container config before replacing it',
    };
  }

  if (classification === 'infra') {
    return {
      action: 'Revert the most recent infrastructure or edge change before more traffic is affected',
      confidence: '81',
      blastRadius: 'infra',
      safety: 'Verify a tested snapshot, prior config, or certificate bundle is ready before revert',
    };
  }

  return {
    action: 'Freeze recent changes and capture logs, errors, and deploy deltas from the failure window before acting',
    confidence: '74',
    blastRadius: 'unknown',
    safety: 'Avoid new changes until you have a rollback target or backup snapshot ready',
  };
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
      const decision = assertHighQuality(toStrictDecision(routed.decision));
      const naturalText = rewriteDecisionToNaturalText(decision);

      console.log(`[Fix API] Using provider ${routed.provider}`);
      saveFixHistory(input, naturalText, routed.provider);

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
      const safeDecision = assertHighQuality(toStrictDecision(fallbackDecision));
      const naturalText = rewriteDecisionToNaturalText(safeDecision);
      const message = error instanceof Error ? error.message : String(error);

      console.log(`[Fix API] Falling back to emergency decision: ${message}`);
      saveFixHistory(input, naturalText, 'openrouter');

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
