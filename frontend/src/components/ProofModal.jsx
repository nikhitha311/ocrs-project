import React from 'react';
import { X, ShieldCheck, CheckCircle2, Download, Eye, FileText, Calendar, Building, User } from 'lucide-react';

export default function ProofModal({ isOpen, onClose, request }) {
  if (!isOpen || !request) return null;

  const studentName = request.studentName || 'Nikhitha Mandhula';
  const rollNumber = request.rollNumber || '24881A12A1';
  const department = request.department || 'Information Technology (IT)';
  const docName = request.documentName || 'student_id_card.pdf';
  const docUrl = request.documentDataUrl || null;

  return (
    <div className="modal-overlay" onClick={onClose} style={{ zIndex: 1300, padding: '16px' }}>
      <div 
        className="modal-content" 
        onClick={(e) => e.stopPropagation()} 
        style={{ 
          maxWidth: '680px', 
          width: '100%', 
          maxHeight: '92vh',
          background: 'var(--bg-card)',
          border: '1px solid var(--border-light)',
          boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.7), var(--shadow-glow)',
          borderRadius: '20px',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Header */}
        <div style={{
          padding: '20px 24px',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'var(--bg-glass-strong)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '38px',
              height: '38px',
              borderRadius: '10px',
              background: 'rgba(99, 102, 241, 0.15)',
              border: '1px solid rgba(99, 102, 241, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <FileText size={20} color="var(--accent-primary)" />
            </div>
            <div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: '800', margin: 0, color: 'var(--text-primary)' }}>
                Attached Document & Identity Proof
              </h3>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: 0 }}>
                {docName} • Submitted for {request.certificateType}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="btn btn-secondary btn-icon" style={{ borderRadius: '50%', width: '34px', height: '34px' }}>
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: '24px', overflowY: 'auto' }}>
          {/* If student uploaded an image file */}
          {docUrl ? (
            <div style={{ marginBottom: '20px', textAlign: 'center' }}>
              <div style={{
                borderRadius: '14px',
                overflow: 'hidden',
                border: '1px solid var(--border-subtle)',
                background: '#000',
                maxHeight: '360px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <img 
                  src={docUrl} 
                  alt="Student Uploaded Proof" 
                  style={{ maxWidth: '100%', maxHeight: '360px', objectFit: 'contain' }} 
                />
              </div>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '8px' }}>
                Uploaded Document Image: {docName}
              </p>
            </div>
          ) : null}

          {/* Authentic Institutional Student Identity Card */}
          <div style={{
            maxWidth: '520px',
            margin: '0 auto',
            borderRadius: '18px',
            background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
            border: '2px solid rgba(99, 102, 241, 0.4)',
            boxShadow: '0 12px 35px rgba(0, 0, 0, 0.45), 0 0 20px rgba(99, 102, 241, 0.2)',
            overflow: 'hidden',
            color: '#ffffff',
          }}>
            {/* ID Card Top Band */}
            <div style={{
              background: 'linear-gradient(135deg, #2563eb 0%, #4f46e5 100%)',
              padding: '12px 18px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Building size={18} color="#ffffff" />
                <div>
                  <div style={{ fontSize: '0.82rem', fontWeight: '800', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                    Institute of Higher Education & Technology
                  </div>
                  <div style={{ fontSize: '0.65rem', opacity: 0.9 }}>
                    Accredited Grade A+ • Directorate of Academic Affairs
                  </div>
                </div>
              </div>
              <span style={{
                fontSize: '0.65rem',
                fontWeight: '800',
                padding: '2px 7px',
                borderRadius: '4px',
                background: 'rgba(255, 255, 255, 0.25)',
              }}>
                STUDENT ID
              </span>
            </div>

            {/* ID Card Main Content */}
            <div style={{ padding: '20px', display: 'flex', gap: '18px', alignItems: 'center' }}>
              {/* Photo Area */}
              <div style={{
                width: '100px',
                height: '120px',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, #a855f7 0%, #6366f1 100%)',
                border: '2px solid rgba(255, 255, 255, 0.25)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
                flexShrink: 0,
              }}>
                <div style={{ fontSize: '2rem', fontWeight: '800' }}>
                  {studentName.slice(0, 2).toUpperCase()}
                </div>
                <span style={{ fontSize: '0.62rem', fontWeight: '700', textTransform: 'uppercase', marginTop: '4px', background: 'rgba(0, 0, 0, 0.3)', padding: '1px 6px', borderRadius: '4px' }}>
                  PHOTO ID
                </span>
              </div>

              {/* Student Details Column */}
              <div style={{ flex: 1, fontSize: '0.84rem' }}>
                <div style={{ fontSize: '1.15rem', fontWeight: '800', color: '#ffffff', marginBottom: '2px' }}>
                  {studentName}
                </div>
                <div style={{
                  display: 'inline-block',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.85rem',
                  fontWeight: '700',
                  color: '#67e8f9',
                  background: 'rgba(6, 182, 212, 0.15)',
                  padding: '2px 8px',
                  borderRadius: '6px',
                  marginBottom: '8px',
                }}>
                  ROLL NO: {rollNumber}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', fontSize: '0.76rem', color: '#cbd5e1' }}>
                  <div>
                    <span style={{ color: '#94a3b8' }}>Branch:</span> <strong>{department.split(' ')[0]}</strong>
                  </div>
                  <div>
                    <span style={{ color: '#94a3b8' }}>Program:</span> <strong>B.Tech</strong>
                  </div>
                  <div>
                    <span style={{ color: '#94a3b8' }}>Batch:</span> <strong>2024–2026</strong>
                  </div>
                  <div>
                    <span style={{ color: '#94a3b8' }}>Valid:</span> <strong style={{ color: '#34d399' }}>JUN 2026</strong>
                  </div>
                </div>
              </div>
            </div>

            {/* ID Card Bottom Bar with Barcode */}
            <div style={{
              background: '#0a0f1d',
              padding: '10px 20px',
              borderTop: '1px solid rgba(255, 255, 255, 0.08)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}>
              <div style={{ fontSize: '0.65rem', color: '#64748b', fontFamily: 'var(--font-mono)' }}>
                ||| | |||| | |||||| || | |||| |||| ||||
                <div style={{ marginTop: '1px' }}>ID-REF: {rollNumber}-2026-REG</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.65rem', color: '#34d399', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <ShieldCheck size={12} />
                  ACADEMIC AFFAIRS VERIFIED
                </div>
              </div>
            </div>
          </div>

          {/* Submission Context */}
          <div style={{
            marginTop: '20px',
            padding: '14px 18px',
            borderRadius: '12px',
            background: 'var(--bg-glass-strong)',
            border: '1px solid var(--border-subtle)',
            fontSize: '0.84rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}>
            <div>
              <span style={{ color: 'var(--text-muted)' }}>Purpose Declared:</span>{' '}
              <strong style={{ color: 'var(--text-primary)' }}>{request.purpose}</strong>
            </div>
            <div>
              <span style={{ color: 'var(--text-muted)' }}>Status:</span>{' '}
              <span style={{
                color: request.status === 'Approved' ? 'var(--success)' : 'var(--warning)',
                fontWeight: '700',
              }}>
                {request.status.toUpperCase()}
              </span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{
          padding: '16px 24px',
          borderTop: '1px solid var(--border-subtle)',
          display: 'flex',
          justifyContent: 'flex-end',
          background: 'var(--bg-glass-strong)',
        }}>
          <button onClick={onClose} className="btn btn-secondary">
            Close Proof
          </button>
        </div>
      </div>
    </div>
  );
}
