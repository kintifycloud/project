import { NextResponse } from "next/server";

const PLAN_TO_ENV_KEY = {
  pro: "STRIPE_CHECKOUT_URL_PRO",
  team: "STRIPE_CHECKOUT_URL_TEAM",
  enterprise: "STRIPE_CHECKOUT_URL_ENTERPRISE",
} as const;

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const planParam = searchParams.get("plan");
  const plan = planParam === "enterprise" ? "enterprise" : planParam === "team" ? "team" : planParam === "pro" ? "pro" : null;

  if (!plan) {
    return NextResponse.redirect(new URL("/pricing?checkout=cancel", origin));
  }

  const checkoutUrl = process.env[PLAN_TO_ENV_KEY[plan]];

  if (checkoutUrl) {
    return NextResponse.redirect(checkoutUrl);
  }

  return NextResponse.redirect(new URL(`/checkout/success?plan=${plan}&demo=1`, origin));
}
