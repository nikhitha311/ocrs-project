"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";

interface RequestSummary {
  id: string;
  type: string;
  status: string;
  appliedDate: string;
  fee: number;
  paymentStatus: string;
  purpose: string;
}

export default function StudentRequestsPage() {
  const [requests, setRequests] = useState<RequestSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Seed sample request IDs if needed
    setRequests([
      {
        id: "9842",
        type: "Study & Conduct Certificate",
        status: "IN_REVIEW",
        appliedDate: "Sep 26, 2026",
        fee: 200,
        paymentStatus: "PENDING",
        purpose: "Education Loan Application",
      },
      {
        id: "9841",
        type: "Bonafide Certificate",
        status: "APPROVED",
        appliedDate: "Sep 24, 2026",
        fee: 100,
        paymentStatus: "PAID",
        purpose: "Passport Application",
      },
      {
        id: "9843",
        type: "Medium of Instruction (English)",
        status: "ISSUED",
        appliedDate: "Sep 20, 2026",
        fee: 300,
        paymentStatus: "PAID",
        purpose: "Higher Education Admissions (MS Abroad)",
      },
    ]);
    setLoading(false);
  }, []);

  const getBadgeClass = (status: string) => {
    switch (status) {
      case "SUBMITTED":
        return "bg-blue-100 text-blue-800 dark:bg-neutral-800 dark:text-neutral-300";
      case "IN_REVIEW":
        return "bg-amber-100 text-amber-800 dark:bg-neutral-700 dark:text-neutral-200";
      case "APPROVED":
        return "bg-emerald-100 text-emerald-800 dark:bg-neutral-100 dark:text-neutral-900";
      case "ISSUED":
        return "bg-green-100 text-green-800 dark:bg-white dark:text-black";
      case "REJECTED":
        return "bg-red-100 text-red-800 dark:bg-neutral-900 dark:text-neutral-100 border border-neutral-700";
      default:
        return "bg-slate-100 text-slate-700 dark:bg-neutral-800 dark:text-neutral-300";
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200 dark:border-neutral-800 gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-neutral-100">
            My Certificate Requests
          </h1>
          <p className="text-sm text-slate-500 dark:text-neutral-400 mt-1">
            Track real-time progress, complete pending payments, and view timelines.
          </p>
        </div>
      </div>

      {/* Requests Table */}
      <div className="bg-white dark:bg-neutral-950 border border-slate-200 dark:border-neutral-800 rounded-xl overflow-hidden shadow-sm">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-slate-200 dark:border-neutral-800 text-xs uppercase font-semibold text-slate-400 dark:text-neutral-500 bg-slate-50/50 dark:bg-neutral-900/50">
              <th className="py-3 px-4">Tracking ID</th>
              <th className="py-3 px-4">Certificate Type</th>
              <th className="py-3 px-4">Applied Date</th>
              <th className="py-3 px-4">Fee Status</th>
              <th className="py-3 px-4">Progress Status</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-neutral-850">
            {requests.map((req) => (
              <tr
                key={req.id}
                className="hover:bg-slate-50/50 dark:hover:bg-neutral-900/30 transition-colors"
              >
                <td className="py-3.5 px-4 font-mono font-medium text-xs text-slate-600 dark:text-neutral-400">
                  #{req.id}
                </td>
                <td className="py-3.5 px-4 font-semibold text-slate-800 dark:text-neutral-200">
                  {req.type}
                </td>
                <td className="py-3.5 px-4 text-xs text-slate-500 dark:text-neutral-400">
                  {req.appliedDate}
                </td>
                <td className="py-3.5 px-4">
                  {req.fee > 0 ? (
                    req.paymentStatus === "PAID" ? (
                      <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
                        Paid · ₹{req.fee}
                      </span>
                    ) : (
                      <span className="text-xs font-medium text-amber-600 dark:text-amber-400">
                        Pending · ₹{req.fee}
                      </span>
                    )
                  ) : (
                    <span className="text-xs text-slate-400">Free</span>
                  )}
                </td>
                <td className="py-3.5 px-4">
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold uppercase tracking-wider ${getBadgeClass(
                      req.status
                    )}`}
                  >
                    {req.status.replace("_", " ")}
                  </span>
                </td>
                <td className="py-3.5 px-4 text-right space-x-2">
                  <Link
                    href={`/requests/${req.id}`}
                    className="inline-block px-3 py-1 text-xs font-medium rounded-md bg-slate-100 dark:bg-neutral-800 text-slate-700 dark:text-neutral-200 hover:bg-slate-200 dark:hover:bg-neutral-700 transition-colors"
                  >
                    View Timeline
                  </Link>
                  {req.fee > 0 && req.paymentStatus === "PENDING" && (
                    <Link
                      href={`/requests/${req.id}/pay`}
                      className="inline-block px-3 py-1 text-xs font-semibold rounded-md bg-amber-600 text-white dark:bg-white dark:text-black hover:opacity-90 transition-opacity"
                    >
                      Pay Now
                    </Link>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
