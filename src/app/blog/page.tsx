"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  Calendar,
  Clock,
  ArrowRight,
  User,
  Mail,
  Search,
  BookOpen,
  TrendingUp,
  Filter,
} from "lucide-react";

import { blogPosts } from "@/lib/blogPosts";

export default function BlogPage() {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  const featuredPost = blogPosts[0]!;
  const listingPosts = blogPosts.slice(1);

  const categories = ["All", "Trust", "Infrastructure", "AI Debugging", "Reliability", "Security"];

  const filteredPosts = listingPosts.filter((post) => {
    const matchesCategory = selectedCategory === "All" || post.category === selectedCategory;
    const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         post.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Beginner":
        return "bg-green-500/10 text-green-400 border-green-500/30";
      case "Intermediate":
        return "bg-yellow-500/10 text-yellow-400 border-yellow-500/30";
      case "Advanced":
        return "bg-red-500/10 text-red-400 border-red-500/30";
      default:
        return "bg-gray-500/10 text-gray-400 border-gray-500/30";
    }
  };

  return (
    <main className="min-h-screen relative overflow-hidden">
      {/* Animated Background Grid */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-[#0a0a0f]" />
        <div className="absolute inset-0 opacity-20" style={{
          backgroundImage: `
            linear-gradient(rgba(99, 102, 241, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(99, 102, 241, 0.1) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px',
        }} />
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      <div className="relative z-10">
        {/* Hero Section */}
        <section className="pt-28 sm:pt-32 pb-16 sm:pb-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center max-w-4xl mx-auto"
            >
              {/* Journal Badge */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: 0.1 }}
                className="inline-flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/30 rounded-full px-4 py-2 mb-8"
              >
                <BookOpen className="w-4 h-4 text-indigo-400" />
                <span className="text-sm font-medium text-indigo-300">Kintify Journal</span>
              </motion.div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-6">
                Cloud Trust, Reliability, and{" "}
                <span className="gradient-text">Infrastructure Intelligence</span>
              </h1>
              <p className="text-lg sm:text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed">
                Deep insights on cloud systems, incident response, trust verification, and modern infrastructure.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Search and Filter Bar */}
        <section className="py-6 px-4 sm:px-6 lg:px-8 sticky top-0 z-40 bg-[#0a0a0f]/80 backdrop-blur-xl border-b border-white/5">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
              {/* Search Bar */}
              <div className="relative w-full sm:w-96">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search articles, guides, and insights…"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setIsSearchFocused(true)}
                  onBlur={() => setIsSearchFocused(false)}
                  className={`w-full bg-[#111117] border rounded-xl pl-12 pr-4 py-3 text-white placeholder-gray-500 focus:outline-none transition-all duration-200 ${
                    isSearchFocused
                      ? "border-indigo-500 shadow-lg shadow-indigo-500/20"
                      : "border-white/10"
                  }`}
                />
              </div>

              {/* Category Filter - Desktop */}
              <div className="hidden lg:flex items-center gap-2 flex-wrap justify-center">
                <Filter className="w-4 h-4 text-gray-400 mr-2" />
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
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

            {/* Category Filter - Mobile */}
            <div className="lg:hidden flex items-center gap-2 overflow-x-auto pb-2 mt-4 scrollbar-hide">
              <Filter className="w-4 h-4 text-gray-400 flex-shrink-0" />
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 flex-shrink-0 ${
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

        {/* Featured Article */}
        <section className="py-12 sm:py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="bg-[#111117]/50 backdrop-blur-sm rounded-2xl border border-white/10 overflow-hidden hover:border-indigo-500/30 hover:shadow-2xl hover:shadow-indigo-500/10 transition-all duration-500 group"
            >
              <div className="grid lg:grid-cols-2">
                {/* Image */}
                <div className={`h-64 sm:h-80 lg:h-auto ${featuredPost.image} relative overflow-hidden`}>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="flex flex-col items-center gap-4">
                      {featuredPost.trending && (
                        <div className="flex items-center gap-2 bg-black/40 backdrop-blur-sm px-4 py-2 rounded-full border border-white/10">
                          <TrendingUp className="w-4 h-4 text-indigo-400" />
                          <span className="text-sm font-medium text-indigo-300">Trending</span>
                        </div>
                      )}
                      <span className="text-sm font-medium text-gray-400 bg-black/40 backdrop-blur-sm px-4 py-2 rounded-full border border-white/10">
                        {featuredPost.category}
                      </span>
                    </div>
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-[#111117] to-transparent opacity-60" />
                </div>

                {/* Content */}
                <div className="p-6 sm:p-8 lg:p-10 flex flex-col justify-center">
                  <div className="flex items-center gap-3 text-sm text-gray-400 mb-4">
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
                    <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getDifficultyColor(featuredPost.difficulty)}`}>
                      {featuredPost.difficulty}
                    </span>
                  </div>

                  <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4 group-hover:text-indigo-400 transition-colors leading-tight">
                    {featuredPost.title}
                  </h2>

                  <p className="text-gray-400 mb-6 line-clamp-3 text-base sm:text-lg leading-relaxed">
                    {featuredPost.excerpt}
                  </p>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center">
                        <User className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <span className="text-white font-medium">{featuredPost.author}</span>
                        <p className="text-xs text-gray-400">Kintify Engineering</p>
                      </div>
                    </div>

                    <div className="mt-6">
                      <Link
                        href={`/blog/${featuredPost.slug}`}
                        className="inline-flex items-center gap-2 bg-indigo-500 hover:bg-indigo-600 text-white px-6 py-3 rounded-xl font-medium transition-all duration-200 hover:shadow-lg hover:shadow-indigo-500/25 group-hover:translate-x-1"
                      >
                        Read Article
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Latest Articles Grid */}
        <section className="py-12 sm:py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="flex items-center justify-between mb-8"
            >
              <h2 className="text-2xl sm:text-3xl font-bold">Latest Articles</h2>
              <span className="text-sm text-gray-400">{filteredPosts.length} articles</span>
            </motion.div>

            <AnimatePresence mode="wait">
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                {filteredPosts.map((post, index) => (
                  <motion.article
                    key={post.slug}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="bg-[#111117]/50 backdrop-blur-sm rounded-2xl border border-white/10 overflow-hidden hover:border-indigo-500/30 hover:shadow-xl hover:shadow-indigo-500/10 transition-all duration-300 group"
                  >
                    {/* Image/Gradient */}
                    <div className={`h-48 sm:h-56 ${post.image} flex items-center justify-center relative overflow-hidden`}>
                      <div className="absolute top-3 left-3 flex gap-2">
                        {post.trending && (
                          <div className="flex items-center gap-1 bg-black/40 backdrop-blur-sm px-2 py-1 rounded-full border border-white/10">
                            <TrendingUp className="w-3 h-3 text-indigo-400" />
                            <span className="text-xs font-medium text-indigo-300">Trending</span>
                          </div>
                        )}
                      </div>
                      <span className="text-xs sm:text-sm font-medium text-gray-400 bg-black/40 backdrop-blur-sm px-3 py-1.5 rounded-full border border-white/10">
                        {post.category}
                      </span>
                      <div className="absolute inset-0 bg-gradient-to-t from-[#111117] to-transparent opacity-40" />
                    </div>

                    {/* Content */}
                    <div className="p-6">
                      <div className="flex items-center gap-3 text-xs sm:text-sm text-gray-400 mb-3">
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

                      <h3 className="text-lg sm:text-xl font-semibold mb-3 line-clamp-2 group-hover:text-indigo-400 transition-colors leading-tight">
                        {post.title}
                      </h3>

                      <p className="text-sm sm:text-base text-gray-400 mb-4 line-clamp-3 leading-relaxed">
                        {post.excerpt}
                      </p>

                      <div className="flex items-center justify-between pt-4 border-t border-white/5">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center">
                            <User className="w-4 h-4 text-white" />
                          </div>
                          <span className="text-xs sm:text-sm text-gray-300">{post.author}</span>
                        </div>

                        <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getDifficultyColor(post.difficulty)}`}>
                          {post.difficulty}
                        </span>
                      </div>

                      <div className="mt-4">
                        <Link
                          href={`/blog/${post.slug}`}
                          className="text-indigo-400 hover:text-indigo-300 transition-colors flex items-center gap-1 text-sm font-medium group-hover:gap-2 transition-all"
                        >
                          Read Article
                          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </Link>
                      </div>
                    </div>
                  </motion.article>
                ))}
              </div>
            </AnimatePresence>

            {filteredPosts.length === 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-16"
              >
                <div className="inline-flex items-center justify-center w-16 h-16 bg-[#111117] rounded-full mb-4">
                  <Search className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold mb-2">No articles found</h3>
                <p className="text-gray-400">Try adjusting your search or category filter</p>
              </motion.div>
            )}
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
              className="bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 backdrop-blur-sm rounded-2xl border border-indigo-500/20 p-8 sm:p-12 text-center relative overflow-hidden"
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
                <p className="text-base sm:text-lg text-gray-400 mb-6 sm:mb-8 max-w-2xl mx-auto leading-relaxed">
                  Get deep technical insights on trust, reliability, and infrastructure delivered to your inbox.
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
              <p className="text-base sm:text-lg text-gray-400 mb-8 max-w-2xl mx-auto leading-relaxed">
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
      </div>
    </main>
  );
}
