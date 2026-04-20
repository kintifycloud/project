export type CheckoutPlan = "pro" | "team" | "enterprise";

export function buildCheckoutUrl(plan: CheckoutPlan): string {
  return `/api/checkout?plan=${plan}`;
}

export function getCheckoutSuccessUrl(plan: CheckoutPlan): string {
  return `/pricing?checkout=success&plan=${plan}`;
}

export function getCheckoutCancelUrl(plan: CheckoutPlan): string {
  return `/pricing?checkout=cancel&plan=${plan}`;
}
