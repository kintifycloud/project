"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
} from "lucide-react";

export default function PricingPage() {
  const [annual, setAnnual] = useState(true);

  const plans = [
    {
      name: "Starter",
      description: "Perfect for individual developers and small projects",
      price: { monthly: 0, annual: 0 },
      features: [
        "100 analyses per month",
        "Basic root cause detection",
        "Standard fix suggestions",
        "Community support",
        "1 user seat",
      ],
      cta: "Get Started Free",
      popular: false,
    },
    {
      name: "Pro",
      description: "For teams who ship fast and need reliability",
      price: { monthly: 49, annual: 39 },
      features: [
        "Unlimited analyses",
        "Advanced root cause detection",
        "AI-powered fix generation",
        "Verisig verification proofs",
        "Priority email support",
        "5 user seats",
        "API access",
        "Custom integrations",
      ],
      cta: "Start Pro Trial",
      popular: true,
    },
    {
      name: "Enterprise",
      description: "For organizations with complex infrastructure",
      price: { monthly: 199, annual: 159 },
      features: [
        "Everything in Pro",
        "Unlimited user seats",
        "Dedicated account manager",
        "SLA guarantee",
        "On-premise deployment option",
        "Custom training",
        "Advanced analytics",
        "SSO/SAML",
        "Audit logs",
      ],
      cta: "Contact Sales",
      popular: false,
    },
  ];

  const faqs = [
    {
      question: "What is Verisig verification?",
      answer:
        "Verisig is our cryptographic verification layer that generates proofs for every fix. These proofs can be independently verified to confirm the fix actually works on your system.",
    },
    {
      question: "Can I change plans anytime?",
      answer:
        "Yes, you can upgrade or downgrade your plan at any time. Changes take effect at the start of your next billing cycle.",
    },
    {
      question: "What happens if I exceed my limits?",
      answer:
        "We'll notify you when you're approaching your limit. You can either upgrade your plan or purchase additional analyses as needed.",
    },
    {
      question: "Do you offer a free trial?",
      answer:
        "Yes, Pro plans include a 14-day free trial. No credit card required to start.",
    },
    {
      question: "Is my data secure?",
      answer:
        "Absolutely. We use end-to-end encryption, and your data is never shared or used to train our models. Enterprise plans include additional security features.",
    },
  ];

  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="pt-32 pb-16 sm:pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center max-w-4xl mx-auto"
          >
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-6">
              Simple, transparent{" "}
              <span className="gradient-text">pricing.</span>
            </h1>
            <p className="text-lg sm:text-xl text-gray-400 max-w-2xl mx-auto mb-8">
              Start free, scale as you grow. No hidden fees, no surprises.
            </p>

            {/* Toggle */}
            <div className="flex items-center justify-center gap-4 mb-8">
              <button
                onClick={() => setAnnual(!annual)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  annual ? "bg-indigo-500" : "bg-gray-600"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    annual ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
              <span className="text-sm text-gray-400">
                {annual ? "Annual (Save 20%)" : "Monthly"}
              </span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-12 sm:py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-3 gap-6 sm:gap-8">
            {plans.map((plan, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className={`relative rounded-2xl border p-6 sm:p-8 ${
                  plan.popular
                    ? "border-indigo-500 bg-[#111117] shadow-lg shadow-indigo-500/20 scale-105"
                    : "border-white/10 bg-[#111117]"
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <div className="bg-indigo-500 text-white text-xs font-medium px-3 py-1 rounded-full">
                      Most Popular
                    </div>
                  </div>
                )}

                <div className="mb-6">
                  <h3 className="text-xl font-semibold mb-2">{plan.name}</h3>
                  <p className="text-sm text-gray-400 mb-4">{plan.description}</p>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl sm:text-5xl font-bold">
                      ${annual ? plan.price.annual : plan.price.monthly}
                    </span>
                    {plan.price.monthly > 0 && (
                      <span className="text-gray-400">/month</span>
                    )}
                  </div>
                  {plan.price.monthly > 0 && annual && (
                    <p className="text-xs text-green-400 mt-1">
                      Billed annually (${plan.price.annual * 12}/year)
                    </p>
                  )}
                </div>

                <Link
                  href={plan.name === "Enterprise" ? "#" : "/fix"}
                  className={`block w-full text-center py-3 px-4 rounded-xl font-medium transition-colors mb-6 ${
                    plan.popular
                      ? "bg-indigo-500 hover:bg-indigo-600 text-white"
                      : "bg-white/10 hover:bg-white/20 text-white"
                  }`}
                >
                  {plan.cta}
                  <ArrowRight className="inline-block w-4 h-4 ml-2" />
                </Link>

                <ul className="space-y-3">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-3 text-sm">
                      <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-300">{feature}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-transparent to-[#111117]/50">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-gray-400">
              Everything you need to know about our pricing
            </p>
          </motion.div>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.05 }}
                className="bg-[#111117] rounded-xl border border-white/10 p-6"
              >
                <h3 className="font-semibold mb-2 text-base sm:text-lg">{faq.question}</h3>
                <p className="text-sm sm:text-base text-gray-400">{faq.answer}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="bg-gradient-to-r from-indigo-500/10 to-purple-500/10 rounded-2xl border border-indigo-500/20 p-8 sm:p-12 text-center"
          >
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4">
              Not sure which plan is right for you?
            </h2>
            <p className="text-base sm:text-lg text-gray-400 mb-6 sm:mb-8 max-w-2xl mx-auto">
              Our team is here to help you find the perfect solution for your needs.
            </p>
            <Link
              href="#"
              className="inline-flex items-center gap-2 bg-indigo-500 hover:bg-indigo-600 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-xl font-medium transition-colors text-sm sm:text-base"
            >
              Talk to Sales
              <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>
        </div>
      </section>
    </main>
  );
}
