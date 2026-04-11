"use client";

import React, { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  Calendar,
  Clock,
  User,
  Share2,
  Bookmark,
  ArrowRight,
  Twitter,
  Linkedin,
  Link2,
  CheckCircle2,
} from "lucide-react";

export default function BlogArticlePage() {
  const [activeSection, setActiveSection] = useState("");
  const [scrollProgress, setScrollProgress] = useState(0);

  // Sample article data - in production this would come from CMS or API
  const article = {
    id: 1,
    title: "Introducing Verisig: Cryptographic Proofs for System Verification",
    subtitle: "How our new verification layer provides mathematical certainty that your fixes actually work in production environments.",
    author: "Alex Chen",
    authorRole: "Lead Engineer",
    date: "2024-01-15",
    readTime: "8 min read",
    category: "Trust",
    coverImage: "bg-gradient-to-br from-indigo-500/20 via-purple-500/20 to-pink-500/20",
    content: `
# Introduction

In modern cloud infrastructure, trust is often assumed rather than proven. We deploy changes, monitor metrics, and hope for the best. But hope is not a strategy.

## The Problem with Current Approaches

Traditional debugging and verification methods suffer from several fundamental issues:

1. **Observation is not verification** - Just because you see something working doesn't mean it's verified
2. **Time-based assumptions** - "It's been running for 24 hours, so it must be stable"
3. **Black box systems** - We trust systems we cannot inspect or verify

## Enter Verisig

Verisig is our cryptographic verification layer that provides mathematical certainty about system state. It generates proofs that can be independently verified.

### How It Works

The Verisig system operates in three phases:

1. **Capture** - Record system state and changes
2. **Proof Generation** - Create cryptographic evidence
3. **Verification** - Allow independent verification of the proof

\`\`\`bash
# Example verification command
verisig verify --proof proof.json --system api.kintify.cloud
✓ DNS TXT record verified
✓ HTTP headers verified
✓ JSON proof valid
Overall: VERIFIED
\`\`\`

## Real-World Impact

Teams using Verisig have reported:

- 94% reduction in deployment-related incidents
- 67% faster incident response times
- Complete elimination of "unknown" system states

## Technical Deep Dive

### DNS TXT Record Verification

We use DNS TXT records as a public, verifiable source of truth:

\`\`\`text
$ dig TXT api.example.com
api.example.com. 300 IN TXT "v=verisig1; hash=sha256:abc123def456; ts=20240115"
\`\`\`

### HTTP Header Verification

Response headers include signed proofs:

\`\`\`http
X-Verisig-Signature: {
  "algo": "RSA-SHA256",
  "sig": "MCoq...",
  "timestamp": "2024-01-15T10:24:00Z"
}
\`\`\`

## Conclusion

Verisig transforms how we think about system verification. From hope-based trust to mathematical certainty.

The future of infrastructure is verifiable. Are you ready?
    `,
  };

  const tableOfContents = useMemo(() => [
    { id: "introduction", title: "Introduction", level: 1 },
    { id: "the-problem", title: "The Problem with Current Approaches", level: 2 },
    { id: "enter-verisig", title: "Enter Verisig", level: 2 },
    { id: "how-it-works", title: "How It Works", level: 3 },
    { id: "real-world-impact", title: "Real-World Impact", level: 2 },
    { id: "technical-deep-dive", title: "Technical Deep Dive", level: 2 },
    { id: "dns-verification", title: "DNS TXT Record Verification", level: 3 },
    { id: "http-verification", title: "HTTP Header Verification", level: 3 },
    { id: "conclusion", title: "Conclusion", level: 2 },
  ], []);

  const relatedArticles = [
    {
      id: 2,
      title: "Debugging Production Systems: The Old Way vs The Kintify Way",
      excerpt:
        "Compare traditional debugging approaches with our AI-powered system analysis.",
      author: "Sarah Miller",
      readTime: "6 min read",
      category: "Infrastructure",
      image: "bg-gradient-to-br from-green-500/20 to-emerald-500/20",
    },
    {
      id: 3,
      title: "Why Hope Is Not a Strategy for Production Systems",
      excerpt:
        "Understanding the cost of uncertainty and how verifiable systems change the game.",
      author: "Marcus Johnson",
      readTime: "5 min read",
      category: "Reliability",
      image: "bg-gradient-to-br from-orange-500/20 to-red-500/20",
    },
    {
      id: 4,
      title: "Building for Scale: How We Handle 10M+ Daily Analyses",
      excerpt:
        "A deep dive into our infrastructure and architectural decisions.",
      author: "Alex Chen",
      readTime: "10 min read",
      category: "Infrastructure",
      image: "bg-gradient-to-br from-blue-500/20 to-cyan-500/20",
    },
  ];

  // Scroll progress
  useEffect(() => {
    const handleScroll = () => {
      const winScroll = document.documentElement.scrollTop;
      const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      const scrolled = (winScroll / height) * 100;
      setScrollProgress(scrolled);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Track active section for TOC
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 100;

      for (let i = tableOfContents.length - 1; i >= 0; i--) {
        const item = tableOfContents[i];
        if (!item) continue;
        const section = document.getElementById(item.id);
        if (section && section.offsetTop <= scrollPosition) {
          setActiveSection(item.id);
          break;
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [tableOfContents]);

  // Process content to add IDs to headings
  const processContent = (content: string) => {
    const lines = content.split("\n");
    return lines.map((line, index) => {
      if (line.startsWith("# ")) {
        const text = line.replace("# ", "");
        const id = text.toLowerCase().replace(/[^a-z0-9]+/g, "-");
        return (
          <h1 key={index} id={id} className="text-3xl sm:text-4xl font-bold mt-12 mb-6">
            {text}
          </h1>
        );
      } else if (line.startsWith("## ")) {
        const text = line.replace("## ", "");
        const id = text.toLowerCase().replace(/[^a-z0-9]+/g, "-");
        return (
          <h2 key={index} id={id} className="text-2xl sm:text-3xl font-bold mt-10 mb-5">
            {text}
          </h2>
        );
      } else if (line.startsWith("### ")) {
        const text = line.replace("### ", "");
        const id = text.toLowerCase().replace(/[^a-z0-9]+/g, "-");
        return (
          <h3 key={index} id={id} className="text-xl sm:text-2xl font-bold mt-8 mb-4">
            {text}
          </h3>
        );
      } else if (line.startsWith("- ")) {
        const text = line.replace("- ", "");
        return (
          <li key={index} className="text-gray-300 ml-6 mb-2 list-disc">
            {text}
          </li>
        );
      } else if (line.startsWith("```")) {
        return null; // Handle code blocks separately
      } else if (line.trim() === "") {
        return <br key={index} />;
      } else if (line.match(/^\d+\./)) {
        const text = line.replace(/^\d+\.\s*/, "");
        return (
          <li key={index} className="text-gray-300 ml-6 mb-2 list-decimal">
            {text}
          </li>
        );
      } else {
        return (
          <p key={index} className="text-gray-300 mb-4 leading-relaxed">
            {line}
          </p>
        );
      }
    });
  };

  return (
    <main className="min-h-screen">
      {/* Scroll Progress Bar */}
      <div className="fixed top-0 left-0 right-0 h-1 bg-white/5 z-50">
        <div
          className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-150"
          style={{ width: `${scrollProgress}%` }}
        />
      </div>

      {/* Article Hero */}
      <section className="pt-32 pb-12 sm:pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-4xl mx-auto"
          >
            {/* Category Badge */}
            <div className="inline-flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/30 rounded-full px-4 py-2 mb-6">
              <span className="text-sm font-medium text-indigo-300">{article.category}</span>
            </div>

            {/* Title */}
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight mb-6">
              {article.title}
            </h1>

            {/* Subtitle */}
            <p className="text-lg sm:text-xl text-gray-400 mb-8 max-w-3xl">
              {article.subtitle}
            </p>

            {/* Author & Meta */}
            <div className="flex flex-wrap items-center gap-6 text-sm text-gray-400 mb-8">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="font-medium text-white">{article.author}</p>
                  <p className="text-xs">{article.authorRole}</p>
                </div>
              </div>
              <span className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                {new Date(article.date).toLocaleDateString("en-US", {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {article.readTime}
              </span>
            </div>

            {/* Share Buttons */}
            <div className="flex items-center gap-3">
              <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors text-sm">
                <Share2 className="w-4 h-4" />
                Share
              </button>
              <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors text-sm">
                <Twitter className="w-4 h-4" />
              </button>
              <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors text-sm">
                <Linkedin className="w-4 h-4" />
              </button>
              <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors text-sm">
                <Link2 className="w-4 h-4" />
              </button>
              <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors text-sm">
                <Bookmark className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Cover Image */}
      <section className="px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="max-w-5xl mx-auto"
          >
            <div className={`h-64 sm:h-80 lg:h-96 rounded-2xl ${article.coverImage} border border-white/10 flex items-center justify-center relative overflow-hidden`}>
              <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0f] to-transparent" />
              <span className="relative z-10 text-2xl font-bold text-white/20">KINTIFY</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Article Content with TOC */}
      <section className="py-12 sm:py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-4 gap-8 lg:gap-12">
            {/* Main Content */}
            <div className="lg:col-span-3">
              <motion.article
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="max-w-3xl mx-auto prose prose-invert prose-lg"
              >
                {processContent(article.content)}

                {/* Code Block Example */}
                <div className="my-8 bg-[#111117] rounded-xl border border-white/10 overflow-hidden">
                  <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-[#0a0a0f]">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-red-500" />
                      <div className="w-3 h-3 rounded-full bg-yellow-500" />
                      <div className="w-3 h-3 rounded-full bg-green-500" />
                    </div>
                    <button className="flex items-center gap-2 text-xs text-gray-400 hover:text-white transition-colors">
                      <CheckCircle2 className="w-4 h-4" />
                      Copy
                    </button>
                  </div>
                  <pre className="p-4 text-sm text-gray-300 overflow-x-auto">
                    <code>{`# Example verification command
verisig verify --proof proof.json --system api.kintify.cloud
✓ DNS TXT record verified
✓ HTTP headers verified
✓ JSON proof valid
Overall: VERIFIED`}</code>
                  </pre>
                </div>

                {/* Callout Box */}
                <div className="my-8 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 rounded-xl border border-indigo-500/20 p-6">
                  <h4 className="text-lg font-semibold mb-2 text-indigo-300">Key Insight</h4>
                  <p className="text-gray-300">
                    Verisig transforms how we think about system verification. From hope-based trust to mathematical certainty.
                  </p>
                </div>

                {/* Block Quote */}
                <blockquote className="my-8 border-l-4 border-indigo-500 pl-6 italic text-gray-400">
                  &quot;The future of infrastructure is verifiable. Are you ready?&quot;
                </blockquote>
              </motion.article>
            </div>

            {/* Sticky Table of Contents - Desktop */}
            <div className="hidden lg:block lg:col-span-1">
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="sticky top-24"
              >
                <div className="bg-[#111117] rounded-xl border border-white/10 p-4">
                  <h4 className="font-semibold mb-4 text-sm uppercase tracking-wide text-gray-400">
                    Contents
                  </h4>
                  <nav className="space-y-2">
                    {tableOfContents.map((item) => (
                      <a
                        key={item.id}
                        href={`#${item.id}`}
                        className={`block text-sm py-1 transition-colors ${
                          activeSection === item.id
                            ? "text-indigo-400 font-medium"
                            : "text-gray-400 hover:text-white"
                        }`}
                        style={{ paddingLeft: `${(item.level - 1) * 12}px` }}
                      >
                        {item.title}
                      </a>
                    ))}
                  </nav>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Related Articles */}
      <section className="py-12 sm:py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-transparent to-[#111117]/50">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="mb-8"
          >
            <h2 className="text-2xl sm:text-3xl font-bold">Related Articles</h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6 sm:gap-8">
            {relatedArticles.map((article, index) => (
              <motion.article
                key={article.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-[#111117] rounded-2xl border border-white/10 overflow-hidden hover:border-indigo-500/30 hover:shadow-lg hover:shadow-indigo-500/10 transition-all duration-300 group"
              >
                <div className={`h-40 ${article.image} flex items-center justify-center relative`}>
                  <span className="text-xs font-medium text-gray-400 bg-black/30 backdrop-blur-sm px-3 py-1.5 rounded-full border border-white/10">
                    {article.category}
                  </span>
                </div>

                <div className="p-5">
                  <div className="flex items-center gap-3 text-xs text-gray-400 mb-3">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {article.readTime}
                    </span>
                  </div>

                  <h3 className="text-lg font-semibold mb-2 line-clamp-2 group-hover:text-indigo-400 transition-colors">
                    {article.title}
                  </h3>

                  <p className="text-sm text-gray-400 mb-4 line-clamp-2">
                    {article.excerpt}
                  </p>

                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-300">{article.author}</span>

                    <Link
                      href={`/blog/${article.id}`}
                      className="text-indigo-400 hover:text-indigo-300 transition-colors flex items-center gap-1 text-sm font-medium"
                    >
                      Read
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                </div>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 rounded-2xl border border-indigo-500/20 p-8 sm:p-12 text-center relative overflow-hidden"
          >
            {/* Glow effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/5 via-purple-500/5 to-pink-500/5 blur-3xl" />

            <div className="relative z-10">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4">
                See how Kintify applies this in production
              </h2>
              <p className="text-base sm:text-lg text-gray-400 mb-8 max-w-2xl mx-auto">
                Experience the power of verifiable infrastructure with a free trial.
              </p>
              <Link
                href="/fix"
                className="inline-flex items-center gap-2 bg-indigo-500 hover:bg-indigo-600 text-white px-8 py-4 rounded-xl font-medium transition-colors shadow-lg shadow-indigo-500/25"
              >
                Explore Kintify
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </main>
  );
}
