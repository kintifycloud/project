"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, Mail, Loader2, Shield, Zap, Clock, CheckCircle } from "lucide-react";
import { supabaseAuth } from "@/lib/supabase-auth";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log("[Magic Link] Starting login process...");
    console.log("[Magic Link] Email:", email);
    console.log("[Magic Link] Window location:", window.location.origin);
    
    if (!supabaseAuth) {
      console.error("[Magic Link] ERROR: supabaseAuth is null - check env vars");
      setError("Authentication is not configured. Please contact support.");
      return;
    }

    console.log("[Magic Link] supabaseAuth is configured");

    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      // Hardcoded production URL to ensure consistency
      const redirectUrl = "https://kintify.cloud/dashboard";
      console.log("[Magic Link] Calling signInWithOtp with redirect:", redirectUrl);

      const { data, error: authError } = await supabaseAuth.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: redirectUrl,
        },
      });

      console.log("[Magic Link] Response received:", { data, error: authError });

      if (authError) {
        console.error("[Magic Link] ERROR:", authError.message, authError);
        setError(authError.message);
      } else {
        console.log("[Magic Link] SUCCESS: Magic link sent successfully");
        setMessage("Check your email to continue. We've sent you a magic link.");
        setEmail("");
      }
    } catch (err) {
      console.error("[Magic Link] CRITICAL ERROR:", err);
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
      console.log("[Magic Link] Process completed");
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/30">
      {/* Background Elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-indigo-200/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-purple-200/20 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-100/10 rounded-full blur-3xl" />
      </div>

      {/* Navigation */}
      <nav className="relative z-10 px-6 py-5">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2.5 text-zinc-900 font-semibold text-lg tracking-tight hover:opacity-80 transition-opacity"
          >
            <div className="w-9 h-9 bg-gradient-to-br from-indigo-600 to-indigo-700 rounded-xl flex items-center justify-center shadow-md shadow-indigo-200">
              <span className="text-white font-bold text-sm">K</span>
            </div>
            <span className="hidden sm:block">Kintify</span>
          </Link>
          <Link
            href="/"
            className="flex items-center gap-2 text-sm font-medium text-zinc-600 hover:text-zinc-900 transition-colors px-3 py-2 rounded-lg hover:bg-zinc-100/50"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Back to home</span>
          </Link>
        </div>
      </nav>

      {/* Main Content */}
      <div className="relative z-10 flex items-center justify-center px-4 sm:px-6 py-12 sm:py-16 lg:py-20">
        <div className="w-full max-w-[420px]">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
            className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl shadow-zinc-200/50 border border-white/50 p-8 sm:p-10"
          >
            {/* Header */}
            <div className="text-center mb-8">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.1, duration: 0.4 }}
                className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-indigo-600 to-indigo-700 rounded-2xl mb-5 shadow-lg shadow-indigo-200"
              >
                <span className="text-white font-bold text-2xl">K</span>
              </motion.div>
              <h1 className="text-2xl sm:text-[28px] font-semibold text-zinc-900 mb-2 tracking-tight">
                Welcome back
              </h1>
              <p className="text-zinc-500 text-sm sm:text-base">
                Sign in to access your Kintify dashboard
              </p>
            </div>

            {/* Success Message */}
            {message && (
              <motion.div
                initial={{ opacity: 0, y: -10, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                className="mb-6 p-4 bg-emerald-50/80 border border-emerald-200 rounded-xl"
              >
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <CheckCircle className="w-3 h-3 text-white" />
                  </div>
                  <p className="text-sm text-emerald-800 leading-relaxed">{message}</p>
                </div>
              </motion.div>
            )}

            {/* Error Message */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                className="mb-6 p-4 bg-red-50/80 border border-red-200 rounded-xl"
              >
                <p className="text-sm text-red-700">{error}</p>
              </motion.div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-semibold text-zinc-700 mb-2"
                >
                  Work email
                </label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400 group-focus-within:text-indigo-500 transition-colors" />
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@company.com"
                    required
                    disabled={loading}
                    className="w-full pl-12 pr-4 py-3.5 bg-zinc-50 border border-zinc-200 rounded-xl text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || !email}
                className="w-full bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 disabled:from-zinc-300 disabled:to-zinc-300 disabled:cursor-not-allowed text-white font-semibold py-3.5 px-4 rounded-xl transition-all shadow-lg shadow-indigo-200 hover:shadow-xl hover:shadow-indigo-200 disabled:shadow-none flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Sending magic link...</span>
                  </>
                ) : (
                  <span>Send Magic Link</span>
                )}
              </button>
            </form>

            {/* Trust Indicators */}
            <div className="mt-8 pt-6 border-t border-zinc-100">
              <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-zinc-500">
                <div className="flex items-center gap-1.5">
                  <Shield className="w-4 h-4 text-emerald-500" />
                  <span>Secure SSL</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Zap className="w-4 h-4 text-amber-500" />
                  <span>Instant Access</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-blue-500" />
                  <span>No Password Needed</span>
                </div>
              </div>
            </div>

            {/* Footer */}
            <p className="mt-6 text-center text-sm text-zinc-500">
              Don&apos;t have an account?{" "}
              <Link
                href="/signup"
                className="font-semibold text-indigo-600 hover:text-indigo-700 transition-colors"
              >
                Create account
              </Link>
            </p>
          </motion.div>

          {/* Bottom Links */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-sm text-zinc-500">
            <Link href="/terms" className="hover:text-zinc-700 transition-colors">
              Terms
            </Link>
            <Link href="/privacy" className="hover:text-zinc-700 transition-colors">
              Privacy
            </Link>
            <Link href="/contact" className="hover:text-zinc-700 transition-colors">
              Support
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
