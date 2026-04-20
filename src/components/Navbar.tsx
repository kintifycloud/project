"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { Building2, ChevronDown, Menu, X } from "lucide-react";
import { TeamSwitcher } from "@/components/TeamSwitcher";
import { useAuth } from "@/lib/auth-context";
import { hasEnterpriseAccess, readKintifyPlan } from "@/lib/monetization";

export function Navbar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [developersDropdownOpen, setDevelopersDropdownOpen] = useState(false);
  const { user } = useAuth();
  const [plan, setPlan] = useState(() => readKintifyPlan());

  useEffect(() => {
    if (typeof window === "undefined") return;
    const syncPlan = () => setPlan(readKintifyPlan());
    syncPlan();
    window.addEventListener("storage", syncPlan);
    window.addEventListener("kintify:plan-change", syncPlan as EventListener);
    return () => {
      window.removeEventListener("storage", syncPlan);
      window.removeEventListener("kintify:plan-change", syncPlan as EventListener);
    };
  }, []);

  const isActive = (path: string) => pathname === path;

  const developerLinks = [
    { href: "/trace", label: "Trace" },
    { href: "/verify", label: "Verify" },
    { href: "/flow", label: "Flow" },
    { href: "/guarantee", label: "Guarantee" },
    { href: "/why", label: "Why" },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-zinc-800 bg-zinc-950/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href="/fix" className="text-base font-semibold text-white tracking-tight">
          Kintify
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex md:items-center md:gap-6">
          {/* Fix - Primary */}
          <Link
            href="/fix"
            className={`text-sm font-medium transition-colors ${
              isActive("/fix")
                ? "text-white font-semibold"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            Fix
          </Link>

          {/* Live */}
          <Link
            href="/live"
            className={`text-sm transition-colors ${
              isActive("/live")
                ? "text-white font-semibold"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            Live
          </Link>

          {/* History */}
          <Link
            href="/history"
            className={`text-sm transition-colors ${
              isActive("/history")
                ? "text-white font-semibold"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            History
          </Link>

          <TeamSwitcher />

          {/* Developers Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setDevelopersDropdownOpen(!developersDropdownOpen)}
              className="flex items-center gap-1 text-sm text-zinc-400 hover:text-white transition-colors"
            >
              Developers
              <ChevronDown className="h-4 w-4" />
            </button>

            {developersDropdownOpen && (
              <div className="absolute left-0 mt-2 w-48 rounded-lg border border-zinc-800 bg-zinc-950 py-2 shadow-xl">
                {developerLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setDevelopersDropdownOpen(false)}
                    className={`block px-4 py-2 text-sm transition-colors ${
                      isActive(link.href)
                        ? "text-white bg-zinc-800"
                        : "text-zinc-400 hover:text-white hover:bg-zinc-800/50"
                    }`}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Pricing */}
          <Link
            href="/pricing"
            className={`text-sm transition-colors ${
              isActive("/pricing")
                ? "text-white font-semibold"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            Pricing
          </Link>

          {hasEnterpriseAccess(plan) ? (
            <Link
              href="/enterprise/dashboard"
              className={`text-sm transition-colors ${
                isActive("/enterprise/dashboard")
                  ? "text-white font-semibold"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              <span className="inline-flex items-center gap-1.5">
                <Building2 className="h-3.5 w-3.5" />
                Enterprise
              </span>
            </Link>
          ) : null}

          {/* Sign in */}
          <Link
            href={user ? "/dashboard" : "/login"}
            className="text-sm text-zinc-400 hover:text-white transition-colors"
          >
            {user ? "Dashboard" : "Sign in"}
          </Link>
        </nav>

        {/* Mobile Menu Button */}
        <button
          type="button"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 text-zinc-400 hover:text-white"
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-zinc-800 bg-zinc-950/95 backdrop-blur-md">
          <nav className="flex flex-col px-4 py-4 gap-1">
            <Link
              href="/fix"
              onClick={() => setMobileMenuOpen(false)}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive("/fix")
                  ? "text-white bg-indigo-500/10"
                  : "text-zinc-400 hover:text-white hover:bg-zinc-800/50"
              }`}
            >
              Fix
            </Link>
            <Link
              href="/live"
              onClick={() => setMobileMenuOpen(false)}
              className={`px-3 py-2 rounded-lg text-sm transition-colors ${
                isActive("/live")
                  ? "text-white bg-indigo-500/10"
                  : "text-zinc-400 hover:text-white hover:bg-zinc-800/50"
              }`}
            >
              Live
            </Link>
            <Link
              href="/history"
              onClick={() => setMobileMenuOpen(false)}
              className={`px-3 py-2 rounded-lg text-sm transition-colors ${
                isActive("/history")
                  ? "text-white bg-indigo-500/10"
                  : "text-zinc-400 hover:text-white hover:bg-zinc-800/50"
              }`}
            >
              History
            </Link>

            <div className="px-3 py-2">
              <TeamSwitcher />
            </div>

            {/* Mobile Developers Section */}
            <div className="mt-2 pt-2 border-t border-zinc-800">
              <p className="px-3 py-1 text-xs font-medium text-zinc-500 uppercase tracking-wider">
                Developers
              </p>
              {developerLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block px-3 py-2 pl-6 text-sm transition-colors ${
                    isActive(link.href)
                      ? "text-white bg-indigo-500/10"
                      : "text-zinc-400 hover:text-white hover:bg-zinc-800/50"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            <div className="mt-2 pt-2 border-t border-zinc-800">
              <Link
                href="/pricing"
                onClick={() => setMobileMenuOpen(false)}
                className={`block px-3 py-2 rounded-lg text-sm transition-colors ${
                  isActive("/pricing")
                    ? "text-white bg-indigo-500/10"
                    : "text-zinc-400 hover:text-white hover:bg-zinc-800/50"
                }`}
              >
                Pricing
              </Link>
              <Link
                href={user ? "/dashboard" : "/login"}
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-sm text-zinc-400 hover:text-white transition-colors"
              >
                {user ? "Dashboard" : "Sign in"}
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
