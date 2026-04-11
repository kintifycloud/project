"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X } from "lucide-react";

export function FixNavbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { href: "/fix", label: "Fix", active: true },
    { href: "/trace", label: "Trace", active: false },
    { href: "/why", label: "Why", active: false },
    { href: "/verify", label: "Verify", active: false },
    { href: "/flow", label: "Flow", active: false },
    { href: "/live", label: "Live", active: false },
    { href: "/trust", label: "Trust", active: false },
    { href: "/guarantee", label: "Guarantee", active: false },
  ];

  return (
    <header className="sticky top-0 z-20 border-b border-zinc-800/60 bg-zinc-950/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-indigo-400 opacity-60" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-indigo-500" />
          </span>
          <Link href="/" className="text-sm font-semibold tracking-tight text-white sm:text-base">
            Kintify
          </Link>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex md:items-center md:gap-4">
          <nav className="flex items-center gap-2 lg:gap-3 text-sm text-zinc-400">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                className={`px-2 py-1.5 rounded-md transition-colors ${
                  link.active
                    ? "text-white bg-indigo-500/10"
                    : "hover:text-white hover:bg-zinc-800/50"
                }`}
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                href={link.href as any}
              >
                {link.label}
              </Link>
            ))}
          </nav>
          <span className="hidden lg:inline-flex rounded-full border border-indigo-500/30 bg-indigo-500/10 px-2.5 py-0.5 font-mono text-[11px] text-indigo-400">
            Intelligence Active
          </span>
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 text-zinc-400 hover:text-white"
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-zinc-800/60 bg-zinc-950/95 backdrop-blur-md">
          <nav className="flex flex-col px-4 py-4 gap-2">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                className={`px-3 py-2 rounded-md text-sm transition-colors ${
                  link.active
                    ? "text-white bg-indigo-500/10"
                    : "text-zinc-400 hover:text-white hover:bg-zinc-800/50"
                }`}
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                href={link.href as any}
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <span className="px-3 py-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 font-mono text-[11px] text-indigo-400 inline-flex items-center gap-2 w-fit">
              <span className="h-1.5 w-1.5 rounded-full bg-indigo-400" />
              Intelligence Active
            </span>
          </nav>
        </div>
      )}
    </header>
  );
}
