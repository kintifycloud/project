"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { 
  LayoutDashboard, 
  Wrench, 
  History, 
  Settings, 
  LogOut, 
  User,
  ArrowRight
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";

export default function DashboardPage() {
  const { user, loading, signOut } = useAuth();
  const router = useRouter();

  // Protect route - redirect to login if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 bottom-0 w-64 border-r border-zinc-800 bg-zinc-950 hidden lg:block">
        <div className="p-6">
          <Link href="/" className="flex items-center gap-2 text-white font-semibold text-lg">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">K</span>
            </div>
            Kintify
          </Link>
        </div>

        <nav className="px-4 py-4 space-y-1">
          <Link
            href="/dashboard"
            className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-white bg-zinc-800/50 rounded-lg"
          >
            <LayoutDashboard className="w-5 h-5" />
            Dashboard
          </Link>
          <Link
            href="/fix"
            className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-zinc-400 hover:text-white hover:bg-zinc-800/50 rounded-lg transition-colors"
          >
            <Wrench className="w-5 h-5" />
            Fix Issues
          </Link>
          <Link
            href="/history"
            className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-zinc-400 hover:text-white hover:bg-zinc-800/50 rounded-lg transition-colors"
          >
            <History className="w-5 h-5" />
            History
          </Link>
          <Link
            href="/settings"
            className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-zinc-400 hover:text-white hover:bg-zinc-800/50 rounded-lg transition-colors"
          >
            <Settings className="w-5 h-5" />
            Settings
          </Link>
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-zinc-800">
          <button
            onClick={signOut}
            className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-zinc-400 hover:text-red-400 hover:bg-zinc-800/50 rounded-lg transition-colors w-full"
          >
            <LogOut className="w-5 h-5" />
            Sign out
          </button>
        </div>
      </aside>

      {/* Mobile Header */}
      <header className="lg:hidden sticky top-0 z-50 border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-xl">
        <div className="flex items-center justify-between px-4 py-4">
          <Link href="/" className="flex items-center gap-2 text-white font-semibold">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">K</span>
            </div>
            Kintify
          </Link>
          <button
            onClick={signOut}
            className="p-2 text-zinc-400 hover:text-white transition-colors"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="lg:ml-64 min-h-screen">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Welcome Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="mb-8"
          >
            <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
              Welcome back{user.user_metadata?.full_name ? `, ${user.user_metadata.full_name}` : ""}
            </h1>
            <p className="text-zinc-400">
              Here&apos;s what&apos;s happening with your infrastructure
            </p>
          </motion.div>

          {/* User Info Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6 mb-8"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-indigo-600/20 rounded-full flex items-center justify-center">
                <User className="w-6 h-6 text-indigo-400" />
              </div>
              <div>
                <p className="font-medium text-white">{user.email}</p>
                <p className="text-sm text-zinc-500">
                  Signed in via magic link
                </p>
              </div>
            </div>
          </motion.div>

          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="grid sm:grid-cols-2 gap-4"
          >
            <Link
              href="/fix"
              className="group bg-gradient-to-br from-indigo-600 to-indigo-700 rounded-2xl p-6 hover:shadow-lg hover:shadow-indigo-500/20 transition-all"
            >
              <div className="flex items-center justify-between mb-4">
                <Wrench className="w-8 h-8 text-white" />
                <ArrowRight className="w-5 h-5 text-white/60 group-hover:text-white group-hover:translate-x-1 transition-all" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-1">Fix an Issue</h3>
              <p className="text-sm text-indigo-200">
                Get instant help with your infrastructure problems
              </p>
            </Link>

            <Link
              href="/history"
              className="group bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6 hover:border-zinc-700 transition-all"
            >
              <div className="flex items-center justify-between mb-4">
                <History className="w-8 h-8 text-zinc-400" />
                <ArrowRight className="w-5 h-5 text-zinc-600 group-hover:text-zinc-400 group-hover:translate-x-1 transition-all" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-1">View History</h3>
              <p className="text-sm text-zinc-500">
                See your past fixes and solutions
              </p>
            </Link>
          </motion.div>

          {/* Mobile Navigation */}
          <div className="lg:hidden mt-8 grid grid-cols-3 gap-2">
            <Link
              href="/fix"
              className="flex flex-col items-center gap-2 p-4 bg-zinc-900/50 border border-zinc-800 rounded-xl text-zinc-400 hover:text-white hover:border-zinc-700 transition-colors"
            >
              <Wrench className="w-5 h-5" />
              <span className="text-xs">Fix</span>
            </Link>
            <Link
              href="/history"
              className="flex flex-col items-center gap-2 p-4 bg-zinc-900/50 border border-zinc-800 rounded-xl text-zinc-400 hover:text-white hover:border-zinc-700 transition-colors"
            >
              <History className="w-5 h-5" />
              <span className="text-xs">History</span>
            </Link>
            <Link
              href="/settings"
              className="flex flex-col items-center gap-2 p-4 bg-zinc-900/50 border border-zinc-800 rounded-xl text-zinc-400 hover:text-white hover:border-zinc-700 transition-colors"
            >
              <Settings className="w-5 h-5" />
              <span className="text-xs">Settings</span>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
