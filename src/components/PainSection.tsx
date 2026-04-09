"use client";

import { motion } from "framer-motion";
import { AlertTriangle, CircleOff, SearchCheck, ServerCrash } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const pains = [
  {
    icon: SearchCheck,
    title: "Trust is buried in dashboards",
    description:
      "Cloud teams can answer health questions fast, but proving provenance still means screenshots, tickets, and slow human review loops.",
  },
  {
    icon: CircleOff,
    title: "DNS and HTTP signals drift apart",
    description:
      "Identity, infrastructure, and app delivery often ship on different cadences, leaving no single cryptographic source of truth for a .cloud surface.",
  },
  {
    icon: ServerCrash,
    title: "Agents cannot verify intent",
    description:
      "AI systems and automation need lightweight, machine-readable trust markers before they can rely on cloud resources with confidence.",
  },
  {
    icon: AlertTriangle,
    title: "Security reviews happen too late",
    description:
      "Verification often arrives after deployment rather than alongside it, which creates friction exactly where velocity matters most.",
  },
];

export function PainSection() {
  return (
    <section className="w-full py-10 sm:py-14 md:py-20">
      <motion.div
        whileInView={{ opacity: 1, y: 0 }}
        initial={{ opacity: 0, y: 24 }}
        viewport={{ once: true, amount: 0.25 }}
        transition={{ duration: 0.55, ease: "easeOut" }}
        className="max-w-3xl"
      >
        <p className="text-sm font-medium uppercase tracking-[0.28em] text-emerald-200/85">Why Kintify VeriKernel exists</p>
        <h2 className="mt-4 text-balance text-xl font-semibold tracking-tight text-white sm:text-2xl md:text-3xl">
          Cloud trust is still too slow, too manual, and too opaque.
        </h2>
        <p className="mt-5 text-sm leading-relaxed text-slate-300 sm:text-base md:text-lg">
          Kintify VeriKernel on kintify.cloud is designed for the gap between a system being live and that system being credibly verifiable. The platform turns that gap into a publishable proof layer.
        </p>
      </motion.div>

      <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        {pains.map((item, index) => {
          const Icon = item.icon;

          return (
            <motion.div
              key={item.title}
              whileInView={{ opacity: 1, y: 0 }}
              initial={{ opacity: 0, y: 22 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.45, delay: index * 0.08, ease: "easeOut" }}
            >
              <Card className="h-full border-white/8 bg-white/[0.03]">
                <CardHeader>
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.05] text-emerald-200">
                    <Icon className="h-5 w-5" />
                  </div>
                  <CardTitle className="mt-4">{item.title}</CardTitle>
                  <CardDescription>{item.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="rounded-2xl border border-white/8 bg-slate-950/60 px-4 py-3 text-xs leading-6 text-slate-400">
                    Kintify VeriKernel replaces delayed audit narratives with immediate trust evidence on kintify.cloud.
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
