/* ------------------------------------------------------------------ */
/*  API Key Authentication                                             */
/*                                                                     */
/*  Current: static demo key                                           */
/*  Future:  database lookup, billing tier, usage tracking             */
/* ------------------------------------------------------------------ */

export type ApiKeyMeta = {
  id: string;
  tier: "demo" | "free" | "pro" | "enterprise";
  rateLimit: number; // requests per minute
};

const VALID_KEYS: Record<string, ApiKeyMeta> = {
  "demo-key": {
    id: "demo",
    tier: "demo",
    rateLimit: 60,
  },
};

export type AuthResult =
  | { valid: true; meta: ApiKeyMeta }
  | { valid: false; error: string };

export function validateApiKey(key: string | null | undefined): AuthResult {
  if (!key || key.trim().length === 0) {
    return { valid: false, error: "Missing x-api-key header." };
  }

  const meta = VALID_KEYS[key.trim()];

  if (!meta) {
    return { valid: false, error: "Invalid API key." };
  }

  return { valid: true, meta };
}

/* ------------------------------------------------------------------ */
/*  Per-key rate limiting                                              */
/* ------------------------------------------------------------------ */

const keyRequests = new Map<string, number[]>();

const WINDOW_MS = 60_000;

export function isKeyRateLimited(keyId: string, limit: number): boolean {
  const now = Date.now();
  const timestamps = keyRequests.get(keyId) ?? [];
  const recent = timestamps.filter((t) => now - t < WINDOW_MS);

  if (recent.length >= limit) {
    keyRequests.set(keyId, recent);
    return true;
  }

  recent.push(now);
  keyRequests.set(keyId, recent);
  return false;
}
