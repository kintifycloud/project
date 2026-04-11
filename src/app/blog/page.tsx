"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  Calendar,
  Clock,
  ArrowRight,
  User,
  Mail,
} from "lucide-react";

export default function BlogPage() {
  const [selectedCategory, setSelectedCategory] = useState("All");

  const featuredPost = {
    id: 1,
    title: "Introducing Verisig: Cryptographic Proofs for System Verification",
    excerpt:
      "Learn how our new verification layer provides mathematical certainty that your fixes actually work in production environments.",
    author: "Alex Chen",
    date: "2024-01-15",
    readTime: "8 min read",
    category: "Trust",
    image: "bg-gradient-to-br from-indigo-500/20 via-purple-500/20 to-pink-500/20",
  };

  const blogPosts = [
    {
      id: 2,
      title: "Debugging Production Systems: The Old Way vs The Kintify Way",
      excerpt:
        "Compare traditional debugging approaches with our AI-powered system analysis and see the difference in reliability.",
      author: "Sarah Miller",
      date: "2024-01-10",
      readTime: "6 min read",
      category: "Infrastructure",
      image: "bg-gradient-to-br from-green-500/20 to-emerald-500/20",
    },
    {
      id: 3,
      title: "Why Hope Is Not a Strategy for Production Systems",
      excerpt:
        "Understanding the cost of uncertainty and how verifiable systems change the game for DevOps teams.",
      author: "Marcus Johnson",
      date: "2024-01-05",
      readTime: "5 min read",
      category: "Reliability",
      image: "bg-gradient-to-br from-orange-500/20 to-red-500/20",
    },
    {
      id: 4,
      title: "Building for Scale: How We Handle 10M+ Daily Analyses",
      excerpt:
        "A deep dive into our infrastructure and the architectural decisions that power our platform at scale.",
      author: "Alex Chen",
      date: "2023-12-28",
      readTime: "10 min read",
      category: "Infrastructure",
      image: "bg-gradient-to-br from-blue-500/20 to-cyan-500/20",
    },
    {
      id: 5,
      title: "The Future of AI Debugging in Cloud Infrastructure",
      excerpt:
        "Exploring emerging trends in AI-powered debugging and where the industry is headed next.",
      author: "Sarah Miller",
      date: "2023-12-20",
      readTime: "7 min read",
      category: "AI Debugging",
      image: "bg-gradient-to-br from-pink-500/20 to-rose-500/20",
    },
    {
      id: 6,
      title: "Security by Design: How We Protect Your Data",
      excerpt:
        "Our approach to security, from encryption to audit logs, and everything in between.",
      author: "Marcus Johnson",
      date: "2023-12-15",
      readTime: "9 min read",
      category: "Security",
      image: "bg-gradient-to-br from-violet-500/20 to-purple-500/20",
    },
  ];

  const categories = ["All", "Trust", "Infrastructure", "AI Debugging", "Reliability", "Security"];

  const filteredPosts = selectedCategory === "All"
    ? blogPosts
    : blogPosts.filter(post => post.category === selectedCategory);

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
              Cloud Trust, Infrastructure Intelligence, and{" "}
              <span className="gradient-text">Reliability Insights</span>
            </h1>
            <p className="text-lg sm:text-xl text-gray-400 max-w-2xl mx-auto">
              Deep technical articles on cloud trust, incident response, verification, and modern infrastructure.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Featured Article */}
      <section className="py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="bg-[#111117] rounded-2xl border border-white/10 overflow-hidden hover:border-indigo-500/30 transition-all duration-300 group"
          >
            <div className="grid lg:grid-cols-2">
              {/* Image */}
              <div className={`h-64 sm:h-80 lg:h-auto ${featuredPost.image} relative`}>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-sm font-medium text-gray-400 bg-black/40 backdrop-blur-sm px-4 py-2 rounded-full border border-white/10">
                    {featuredPost.category}
                  </span>
                </div>
              </div>

              {/* Content */}
              <div className="p-6 sm:p-8 lg:p-10 flex flex-col justify-center">
                <div className="flex items-center gap-4 text-sm text-gray-400 mb-4">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {new Date(featuredPost.date).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {featuredPost.readTime}
                  </span>
                </div>

                <h2 className="text-2xl sm:text-3xl font-bold mb-4 group-hover:text-indigo-400 transition-colors">
                  {featuredPost.title}
                </h2>

                <p className="text-gray-400 mb-6 line-clamp-3">
                  {featuredPost.excerpt}
                </p>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-gray-300">{featuredPost.author}</span>
                  </div>

                  <Link
                    href={`/blog/${featuredPost.id}`}
                    className="inline-flex items-center gap-2 bg-indigo-500 hover:bg-indigo-600 text-white px-5 py-2.5 rounded-lg font-medium transition-colors"
                  >
                    Read Article
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Categories Filter */}
      <section className="py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-wrap justify-center gap-2 sm:gap-3">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-200 ${
                  selectedCategory === category
                    ? "bg-indigo-500 text-white shadow-lg shadow-indigo-500/25"
                    : "bg-[#111117] text-gray-300 hover:text-white border border-white/10 hover:border-white/20"
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Latest Articles Grid */}
      <section className="py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8"
          >
            <h2 className="text-2xl sm:text-3xl font-bold">Latest Articles</h2>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {filteredPosts.map((post, index) => (
              <motion.article
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-[#111117] rounded-2xl border border-white/10 overflow-hidden hover:border-indigo-500/30 hover:shadow-lg hover:shadow-indigo-500/10 transition-all duration-300 group"
              >
                {/* Image/Gradient */}
                <div className={`h-48 sm:h-56 ${post.image} flex items-center justify-center relative`}>
                  <span className="text-xs sm:text-sm font-medium text-gray-400 bg-black/30 backdrop-blur-sm px-3 py-1.5 rounded-full border border-white/10">
                    {post.category}
                  </span>
                </div>

                {/* Content */}
                <div className="p-6">
                  <div className="flex items-center gap-4 text-xs sm:text-sm text-gray-400 mb-3">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3 sm:w-4 sm:h-4" />
                      {new Date(post.date).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 sm:w-4 sm:h-4" />
                      {post.readTime}
                    </span>
                  </div>

                  <h3 className="text-lg sm:text-xl font-semibold mb-3 line-clamp-2 group-hover:text-indigo-400 transition-colors">
                    {post.title}
                  </h3>

                  <p className="text-sm sm:text-base text-gray-400 mb-4 line-clamp-3">
                    {post.excerpt}
                  </p>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center">
                        <User className="w-4 h-4 text-white" />
                      </div>
                      <span className="text-xs sm:text-sm text-gray-300">{post.author}</span>
                    </div>

                    <Link
                      href={`/blog/${post.id}`}
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

      {/* Newsletter CTA */}
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
              <div className="inline-flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/30 rounded-full px-4 py-2 mb-6">
                <Mail className="w-4 h-4 text-indigo-400" />
                <span className="text-sm font-medium text-indigo-300">Newsletter</span>
              </div>

              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4">
                Stay ahead of cloud complexity
              </h2>
              <p className="text-base sm:text-lg text-gray-400 mb-6 sm:mb-8 max-w-2xl mx-auto">
                Get weekly insights on cloud trust, infrastructure reliability, and verification best practices.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="flex-1 bg-[#0a0a0f] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition-colors"
                />
                <button className="bg-indigo-500 hover:bg-indigo-600 text-white px-6 py-3 rounded-xl font-medium transition-colors whitespace-nowrap shadow-lg shadow-indigo-500/25">
                  Subscribe
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-transparent to-[#111117]/50">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4">
              Build trust into every system.
            </h2>
            <p className="text-base sm:text-lg text-gray-400 mb-8 max-w-2xl mx-auto">
              Start using Kintify to verify your infrastructure today.
            </p>
            <Link
              href="/fix"
              className="inline-flex items-center gap-2 bg-indigo-500 hover:bg-indigo-600 text-white px-8 py-4 rounded-xl font-medium transition-colors shadow-lg shadow-indigo-500/25"
            >
              Explore Kintify
              <ArrowRight className="w-5 h-5" />
            </Link>
          </motion.div>
        </div>
      </section>
    </main>
  );
}
