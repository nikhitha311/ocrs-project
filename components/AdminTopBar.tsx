"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import ThemeToggle from "./ThemeToggle";
import { ChevronDown, ShieldCheck, ClipboardList, LogOut } from "lucide-react";

interface AdminTopBarProps {
  user?: {
    name?: string;
    designation?: string;
    email?: string;
  };
}

export default function AdminTopBar({ user }: AdminTopBarProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("token");
      localStorage.removeItem("ocrs_token");
      localStorage.removeItem("ocrs_user");
      window.location.href = "/login";
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 dark:border-neutral-800 bg-white/95 dark:bg-neutral-950/95 backdrop-blur">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-6">
          <Link href="/admin/dashboard" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-black dark:bg-white flex items-center justify-center text-white dark:text-black font-bold text-base shadow-sm">
              A
            </div>
            <div>
              <span className="font-bold text-base tracking-tight text-slate-900 dark:text-neutral-100">
                OCRS
              </span>
              <span className="hidden sm:inline-block ml-1 text-xs text-slate-500 dark:text-neutral-400">
                • Registrar & Admin Console
              </span>
            </div>
          </Link>
        </div>

        {/* Right side: ThemeToggle & Admin Profile Dropdown */}
        <div className="flex items-center gap-3">
          <ThemeToggle />

          {/* Admin Menu Trigger (Shows ONLY admin name) */}
          <div className="relative" ref={menuRef}>
            <button
              type="button"
              onClick={() => setDropdownOpen((prev) => !prev)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-neutral-800 hover:bg-slate-100 dark:hover:bg-neutral-900 transition-colors"
            >
              <span className="text-xs font-bold text-slate-900 dark:text-neutral-100">
                {user?.name || "Dr. K. S. Ramanujam"}
              </span>
              <ChevronDown
                size={14}
                className={`text-slate-500 transition-transform duration-150 ${dropdownOpen ? "rotate-180" : ""}`}
              />
            </button>

            {/* Dropdown Menu */}
            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 rounded-lg shadow-lg py-1 z-50 animate-in fade-in duration-150">
                <Link
                  href="/admin/profile"
                  onClick={() => setDropdownOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-700 dark:text-neutral-200 hover:bg-slate-100 dark:hover:bg-neutral-800 transition-colors"
                >
                  <ShieldCheck size={14} />
                  Admin Profile
                </Link>
                <Link
                  href="/admin/audit"
                  onClick={() => setDropdownOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-700 dark:text-neutral-200 hover:bg-slate-100 dark:hover:bg-neutral-800 transition-colors"
                >
                  <ClipboardList size={14} />
                  Audit Log
                </Link>
                <div className="my-1 border-t border-slate-200 dark:border-neutral-800" />
                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors text-left"
                >
                  <LogOut size={14} />
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
