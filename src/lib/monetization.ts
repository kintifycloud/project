export type KintifyUsage = {
  count: number;
  month: number;
};

export type KintifyPlan = "free" | "pro" | "team" | "enterprise";

export type MonetizationMetricEvent =
  | "fixSuccess"
  | "paywallView"
  | "paywallDismiss"
  | "checkoutClick"
  | "historyLock";

export type MonetizationMetrics = {
  fixes: number;
  paywallViews: number;
  paywallDismissals: number;
  checkoutClicks: number;
  historyLocks: number;
  updatedAt: number;
};

export const KINTIFY_USAGE_KEY = "kintify_usage";
export const KINTIFY_PLAN_KEY = "kintify_plan";
export const KINTIFY_MONETIZATION_METRICS_KEY = "kintify_monetization_metrics";
export const KINTIFY_FREE_FIX_LIMIT = 5;
export const KINTIFY_FREE_HISTORY_PREVIEW = 3;

function getCurrentMonth(): number {
  return new Date().getMonth() + 1;
}

function getDefaultUsage(): KintifyUsage {
  return {
    count: 0,
    month: getCurrentMonth(),
  };
}

export function readKintifyUsage(): KintifyUsage {
  if (typeof window === "undefined") {
    return getDefaultUsage();
  }

  try {
    const raw = window.localStorage.getItem(KINTIFY_USAGE_KEY);
    if (!raw) {
      return getDefaultUsage();
    }

    const parsed = JSON.parse(raw) as { count?: unknown; month?: unknown };
    const count = Number(parsed.count);
    const month = Number(parsed.month);
    const currentMonth = getCurrentMonth();

    if (!Number.isFinite(count) || !Number.isFinite(month) || month !== currentMonth) {
      return getDefaultUsage();
    }

    return {
      count: Math.max(0, Math.floor(count)),
      month: currentMonth,
    };
  } catch {
    return getDefaultUsage();
  }
}

export function writeKintifyUsage(usage: KintifyUsage) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(
    KINTIFY_USAGE_KEY,
    JSON.stringify({
      count: Math.max(0, Math.floor(usage.count)),
      month: getCurrentMonth(),
    } satisfies KintifyUsage),
  );
}

export function incrementKintifyUsage(current?: KintifyUsage): KintifyUsage {
  const active = current ?? readKintifyUsage();
  const normalized = active.month === getCurrentMonth() ? active : getDefaultUsage();
  const nextUsage = {
    count: normalized.count + 1,
    month: getCurrentMonth(),
  } satisfies KintifyUsage;
  writeKintifyUsage(nextUsage);
  return nextUsage;
}

export function getFreeFixesRemaining(usage: KintifyUsage): number {
  return Math.max(KINTIFY_FREE_FIX_LIMIT - usage.count, 0);
}

export function hasReachedFreeFixLimit(usage: KintifyUsage): boolean {
  return usage.count >= KINTIFY_FREE_FIX_LIMIT;
}

export function shouldShowSoftPaywall(usage: KintifyUsage, plan: KintifyPlan): boolean {
  return plan === "free" && getFreeFixesRemaining(usage) === 1;
}

export function readKintifyPlan(): KintifyPlan {
  if (typeof window === "undefined") {
    return "free";
  }

  try {
    const raw = window.localStorage.getItem(KINTIFY_PLAN_KEY);
    return raw === "pro" || raw === "team" || raw === "enterprise" ? raw : "free";
  } catch {
    return "free";
  }
}

export function writeKintifyPlan(plan: KintifyPlan) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(KINTIFY_PLAN_KEY, plan);
  window.dispatchEvent(new Event("kintify:plan-change"));
}

export function hasProAccess(plan: KintifyPlan): boolean {
  return plan === "pro" || plan === "team" || plan === "enterprise";
}

export function hasTeamAccess(plan: KintifyPlan): boolean {
  return plan === "team" || plan === "enterprise";
}

export function hasEnterpriseAccess(plan: KintifyPlan): boolean {
  return plan === "enterprise";
}

function getDefaultMetrics(): MonetizationMetrics {
  return {
    fixes: 0,
    paywallViews: 0,
    paywallDismissals: 0,
    checkoutClicks: 0,
    historyLocks: 0,
    updatedAt: Date.now(),
  };
}

export function trackMonetizationEvent(event: MonetizationMetricEvent) {
  if (typeof window === "undefined") {
    return;
  }

  try {
    const raw = window.localStorage.getItem(KINTIFY_MONETIZATION_METRICS_KEY);
    const current = raw
      ? (JSON.parse(raw) as Partial<MonetizationMetrics>)
      : getDefaultMetrics();

    const next: MonetizationMetrics = {
      fixes: current.fixes ?? 0,
      paywallViews: current.paywallViews ?? 0,
      paywallDismissals: current.paywallDismissals ?? 0,
      checkoutClicks: current.checkoutClicks ?? 0,
      historyLocks: current.historyLocks ?? 0,
      updatedAt: Date.now(),
    };

    if (event === "fixSuccess") next.fixes += 1;
    if (event === "paywallView") next.paywallViews += 1;
    if (event === "paywallDismiss") next.paywallDismissals += 1;
    if (event === "checkoutClick") next.checkoutClicks += 1;
    if (event === "historyLock") next.historyLocks += 1;

    window.localStorage.setItem(KINTIFY_MONETIZATION_METRICS_KEY, JSON.stringify(next));
  } catch {
    // Ignore localStorage errors.
  }
}
