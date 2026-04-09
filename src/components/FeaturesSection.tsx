"use client";

import { motion } from "framer-motion";
import { Bot, Boxes, Gauge, LockKeyhole, Orbit, Workflow } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const features = [
  {
    icon: Gauge,
    title: "Performance-first landing baseline",
    description: "Built mobile-first for fast LCP, low INP, and stable layout with no external runtime dependencies in the demo path.",
  },
  {
    icon: LockKeyhole,
    title: "Cryptographic trust positioning",
    description: "Message architecture is centered on Kintify VeriKernel, cryptographic cloud trust, and .cloud proof injection for search and AI retrieval.",
  },
  {
    icon: Workflow,
    title: "Zero-friction deployment story",
    description: "The platform narrative focuses on publishing proofs without introducing a heavy operator workflow or a separate control plane.",
  },
  {
    icon: Bot,
    title: "Agent-readable proof surfaces",
    description: "Structured outputs, JSON-LD, and readable proof previews make it easy for automation and AI systems to understand the trust model.",
  },
  {
    icon: Boxes,
    title: "Composable rollout blocks",
    description: "Hero, proof, FAQ, and feature sections are split into reusable components so you can iterate section-by-section from here.",
  },
  {
    icon: Orbit,
    title: "Vercel-ready baseline",
    description: "Next.js 15 App Router metadata routes, CSP headers, local API routes, and optimized image settings are already wired in.",
  },
];

export function FeaturesSection() {
  return (
    <section id="features" className="w-full py-10 sm:py-14 md:py-20">
      <motion.div
        whileInView={{ opacity: 1, y: 0 }}
        initial={{ opacity: 0, y: 24 }}
        viewport={{ once: true, amount: 0.24 }}
        transition={{ duration: 0.55, ease: "easeOut" }}
        className="max-w-3xl"
      >
        <Badge variant="secondary">Why this baseline is ready</Badge>
        <h2 className="mt-4 text-balance text-xl font-semibold tracking-tight text-white sm:text-2xl md:text-3xl">
          SEO, trust semantics, and performance are already aligned for kintify.cloud.
        </h2>
        <p className="mt-5 text-sm leading-relaxed text-slate-300 sm:text-base md:text-lg">
          This starting point is set up so you can keep prompting section-by-section without reworking the project foundation. The structure is modular, metadata-rich, and deployment-safe.
        </p>
      </motion.div>

      <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {features.map((feature, index) => {
          const Icon = feature.icon;

          return (
            <motion.div
              key={feature.title}
              whileInView={{ opacity: 1, y: 0 }}
              initial={{ opacity: 0, y: 20 }}
              viewport={{ once: true, amount: 0.18 }}
              transition={{ duration: 0.45, delay: index * 0.06, ease: "easeOut" }}
            >
              <Card className="h-full border-white/8 bg-white/[0.03]">
                <CardHeader>
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.05] text-sky-200">
                    <Icon className="h-5 w-5" />
                  </div>
                  <CardTitle className="mt-4 text-xl">{feature.title}</CardTitle>
                  <CardDescription>{feature.description}</CardDescription>
                </CardHeader>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
