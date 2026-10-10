"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const isProfileActive = pathname === "/profile";
  const isDocumentsActive = pathname === "/profile/documents";

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header Banner */}
      <div className="border-b border-slate-200 dark:border-neutral-800 pb-4">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-neutral-100">
          Student Portal
        </h1>
        <p className="text-sm text-slate-500 dark:text-neutral-400 mt-1">
          Manage your verified academic profile, contact details, and institutional records.
        </p>

        {/* Two underline tabs */}
        <div className="flex space-x-8 mt-6">
          <Link
            href="/profile"
            className={`pb-3 text-sm font-medium transition-colors border-b-2 ${
              isProfileActive
                ? "border-blue-600 text-blue-600 dark:border-white dark:text-white"
                : "border-transparent text-slate-500 dark:text-neutral-400 hover:text-slate-700 dark:hover:text-neutral-200"
            }`}
          >
            Profile
          </Link>
          <Link
            href="/profile/documents"
            className={`pb-3 text-sm font-medium transition-colors border-b-2 ${
              isDocumentsActive
                ? "border-blue-600 text-blue-600 dark:border-white dark:text-white"
                : "border-transparent text-slate-500 dark:text-neutral-400 hover:text-slate-700 dark:hover:text-neutral-200"
            }`}
          >
            Documents
          </Link>
        </div>
      </div>

      {/* Tab Content */}
      <div>{children}</div>
    </div>
  );
}
