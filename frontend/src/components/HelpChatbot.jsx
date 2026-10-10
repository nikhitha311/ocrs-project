import React, { useState, useRef, useEffect } from 'react';
import { 
  MessageSquare, X, Send, Bot, User, ShieldAlert, 
  HelpCircle, Clock, CheckCircle2, ChevronRight, Phone, 
  Sparkles, FileText, CreditCard, Lock, AlertTriangle, AlertCircle, Receipt
} from 'lucide-react';

const DOCUMENT_CATEGORIES = [
  {
    id: 'doc_bonafide',
    label: '📄 Bonafide Docs',
    title: 'Bonafide Certificate: Required Documents',
    reply: `📄 **Bonafide Certificate Requirements**:\n\n• **Mandatory Document**: Valid College Student ID Card (PDF or JPG/PNG).\n• **Institutional Checks**: Active enrollment status in the university database.\n• **Fee**: 100% FREE (Institutional Standard).\n• **Processing Time**: 24 Hours.`,
  },
  {
    id: 'doc_conduct',
    label: '📄 Study & Conduct Docs',
    title: 'Study & Conduct: Required Documents',
    reply: `📄 **Study & Conduct Certificate Requirements**:\n\n• **Mandatory Documents**: \n  1. College Student ID Card\n  2. Latest Semester Marksheet / Hall Ticket copy.\n• **Institutional Checks**: Disciplinary record check with Head of Department.\n• **Fee**: 100% FREE.\n• **Processing Time**: 24–48 Hours.`,
  },
  {
    id: 'doc_moi',
    label: '📄 MOI (English) Docs',
    title: 'Medium of Instruction: Required Documents',
    reply: `📄 **Medium of Instruction (MOI - English) Requirements**:\n\n• **Mandatory Documents**:\n  1. College Student ID Card\n  2. Consolidated Marksheet or Degree Certificate.\n• **Purpose**: Higher education abroad (MS/MBA) or visa processing.\n• **Fee**: 100% FREE.\n• **Processing Time**: 48 Hours.`,
  },
  {
    id: 'doc_tc',
    label: '📄 Transfer Cert (TC) Docs',
    title: 'Transfer Certificate (TC): Required Documents',
    reply: `📄 **Transfer Certificate (TC) Requirements**:\n\n• **Mandatory Documents**:\n  1. College Student ID Card\n  2. Institutional No-Dues Clearance Slip (Library, Laboratory, Hostel, & Tuition Accounts).\n• **Statutory Fee**: ₹100 (Payable via online UPI QR Code or Card).\n• **Official Receipt**: Generated immediately upon payment.\n• **Processing Time**: 3–5 Working Days.`,
  },
  {
    id: 'doc_migration',
    label: '📄 Migration Cert Docs',
    title: 'Migration Certificate: Required Documents',
    reply: `📄 **Migration Certificate Requirements**:\n\n• **Mandatory Documents**:\n  1. College Student ID Card\n  2. Provisional Certificate or Issued TC copy.\n• **Statutory Fee**: ₹150 (Payable via online UPI QR Code or Card).\n• **Official Receipt**: Generated immediately upon payment.\n• **Processing Time**: 3–5 Working Days.`,
  },
];

