import React, { useState, useEffect } from 'react';
import { 
  X, Check, AlertCircle, Edit3, ShieldCheck, FileText, CheckCircle2, 
  Eye, Building, User, Calendar, Award, Lock, DollarSign, CreditCard, Sparkles, Printer
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function DocumentAuditModal({
  isOpen,
  onClose,
  request,
  onApproveWithData,
  onReject,
  onViewProof,
}) {
  const [activeTab, setActiveTab] = useState('audit'); // 'audit' | 'preview'
  const [formData, setFormData] = useState({
    studentName: '',
    rollNumber: '',
    department: '',
    academicYear: '2024-2026',
    purpose: '',
    urgency: 'Normal',
    registrarRemarks: 'Verified against institutional database. All university requirements satisfied.',
    isIdProofVerified: true,
    isDuesCleared: true,
  });

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (request) {
      setFormData({
        studentName: request.studentName || '',
        rollNumber: request.rollNumber || '',
        department: request.department || '',
        academicYear: request.academicYear || '2024-2026',
        purpose: request.purpose || '',
        urgency: request.urgency || 'Normal',
        registrarRemarks: request.notes || 'Verified against institutional database. All university requirements satisfied.',
        isIdProofVerified: true,
        isDuesCleared: true,
      });
      setActiveTab('audit');
    }
  }, [request]);

  if (!isOpen || !request) return null;

  const isPaid = request.fee && request.fee !== 'Free' || request.certificateType?.includes('Transfer') || request.certificateType?.includes('Migration');
  const feeValue = request.fee || (request.certificateType?.includes('Migration') ? '₹150' : request.certificateType?.includes('Transfer') ? '₹100' : 'Free');
  const receiptNum = request.receiptNumber || 'REC-2026-8819';
  const payMode = request.paymentMethod || 'UPI';

  const handleApprove = async () => {
    setSaving(true);
    try {
      if (onApproveWithData) {
        await onApproveWithData(request.id, {
          studentName: formData.studentName, // locked to original
          rollNumber: formData.rollNumber,
          department: formData.department,
          academicYear: formData.academicYear,
          purpose: formData.purpose,
          urgency: formData.urgency,
          registrarRemarks: formData.registrarRemarks,
        });
      }

      confetti({
        particleCount: 85,
        spread: 60,
        origin: { y: 0.6 },
      });
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose} style={{ zIndex: 1250, padding: '16px' }}>
      <div 
        className="modal-content" 
        onClick={(e) => e.stopPropagation()} 
        style={{ 
          maxWidth: activeTab === 'preview' ? '880px' : '820px', 
          width: '100%', 
          maxHeight: '94vh',
          background: 'var(--bg-card)',
          border: '1px solid var(--border-light)',
          boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.7), var(--shadow-glow)',
          borderRadius: '20px',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          transition: 'all 0.25s ease',
        }}
      >
        {/* Header */}
        <div style={{
          padding: '18px 24px',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'var(--bg-glass-strong)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              background: 'rgba(16, 185, 129, 0.15)',
              border: '1px solid rgba(16, 185, 129, 0.35)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <ShieldCheck size={22} color="var(--success)" />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h3 style={{ fontSize: '1.2rem', fontWeight: '800', margin: 0, color: 'var(--text-primary)' }}>
                  Audit & Approval Console
                </h3>
                <span style={{
                  fontSize: '0.7rem',
                  fontWeight: '700',
                  padding: '2px 8px',
                  borderRadius: '10px',
                  background: 'rgba(245, 158, 11, 0.15)',
                  color: 'var(--warning)',
                  border: '1px solid rgba(245, 158, 11, 0.3)',
                }}>
                  PENDING VERIFICATION
                </span>
              </div>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: '2px 0 0 0' }}>
                Review ID proof, modify allowed details, inspect live certificate before official issuance
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {/* View switcher tabs */}
            <div style={{
              display: 'flex',
              background: 'var(--bg-glass)',
              padding: '3px',
              borderRadius: 'var(--radius-full)',
              border: '1px solid var(--border-subtle)',
            }}>
              <button
                type="button"
                onClick={() => setActiveTab('audit')}
                style={{
                  padding: '5px 14px',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '0.78rem',
                  fontWeight: activeTab === 'audit' ? '700' : '500',
                  color: activeTab === 'audit' ? '#fff' : 'var(--text-secondary)',
                  background: activeTab === 'audit' ? 'var(--accent-primary)' : 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                  transition: 'all 0.2s ease',
                }}
              >
                <Edit3 size={13} />
                Audit & Edit
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('preview')}
                style={{
                  padding: '5px 14px',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '0.78rem',
                  fontWeight: activeTab === 'preview' ? '700' : '500',
                  color: activeTab === 'preview' ? '#fff' : 'var(--text-secondary)',
                  background: activeTab === 'preview' ? '#10b981' : 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                  transition: 'all 0.2s ease',
                }}
              >
                <Eye size={13} />
                Live Certificate Preview
              </button>
            </div>

            <button onClick={onClose} className="btn btn-secondary btn-icon" style={{ borderRadius: '50%', width: '34px', height: '34px' }}>
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Tab 1: Audit & Edit Form */}
        {activeTab === 'audit' && (
          <div style={{ padding: '24px 26px', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '18px' }}>
            {/* Top Bar: Certificate info & Fee Breakdown on the side */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '14px',
            }}>
              {/* Requested Certificate */}
              <div style={{
                padding: '14px 18px',
                borderRadius: '12px',
                background: 'var(--bg-glass-strong)',
                border: '1px solid var(--border-subtle)',
              }}>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '600' }}>
                  Requested Certificate
                </span>
                <div style={{ fontSize: '1.05rem', fontWeight: '800', color: 'var(--text-primary)' }}>
                  {request.certificateType}
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--accent-primary)', fontFamily: 'var(--font-mono)', marginTop: '2px' }}>
                  Tracking ID: {request.certificateNumber}
                </div>
              </div>

              {/* Fee & Payment Breakdown on the side */}
              <div style={{
                padding: '14px 18px',
                borderRadius: '12px',
                background: isPaid ? 'rgba(16, 185, 129, 0.08)' : 'var(--bg-glass-strong)',
                border: `1px solid ${isPaid ? 'rgba(16, 185, 129, 0.3)' : 'var(--border-subtle)'}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}>
                <div>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '600' }}>
                    Payment & Fee Status
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '2px' }}>
                    <span style={{
                      fontSize: '0.85rem',
                      fontWeight: '800',
                      color: isPaid ? '#10b981' : 'var(--text-primary)',
                    }}>
                      {isPaid ? `PAID (${feeValue})` : 'FREE (Institutional)'}
                    </span>
                    <span className="badge badge-approved" style={{ fontSize: '0.68rem', padding: '2px 6px' }}>
                      {payMode}
                    </span>
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                    Receipt / Trans ID
                  </span>
                  <div style={{ fontSize: '0.8rem', fontFamily: 'var(--font-mono)', color: 'var(--text-primary)', fontWeight: '700' }}>
                    {receiptNum}
                  </div>
                </div>
              </div>
            </div>

            {/* Attached Student ID Proof Card (Clickable to view) */}
            <div style={{
              padding: '16px 20px',
              borderRadius: '14px',
              background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.08) 0%, rgba(56, 189, 248, 0.05) 100%)',
              border: '1px solid var(--border-light)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '12px',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '10px',
                  background: 'rgba(99, 102, 241, 0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <FileText size={22} color="var(--accent-primary)" />
                </div>
                <div>
                  <div style={{ fontSize: '0.92rem', fontWeight: '700', color: 'var(--text-primary)' }}>
                    Student Identity Proof: {request.documentName || 'student_id_card.pdf'}
                  </div>
                  <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>
                    Mandatory ID attachment by student • Click button to view ID proof card & photo
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  if (onViewProof) onViewProof(request);
                }}
                className="btn btn-secondary btn-sm"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: 'rgba(99, 102, 241, 0.15)',
                  borderColor: 'rgba(99, 102, 241, 0.4)',
                  color: 'var(--accent-primary)',
                  fontWeight: '700',
                }}
                id="btn-view-proof-audit"
              >
                <Eye size={15} />
                Inspect Student ID Proof
              </button>
            </div>

            {/* Editable Fields Grid (Student Name is strictly LOCKED by Higher Authority) */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                <h4 style={{ fontSize: '0.92rem', fontWeight: '700', color: 'var(--text-primary)', margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Edit3 size={15} color="var(--accent-primary)" />
                  Verify & Correct Certificate Data:
                </h4>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Clerical corrections will appear in the issued certificate
                </span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                {/* 1. Student Full Name: LOCKED / READ-ONLY (Higher Authority) */}
                <div className="form-group" style={{ margin: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <label className="form-label" style={{ fontSize: '0.78rem', margin: 0 }}>Student Full Name</label>
                    <span style={{
                      fontSize: '0.7rem',
                      color: '#f59e0b',
                      fontWeight: '700',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      background: 'rgba(245, 158, 11, 0.12)',
                      padding: '2px 6px',
                      borderRadius: '4px',
                      border: '1px solid rgba(245, 158, 11, 0.3)',
                    }}>
                      <Lock size={11} /> Locked by Higher Authority
                    </span>
                  </div>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.studentName}
                    disabled
                    readOnly
                    style={{
                      background: 'rgba(255, 255, 255, 0.03)',
                      color: 'var(--text-secondary)',
                      cursor: 'not-allowed',
                      borderColor: 'rgba(245, 158, 11, 0.3)',
                      fontWeight: '600',
                    }}
                    title="Student legal name cannot be modified by admin. Authority rule: University Registrar only."
                  />
                  <div style={{ fontSize: '0.71rem', color: '#fbbf24', marginTop: '3px' }}>
                    * Institutional integrity rule: Student legal name is tied to enrollment and cannot be edited by faculty admin.
                  </div>
                </div>

                {/* 2. Roll Number / Hall Ticket: EDITABLE */}
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label" style={{ fontSize: '0.78rem' }}>Roll Number / Hall Ticket</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.rollNumber}
                    onChange={(e) => setFormData({ ...formData, rollNumber: e.target.value })}
                    style={{ fontFamily: 'var(--font-mono)' }}
                    required
                  />
                </div>

                {/* 3. Department / Branch: EDITABLE */}
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label" style={{ fontSize: '0.78rem' }}>Department / Branch</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    required
                  />
                </div>

                {/* 4. Purpose of Certificate: EDITABLE */}
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label" style={{ fontSize: '0.78rem' }}>Purpose of Certificate</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.purpose}
                    onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
                    required
                  />
                </div>
              </div>

              {/* Academic Year */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginTop: '14px' }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label" style={{ fontSize: '0.78rem' }}>Academic Batch / Year</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.academicYear}
                    onChange={(e) => setFormData({ ...formData, academicYear: e.target.value })}
                    placeholder="e.g. 2024-2026"
                  />
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label" style={{ fontSize: '0.78rem' }}>Urgency Flag</label>
                  <select
                    className="form-select"
                    value={formData.urgency}
                    onChange={(e) => setFormData({ ...formData, urgency: e.target.value })}
                    style={{ fontSize: '0.84rem' }}
                  >
                    <option value="Normal">Normal Standard</option>
                    <option value="Urgent">Urgent Priority (Tatkal)</option>
                  </select>
                </div>
              </div>

              {/* Registrar Clearance Remarks */}
              <div className="form-group" style={{ marginTop: '14px', marginBottom: 0 }}>
                <label className="form-label" style={{ fontSize: '0.78rem' }}>
                  Registrar Clearance Remarks (Printed on Official Certificate Note)
                </label>
                <textarea
                  className="form-textarea"
                  value={formData.registrarRemarks}
                  onChange={(e) => setFormData({ ...formData, registrarRemarks: e.target.value })}
                  rows={2}
                  placeholder="Institutional clearance remarks..."
                />
              </div>
            </div>

            {/* Audit Verification Checkboxes */}
            <div style={{
              padding: '14px 18px',
              borderRadius: '12px',
              background: 'var(--bg-glass-strong)',
              border: '1px solid var(--border-subtle)',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
            }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontSize: '0.84rem' }}>
                <input
                  type="checkbox"
                  checked={formData.isIdProofVerified}
                  onChange={(e) => setFormData({ ...formData, isIdProofVerified: e.target.checked })}
                />
                <span style={{ color: 'var(--text-primary)' }}>
                  <strong>Student ID Proof Verified:</strong> Attached document ({request.documentName || 'student_id_card.pdf'}) matches official institutional photo database.
                </span>
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontSize: '0.84rem' }}>
                <input
                  type="checkbox"
                  checked={formData.isDuesCleared}
                  onChange={(e) => setFormData({ ...formData, isDuesCleared: e.target.checked })}
                />
                <span style={{ color: 'var(--text-primary)' }}>
                  <strong>No Dues & Fee Clearance:</strong> Library, laboratory dues, and tuition fee records are fully cleared.
                </span>
              </label>
            </div>
          </div>
        )}

        {/* Tab 2: Live Certificate Preview Before Approval */}
        {activeTab === 'preview' && (
          <div style={{ padding: '20px 24px', overflowY: 'auto', flex: 1, background: '#090d16' }}>
            <div style={{
              padding: '10px 16px',
              background: 'rgba(16, 185, 129, 0.12)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              borderRadius: '8px',
              marginBottom: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#34d399', fontSize: '0.84rem', fontWeight: '700' }}>
                <Eye size={16} />
                Live Pre-Issuance Proof: Reviewing exactly how the final certificate will be generated
              </div>
              <button
                type="button"
                onClick={() => setActiveTab('audit')}
                className="btn btn-secondary btn-sm"
                style={{ fontSize: '0.76rem', padding: '4px 10px' }}
              >
                ← Back to Edit Details
              </button>
            </div>

            {/* Printable Certificate Sheet Simulation */}
            <div 
              style={{
                background: '#ffffff',
                color: '#0f172a',
                borderRadius: '12px',
                padding: '40px 48px',
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
                fontSize: '320px',
                fontWeight: '900',
                fontFamily: 'var(--font-heading)',
                color: '#0f172a',
                userSelect: 'none',
              }}>
                OCRS
              </div>

              {/* University Header */}
              <div style={{ textAlign: 'center', borderBottom: '2px solid #cbd5e1', paddingBottom: '16px', marginBottom: '22px' }}>
                <div style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '56px',
                  height: '56px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #1e293b, #0f172a)',
                  color: '#f59e0b',
                  marginBottom: '10px',
                  border: '3px double #d97706',
                }}>
                  <ShieldCheck size={32} />
                </div>
                <h2 style={{
                  fontFamily: 'var(--font-heading)',
                  fontSize: '1.6rem',
                  fontWeight: '800',
                  letterSpacing: '0.04em',
                  color: '#0f172a',
                  textTransform: 'uppercase',
                  margin: '0 0 4px 0',
                }}>
                  Autonomous Institute of Technology
                </h2>
                <p style={{
                  fontSize: '0.84rem',
                  color: '#64748b',
                  fontFamily: 'var(--font-sans)',
                  margin: 0,
                  letterSpacing: '0.02em',
                }}>
                  Approved by AICTE, Affiliated to State University • Accredited 'A+' Grade
                </p>
                <p style={{
                  fontSize: '0.74rem',
                  color: '#94a3b8',
                  fontFamily: 'var(--font-sans)',
                  marginTop: '4px',
                }}>
                  Office of Academic Affairs & Certification Services
                </p>
              </div>

              {/* Certificate Title */}
              <div style={{ textAlign: 'center', margin: '20px 0' }}>
                <span style={{
                  fontFamily: 'var(--font-heading)',
                  fontSize: '1.3rem',
                  fontWeight: '800',
                  textTransform: 'uppercase',
                  letterSpacing: '0.12em',
                  color: '#1e3a8a',
                  borderBottom: '2px solid #3b82f6',
                  paddingBottom: '4px',
                }}>
                  {request.certificateType || 'Bonafide Certificate'}
                </span>
              </div>

              {/* Certificate Body Text with Live Edited Fields */}
              <div style={{
                fontSize: '1.05rem',
                lineHeight: '1.85',
                textAlign: 'justify',
                color: '#334155',
                margin: '28px 0',
              }}>
                <p>
                  This is to officially certify that <strong>Mr./Ms. {formData.studentName}</strong>, 
                  bearing Roll Number <strong>{formData.rollNumber}</strong>, is a verified student of this institution 
                  enrolled in the department of <strong>{formData.department}</strong> during the academic 
                  batch <strong>{formData.academicYear}</strong>.
                </p>
                <p style={{ marginTop: '14px' }}>
                  This credential is officially issued upon verified request for the purpose of <strong>{formData.purpose}</strong>. 
                  As per institutional records, the student maintains an exemplary academic and conduct record.
                </p>
                {formData.registrarRemarks && (
                  <p style={{ marginTop: '12px', fontSize: '0.92rem', fontStyle: 'italic', color: '#475569' }}>
                    Note / Clearance: "{formData.registrarRemarks}"
                  </p>
                )}
              </div>

              {/* Certificate Meta & Signatures */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-end',
                marginTop: '40px',
                paddingTop: '16px',
                borderTop: '1px solid #e2e8f0',
              }}>
                {/* QR Code & Verification Data */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <div style={{
                    padding: '6px',
                    background: '#f8fafc',
                    border: '1px solid #cbd5e1',
                    borderRadius: '6px',
                    textAlign: 'center',
                  }}>
                    <svg width="64" height="64" viewBox="0 0 100 100" fill="#0f172a">
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
                    <p style={{ fontSize: '0.6rem', color: '#64748b', margin: '2px 0 0 0', fontFamily: 'var(--font-mono)' }}>
                      SCAN TO VERIFY
                    </p>
                  </div>
                  <div>
                    <p style={{ fontSize: '0.74rem', color: '#64748b', margin: 0, fontFamily: 'var(--font-sans)' }}>
                      Certificate No:
                    </p>
                    <p style={{ fontSize: '0.88rem', fontWeight: 'bold', margin: '2px 0', fontFamily: 'var(--font-mono)', color: '#0f172a' }}>
                      {request.certificateNumber}
                    </p>
                    <p style={{ fontSize: '0.72rem', color: '#10b981', margin: 0, fontWeight: '700', fontFamily: 'var(--font-sans)' }}>
                      ✓ AICTE Cryptographic Seal Active
                    </p>
                  </div>
                </div>

                {/* Signatures */}
                <div style={{ textAlign: 'center' }}>
                  <div style={{
                    fontFamily: "'Brush Script MT', cursive, sans-serif",
                    fontSize: '1.7rem',
                    color: '#1e3a8a',
                    transform: 'rotate(-4deg)',
                    marginBottom: '2px',
                  }}>
                    Dr. K. S. Ramanujam
                  </div>
                  <div style={{ width: '150px', height: '1.5px', background: '#94a3b8', margin: '0 auto 4px auto' }} />
                  <p style={{ fontSize: '0.82rem', fontWeight: 'bold', margin: 0, color: '#0f172a', fontFamily: 'var(--font-sans)' }}>
                    Dean of Academic Affairs
                  </p>
                  <p style={{ fontSize: '0.7rem', color: '#64748b', margin: 0, fontFamily: 'var(--font-sans)' }}>
                    Authorized Controller of Examinations
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Footer Actions */}
        <div style={{
          padding: '16px 26px',
          borderTop: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'var(--bg-glass-strong)',
        }}>
          <button 
            type="button" 
            onClick={() => {
              if (onReject) onReject(request.id);
              onClose();
            }} 
            className="btn btn-secondary btn-sm"
            style={{ color: 'var(--danger)' }}
          >
            Reject with Remarks
          </button>

          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            {activeTab === 'audit' ? (
              <button 
                type="button" 
                onClick={() => setActiveTab('preview')} 
                className="btn btn-secondary"
                style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <Eye size={15} color="var(--accent-primary)" />
                Preview Certificate First
              </button>
            ) : (
              <button 
                type="button" 
                onClick={() => setActiveTab('audit')} 
                className="btn btn-secondary"
              >
                Edit Further
              </button>
            )}

            <button
              type="button"
              onClick={handleApprove}
              disabled={saving || !formData.isIdProofVerified}
              className="btn btn-primary"
              style={{
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                borderColor: '#10b981',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '0 4px 14px rgba(16, 185, 129, 0.35)',
              }}
              id="btn-confirm-approve-audit"
            >
              <Check size={16} />
              {saving ? 'Issuing with Digital Seal...' : 'Approve & Issue Certificate'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
