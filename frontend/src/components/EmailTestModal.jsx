import React, { useState } from 'react';
import { X, Mail, Send, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function EmailTestModal({ isOpen, onClose, onSendEmail }) {
  const [recipient, setRecipient] = useState('nikhithamandhula18@gmail.com');
  const [studentName, setStudentName] = useState('Nikhitha Mandhula');
  const [certType, setCertType] = useState('Bonafide Certificate');
  const [status, setStatus] = useState('idle'); // idle | loading | success | error
  const [responseLog, setResponseLog] = useState(null);

  if (!isOpen) return null;

  const handleSendTest = async (e) => {
    e.preventDefault();
    setStatus('loading');
    setResponseLog(null);

    try {
      const res = await onSendEmail({
        to: recipient,
        studentName,
        certificateType: certType,
      });

      if (res && res.success) {
        setStatus('success');
        setResponseLog(res);
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });
      } else {
        setStatus('error');
        setResponseLog(res || { error: 'Unknown server error' });
      }
    } catch (err) {
      setStatus('error');
      setResponseLog({ error: err.message });
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose} style={{ zIndex: 1300 }}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '540px' }}>
        {/* Header */}
        <div style={{
          padding: '20px 24px',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '8px',
              background: 'rgba(99, 102, 241, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <Mail size={18} color="#818cf8" />
            </div>
            <div>
              <h3 style={{ fontSize: '1.15rem', margin: 0 }}>Gmail OAuth2 Live Test</h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0 }}>
                Test backend email delivery via Node.js + Gmail SMTP OAuth2
              </p>
            </div>
          </div>
          <button onClick={onClose} className="btn btn-secondary btn-icon">
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSendTest} style={{ padding: '24px' }}>
          <div className="form-group">
            <label className="form-label">Recipient Email Address</label>
            <input
              type="email"
              className="form-input"
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              required
            />
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Configured sender: <code>nikhithamandhula18@gmail.com</code> (OAuth2 Verified)
            </span>
          </div>

          <div className="form-group">
            <label className="form-label">Student Name</label>
            <input
              type="text"
              className="form-input"
              value={studentName}
              onChange={(e) => setStudentName(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Certificate Type in Notification</label>
            <select
              className="form-select"
              value={certType}
              onChange={(e) => setCertType(e.target.value)}
            >
              <option value="Bonafide Certificate">Bonafide Certificate</option>
              <option value="Study & Conduct Certificate">Study & Conduct Certificate</option>
              <option value="Medium of Instruction">Medium of Instruction</option>
              <option value="Course Completion Certificate">Course Completion Certificate</option>
            </select>
          </div>

          {/* Status Message / Response Log */}
          {status === 'success' && (
            <div style={{
              padding: '14px',
              borderRadius: 'var(--radius-md)',
              background: 'rgba(16, 185, 129, 0.15)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              marginBottom: '16px',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#34d399', fontWeight: '700', fontSize: '0.9rem' }}>
                <CheckCircle2 size={18} /> Email Sent Successfully!
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: '4px 0 0 0' }}>
                Check inbox at <strong>{recipient}</strong>.
              </p>
              {responseLog?.messageId && (
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '4px', fontFamily: 'var(--font-mono)' }}>
                  Message ID: {responseLog.messageId}
                </div>
              )}
            </div>
          )}

          {status === 'error' && (
            <div style={{
              padding: '14px',
              borderRadius: 'var(--radius-md)',
              background: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              marginBottom: '16px',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#f87171', fontWeight: '700', fontSize: '0.9rem' }}>
                <AlertCircle size={18} /> Email Sending Failed
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: '4px 0 0 0' }}>
                {responseLog?.error || 'Make sure the backend server is running with `npm run dev`.'}
              </p>
            </div>
          )}

          {/* Action */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
            <button type="button" onClick={onClose} className="btn btn-secondary">
              Close
            </button>
            <button type="submit" disabled={status === 'loading'} className="btn btn-primary">
              <Send size={15} />
              {status === 'loading' ? 'Sending via Gmail...' : 'Send Live Test Email'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
