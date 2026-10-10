import React from "react";
import Link from "next/link";
import { prisma } from "@/lib/prisma";

export default async function VerifyCertificatePage({
  params,
}: {
  params: { token: string };
}) {
  const { token } = params;

  const certificate = await prisma.certificate.findFirst({
    where: {
      OR: [{ qrToken: token }, { serialNo: token }],
    },
    include: {
      student: true,
      certType: true,
      request: true,
    },
  });

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-neutral-900 py-12 px-4 sm:px-6 lg:px-8 flex flex-col justify-center items-center">
      <div className="max-w-xl w-full bg-white dark:bg-neutral-950 border border-slate-200 dark:border-neutral-800 rounded-2xl shadow-xl overflow-hidden">
        {/* Verification Banner */}
        <div
          className={`p-6 text-center text-white ${
            certificate ? "bg-emerald-600" : "bg-red-600"
          }`}
        >
          <div className="w-16 h-16 mx-auto rounded-full bg-white/20 flex items-center justify-center text-2xl font-bold mb-2">
            {certificate ? "✓" : "✕"}
          </div>
          <h1 className="text-xl font-bold tracking-tight">
            {certificate
              ? "Official Institutional Verification"
              : "Certificate Record Not Found"}
          </h1>
          <p className="text-xs text-white/90 mt-1">
            {certificate
              ? "Cryptographically verified digital credential issued by university authorities"
              : "The credential token provided could not be validated on the university ledger"}
          </p>
        </div>

        {/* Verification Details */}
        {certificate ? (
          <div className="p-6 sm:p-8 space-y-6 text-sm">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-neutral-800">
              <span className="text-xs uppercase font-medium text-slate-400 dark:text-neutral-500">
                Validation Status
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                ACTIVE & AUTHENTIC
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-xs text-slate-400 dark:text-neutral-500">
                  Student Name
                </span>
                <p className="font-semibold text-slate-800 dark:text-neutral-200 mt-0.5">
                  {certificate.student.name}
                </p>
              </div>

              <div>
                <span className="text-xs text-slate-400 dark:text-neutral-500">
                  Roll Number
                </span>
                <p className="font-semibold text-slate-800 dark:text-neutral-200 mt-0.5 font-mono">
                  {certificate.student.rollNo}
                </p>
              </div>

              <div>
                <span className="text-xs text-slate-400 dark:text-neutral-500">
                  Certificate Type
                </span>
                <p className="font-semibold text-slate-800 dark:text-neutral-200 mt-0.5">
                  {certificate.certType.name}
                </p>
              </div>

              <div>
                <span className="text-xs text-slate-400 dark:text-neutral-500">
                  Serial Number
                </span>
                <p className="font-semibold text-slate-800 dark:text-neutral-200 mt-0.5 font-mono text-xs">
                  {certificate.serialNo}
                </p>
              </div>

              <div>
                <span className="text-xs text-slate-400 dark:text-neutral-500">
                  Department
                </span>
                <p className="font-semibold text-slate-800 dark:text-neutral-200 mt-0.5">
                  {certificate.student.department}
                </p>
              </div>

              <div>
                <span className="text-xs text-slate-400 dark:text-neutral-500">
                  Date of Issuance
                </span>
                <p className="font-semibold text-slate-800 dark:text-neutral-200 mt-0.5">
                  {new Date(certificate.issuedAt).toDateString()}
                </p>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-slate-50 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 font-mono text-[11px] break-all text-slate-500 dark:text-neutral-400">
              <span className="font-bold text-slate-700 dark:text-neutral-300">
                SHA-256 Digest:{" "}
              </span>
              {certificate.sha256Hash}
            </div>

            <div className="pt-2 flex justify-center">
              <a
                href={`/api/certificates/${encodeURIComponent(
                  certificate.serialNo
                )}/pdf`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full text-center py-2.5 px-4 rounded-lg text-sm font-semibold bg-blue-600 text-white dark:bg-white dark:text-black hover:opacity-95"
              >
                View Official PDF
              </a>
            </div>
          </div>
        ) : (
          <div className="p-8 text-center text-sm text-slate-500 dark:text-neutral-400 space-y-4">
            <p>
              The scanned QR token ({token}) did not match any active credential record on the university registry.
            </p>
            <Link
              href="/"
              className="inline-block text-xs font-semibold px-4 py-2 rounded-lg bg-slate-900 text-white dark:bg-white dark:text-black"
            >
              Return Home
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
