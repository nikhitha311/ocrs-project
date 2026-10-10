"use client";

import React, { useState, useEffect } from "react";

interface ProfileData {
  name: string;
  rollNo: string;
  department: string;
  program: string;
  batch: string;
  email: string;
  phone: string;
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [editEmail, setEditEmail] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [statusMessage, setStatusMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/student/profile");
      if (res.ok) {
        const data = await res.json();
        setProfile(data);
        setEditEmail(data.email || "");
        setEditPhone(data.phone || "");
      }
    } catch (err) {
      console.error("Error fetching profile:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleStartEdit = () => {
    if (profile) {
      setEditEmail(profile.email || "");
      setEditPhone(profile.phone || "");
    }
    setStatusMessage(null);
    setEditing(true);
  };

  const handleCancelEdit = () => {
    if (profile) {
      setEditEmail(profile.email || "");
      setEditPhone(profile.phone || "");
    }
    setEditing(false);
    setStatusMessage(null);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setStatusMessage(null);

    try {
      const res = await fetch("/api/student/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: editEmail,
          phone: editPhone,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setProfile(data.profile);
        setEditing(false);
        setStatusMessage({
          type: "success",
          text: "Contact information updated successfully.",
        });
      } else {
        const err = await res.json();
        setStatusMessage({
          type: "error",
          text: err.error || "Failed to save contact info",
        });
      }
    } catch (err: any) {
      setStatusMessage({
        type: "error",
        text: err?.message || "An error occurred",
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-center text-sm text-slate-500 dark:text-neutral-400">
        Loading profile details...
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="p-8 text-center text-sm text-red-500">
        Unable to load profile data.
      </div>
    );
  }

  const initial = profile.name ? profile.name.charAt(0).toUpperCase() : "S";

  return (
    <div className="bg-white dark:bg-neutral-950 border border-slate-200 dark:border-neutral-800 rounded-xl p-6 sm:p-8 shadow-sm">
      {statusMessage && (
        <div
          className={`mb-6 p-4 rounded-lg text-sm flex items-center justify-between ${
            statusMessage.type === "success"
              ? "bg-emerald-50 text-emerald-800 border border-emerald-200 dark:bg-neutral-900 dark:text-emerald-400 dark:border-neutral-800"
              : "bg-red-50 text-red-800 border border-red-200 dark:bg-neutral-900 dark:text-red-400 dark:border-neutral-800"
          }`}
        >
          <span>{statusMessage.text}</span>
          <button
            onClick={() => setStatusMessage(null)}
            className="text-xs opacity-75 hover:opacity-100"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Top Profile Header: Avatar & Main Identity */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-100 dark:border-neutral-800 gap-4">
        <div className="flex items-center gap-4">
          {/* Avatar circle (initial, blue-100 bg) */}
          <div className="w-16 h-16 rounded-full bg-blue-100 dark:bg-neutral-800 text-blue-600 dark:text-white flex items-center justify-center font-bold text-2xl select-none shadow-inner">
            {initial}
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-neutral-100">
              {profile.name}
            </h2>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs font-mono font-medium px-2 py-0.5 rounded bg-slate-100 dark:bg-neutral-800 text-slate-700 dark:text-neutral-300">
                {profile.rollNo}
              </span>
              <span className="text-xs text-slate-500 dark:text-neutral-400">
                Verified Student
              </span>
            </div>
          </div>
        </div>

        <div>
          {!editing ? (
            <button
              type="button"
              id="edit-contact-btn"
              onClick={handleStartEdit}
              className="inline-flex items-center px-4 py-2 text-sm font-medium rounded-lg border border-slate-300 dark:border-neutral-700 text-slate-700 dark:text-neutral-200 hover:bg-slate-50 dark:hover:bg-neutral-900 transition-colors"
            >
              Edit Contact Info
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleCancelEdit}
                disabled={submitting}
                className="px-3 py-2 text-sm font-medium rounded-lg border border-slate-300 dark:border-neutral-800 text-slate-600 dark:text-neutral-400 hover:bg-slate-100 dark:hover:bg-neutral-900 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={submitting}
                className="px-4 py-2 text-sm font-medium rounded-lg bg-blue-600 text-white dark:bg-white dark:text-black hover:opacity-90 transition-opacity"
              >
                {submitting ? "Saving..." : "Save"}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Info grid: Roll No, Department, Program, Batch, Email, Phone */}
      <form onSubmit={handleSave} className="mt-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Roll No */}
          <div className="p-4 rounded-lg bg-slate-50 dark:bg-neutral-900/50 border border-slate-100 dark:border-neutral-800/80">
            <span className="text-xs uppercase font-medium text-slate-400 dark:text-neutral-500">
              Roll Number (Locked)
            </span>
            <p className="mt-1 font-semibold text-slate-800 dark:text-neutral-200 font-mono">
              {profile.rollNo}
            </p>
          </div>

          {/* Department */}
          <div className="p-4 rounded-lg bg-slate-50 dark:bg-neutral-900/50 border border-slate-100 dark:border-neutral-800/80">
            <span className="text-xs uppercase font-medium text-slate-400 dark:text-neutral-500">
              Department (Locked)
            </span>
            <p className="mt-1 font-semibold text-slate-800 dark:text-neutral-200">
              {profile.department}
            </p>
          </div>

          {/* Program */}
          <div className="p-4 rounded-lg bg-slate-50 dark:bg-neutral-900/50 border border-slate-100 dark:border-neutral-800/80">
            <span className="text-xs uppercase font-medium text-slate-400 dark:text-neutral-500">
              Program (Locked)
            </span>
            <p className="mt-1 font-semibold text-slate-800 dark:text-neutral-200">
              {profile.program}
            </p>
          </div>

          {/* Batch */}
          <div className="p-4 rounded-lg bg-slate-50 dark:bg-neutral-900/50 border border-slate-100 dark:border-neutral-800/80">
            <span className="text-xs uppercase font-medium text-slate-400 dark:text-neutral-500">
              Batch (Locked)
            </span>
            <p className="mt-1 font-semibold text-slate-800 dark:text-neutral-200">
              {profile.batch}
            </p>
          </div>

          {/* Email - Editable */}
          <div className="p-4 rounded-lg bg-slate-50 dark:bg-neutral-900/50 border border-slate-100 dark:border-neutral-800/80">
            <span className="text-xs uppercase font-medium text-slate-400 dark:text-neutral-500">
              Registered Email
            </span>
            {editing ? (
              <input
                type="email"
                required
                value={editEmail}
                onChange={(e) => setEditEmail(e.target.value)}
                className="mt-1.5 w-full px-3 py-1.5 text-sm rounded-md border border-slate-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-slate-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            ) : (
              <p className="mt-1 font-semibold text-slate-800 dark:text-neutral-200">
                {profile.email}
              </p>
            )}
          </div>

          {/* Phone - Editable */}
          <div className="p-4 rounded-lg bg-slate-50 dark:bg-neutral-900/50 border border-slate-100 dark:border-neutral-800/80">
            <span className="text-xs uppercase font-medium text-slate-400 dark:text-neutral-500">
              Phone Number
            </span>
            {editing ? (
              <input
                type="tel"
                required
                value={editPhone}
                onChange={(e) => setEditPhone(e.target.value)}
                className="mt-1.5 w-full px-3 py-1.5 text-sm rounded-md border border-slate-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-slate-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            ) : (
              <p className="mt-1 font-semibold text-slate-800 dark:text-neutral-200">
                {profile.phone}
              </p>
            )}
          </div>
        </div>

        {editing && (
          <div className="mt-6 flex justify-end gap-3">
            <button
              type="button"
              onClick={handleCancelEdit}
              disabled={submitting}
              className="px-4 py-2 text-sm font-medium rounded-lg border border-slate-300 dark:border-neutral-800 text-slate-600 dark:text-neutral-400 hover:bg-slate-100 dark:hover:bg-neutral-900"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2 text-sm font-medium rounded-lg bg-blue-600 text-white dark:bg-white dark:text-black hover:opacity-90"
            >
              {submitting ? "Saving..." : "Save Changes"}
            </button>
          </div>
        )}
      </form>
    </div>
  );
}
