"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ArrowRight, CheckCircle2 } from "lucide-react";

import { buildCheckoutUrl } from "@/lib/checkout";

const plans = [
  {
    name: "Free",
    price: "$0",
    description: "Try Kintify Fix and get value before you pay.",
    features: [
      "5 fixes per month",
      "Answer-first troubleshooting",
      "Basic history preview",
    ],
    href: "/fix",
    cta: "Start free",
    highlighted: false,
  },
  {
    name: "Pro",
    price: "$19",
    description: "For individual developers who use /fix actively.",
    features: [
      "Unlimited fixes",
      "Faster responses with priority routing",
      "Full history access",
      "Pro UX: re-run, advanced keyboard flow, faster iteration",
    ],
    href: buildCheckoutUrl("pro"),
    cta: "Upgrade to Pro",
    highlighted: true,
  },
  {
    name: "Team",
    price: "$79",
    description: "For teams that share fixes, run incident workflows together, and compound knowledge.",
    features: [
      "Shared history across your team",
      "Incident status workflows with shareable links",
      "Multi-user access with owner/member roles",
      "Team-wide unlimited fixes",
      "Simple invites via email or link",
    ],
    href: buildCheckoutUrl("team"),
    cta: "Start Team",
    highlighted: false,
  },
  {
    name: "Enterprise",
    price: "Custom",
    description: "For production organizations that need audit visibility, SLA measurement, RBAC, exports, and secure processing.",
    features: [
      "Organizations with teams, users, and incidents",
      "Audit logs and incident timelines",
      "SLA dashboard with exports and weekly reports",
      "Admin / Engineer / Viewer RBAC",
      "Priority processing and API access",
    ],
    href: "/contact",
    cta: "Contact Sales",
    highlighted: false,
  },
] as const;

export default function PricingPage() {
  const searchParams = useSearchParams();
  const checkoutState = searchParams.get("checkout");
  const plan = searchParams.get("plan");

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
        {checkoutState === "success" ? (
          <div className="mb-8 rounded-2xl border border-emerald-500/20 bg-emerald-500/[0.08] px-5 py-4 text-sm text-emerald-100">
            Checkout completed for {plan ?? "your plan"}. You can return to `/fix` and continue.
          </div>
        ) : null}

        {checkoutState === "cancel" ? (
          <div className="mb-8 rounded-2xl border border-zinc-800 bg-zinc-900/50 px-5 py-4 text-sm text-zinc-300">
            No problem — you can keep using the free tier and upgrade later when you want unlimited fixes.
          </div>
        ) : null}

        <section className="text-center">
          <p className="text-xs font-medium uppercase tracking-[0.24em] text-indigo-400">
            Kintify Fix pricing
          </p>
          <h1 className="mt-4 text-balance text-4xl font-semibold tracking-tight text-white sm:text-5xl">
            Pay after the fix proves its value.
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-zinc-400 sm:text-base">
            Start with 5 free fixes per month. Upgrade when faster responses, shared incident workflows, or measurable incident resolution acceleration start saving real time.
          </p>
        </section>

        <section className="mt-8 rounded-3xl border border-indigo-500/20 bg-indigo-500/[0.06] px-6 py-5 text-center">
          <p className="text-sm font-medium text-white">Kintify is an incident resolution acceleration system.</p>
          <p className="mt-2 text-sm text-zinc-300">
            Team unlocks shared history and incident workflows. Enterprise adds audit visibility, SLA metrics, secure processing posture, and Contact Sales rollout.
          </p>
        </section>

        <section className="mt-12 grid gap-6 lg:grid-cols-4">
          {plans.map((planOption) => (
            <div
              key={planOption.name}
              className={`rounded-3xl border px-6 py-7 ${
                planOption.highlighted
                  ? "border-indigo-500/40 bg-indigo-500/[0.08] shadow-lg shadow-indigo-500/10"
                  : "border-zinc-800 bg-zinc-900/50"
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-xl font-semibold text-white">{planOption.name}</h2>
                  <p className="mt-2 text-sm text-zinc-400">{planOption.description}</p>
                </div>
                {planOption.highlighted ? (
                  <span className="rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3 py-1 text-[11px] font-medium uppercase tracking-wide text-indigo-300">
                    Best for active users
                  </span>
                ) : null}
              </div>

              <div className="mt-6 text-4xl font-semibold text-white">{planOption.price}</div>
              <p className="mt-1 text-xs uppercase tracking-wide text-zinc-500">per month</p>

              <Link
                href={planOption.href}
                className={`mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-medium transition-colors ${
                  planOption.highlighted
                    ? "bg-indigo-500 text-white hover:bg-indigo-400"
                    : "border border-zinc-700 text-zinc-200 hover:border-zinc-600 hover:text-white"
                }`}
              >
                {planOption.cta}
                <ArrowRight className="h-4 w-4" />
              </Link>

              <ul className="mt-6 space-y-3">
                {planOption.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3 text-sm text-zinc-300">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </section>

        <section className="mt-12 rounded-3xl border border-zinc-800 bg-zinc-900/40 px-6 py-7">
          <h2 className="text-xl font-semibold text-white">Rollout paths</h2>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-zinc-400">
            Pro and Team remain self-serve. Enterprise is sales-led so production organizations can review rollout, compliance posture, API usage, and secure processing expectations before launch.
          </p>
          <div className="mt-5 flex flex-wrap gap-3 text-sm">
            <Link
              href={buildCheckoutUrl("pro")}
              className="inline-flex items-center gap-2 rounded-xl bg-indigo-500 px-4 py-2.5 font-medium text-white transition-colors hover:bg-indigo-400"
            >
              Test Pro checkout
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 rounded-xl border border-zinc-700 px-4 py-2.5 text-zinc-300 transition-colors hover:border-zinc-600 hover:text-white"
            >
              Contact Sales
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/fix"
              className="inline-flex items-center gap-2 rounded-xl border border-zinc-700 px-4 py-2.5 text-zinc-300 transition-colors hover:border-zinc-600 hover:text-white"
            >
              Back to /fix
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
