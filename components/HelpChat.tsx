"use client";

import React, { useState, useEffect, useRef } from "react";

interface Message {
  id: string;
  sender: "bot" | "user";
  text: string;
}

const KB = [
  {
    keys: ["request", "new", "apply", "how do i get"],
    reply:
      "Go to your Dashboard → click '+ New Request' → choose certificate type → add purpose → Submit. You'll get a tracking ID instantly.",
  },
  {
    keys: ["pay", "payment", "upi", "qr", "fee", "money"],
    reply:
      "Open your request → if fee is pending, click 'Pay Now'. Scan the UPI QR with PhonePe/GPay/Paytm, then enter the UPI txn ID and confirm. Registrar verifies before approval.",
  },
  {
    keys: ["receipt", "proof"],
    reply:
      "After payment, a receipt PDF is generated and emailed to your registered Gmail. You can also download it from Profile → Documents → Issued Certificates → [Receipt].",
  },
  {
    keys: ["track", "status", "where", "progress"],
    reply:
      "Your Dashboard lists all requests with live status. Click any row to see the full approval timeline.",
  },
  {
    keys: ["verify", "fake", "authentic", "forgery"],
    reply:
      "Every issued certificate has a QR code. Anyone can scan it or visit /verify/[token] to confirm authenticity instantly — no login needed.",
  },
  {
    keys: ["download", "pdf", "print"],
    reply:
      "Once your certificate is ISSUED, go to Profile → Documents → Issued Certificates, and click PDF to download.",
  },
  {
    keys: ["reject", "denied", "why rejected"],
    reply:
      "Rejections include a reason in the request timeline. Fix the issue and submit a new request, or contact the registrar office.",
  },
  {
    keys: ["profile", "edit", "phone", "email"],
    reply:
      "Open My Profile → Edit Contact Info to update email and phone. Academic details are locked.",
  },
  {
    keys: ["login", "password", "forgot"],
    reply:
      "Use the Student tab on the login page with your roll number. For password reset, contact the registrar office.",
  },
  {
    keys: ["admin", "approve", "queue"],
    reply:
      "Admins see the queue at /admin/dashboard — approve, reject, or request more info. Approval auto-issues the PDF certificate.",
  },
  {
    keys: ["hi", "hello", "hey"],
    reply: "Hello! How can I help you with OCRS today?",
  },
  {
    keys: ["thanks", "thank you", "ok"],
    reply: "You're welcome! Anything else I can help with?",
  },
];

const QUICK_CHIPS = [
  "How do I request a certificate?",
  "Payment not working",
  "How to verify a certificate?",
  "Track my request",
];

export default function HelpChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "initial",
      sender: "bot",
      text: "Hi! I'm your OCRS assistant. Ask me anything about requesting certificates, payments, tracking, or verification.",
    },
  ]);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSendMessage = (textToSend?: string) => {
    const rawText = textToSend !== undefined ? textToSend : input;
    const query = rawText.trim();
    if (!query) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      sender: "user",
      text: query,
    };

    setMessages((prev) => [...prev, userMsg]);
    if (textToSend === undefined) {
      setInput("");
    }

    // Keyword lookup
    const lower = query.toLowerCase();
    const match = KB.find((entry) =>
      entry.keys.some((key) => lower.includes(key))
    );

    const replyText = match
      ? match.reply
      : "I didn't quite get that. Try asking about requesting, paying, tracking, or verifying certificates.";

    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          sender: "bot",
          text: replyText,
        },
      ]);
    }, 400);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <>
      {/* Floating Chat Button: 56x56 round, black (light) / white (dark), fixed bottom-6 right-6 z-50 */}
      <button
        type="button"
        id="ocrs-help-btn"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label="Open OCRS Help Chat"
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-black text-white dark:bg-white dark:text-black shadow-2xl flex items-center justify-center transition-transform hover:scale-105 active:scale-95 focus:outline-none"
      >
        {isOpen ? (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M18 6 6 18" />
            <path d="m6 6 12 12" />
          </svg>
        ) : (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="26"
            height="26"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
        )}
      </button>

      {/* Chat Window Panel: 360x480, rounded-xl, shadow-2xl */}
      {isOpen && (
        <div
          id="ocrs-help-panel"
          className="fixed bottom-24 right-6 z-50 w-[360px] h-[480px] rounded-xl shadow-2xl flex flex-col bg-white dark:bg-neutral-950 border border-slate-200 dark:border-neutral-800 overflow-hidden text-slate-900 dark:text-neutral-100"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 dark:border-neutral-800 bg-slate-50 dark:bg-neutral-900">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="font-semibold text-sm">OCRS Help</span>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-md text-slate-400 hover:text-slate-700 dark:hover:text-neutral-200 transition-colors"
              aria-label="Close Help Chat"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M18 6 6 18" />
                <path d="m6 6 12 12" />
              </svg>
            </button>
          </div>

          {/* Scrollable message list */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 text-sm">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex ${
                  m.sender === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`rounded-lg px-3 py-2 max-w-[80%] leading-relaxed ${
                    m.sender === "user"
                      ? "bg-black text-white dark:bg-white dark:text-black font-medium"
                      : "bg-slate-100 dark:bg-neutral-800 text-slate-800 dark:text-neutral-200"
                  }`}
                >
                  {m.text}
                </div>
              </div>
            ))}

            {/* Quick reply chips */}
            {messages.length === 1 && (
              <div className="pt-2 flex flex-col gap-1.5">
                <span className="text-xs text-slate-400 dark:text-neutral-500 font-medium">
                  Suggested Questions:
                </span>
                {QUICK_CHIPS.map((chip, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSendMessage(chip)}
                    className="text-left text-xs px-2.5 py-1.5 rounded-md bg-slate-100 dark:bg-neutral-900 hover:bg-slate-200 dark:hover:bg-neutral-800 border border-slate-200 dark:border-neutral-800 transition-colors text-slate-700 dark:text-neutral-300"
                  >
                    {chip}
                  </button>
                ))}
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input row + Send button at bottom */}
          <div className="p-3 border-t border-slate-200 dark:border-neutral-800 bg-white dark:bg-neutral-950">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask a question..."
                className="flex-1 px-3 py-2 text-sm border rounded-lg bg-transparent text-slate-900 dark:text-neutral-100 placeholder-slate-400 dark:placeholder-neutral-500 border-slate-300 dark:border-neutral-700 focus:outline-none focus:ring-1 focus:ring-slate-400 dark:focus:ring-neutral-500"
              />
              <button
                type="button"
                onClick={() => handleSendMessage()}
                disabled={!input.trim()}
                className="px-3 py-2 text-sm font-medium rounded-lg bg-black text-white dark:bg-white dark:text-black disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-90 transition-opacity"
              >
                Send
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
