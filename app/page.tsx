import React from "react";
import Link from "next/link";
import ThemeToggle from "@/components/ThemeToggle";
import HelpChat from "@/components/HelpChat";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-neutral-900 transition-colors flex flex-col justify-between">
      {/* Top Navbar */}
      <header className="border-b border-slate-200 dark:border-neutral-800 bg-white/90 dark:bg-neutral-950/90 backdrop-blur">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-blue-600 dark:bg-white text-white dark:text-black font-bold flex items-center justify-center">
              O
            </div>
            <span className="font-bold text-lg text-slate-900 dark:text-neutral-100">
              OCRS
            </span>
          </div>

          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Link
              href="/requests"
              className="text-xs font-semibold px-4 py-2 rounded-lg bg-blue-600 text-white dark:bg-white dark:text-black hover:opacity-90"
            >
              Open Student Portal
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-4xl mx-auto px-4 py-16 text-center space-y-6">
        <div className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700 dark:bg-neutral-800 dark:text-neutral-300">
          Official University Academic Credentialing
        </div>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 dark:text-neutral-100 tracking-tight leading-tight">
          Online Certificate Request System
        </h1>
        <p className="text-base sm:text-lg text-slate-600 dark:text-neutral-400 max-w-2xl mx-auto leading-relaxed">
          Request, track, pay fees via dynamic UPI, and download officially verified academic credentials with tamper-proof QR validation.
        </p>

        <div className="pt-4 flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/requests"
            className="px-6 py-3 rounded-xl font-semibold text-sm bg-blue-600 hover:bg-blue-700 text-white dark:bg-white dark:text-black dark:hover:bg-neutral-200 transition-colors shadow-md"
          >
            Go to Student Requests
          </Link>
          <Link
            href="/profile"
            className="px-6 py-3 rounded-xl font-semibold text-sm border border-slate-300 dark:border-neutral-700 text-slate-700 dark:text-neutral-300 hover:bg-slate-100 dark:hover:bg-neutral-800 transition-colors"
          >
            My Profile & Documents
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 py-6 text-center text-xs text-slate-500 dark:text-neutral-500">
        © 2026 Online Certificate Request System (OCRS) • Academic Affairs Department
      </footer>

      {/* Swiggy-style Helpbot */}
      <HelpChat />
    </div>
  );
}
