"use client";

import { motion } from "framer-motion";
import { Activity, Fingerprint, ScanSearch, Waypoints } from "lucide-react";

import { DemoModal } from "@/components/DemoModal";
import { VerisigBadge } from "@/components/VerisigBadge";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const proofSignals = [
  {
    icon: Fingerprint,
    title: "Domain-bound identity",
    description: "Attach trust state directly to the .cloud hostname through a compact Verisig TXT record.",
  },
  {
    icon: Activity,
    title: "Response-path attestation",
    description: "Mirror the claim at the HTTP layer so every request can expose the same machine-readable trust signal.",
  },
  {
    icon: ScanSearch,
    title: "Verifier-friendly endpoint",
    description: "Publish a structured proof object that humans, scripts, and agents can inspect without custom tooling.",
  },
  {
    icon: Waypoints,
    title: "Low-friction propagation",
    description: "Keep rollout simple enough that trust evidence can move at the speed of deployment rather than behind it.",
  },
];

export function ProofSection() {
  return (
    <section id="proofs" className="w-full py-10 sm:py-14 md:py-20">
      <div className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-start">
        <motion.div
          whileInView={{ opacity: 1, y: 0 }}
          initial={{ opacity: 0, y: 24 }}
          viewport={{ once: true, amount: 0.22 }}
          transition={{ duration: 0.55, ease: "easeOut" }}
        >
          <Badge variant="secondary">Live proof preview</Badge>
          <h2 className="mt-4 text-balance text-xl font-semibold tracking-tight text-white sm:text-2xl md:text-3xl">
            Show the trust signal where the internet can actually see it.
          </h2>
          <p className="mt-5 max-w-2xl text-sm leading-relaxed text-slate-300 sm:text-base md:text-lg">
            Kintify VeriKernel publishes trust evidence in the layers users, verifiers, and AI agents already touch: DNS, HTTP, and a simple endpoint. That is what makes cryptographic cloud trust readable instead of theoretical.
          </p>

          <div className="mt-8">
            <DemoModal />
          </div>

          <div className="mt-10 grid gap-4 sm:grid-cols-2">
            {proofSignals.map((signal, index) => {
              const Icon = signal.icon;

              return (
                <motion.div
                  key={signal.title}
                  whileInView={{ opacity: 1, y: 0 }}
                  initial={{ opacity: 0, y: 20 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{ duration: 0.42, delay: index * 0.06, ease: "easeOut" }}
                >
                  <Card className="h-full border-white/8 bg-white/[0.03]">
                    <CardHeader>
                      <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.05] text-emerald-200">
                        <Icon className="h-5 w-5" />
                      </div>
                      <CardTitle className="mt-3 text-lg">{signal.title}</CardTitle>
                      <CardDescription>{signal.description}</CardDescription>
                    </CardHeader>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        <motion.div
          whileInView={{ opacity: 1, scale: 1, y: 0 }}
          initial={{ opacity: 0, scale: 0.98, y: 26 }}
          viewport={{ once: true, amount: 0.22 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="lg:sticky lg:top-24"
        >
          <Card className="border-white/8 bg-gradient-to-b from-white/[0.05] to-white/[0.02] p-2">
            <CardContent className="p-3 sm:p-4">
              <VerisigBadge host="edge.kintify.cloud" claim="publish trusted origin claims for every production edge" />
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </section>
  );
}
