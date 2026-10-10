import React from "react";
import AdminTopBar from "@/components/AdminTopBar";
import HelpChat from "@/components/HelpChat";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-neutral-900 transition-colors">
      <AdminTopBar />
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
      <footer className="border-t border-slate-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 py-6 text-center text-xs text-slate-500 dark:text-neutral-500">
        © 2026 OCRS Admin Console • Registrar & Examination Authority
      </footer>
      {/* Swiggy-style Help Chatbot mounted */}
      <HelpChat />
    </div>
  );
}
