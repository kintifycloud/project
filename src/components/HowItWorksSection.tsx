"use client";

import { motion } from "framer-motion";
import { Binary, CloudUpload, FileJson2, ShieldEllipsis } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

const steps = [
  {
    icon: Binary,
    step: "01",
    title: "Describe the trust claim",
    description:
      "Start with a simple intent statement about the workload, domain, or deployment state you need to attest across kintify.cloud.",
  },
  {
    icon: ShieldEllipsis,
    step: "02",
    title: "Generate a proof envelope",
    description:
      "Kintify VeriKernel creates a compact proof payload that can be surfaced as DNS TXT, HTTP headers, and a verifier endpoint.",
  },
  {
    icon: CloudUpload,
    step: "03",
    title: "Inject proof into the edge",
    description:
      "The proof is attached where it matters most: the domain, the response path, and the machine-readable route consumers can inspect.",
  },
  {
    icon: FileJson2,
    step: "04",
    title: "Let humans and agents verify",
    description:
      "Operators get readable evidence while browsers, agents, and automation get structured signals for faster trust decisions.",
  },
];

export function HowItWorksSection() {
  return (
    <section id="how-it-works" className="w-full py-10 sm:py-14 md:py-20">
      <motion.div
        whileInView={{ opacity: 1, y: 0 }}
        initial={{ opacity: 0, y: 24 }}
        viewport={{ once: true, amount: 0.25 }}
        transition={{ duration: 0.55, ease: "easeOut" }}
        className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between"
      >
        <div className="max-w-3xl">
          <Badge variant="secondary">VeriKernel rollout path</Badge>
          <h2 className="mt-4 text-balance text-xl font-semibold tracking-tight text-white sm:text-2xl md:text-3xl">
            Four steps from plain language to live cloud proof injection.
          </h2>
        </div>
        <p className="max-w-2xl text-sm leading-relaxed text-slate-300 sm:text-base md:text-lg">
          The Kintify VeriKernel model is intentionally lightweight: publish the claim, bind it cryptographically, expose it at the network boundary, and make it easy to consume.
        </p>
      </motion.div>

      <div className="mt-10 grid gap-5 lg:grid-cols-[0.72fr_1.28fr]">
        <Card className="border-white/8 bg-gradient-to-b from-white/[0.05] to-white/[0.02]">
          <CardHeader>
            <CardTitle>What changes for your team</CardTitle>
            <CardDescription>
              Kintify VeriKernel adds a trust layer without introducing a separate control plane for the landing experience.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="rounded-3xl border border-white/8 bg-slate-950/70 p-5">
              <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Before</p>
              <p className="mt-2 text-sm leading-7 text-slate-300">
                Trust state lives in tickets, post-deploy checklists, and disconnected security tooling.
              </p>
            </div>
            <Separator />
            <div className="rounded-3xl border border-emerald-300/12 bg-emerald-400/6 p-5">
              <p className="text-xs uppercase tracking-[0.24em] text-emerald-100/85">After</p>
              <p className="mt-2 text-sm leading-7 text-slate-200">
                Proofs become part of the surface itself, making kintify.cloud verifiable where requests actually land.
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-5 md:grid-cols-2">
          {steps.map((step, index) => {
            const Icon = step.icon;

            return (
              <motion.div
                key={step.step}
                whileInView={{ opacity: 1, y: 0 }}
                initial={{ opacity: 0, y: 20 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.45, delay: index * 0.07, ease: "easeOut" }}
              >
                <Card className="h-full border-white/8 bg-white/[0.03]">
                  <CardHeader>
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.05] text-sky-200">
                        <Icon className="h-5 w-5" />
                      </div>
                      <span className="text-xs font-medium uppercase tracking-[0.28em] text-slate-500">{step.step}</span>
                    </div>
                    <CardTitle className="mt-3">{step.title}</CardTitle>
                    <CardDescription>{step.description}</CardDescription>
                  </CardHeader>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
