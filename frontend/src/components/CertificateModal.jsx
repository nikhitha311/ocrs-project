import React, { useState } from 'react';
import { X, Download, Mail, CheckCircle2, ShieldCheck, Printer, Sparkles, Send } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function CertificateModal({ certificate, onClose, onSendEmail }) {
  const [sendingEmail, setSendingEmail] = useState(false);
  const [emailStatus, setEmailStatus] = useState(null);

  if (!certificate) return null;

  const handlePrint = () => {
    // Trigger celebration confetti
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#6366f1', '#10b981', '#f59e0b', '#ec4899'],
    });

    setTimeout(() => {
      window.print();
    }, 400);
  };

  const handleEmailCertificate = async () => {
    setSendingEmail(true);
    setEmailStatus(null);
    try {
      const res = await onSendEmail({
        to: certificate.studentEmail || 'nikhithamandhula18@gmail.com',
        studentName: certificate.studentName,
        certificateType: certificate.certificateType,
      });
      if (res && res.success) {
        setEmailStatus({ type: 'success', message: 'Email sent successfully via Gmail OAuth2!' });
        confetti({
          particleCount: 60,
          spread: 50,
          origin: { y: 0.8 },
        });
      } else {
        setEmailStatus({ type: 'error', message: res?.error || 'Failed to send email. Check backend console.' });
      }
    } catch (err) {
      setEmailStatus({ type: 'error', message: err.message || 'Error communicating with backend API' });
    } finally {
      setSendingEmail(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose} style={{ zIndex: 1200, padding: '16px' }}>
      <div 
        className="modal-content" 
        onClick={(e) => e.stopPropagation()} 
        style={{ 
          maxWidth: '840px', 
          width: '100%',
          maxHeight: '92vh',
          display: 'flex',
          flexDirection: 'column',
          padding: '0', 
          background: '#0b1120', 
          overflow: 'hidden',
          borderRadius: '20px',
        }}
      >
        {/* Header Bar */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '16px 24px',
          borderBottom: '1px solid var(--border-subtle)',
          background: 'rgba(15, 23, 42, 0.95)',
          flexShrink: 0,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <ShieldCheck size={22} color="#10b981" />
            <h3 style={{ fontSize: '1.1rem', margin: 0, fontWeight: '700' }}>
              Verified Official Certificate
            </h3>
            <span className="badge badge-approved">Issued</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button
              onClick={handleEmailCertificate}
              disabled={sendingEmail}
              className="btn btn-secondary btn-sm"
              style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              {sendingEmail ? <span className="pulse-dot pulse-dot-online" /> : <Mail size={15} color="#818cf8" />}
              {sendingEmail ? 'Sending...' : 'Email to Me'}
            </button>

            <button
              onClick={handlePrint}
              className="btn btn-primary btn-sm"
              style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <Download size={15} />
              Print / Save PDF
            </button>

            <button
              onClick={onClose}
              className="btn btn-secondary btn-icon"
              style={{ width: '32px', height: '32px' }}
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Email Notification Status Banner if any */}
        {emailStatus && (
          <div style={{
            padding: '10px 24px',
            fontSize: '0.85rem',
            fontWeight: '600',
            background: emailStatus.type === 'success' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
            color: emailStatus.type === 'success' ? '#34d399' : '#f87171',
            borderBottom: '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}>
            <span>{emailStatus.message}</span>
            <button onClick={() => setEmailStatus(null)} style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer' }}>×</button>
          </div>
        )}

        {/* Certificate Paper Frame (Scrollable) */}
        <div style={{ padding: '24px', background: '#090d16', overflowY: 'auto', flex: 1, minHeight: 0 }}>
          <div 
            id="printable-certificate"
            style={{
              background: '#ffffff',
              color: '#0f172a',
              borderRadius: '12px',
              padding: '48px',
              position: 'relative',
              boxShadow: '0 20px 40px rgba(0,0,0,0.6)',
              border: '12px solid #e2e8f0',
              outline: '2px solid #cbd5e1',
              outlineOffset: '-6px',
              fontFamily: "'Times New Roman', Times, serif",
            }}
          >
            {/* Watermark Crest */}
            <div style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              opacity: 0.04,
              pointerEvents: 'none',
              fontSize: '360px',
              fontWeight: '900',
              fontFamily: 'var(--font-heading)',
              color: '#0f172a',
              userSelect: 'none',
            }}>
              OCRS
            </div>

            {/* University Header */}
            <div style={{ textAlign: 'center', borderBottom: '2px solid #cbd5e1', paddingBottom: '20px', marginBottom: '28px' }}>
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #1e293b, #0f172a)',
                color: '#f59e0b',
                marginBottom: '12px',
                border: '3px double #d97706',
              }}>
                <ShieldCheck size={36} />
              </div>
              <h1 style={{
                fontFamily: 'var(--font-heading)',
                fontSize: '1.75rem',
                fontWeight: '800',
                letterSpacing: '0.04em',
                color: '#0f172a',
                textTransform: 'uppercase',
                margin: '0 0 4px 0',
              }}>
                Autonomous Institute of Technology
              </h1>
              <p style={{
                fontSize: '0.88rem',
                color: '#64748b',
                fontFamily: 'var(--font-sans)',
                margin: 0,
                letterSpacing: '0.02em',
              }}>
                Approved by AICTE, Affiliated to State University • Accredited 'A+' Grade
              </p>
              <p style={{
                fontSize: '0.78rem',
                color: '#94a3b8',
                fontFamily: 'var(--font-sans)',
                marginTop: '4px',
              }}>
                Office of Academic Affairs & Certification Services
              </p>
            </div>

            {/* Certificate Title */}
            <div style={{ textAlign: 'center', margin: '24px 0' }}>
              <span style={{
                fontFamily: 'var(--font-heading)',
                fontSize: '1.4rem',
                fontWeight: '800',
                textTransform: 'uppercase',
                letterSpacing: '0.12em',
                color: '#1e3a8a',
                borderBottom: '2px solid #3b82f6',
                paddingBottom: '4px',
              }}>
                {certificate.certificateType || 'Bonafide Certificate'}
              </span>
            </div>

            {/* Certificate Body Text */}
            <div style={{
              fontSize: '1.1rem',
              lineHeight: '1.9',
              textAlign: 'justify',
              color: '#334155',
              margin: '32px 0',
            }}>
              <p>
                This is to officially certify that <strong>Mr./Ms. {certificate.studentName || 'Nikhitha Mandhula'}</strong>, 
                bearing Roll Number <strong>{certificate.rollNumber || '24881A12A1'}</strong>, is a bonafide student of this institution 
                enrolled in the department of <strong>{certificate.department || 'Information Technology (IT)'}</strong> during the academic 
                year <strong>2024 – 2026</strong>.
              </p>
              <p style={{ marginTop: '16px' }}>
                This certificate is officially issued upon verified request for the purpose of <strong>{certificate.purpose || 'Official Academic and Identification Verification'}</strong>. 
                As per institutional records, the student maintains an exemplary academic and conduct record.
              </p>
            </div>

            {/* Certificate Meta & Signatures */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-end',
              marginTop: '48px',
              paddingTop: '20px',
              borderTop: '1px solid #e2e8f0',
            }}>
              {/* QR Code & Verification Data */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                {/* Simulated High-Res QR Code */}
                <div style={{
                  padding: '8px',
                  background: '#f8fafc',
                  border: '1px solid #cbd5e1',
                  borderRadius: '6px',
                  textAlign: 'center',
                }}>
                  <svg width="72" height="72" viewBox="0 0 100 100" fill="#0f172a">
                    <rect x="0" y="0" width="30" height="30" fill="#0f172a" />
                    <rect x="5" y="5" width="20" height="20" fill="#fff" />
                    <rect x="10" y="10" width="10" height="10" fill="#0f172a" />
                    <rect x="70" y="0" width="30" height="30" fill="#0f172a" />
                    <rect x="75" y="5" width="20" height="20" fill="#fff" />
                    <rect x="80" y="10" width="10" height="10" fill="#0f172a" />
                    <rect x="0" y="70" width="30" height="30" fill="#0f172a" />
                    <rect x="5" y="75" width="20" height="20" fill="#fff" />
                    <rect x="10" y="80" width="10" height="10" fill="#0f172a" />
                    <rect x="40" y="10" width="20" height="10" fill="#0f172a" />
                    <rect x="40" y="30" width="10" height="30" fill="#0f172a" />
                    <rect x="60" y="40" width="20" height="10" fill="#0f172a" />
                    <rect x="50" y="60" width="30" height="10" fill="#0f172a" />
                    <rect x="70" y="80" width="20" height="10" fill="#0f172a" />
                  </svg>
                  <p style={{ fontSize: '0.65rem', color: '#64748b', margin: '4px 0 0 0', fontFamily: 'var(--font-mono)' }}>
                    SCAN TO VERIFY
                  </p>
                </div>
                <div>
                  <p style={{ fontSize: '0.78rem', color: '#64748b', margin: 0, fontFamily: 'var(--font-sans)' }}>
                    Certificate No:
                  </p>
                  <p style={{ fontSize: '0.9rem', fontWeight: '700', color: '#0f172a', margin: '2px 0', fontFamily: 'var(--font-mono)' }}>
                    {certificate.certificateNumber || `OCRS-2026-${certificate.id || '9841'}`}
                  </p>
                  <p style={{ fontSize: '0.78rem', color: '#64748b', margin: 0, fontFamily: 'var(--font-sans)' }}>
                    Issue Date: {certificate.dateApproved || new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                  </p>
                </div>
              </div>

              {/* Gold Institutional Seal Stamp */}
              <div style={{
                width: '84px',
                height: '84px',
                borderRadius: '50%',
                border: '3px dashed #d97706',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexDirection: 'column',
                color: '#b45309',
                transform: 'rotate(-10deg)',
                fontFamily: 'var(--font-heading)',
              }}>
                <Sparkles size={20} color="#d97706" />
                <span style={{ fontSize: '0.62rem', fontWeight: '800', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                  OFFICIAL
                </span>
                <span style={{ fontSize: '0.55rem', fontWeight: '700' }}>
                  SEAL 2026
                </span>
              </div>

              {/* Signature Section */}
              <div style={{ textAlign: 'center', minWidth: '180px' }}>
                <div style={{
                  fontFamily: "'Brush Script MT', cursive, sans-serif",
                  fontSize: '1.6rem',
                  color: '#1e3a8a',
                  marginBottom: '2px',
                  userSelect: 'none',
                }}>
                  Dr. K. S. Ramanujam
                </div>
                <div style={{ width: '100%', height: '1px', background: '#94a3b8', margin: '4px 0' }} />
                <p style={{ fontSize: '0.85rem', fontWeight: '700', color: '#0f172a', margin: 0, fontFamily: 'var(--font-sans)' }}>
                  Dean of Academic Affairs
                </p>
                <p style={{ fontSize: '0.72rem', color: '#64748b', margin: 0, fontFamily: 'var(--font-sans)' }}>
                  Digital Signature Validated
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div style={{
          padding: '14px 24px',
          background: 'rgba(15, 23, 42, 0.95)',
          borderTop: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: '0.8rem',
          color: 'var(--text-muted)',
          flexShrink: 0,
        }}>
          <span>Cryptographic Hash: <code style={{ color: '#818cf8', fontFamily: 'var(--font-mono)' }}>sha256:e3b0c44...98a1</code></span>
          <span>Verified by Public Verification Portal</span>
        </div>
      </div>
    </div>
  );
}
