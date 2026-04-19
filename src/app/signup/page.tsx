"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  CheckCircle2,
  Eye,
  EyeOff,
  Mail,
  Lock,
  Building2,
  User,
  Github,
  Chrome,
  Shield,
  Zap,
  Loader2,
} from "lucide-react";

export default function SignupPage() {
  const [step, setStep] = useState<"email" | "details" | "success">("email");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [company, setCompany] = useState("");
  const [loading, setLoading] = useState(false);
  const [agreed, setAgreed] = useState(false);

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) setStep("details");
  };

  const handleDetailsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setLoading(false);
    setStep("success");
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
          <AnimatePresence mode="wait">
            {step === "email" && (
              <motion.div
                key="email"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
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
                    Create your account
                  </h1>
                  <p className="text-zinc-500 text-sm sm:text-base">
                    Start fixing your infrastructure today
                  </p>
                </div>

                {/* Social Signup */}
                <div className="space-y-3 mb-6">
                  <button className="w-full flex items-center justify-center gap-3 px-4 py-3.5 bg-white border border-zinc-200 rounded-xl text-zinc-700 font-semibold hover:bg-zinc-50 hover:border-zinc-300 transition-all shadow-sm">
                    <Chrome className="w-5 h-5" />
                    Continue with Google
                  </button>
                  <button className="w-full flex items-center justify-center gap-3 px-4 py-3.5 bg-white border border-zinc-200 rounded-xl text-zinc-700 font-semibold hover:bg-zinc-50 hover:border-zinc-300 transition-all shadow-sm">
                    <Github className="w-5 h-5" />
                    Continue with GitHub
                  </button>
                </div>

                {/* Divider */}
                <div className="relative mb-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-zinc-200" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-4 bg-white text-zinc-500 font-medium">
                      Or continue with email
                    </span>
                  </div>
                </div>

                {/* Email Form */}
                <form onSubmit={handleEmailSubmit} className="space-y-5">
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
                        className="w-full pl-12 pr-4 py-3.5 bg-zinc-50 border border-zinc-200 rounded-xl text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white font-semibold py-3.5 px-4 rounded-xl transition-all shadow-lg shadow-indigo-200 hover:shadow-xl hover:shadow-indigo-200"
                  >
                    Continue
                  </button>
                </form>

                {/* Trust Indicators */}
                <div className="mt-6 pt-6 border-t border-zinc-100">
                  <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-zinc-500">
                    <div className="flex items-center gap-1.5">
                      <Shield className="w-4 h-4 text-emerald-500" />
                      <span>Secure SSL</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Zap className="w-4 h-4 text-amber-500" />
                      <span>Free to start</span>
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <p className="mt-6 text-center text-sm text-zinc-500">
                  Already have an account?{" "}
                  <Link
                    href="/login"
                    className="font-semibold text-indigo-600 hover:text-indigo-700 transition-colors"
                  >
                    Sign in
                  </Link>
                </p>
              </motion.div>
            )}

            {step === "details" && (
              <motion.div
                key="details"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
                className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl shadow-zinc-200/50 border border-white/50 p-8 sm:p-10"
              >
                {/* Back Button */}
                <button
                  onClick={() => setStep("email")}
                  className="flex items-center gap-2 text-sm font-medium text-zinc-500 hover:text-zinc-700 mb-6 transition-colors px-2 py-1 -ml-2 rounded-lg hover:bg-zinc-100/50"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back
                </button>

                <div className="mb-6">
                  <h1 className="text-2xl sm:text-[28px] font-semibold text-zinc-900 mb-2 tracking-tight">
                    Complete your profile
                  </h1>
                  <p className="text-zinc-500 text-sm sm:text-base">
                    Tell us a bit about yourself
                  </p>
                </div>

                <form onSubmit={handleDetailsSubmit} className="space-y-5">
                  {/* Name Fields */}
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label
                        htmlFor="firstName"
                        className="block text-sm font-semibold text-zinc-700 mb-2"
                      >
                        First name
                      </label>
                      <div className="relative group">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400 group-focus-within:text-indigo-500 transition-colors" />
                        <input
                          type="text"
                          id="firstName"
                          value={firstName}
                          onChange={(e) => setFirstName(e.target.value)}
                          placeholder="John"
                          required
                          className="w-full pl-12 pr-4 py-3.5 bg-zinc-50 border border-zinc-200 rounded-xl text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all"
                        />
                      </div>
                    </div>
                    <div>
                      <label
                        htmlFor="lastName"
                        className="block text-sm font-semibold text-zinc-700 mb-2"
                      >
                        Last name
                      </label>
                      <input
                        type="text"
                        id="lastName"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        placeholder="Doe"
                        required
                        className="w-full px-4 py-3.5 bg-zinc-50 border border-zinc-200 rounded-xl text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all"
                      />
                    </div>
                  </div>

                  {/* Company */}
                  <div>
                    <label
                      htmlFor="company"
                      className="block text-sm font-semibold text-zinc-700 mb-2"
                    >
                      Company <span className="text-zinc-400 font-normal">(optional)</span>
                    </label>
                    <div className="relative group">
                      <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400 group-focus-within:text-indigo-500 transition-colors" />
                      <input
                        type="text"
                        id="company"
                        value={company}
                        onChange={(e) => setCompany(e.target.value)}
                        placeholder="Acme Inc."
                        className="w-full pl-12 pr-4 py-3.5 bg-zinc-50 border border-zinc-200 rounded-xl text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all"
                      />
                    </div>
                  </div>

                  {/* Password */}
                  <div>
                    <label
                      htmlFor="password"
                      className="block text-sm font-semibold text-zinc-700 mb-2"
                    >
                      Password
                    </label>
                    <div className="relative group">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400 group-focus-within:text-indigo-500 transition-colors" />
                      <input
                        type={showPassword ? "text" : "password"}
                        id="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Create a strong password"
                        required
                        minLength={8}
                        className="w-full pl-12 pr-12 py-3.5 bg-zinc-50 border border-zinc-200 rounded-xl text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 transition-colors"
                      >
                        {showPassword ? (
                          <EyeOff className="w-5 h-5" />
                        ) : (
                          <Eye className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                    <p className="mt-1.5 text-xs text-zinc-500">
                      Must be at least 8 characters
                    </p>
                  </div>

                  {/* Terms */}
                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      id="terms"
                      checked={agreed}
                      onChange={(e) => setAgreed(e.target.checked)}
                      required
                      className="mt-1 w-4 h-4 text-indigo-600 border-zinc-300 rounded focus:ring-indigo-500 focus:ring-2"
                    />
                    <label htmlFor="terms" className="text-sm text-zinc-600 leading-relaxed">
                      I agree to the{" "}
                      <Link
                        href="/terms"
                        className="font-semibold text-indigo-600 hover:text-indigo-700 transition-colors"
                      >
                        Terms of Service
                      </Link>{" "}
                      and{" "}
                      <Link
                        href="/privacy"
                        className="font-semibold text-indigo-600 hover:text-indigo-700 transition-colors"
                      >
                        Privacy Policy
                      </Link>
                    </label>
                  </div>

                  <button
                    type="submit"
                    disabled={loading || !agreed}
                    className="w-full bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 disabled:from-zinc-300 disabled:to-zinc-300 disabled:cursor-not-allowed text-white font-semibold py-3.5 px-4 rounded-xl transition-all shadow-lg shadow-indigo-200 hover:shadow-xl hover:shadow-indigo-200 disabled:shadow-none flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>Creating account...</span>
                      </>
                    ) : (
                      <span>Create account</span>
                    )}
                  </button>
                </form>
              </motion.div>
            )}

            {step === "success" && (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
                className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl shadow-zinc-200/50 border border-white/50 p-8 sm:p-10 text-center"
              >
                <div className="w-20 h-20 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-emerald-200">
                  <CheckCircle2 className="w-10 h-10 text-white" />
                </div>
                <h1 className="text-2xl sm:text-[28px] font-semibold text-zinc-900 mb-3 tracking-tight">
                  Welcome to Kintify!
                </h1>
                <p className="text-zinc-500 mb-8 text-sm sm:text-base leading-relaxed">
                  Your account has been created successfully. Let&apos;s start fixing your infrastructure.
                </p>
                <Link
                  href="/fix"
                  className="inline-flex items-center justify-center w-full bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white font-semibold py-3.5 px-4 rounded-xl transition-all shadow-lg shadow-indigo-200 hover:shadow-xl hover:shadow-indigo-200"
                >
                  Get Started
                </Link>
              </motion.div>
            )}
          </AnimatePresence>

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
