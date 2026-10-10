"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";

interface TimelineItem {
  stage: string;
  actor: string;
  timestamp: string | null;
  remarks: string;
  status: "done" | "current" | "pending";
}

interface RequestDetail {
  id: string;
  type: string;
  status: "SUBMITTED" | "IN_REVIEW" | "APPROVED" | "ISSUED" | "REJECTED";
  purpose: string;
  appliedAt: string;
  serial: string | null;
  fee: number;
  paymentStatus: "PENDING" | "PAID" | "FAILED" | "NOT_REQUIRED";
  timeline: TimelineItem[];
}

export default function RequestDetailPage() {
  const params = useParams();
  const id = params?.id as string;

  const [request, setRequest] = useState<RequestDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchRequest();
    }
  }, [id]);

  const fetchRequest = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/student/requests/${id}`);
      if (res.ok) {
        const data = await res.json();
        setRequest(data);
      }
    } catch (err) {
      console.error("Failed to load request detail:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-center text-sm text-slate-500 dark:text-neutral-400">
        Loading request details & timeline...
      </div>
    );
  }

  if (!request) {
    return (
      <div className="p-8 text-center text-sm text-red-500">
        Request not found or inaccessible.
      </div>
    );
  }

  // Status Badge Class resolver
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

  // Timeline Dot Class resolver
  const getDotClass = (stageStatus: "done" | "current" | "pending") => {
    if (stageStatus === "done") {
      return "bg-green-500 dark:bg-white ring-4 ring-green-100 dark:ring-neutral-800";
    }
    if (stageStatus === "current") {
      return "bg-amber-500 dark:bg-neutral-400 ring-4 ring-amber-100 dark:ring-neutral-800 animate-pulse";
    }
    return "bg-slate-300 dark:bg-neutral-700 ring-4 ring-slate-100 dark:ring-neutral-900";
  };

  const appliedDateStr = new Date(request.appliedAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Navigation breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-neutral-400">
        <Link href="/requests" className="hover:underline">
          Requests
        </Link>
        <span>/</span>
        <span className="font-mono text-slate-800 dark:text-neutral-200">
          #{request.id}
        </span>
      </div>

      {/* Summary Card */}
      <div className="bg-white dark:bg-neutral-950 border border-slate-200 dark:border-neutral-800 rounded-xl p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100 dark:border-neutral-850">
          <div>
            <span className="text-xs uppercase font-semibold text-slate-400 dark:text-neutral-500 tracking-wider">
              Certificate Application
            </span>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-neutral-100 mt-0.5">
              {request.type}
            </h1>
            <p className="text-xs font-mono text-slate-500 dark:text-neutral-400 mt-1">
              Tracking ID: {request.id}
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Status Badge */}
            <span
              className={`px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide ${getBadgeClass(
                request.status
              )}`}
            >
              {request.status.replace("_", " ")}
            </span>
          </div>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6 text-sm">
          <div>
            <span className="text-xs text-slate-400 dark:text-neutral-500">
              Applied Date
            </span>
            <p className="font-medium text-slate-800 dark:text-neutral-200 mt-0.5">
              {appliedDateStr}
            </p>
          </div>

          <div>
            <span className="text-xs text-slate-400 dark:text-neutral-500">
              Application Fee
            </span>
            <p className="font-medium text-slate-800 dark:text-neutral-200 mt-0.5">
              {request.fee > 0 ? `₹${request.fee}` : "Free (₹0)"}
            </p>
          </div>

          <div>
            <span className="text-xs text-slate-400 dark:text-neutral-500">
              Purpose
            </span>
            <p className="font-medium text-slate-800 dark:text-neutral-200 mt-0.5 truncate" title={request.purpose}>
              {request.purpose || "Academic / Official"}
            </p>
          </div>

          <div>
            <span className="text-xs text-slate-400 dark:text-neutral-500">
              Serial Number
            </span>
            <p className="font-medium text-slate-800 dark:text-neutral-200 mt-0.5 font-mono text-xs">
              {request.serial || "Pending Issuance"}
            </p>
          </div>
        </div>
      </div>

      {/* Conditional Payment Banners */}
      {/* 1. If fee > 0 and paymentStatus === "PENDING": amber banner */}
      {request.fee > 0 && request.paymentStatus === "PENDING" && (
        <div className="bg-amber-50 dark:bg-neutral-900 border border-amber-200 dark:border-neutral-800 rounded-xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-amber-100 dark:bg-neutral-800 text-amber-700 dark:text-neutral-200 flex items-center justify-center font-bold">
              ₹
            </div>
            <div>
              <h3 className="text-sm font-bold text-amber-900 dark:text-neutral-100">
                Payment pending · ₹{request.fee}
              </h3>
              <p className="text-xs text-amber-700 dark:text-neutral-400 mt-0.5">
                Complete payment via UPI QR, Cash at Office, or Demand Draft to proceed to Registrar Review.
              </p>
            </div>
          </div>
          <Link
            href={`/requests/${request.id}/pay`}
            className="inline-flex items-center justify-center px-5 py-2.5 rounded-lg text-sm font-medium bg-amber-600 hover:bg-amber-700 text-white dark:bg-white dark:text-black dark:hover:bg-neutral-200 transition-colors shadow-sm"
          >
            Pay Now
          </Link>
        </div>
      )}

      {/* 2. If fee > 0 and paymentStatus === "PAID": green banner */}
      {request.fee > 0 && request.paymentStatus === "PAID" && (
        <div className="bg-emerald-50 dark:bg-neutral-900 border border-emerald-200 dark:border-neutral-800 rounded-xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-emerald-100 dark:bg-neutral-800 text-emerald-700 dark:text-neutral-200 flex items-center justify-center font-bold text-sm">
              ✓
            </div>
            <div>
              <h3 className="text-sm font-bold text-emerald-900 dark:text-neutral-100">
                Payment received · ₹{request.fee}
              </h3>
              <p className="text-xs text-emerald-700 dark:text-neutral-400 mt-0.5">
                Your payment has been reconciled. Official receipt is available for download and was sent to your registered Gmail.
              </p>
            </div>
          </div>
          <a
            href={`/api/student/requests/${request.id}/receipt`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center px-4 py-2 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white dark:bg-white dark:text-black dark:hover:bg-neutral-200 transition-colors shadow-sm"
          >
            Download Receipt
          </a>
        </div>
      )}

      {/* Vertical Timeline with 4 stages: Submitted -> Payment -> Registrar Review -> Issued */}
      <div className="bg-white dark:bg-neutral-950 border border-slate-200 dark:border-neutral-800 rounded-xl p-6 sm:p-8 shadow-sm">
        <h2 className="text-lg font-bold text-slate-900 dark:text-neutral-100 mb-6">
          Application Progress Timeline
        </h2>

        <div className="relative pl-6 sm:pl-8 space-y-8 before:absolute before:left-[11px] sm:before:left-[15px] before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 dark:before:bg-neutral-800">
          {request.timeline.map((item, index) => {
            const timeStr = item.timestamp
              ? new Date(item.timestamp).toLocaleString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })
              : null;

            return (
              <div key={item.stage} className="relative flex items-start group">
                {/* Dot */}
                <div
                  className={`absolute -left-[27px] sm:-left-[31px] top-1 w-3.5 h-3.5 rounded-full z-10 transition-colors ${getDotClass(
                    item.status
                  )}`}
                />

                {/* Stage Info */}
                <div className="flex-1 bg-slate-50/60 dark:bg-neutral-900/40 border border-slate-100 dark:border-neutral-850 rounded-lg p-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                    <span className="font-semibold text-sm text-slate-900 dark:text-neutral-100">
                      {index + 1}. {item.stage}
                    </span>
                    {timeStr ? (
                      <span className="text-xs text-slate-400 dark:text-neutral-500">
                        {timeStr}
                      </span>
                    ) : (
                      <span className="text-xs italic text-slate-400 dark:text-neutral-500">
                        {item.status === "current" ? "In Progress" : "Pending"}
                      </span>
                    )}
                  </div>

                  <div className="mt-1 flex items-center gap-2 text-xs text-slate-500 dark:text-neutral-400">
                    <span className="font-medium">Handled by:</span>
                    <span>{item.actor}</span>
                  </div>

                  <p className="mt-2 text-xs text-slate-600 dark:text-neutral-300 leading-relaxed">
                    {item.remarks}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
