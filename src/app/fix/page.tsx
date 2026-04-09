import type { Metadata } from "next";
import { HelpCircle } from "lucide-react";

import { ErrorBoundary } from "@/components/ErrorBoundary";
import { FixInput } from "@/components/FixInput";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";

const fixFaqs = [
  {
    question: "Why is my API slow?",
    answer:
      "Slow APIs are often caused by sequential requests, expensive database calls, or missing cache layers. The /fix engine gives you a quick probable cause so you can narrow the next debugging step faster.",
  },
  {
    question: "Why is my cloud failing?",
    answer:
      "Cloud failures usually come from unhealthy deploys, dependency bottlenecks, or overloaded services. Paste the symptom into /fix and Kintify will return a mock diagnosis with a likely fix path.",
  },
  {
    question: "How do I debug cloud issues?",
    answer:
      "Start with the error or symptom, identify the likely bottleneck or failing dependency, and then apply the highest-confidence fix first. The /fix route is built to make that first diagnosis instant.",
  },
];

export const metadata: Metadata = {
  title: "Fix Cloud Problems Instantly | Kintify",
  description: "Paste your cloud issue and instantly see what’s wrong and how to fix it.",
  alternates: {
    canonical: "/fix",
  },
};

export default function FixPage() {
  return (
    <main className="overflow-x-hidden pb-24">
      <section className="relative isolate">
        <div className="absolute inset-0 -z-10 grid-veil opacity-50" />
        <div className="mx-auto w-full max-w-2xl py-10 sm:py-14 md:py-20">
          <div className="text-center">
            <Badge variant="secondary">/fix analysis engine</Badge>
            <h1 className="mt-4 text-balance text-2xl font-bold tracking-tight text-white sm:text-3xl md:text-4xl lg:text-5xl">
              Fix your cloud problems instantly
            </h1>
            <p className="mt-6 text-sm leading-relaxed text-slate-300 sm:text-base md:text-lg">
              Paste errors, API symptoms, or system descriptions. Get a structured diagnosis in seconds.
            </p>
          </div>

          <div className="mt-10">
            <ErrorBoundary>
              <FixInput />
            </ErrorBoundary>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-2xl py-10 sm:py-14 md:py-20">
        <div>
          <Badge className="gap-2" variant="secondary">
            <HelpCircle className="h-3.5 w-3.5" />
            FAQ
          </Badge>
          <h2 className="mt-4 text-balance text-xl font-semibold tracking-tight text-white sm:text-2xl md:text-3xl">
            Common cloud debugging questions
          </h2>
          <p className="mt-5 text-sm leading-relaxed text-slate-300 sm:text-base md:text-lg">
            These answers target the exact search queries this page is built to capture, including slow APIs, failing clouds, and cloud debugging workflows.
          </p>
        </div>

        <div className="mt-10">
          <Accordion className="space-y-3" collapsible type="single">
            {fixFaqs.map((faq, index) => (
              <AccordionItem key={faq.question} value={`faq-${index + 1}`}>
                <AccordionTrigger>{faq.question}</AccordionTrigger>
                <AccordionContent>{faq.answer}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>
    </main>
  );
}
