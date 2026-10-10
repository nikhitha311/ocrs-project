"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";

interface AcademicDoc {
  id: string;
  name: string;
  status: "VERIFIED" | "UPLOADED" | "PENDING";
  fileUrl?: string | null;
  uploadedAt?: string | null;
}

interface IssuedCertificate {
  type: string;
  serial: string;
  issuedAt: string;
  qrToken: string;
  receiptNo?: string | null;
  amount?: number;
  requestId: string;
}

export default function DocumentsPage() {
  const [academic, setAcademic] = useState<AcademicDoc[]>([]);
  const [issued, setIssued] = useState<IssuedCertificate[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploadFeedback, setUploadFeedback] = useState<string | null>(null);

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/student/documents");
      if (res.ok) {
        const data = await res.json();
        setAcademic(data.academic || []);
        setIssued(data.issued || []);
      }
    } catch (err) {
      console.error("Error loading documents:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleMockUpload = (docName: string) => {
    setUploadFeedback(`Document "${docName}" uploaded and queued for verification.`);
    setTimeout(() => {
      setAcademic((prev) =>
        prev.map((d) =>
          d.name === docName
            ? { ...d, status: "UPLOADED", uploadedAt: new Date().toISOString() }
            : d
        )
      );
      setUploadFeedback(null);
    }, 1200);
  };

  if (loading) {
    return (
      <div className="p-8 text-center text-sm text-slate-500 dark:text-neutral-400">
        Loading institutional documents and certificate records...
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {uploadFeedback && (
        <div className="p-4 rounded-lg bg-blue-50 text-blue-800 dark:bg-neutral-900 dark:text-neutral-100 border border-blue-200 dark:border-neutral-800 text-sm flex items-center justify-between">
          <span>{uploadFeedback}</span>
        </div>
      )}

      {/* Section 1: Academic Documents */}
      <section className="bg-white dark:bg-neutral-950 border border-slate-200 dark:border-neutral-800 rounded-xl p-6 shadow-sm">
        <div className="pb-4 border-b border-slate-100 dark:border-neutral-800 mb-5">
          <h2 className="text-lg font-bold text-slate-900 dark:text-neutral-100">
            Academic Documents
          </h2>
          <p className="text-xs text-slate-500 dark:text-neutral-400 mt-0.5">
            Required baseline identity and prior academic records on file with the registrar.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {academic.map((doc) => {
            const isVerified = doc.status === "VERIFIED";
            const isUploaded = doc.status === "UPLOADED";

            return (
              <div
                key={doc.id || doc.name}
                className="flex items-center justify-between p-4 rounded-lg border border-slate-200 dark:border-neutral-800 bg-slate-50/50 dark:bg-neutral-900/40"
              >
                <div className="flex items-center gap-3">
                  {/* Status Indicator: ✓ or ○ */}
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                      isVerified
                        ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400"
                        : isUploaded
                        ? "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400"
                        : "bg-slate-200 text-slate-500 dark:bg-neutral-800 dark:text-neutral-400"
                    }`}
                  >
                    {isVerified ? "✓" : isUploaded ? "✓" : "○"}
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-slate-800 dark:text-neutral-200">
                      {doc.name}
                    </h3>
                    <span className="text-[11px] text-slate-500 dark:text-neutral-400">
                      {isVerified
                        ? "Verified by Registrar"
                        : isUploaded
                        ? "Pending Verification"
                        : "Missing / Required"}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {isVerified || isUploaded ? (
                    <button
                      type="button"
                      onClick={() =>
                        alert(
                          `Previewing official copy of ${doc.name} (verified on institutional ledger).`
                        )
                      }
                      className="px-2.5 py-1 text-xs font-medium rounded border border-slate-300 dark:border-neutral-700 text-slate-700 dark:text-neutral-300 hover:bg-slate-100 dark:hover:bg-neutral-800 transition-colors"
                    >
                      View
                    </button>
                  ) : null}
                  <button
                    type="button"
                    onClick={() => handleMockUpload(doc.name)}
                    className="px-2.5 py-1 text-xs font-medium rounded bg-slate-900 text-white dark:bg-white dark:text-black hover:opacity-90 transition-opacity"
                  >
                    Upload
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Section 2: Issued Certificates */}
      <section className="bg-white dark:bg-neutral-950 border border-slate-200 dark:border-neutral-800 rounded-xl p-6 shadow-sm">
        <div className="pb-4 border-b border-slate-100 dark:border-neutral-800 mb-5">
          <h2 className="text-lg font-bold text-slate-900 dark:text-neutral-100">
            Issued Certificates
          </h2>
          <p className="text-xs text-slate-500 dark:text-neutral-400 mt-0.5">
            Officially verified digital credentials generated with cryptographic authenticity.
          </p>
        </div>

        {issued.length === 0 ? (
          <div className="py-8 text-center text-sm text-slate-400 dark:text-neutral-500">
            No certificates have been issued yet. When your requests are approved, your verified certificates and payment receipts will appear here.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 dark:border-neutral-800 text-xs uppercase font-semibold text-slate-400 dark:text-neutral-500">
                  <th className="py-3 px-4">Certificate Type</th>
                  <th className="py-3 px-4">Serial Number</th>
                  <th className="py-3 px-4">Issued Date</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-neutral-850">
                {issued.map((cert) => {
                  const dateStr = cert.issuedAt
                    ? new Date(cert.issuedAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })
                    : "—";

                  return (
                    <tr
                      key={cert.serial}
                      className="hover:bg-slate-50/50 dark:hover:bg-neutral-900/30 transition-colors"
                    >
                      <td className="py-3.5 px-4 font-semibold text-slate-800 dark:text-neutral-200">
                        {cert.type}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-xs text-slate-600 dark:text-neutral-400">
                        {cert.serial}
                      </td>
                      <td className="py-3.5 px-4 text-xs text-slate-500 dark:text-neutral-400">
                        {dateStr}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {/* [PDF] Link */}
                          <a
                            href={`/api/certificates/${encodeURIComponent(
                              cert.serial
                            )}/pdf`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-2.5 py-1 text-xs font-medium rounded bg-blue-50 text-blue-700 dark:bg-neutral-800 dark:text-neutral-200 hover:bg-blue-100 dark:hover:bg-neutral-700 transition-colors"
                          >
                            PDF
                          </a>

                          {/* [Receipt] Link - only shown if paid */}
                          {cert.receiptNo && (
                            <a
                              href={`/api/student/requests/${cert.requestId}/receipt`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-2.5 py-1 text-xs font-medium rounded bg-emerald-50 text-emerald-700 dark:bg-neutral-800 dark:text-neutral-200 hover:bg-emerald-100 dark:hover:bg-neutral-700 transition-colors"
                            >
                              Receipt
                            </a>
                          )}

                          {/* [Verify] Link - opens /verify/[qrToken] in new tab */}
                          <a
                            href={`/verify/${encodeURIComponent(cert.qrToken)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-2.5 py-1 text-xs font-medium rounded border border-slate-300 dark:border-neutral-700 text-slate-700 dark:text-neutral-300 hover:bg-slate-100 dark:hover:bg-neutral-800 transition-colors"
                          >
                            Verify
                          </a>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