const PROBLEM_CATEGORIES = [
  {
    id: 'prob_rejected',
    label: '⚠️ Application Rejected & Refund',
    title: 'Why was my application rejected and what about my fee?',
    reply: `⚠️ **Application Rejection & Fee Refund Protocol**:\n\n1. **Check Exact Reason**: Log into the Student Portal dashboard. Under your rejected application, a red alert box displays the exact administrative remarks (e.g. illegible student ID card, pending library books).\n2. **Automatic Fee Refund**: If you paid for a Transfer (₹100) or Migration (₹150) certificate, a **full refund is automatically initiated** to your original UPI/Card account.\n3. **Refund Tracking**: Your dashboard displays an official Refund Reference ID (e.g. RFD-2026-XXXX). Credit reflects in your bank within 2–3 working days.\n4. **Re-Application**: Once you correct your documents, submit a fresh application.`,
  },
  {
    id: 'prob_receipt',
    label: '🧾 Missing / Download Receipt',
    title: 'Money debited but where is my payment receipt?',
    reply: `🧾 **Official Payment & Fee Receipts**:\n\n1. **Instant Receipt**: As soon as payment is confirmed, your official institutional receipt is generated.\n2. **View Anytime**: Go to the **Student Portal** and click on the **'Payment & Receipts History'** tab.\n3. **Download / Print**: Click the **'View Receipt'** button to view your official breakdown with receipt number, transaction hash, and 1-click PDF download.\n4. **Payment Query**: If bank debited amount but ledger is delayed, email **accounts@ocrs.edu** with your UPI UTR reference.`,
  },
  {
    id: 'prob_name_lock',
    label: '🔒 Why is Student Name Locked?',
    title: 'Why can\'t I or the faculty admin edit my legal name?',
    reply: `🔒 **Legal Student Name Protection Rule**:\n\n• Under University Examination and Credentialing regulations, a student's legal name is tied strictly to government enrollment and identity registers.\n• Faculty administrators are **strictly prohibited** from editing student names to prevent fraud.\n• If your official name has a typographical error, submit a legal name rectification request with 10th grade marksheet proof to the **University Registrar Office (Room 101, Main Administrative Building)**.`,
  },
  {
    id: 'prob_emergency',
    label: '🚨 Urgent / Tatkal Emergency',
    title: 'Need certificate urgently for Visa or Loan deadline today?',
    reply: `🚨 **Urgent / Tatkal Processing Guide**:\n\n1. Select **'Urgent Priority (Tatkal)'** when applying and mention your submission deadline in the notes.\n2. For immediate same-day emergency authorization, contact the Academic Controller:\n   • **Dean Office Direct Phone**: +91 (040) 2345-6789 (Ext. 204)\n   • **Priority Emergency Email**: dean.academics@ocrs.edu\n   • **In-Person Desk**: Room 104, Administrative Block (Mon–Sat, 9:30 AM – 5:00 PM).`,
  },
];

