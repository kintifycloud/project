"use client";

import React from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Calendar, Clock, User, ArrowRight } from "lucide-react";

type BlogCardProps = {
  id: number;
  title: string;
  excerpt: string;
  author: string;
  date: string;
  readTime: string;
  category: string;
  image: string;
  index?: number;
  featured?: boolean;
};

export function BlogCard({
  id,
  title,
  excerpt,
  author,
  date,
  readTime,
  category,
  image,
  index = 0,
  featured = false,
}: BlogCardProps) {
  if (featured) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: index * 0.1 }}
        className="bg-[#111117] rounded-2xl border border-white/10 overflow-hidden hover:border-indigo-500/30 transition-all duration-300 group"
      >
        <div className="grid lg:grid-cols-2">
          {/* Image */}
          <div className={`h-64 sm:h-80 lg:h-auto ${image} relative`}>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-sm font-medium text-gray-400 bg-black/40 backdrop-blur-sm px-4 py-2 rounded-full border border-white/10">
                {category}
              </span>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 sm:p-8 lg:p-10 flex flex-col justify-center">
            <div className="flex items-center gap-4 text-sm text-gray-400 mb-4">
              <span className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                {new Date(date).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {readTime}
              </span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-bold mb-4 group-hover:text-indigo-400 transition-colors">
              {title}
            </h2>

            <p className="text-gray-400 mb-6 line-clamp-3">{excerpt}</p>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-white" />
                </div>
                <span className="text-gray-300">{author}</span>
              </div>

              <Link
                href={`/blog/${id}`}
                className="inline-flex items-center gap-2 bg-indigo-500 hover:bg-indigo-600 text-white px-5 py-2.5 rounded-lg font-medium transition-colors"
              >
                Read Article
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="bg-[#111117] rounded-2xl border border-white/10 overflow-hidden hover:border-indigo-500/30 hover:shadow-lg hover:shadow-indigo-500/10 transition-all duration-300 group"
    >
      {/* Image/Gradient */}
      <div className={`h-48 sm:h-56 ${image} flex items-center justify-center relative`}>
        <span className="text-xs sm:text-sm font-medium text-gray-400 bg-black/30 backdrop-blur-sm px-3 py-1.5 rounded-full border border-white/10">
          {category}
        </span>
      </div>

      {/* Content */}
      <div className="p-6">
        <div className="flex items-center gap-4 text-xs sm:text-sm text-gray-400 mb-3">
          <span className="flex items-center gap-1">
            <Calendar className="w-3 h-3 sm:w-4 sm:h-4" />
            {new Date(date).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3 sm:w-4 sm:h-4" />
            {readTime}
          </span>
        </div>

        <h3 className="text-lg sm:text-xl font-semibold mb-3 line-clamp-2 group-hover:text-indigo-400 transition-colors">
          {title}
        </h3>

        <p className="text-sm sm:text-base text-gray-400 mb-4 line-clamp-3">{excerpt}</p>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center">
              <User className="w-4 h-4 text-white" />
            </div>
            <span className="text-xs sm:text-sm text-gray-300">{author}</span>
          </div>

          <Link
            href={`/blog/${id}`}
            className="text-indigo-400 hover:text-indigo-300 transition-colors flex items-center gap-1 text-sm font-medium"
          >
            Read
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </motion.article>
  );
}
