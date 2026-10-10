"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

interface PaymentInfo {
  amount: number;
  status: string;
  method: string;
  upiLink: string;
  qrDataUrl: string;
  txnRef: string;
  certType: string;
}

export default function PayFeePage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [paymentInfo, setPaymentInfo] = useState<PaymentInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeMethod, setActiveMethod] = useState<"UPI" | "CASH" | "DD">("UPI");
  const [upiTxnId, setUpiTxnId] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [successData, setSuccessData] = useState<{
    receiptNo: string;
    studentEmail?: string;
  } | null>(null);

  useEffect(() => {
    if (id) {
      fetchPaymentData();
    }
  }, [id]);

  // Auto redirect after 3 seconds on success
  useEffect(() => {
    if (successData) {
      const timer = setTimeout(() => {
        router.push(`/requests/${id}`);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [successData, id, router]);

  const fetchPaymentData = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/student/requests/${id}/payment`);
      if (res.ok) {
        const data = await res.json();
        setPaymentInfo(data);
      }
    } catch (err) {
      console.error("Failed to load payment:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmPayment = async (method: "UPI" | "CASH" | "DD") => {
    setSubmitting(true);
    try {
      const res = await fetch(`/api/student/requests/${id}/payment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          method,
          upiTxnId: method === "UPI" ? upiTxnId.trim() : `${method}-DESK`,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setSuccessData({
          receiptNo: data.receiptNo,
          studentEmail: "your registered Gmail",
        });
      } else {
        alert("Failed to record payment. Please try again.");
      }
    } catch (err) {
      console.error("Payment confirmation error:", err);
      alert("Error confirming payment.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-center text-sm text-slate-500 dark:text-neutral-400">
        Initializing secure payment gateway...
      </div>
    );
  }

  if (!paymentInfo) {
    return (
      <div className="p-8 text-center text-sm text-red-500">
        Payment details unavailable for this request.
      </div>
    );
  }

  // If already paid or not required
  if (paymentInfo.status === "PAID" && !successData) {
    return (
      <div className="max-w-lg mx-auto bg-white dark:bg-neutral-950 border border-slate-200 dark:border-neutral-800 rounded-xl p-8 text-center shadow-sm">
        <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-neutral-800 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto text-xl font-bold mb-4">
          ✓
        </div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-neutral-100">
          Payment Already Completed
        </h2>
        <p className="text-sm text-slate-500 dark:text-neutral-400 mt-2">
          Fee for this certificate request has already been received and reconciled.
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <a
            href={`/api/student/requests/${id}/receipt`}
            className="px-4 py-2 text-xs font-semibold rounded-lg bg-emerald-600 text-white hover:bg-emerald-700"
          >
            Download Receipt
          </a>
          <Link
            href={`/requests/${id}`}
            className="px-4 py-2 text-xs font-semibold rounded-lg border border-slate-300 dark:border-neutral-700 text-slate-700 dark:text-neutral-300"
          >
            Back to Timeline
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto space-y-6">
      {/* Navigation */}
      <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-neutral-400">
        <Link href={`/requests/${id}`} className="hover:underline">
          ← Back to Request Details
        </Link>
      </div>

      {/* Success Card view */}
      {successData ? (
        <div className="bg-white dark:bg-neutral-950 border border-emerald-300 dark:border-emerald-800/60 rounded-xl p-8 text-center shadow-lg space-y-4">
          <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-neutral-900 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto text-2xl font-bold">
            ✓
          </div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-neutral-100">
            Payment recorded ✓
          </h2>
          <p className="text-sm text-slate-600 dark:text-neutral-300">
            Receipt sent to <b>{successData.studentEmail}</b>
          </p>
          <div className="text-xs font-mono text-slate-500 dark:text-neutral-400">
            Receipt Number: {successData.receiptNo}
          </div>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
            <a
              href={`/api/student/requests/${id}/receipt`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto px-5 py-2.5 rounded-lg text-sm font-semibold bg-emerald-600 hover:bg-emerald-700 text-white dark:bg-white dark:text-black dark:hover:bg-neutral-200 transition-colors shadow-sm"
            >
              Download Receipt
            </a>
            <Link
              href={`/requests/${id}`}
              className="w-full sm:w-auto px-5 py-2.5 rounded-lg text-sm font-medium border border-slate-300 dark:border-neutral-700 text-slate-700 dark:text-neutral-300 hover:bg-slate-50 dark:hover:bg-neutral-900 transition-colors"
            >
              Return to Timeline
            </Link>
          </div>

          <p className="text-[11px] text-slate-400 dark:text-neutral-500 pt-2">
            Auto-redirecting back to timeline in 3 seconds...
          </p>
        </div>
      ) : (
        /* Payment Checkout Card */
        <div className="bg-white dark:bg-neutral-950 border border-slate-200 dark:border-neutral-800 rounded-xl p-6 sm:p-8 shadow-sm">
          {/* Dynamic Heading */}
          <div className="text-center pb-6 border-b border-slate-100 dark:border-neutral-800">
            <span className="text-xs uppercase font-semibold text-slate-400 dark:text-neutral-500 tracking-wider">
              Institutional Fee Settlement
            </span>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-neutral-100 mt-1">
              Pay {paymentInfo.certType} Fee
            </h1>

            {/* Big amount: 3xl bold */}
            <div className="mt-4 text-3xl font-extrabold text-blue-600 dark:text-white">
              ₹{paymentInfo.amount}
            </div>

            {/* Reference Number Below */}
            <p className="text-xs font-mono text-slate-500 dark:text-neutral-400 mt-1">
              Reference: {paymentInfo.txnRef}
            </p>
          </div>

          {/* Method tabs: [ UPI ] [ Cash at Office ] [ Demand Draft ] */}
          <div className="grid grid-cols-3 gap-2 p-1.5 my-6 bg-slate-100 dark:bg-neutral-900 rounded-lg">
            <button
              type="button"
              onClick={() => setActiveMethod("UPI")}
              className={`py-2 text-xs font-semibold rounded-md transition-colors ${
                activeMethod === "UPI"
                  ? "bg-white dark:bg-neutral-800 text-slate-900 dark:text-white shadow-sm"
                  : "text-slate-600 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              UPI
            </button>
            <button
              type="button"
              onClick={() => setActiveMethod("CASH")}
              className={`py-2 text-xs font-semibold rounded-md transition-colors ${
                activeMethod === "CASH"
                  ? "bg-white dark:bg-neutral-800 text-slate-900 dark:text-white shadow-sm"
                  : "text-slate-600 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              Cash at Office
            </button>
            <button
              type="button"
              onClick={() => setActiveMethod("DD")}
              className={`py-2 text-xs font-semibold rounded-md transition-colors ${
                activeMethod === "DD"
                  ? "bg-white dark:bg-neutral-800 text-slate-900 dark:text-white shadow-sm"
                  : "text-slate-600 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              Demand Draft
            </button>
          </div>

          {/* VIEW 1: UPI VIEW */}
          {activeMethod === "UPI" && (
            <div className="space-y-5">
              {/* QR Image centered (256x256) in slate-50 dark:bg-neutral-900 card */}
              <div className="bg-slate-50 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 rounded-xl p-6 flex flex-col items-center justify-center text-center">
                {paymentInfo.qrDataUrl ? (
                  <img
                    src={paymentInfo.qrDataUrl}
                    alt="Scan UPI QR"
                    className="w-64 h-64 rounded-lg shadow-sm border border-slate-200 dark:border-neutral-700 bg-white"
                  />
                ) : (
                  <div className="w-64 h-64 flex items-center justify-center text-xs text-slate-400">
                    Generating QR code...
                  </div>
                )}
                <p className="mt-4 text-xs font-medium text-slate-600 dark:text-neutral-400">
                  Scan with PhonePe, GPay, Paytm, BHIM or any UPI app
                </p>
              </div>

              {/* [Open UPI App] button (href = upiLink, block, blue-600 dark:bg-white dark:text-black) */}
              <a
                href={paymentInfo.upiLink}
                className="block w-full py-3 px-4 rounded-lg text-sm font-semibold text-center bg-blue-600 text-white dark:bg-white dark:text-black hover:opacity-95 transition-opacity shadow-sm"
              >
                Open UPI App
              </a>

              {/* Divider */}
              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200 dark:border-neutral-800" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white dark:bg-neutral-950 px-2 text-slate-400 dark:text-neutral-500">
                    After scanning & paying
                  </span>
                </div>
              </div>

              {/* Input "UPI Transaction ID (optional)" */}
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-neutral-300 mb-1">
                  UPI Transaction ID (optional)
                </label>
                <input
                  type="text"
                  value={upiTxnId}
                  onChange={(e) => setUpiTxnId(e.target.value)}
                  placeholder="e.g. 427819827361"
                  className="w-full px-3 py-2 text-sm border rounded-lg border-slate-300 dark:border-neutral-700 bg-transparent text-slate-900 dark:text-neutral-100 placeholder-slate-400 dark:placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                />
              </div>

              {/* [I've Paid — Confirm] button */}
              <button
                type="button"
                onClick={() => handleConfirmPayment("UPI")}
                disabled={submitting}
                className="w-full py-3 px-4 rounded-lg text-sm font-semibold bg-emerald-600 hover:bg-emerald-700 text-white dark:bg-white dark:text-black dark:hover:bg-neutral-200 transition-colors shadow-sm disabled:opacity-50"
              >
                {submitting ? "Verifying..." : "I've Paid — Confirm"}
              </button>
            </div>
          )}

          {/* VIEW 2: CASH VIEW */}
          {activeMethod === "CASH" && (
            <div className="space-y-5">
              <div className="bg-slate-50 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 rounded-xl p-5 space-y-3 text-sm">
                <div>
                  <span className="text-xs uppercase font-semibold text-slate-400 dark:text-neutral-500">
                    Office Address
                  </span>
                  <p className="font-medium text-slate-800 dark:text-neutral-200 mt-0.5">
                    Administrative Block, Ground Floor — Cashier Counter #02
                  </p>
                </div>
                <div>
                  <span className="text-xs uppercase font-semibold text-slate-400 dark:text-neutral-500">
                    Working Hours
                  </span>
                  <p className="font-medium text-slate-800 dark:text-neutral-200 mt-0.5">
                    Monday to Friday: 9:30 AM – 4:30 PM (Lunch: 1:00 PM – 2:00 PM)
                  </p>
                </div>
                <p className="text-xs text-slate-500 dark:text-neutral-400 pt-2 border-t border-slate-200 dark:border-neutral-800">
                  Please quote Application Reference <b>{paymentInfo.txnRef}</b> when paying at the counter.
                </p>
              </div>

              {/* [Mark as Paid at Office] -> POST { method: "CASH" } */}
              <button
                type="button"
                onClick={() => handleConfirmPayment("CASH")}
                disabled={submitting}
                className="w-full py-3 px-4 rounded-lg text-sm font-semibold bg-slate-900 text-white dark:bg-white dark:text-black hover:opacity-90 transition-opacity shadow-sm disabled:opacity-50"
              >
                {submitting ? "Processing..." : "Mark as Paid at Office"}
              </button>
            </div>
          )}

          {/* VIEW 3: DEMAND DRAFT VIEW */}
          {activeMethod === "DD" && (
            <div className="space-y-5">
              <div className="bg-slate-50 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 rounded-xl p-5 space-y-3 text-sm">
                <div>
                  <span className="text-xs uppercase font-semibold text-slate-400 dark:text-neutral-500">
                    Demand Draft Instructions
                  </span>
                  <p className="font-medium text-slate-800 dark:text-neutral-200 mt-0.5">
                    Draw Demand Draft for <b>₹{paymentInfo.amount}</b> in favor of:
                  </p>
                  <p className="text-xs font-mono font-semibold text-blue-600 dark:text-neutral-100 mt-1">
                    "REGISTRAR, UNIVERSITY OF TECHNOLOGY"
                  </p>
                  <p className="text-xs text-slate-500 dark:text-neutral-400 mt-0.5">
                    Payable at State Bank of India Main Branch. Write student roll number and reference {paymentInfo.txnRef} on the reverse of the DD.
                  </p>
                </div>
              </div>

              {/* [Mark DD Submitted] -> POST { method: "DD" } */}
              <button
                type="button"
                onClick={() => handleConfirmPayment("DD")}
                disabled={submitting}
                className="w-full py-3 px-4 rounded-lg text-sm font-semibold bg-slate-900 text-white dark:bg-white dark:text-black hover:opacity-90 transition-opacity shadow-sm disabled:opacity-50"
              >
                {submitting ? "Processing..." : "Mark DD Submitted"}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