export default function HelpChatbot({ requests = [], currentUser = null }) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState('docs'); // 'docs' | 'problems'
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'bot',
      text: `Hello ${currentUser?.name ? currentUser.name.split(' ')[0] : 'there'}! 👋 Welcome to the OCRS Institutional Helpdesk.\n\nI provide exact guidance on **Related Documents Required** and **Common Problems & Solutions** (fee receipts, rejection refunds, urgent Tatkal, and rules).\n\nTap any topic below or type your question:`,
      time: 'Just now',
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const addBotResponse = (text) => {
    setIsTyping(true);
    setTimeout(() => {
      setMessages(prev => [
        ...prev,
        {
          id: Date.now(),
          sender: 'bot',
          text,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        }
      ]);
      setIsTyping(false);
    }, 450);
  };

  const handleSelectTopic = (title, reply) => {
    setMessages(prev => [
      ...prev,
      {
        id: Date.now(),
        sender: 'user',
        text: title,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      }
    ]);
    addBotResponse(reply);
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const userText = inputValue.trim();
    setInputValue('');

    setMessages(prev => [
      ...prev,
      {
        id: Date.now(),
        sender: 'user',
        text: userText,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      }
    ]);

    // Accurate Keyword Query Resolution
    const q = userText.toLowerCase();
    let reply = '';

    if (q.includes('reject') || q.includes('refund') || q.includes('cancel')) {
      reply = `⚠️ **Rejection & Refund Status**:\nWhen a request is rejected, the admin's specific reason is shown on your dashboard. For paid certificates (TC/Migration), a full refund is automatically initiated to your original payment source (UPI/Card). Refund Ref is displayed on your portal.`;
    } else if (q.includes('receipt') || q.includes('bill') || q.includes('transaction') || q.includes('rec-')) {
      reply = `🧾 **Official Payment Receipt**:\nYou can view and print your receipt anytime! Go to **Student Portal** -> switch to the **'Payment & Receipts History'** tab -> click **'View Receipt'** to download the official PDF.`;
    } else if (q.includes('bonafide')) {
      reply = `📄 **Bonafide Certificate Documents**:\nYou only need to attach your **Valid College Student ID Card**. No fee is required (100% Free). Issued in 24 hours.`;
    } else if (q.includes('conduct') || q.includes('study')) {
      reply = `📄 **Study & Conduct Certificate Documents**:\nAttach your **College Student ID Card** and your **Latest Semester Marksheet / Hall Ticket**. 100% Free.`;
    } else if (q.includes('tc') || q.includes('transfer')) {
      reply = `📄 **Transfer Certificate (TC) Documents**:\nAttach your **College Student ID Card** + **Institutional No-Dues Clearance Slip** (Library, Lab, Hostel, and Accounts). Statutory Fee: **₹100**. Receipt generated instantly.`;
    } else if (q.includes('migration')) {
      reply = `📄 **Migration Certificate Documents**:\nAttach your **College Student ID Card** + **Provisional Degree / TC copy**. Statutory Fee: **₹150**. Receipt generated instantly.`;
    } else if (q.includes('name') || q.includes('spelling') || q.includes('correct name')) {
      reply = `🔒 **Name Editing Rule**:\nStudent legal names are protected by Higher University Authority and cannot be changed by faculty admins. For official name changes, visit the University Registrar Office with 10th grade marksheet proof.`;
    } else if (q.includes('emergency') || q.includes('urgent') || q.includes('tatkal') || q.includes('today')) {
      reply = `🚨 **Emergency Tatkal Support**:\nMark your application as 'Urgent Priority' during submission. For immediate clearance, call Controller Helpline: **+91 (040) 2345-6789** or visit Room 104, Admin Block.`;
    } else if (q.includes('roll') || q.includes('profile')) {
      reply = `👤 Click your **Roll Number** anywhere in the portal to open your complete verified student profile, document records, and history!`;
    } else {
      reply = `Thank you for your question. For accurate help, please select one of the **Related Documents** or **Problems & Solutions** chips above, or visit the Academic Affairs Office (Room 104, Admin Block).`;
    }

    addBotResponse(reply);
  };

  return (
    <>
      {/* Floating Launcher Button with strictly 'Need Help' label */}
      <div 
        style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          zIndex: 9999,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-end',
          gap: '8px',
        }}
      >
        {!isOpen && (
          <div style={{
            background: 'rgba(15, 23, 42, 0.95)',
            border: '1px solid rgba(99, 102, 241, 0.45)',
            padding: '6px 14px',
            borderRadius: 'var(--radius-full)',
            fontSize: '0.8rem',
            color: '#c7d2fe',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.4)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontWeight: '700',
            animation: 'fadeIn 0.3s ease',
          }}>
            <span className="pulse-dot pulse-dot-online" />
            <span>Need Help</span>
          </div>
        )}

        <button
          onClick={() => setIsOpen(prev => !prev)}
          style={{
            width: '58px',
            height: '58px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 50%, #10b981 100%)',
            border: '2px solid rgba(255, 255, 255, 0.25)',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            boxShadow: '0 8px 28px rgba(99, 102, 241, 0.45)',
            transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
            transform: isOpen ? 'rotate(90deg)' : 'rotate(0deg)',
          }}
          title="Need Help - Academic Documents & Problem Concierge"
          id="btn-chatbot-launcher"
        >
          {isOpen ? <X size={26} /> : <MessageSquare size={26} />}
        </button>
      </div>

      {/* Chat Window Drawer */}
      {isOpen && (
        <div style={{
          position: 'fixed',
          bottom: '96px',
          right: '24px',
          width: '390px',
          maxWidth: 'calc(100vw - 32px)',
          height: '570px',
          maxHeight: 'calc(100vh - 120px)',
          background: 'var(--bg-card)',
          borderRadius: '20px',
          border: '1px solid var(--border-light)',
          boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.7), var(--shadow-glow)',
          zIndex: 9999,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          animation: 'slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        }}>
          {/* Header */}
          <div style={{
            padding: '16px 20px',
            background: 'linear-gradient(135deg, #1e1b4b 0%, #0f172a 100%)',
            borderBottom: '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{
                width: '38px',
                height: '38px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #6366f1, #10b981)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                boxShadow: '0 2px 10px rgba(99, 102, 241, 0.4)',
              }}>
                <Bot size={20} />
              </div>
              <div>
                <div style={{ fontSize: '0.96rem', fontWeight: '800', color: '#fff' }}>
                  Need Help? Academic Concierge
                </div>
                <div style={{ fontSize: '0.72rem', color: '#34d399', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span className="pulse-dot pulse-dot-online" style={{ width: '6px', height: '6px' }} />
                  Accurate Documents & Problem Resolution
                </div>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="btn btn-secondary btn-icon"
              style={{ width: '32px', height: '32px', borderRadius: '50%', padding: 0 }}
            >
              <X size={16} />
            </button>
          </div>

          {/* Sub Navigation: Related Documents vs Problems */}
          <div style={{
            display: 'flex',
            background: 'var(--bg-glass-strong)',
            padding: '6px 12px',
            borderBottom: '1px solid var(--border-subtle)',
            gap: '8px',
          }}>
            <button
              type="button"
              onClick={() => setActiveCategory('docs')}
              style={{
                flex: 1,
                padding: '6px 10px',
                borderRadius: 'var(--radius-full)',
                fontSize: '0.76rem',
                fontWeight: activeCategory === 'docs' ? '700' : '500',
                background: activeCategory === 'docs' ? 'var(--accent-primary)' : 'transparent',
                color: activeCategory === 'docs' ? '#fff' : 'var(--text-secondary)',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
            >
              📋 Related Documents
            </button>
            <button
              type="button"
              onClick={() => setActiveCategory('problems')}
              style={{
                flex: 1,
                padding: '6px 10px',
                borderRadius: 'var(--radius-full)',
                fontSize: '0.76rem',
                fontWeight: activeCategory === 'problems' ? '700' : '500',
                background: activeCategory === 'problems' ? 'var(--accent-primary)' : 'transparent',
                color: activeCategory === 'problems' ? '#fff' : 'var(--text-secondary)',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
            >
              ⚡ Problems & Solutions
            </button>
          </div>

          {/* Quick Action Chips Bar */}
          <div style={{
            padding: '8px 12px',
            background: 'var(--bg-glass)',
            borderBottom: '1px solid var(--border-subtle)',
            overflowX: 'auto',
            whiteSpace: 'nowrap',
            display: 'flex',
            gap: '6px',
            scrollbarWidth: 'none',
          }}>
            {activeCategory === 'docs' ? (
              DOCUMENT_CATEGORIES.map(doc => (
                <button
                  key={doc.id}
                  type="button"
                  onClick={() => handleSelectTopic(doc.title, doc.reply)}
                  style={{
                    padding: '5px 10px',
                    borderRadius: 'var(--radius-full)',
                    background: 'rgba(99, 102, 241, 0.14)',
                    border: '1px solid rgba(99, 102, 241, 0.3)',
                    color: '#c7d2fe',
                    fontSize: '0.73rem',
                    fontWeight: '600',
                    cursor: 'pointer',
                    flexShrink: 0,
                  }}
                >
                  {doc.label}
                </button>
              ))
            ) : (
              PROBLEM_CATEGORIES.map(prob => (
                <button
                  key={prob.id}
                  type="button"
                  onClick={() => handleSelectTopic(prob.title, prob.reply)}
                  style={{
                    padding: '5px 10px',
                    borderRadius: 'var(--radius-full)',
                    background: 'rgba(239, 68, 68, 0.12)',
                    border: '1px solid rgba(239, 68, 68, 0.35)',
                    color: '#fca5a5',
                    fontSize: '0.73rem',
                    fontWeight: '600',
                    cursor: 'pointer',
                    flexShrink: 0,
                  }}
                >
                  {prob.label}
                </button>
              ))
            )}
          </div>

          {/* Messages Thread */}
          <div style={{
            flex: 1,
            padding: '16px',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
          }}>
            {messages.map(msg => (
              <div
                key={msg.id}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                }}
              >
                <div style={{
                  maxWidth: '86%',
                  padding: '10px 14px',
                  borderRadius: msg.sender === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                  background: msg.sender === 'user' 
                    ? 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)' 
                    : 'var(--bg-glass-strong)',
                  color: '#ffffff',
                  fontSize: '0.84rem',
                  lineHeight: '1.45',
                  border: msg.sender === 'user' ? 'none' : '1px solid var(--border-subtle)',
                  whiteSpace: 'pre-wrap',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                }}>
                  {msg.text}
                </div>
                <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: '3px', padding: '0 4px' }}>
                  {msg.time}
                </span>
              </div>
            ))}

            {isTyping && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)', fontSize: '0.78rem', fontStyle: 'italic' }}>
                <span className="pulse-dot pulse-dot-online" style={{ width: '6px', height: '6px' }} />
                Concierge is formulating accurate guidance...
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Form */}
          <form
            onSubmit={handleSendMessage}
            style={{
              padding: '12px 14px',
              borderTop: '1px solid var(--border-subtle)',
              background: 'var(--bg-glass-strong)',
              display: 'flex',
              gap: '8px',
            }}
          >
            <input
              type="text"
              className="form-input"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Ask document needs or problem..."
              style={{ flex: 1, padding: '9px 12px', fontSize: '0.84rem', borderRadius: '12px' }}
            />
            <button
              type="submit"
              className="btn btn-primary"
              style={{
                width: '40px',
                height: '40px',
                padding: 0,
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
              }}
            >
              <Send size={16} />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
