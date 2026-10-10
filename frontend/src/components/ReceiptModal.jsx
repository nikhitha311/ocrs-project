import React from 'react';
import { X, Printer, CheckCircle2, Download, ShieldCheck, Building2, CreditCard, Calendar, Clock, QrCode } from 'lucide-react';

export default function ReceiptModal({ isOpen, onClose, request }) {
  if (!isOpen || !request) return null;

  const receiptId = request.receiptNumber || `REC-2026-${request.id || '8819'}`;
  const studentName = request.studentName || 'Nikhitha Mandhula';
  const rollNumber = request.rollNumber || '24881A12A1';
  const department = request.department || 'Information Technology (IT)';
  const certificateType = request.certificateType || 'Transfer Certificate (TC)';
  const feeAmount = request.fee || (certificateType.includes('Migration') ? '₹150' : certificateType.includes('Transfer') ? '₹100' : 'Free');
  const numericFee = feeAmount.includes('Free') ? '0.00' : feeAmount.replace(/[^\d]/g, '') + '.00';
  const paymentMethod = request.paymentMethod || 'UPI';
  const paymentRef = request.paymentReference || 'UPI' + Math.floor(100000000000 + Math.random() * 900000000000);
  const appliedDate = request.appliedDate || new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  const appliedTime = request.appliedTime || '08:30 AM';
  const isRefunded = request.status === 'Rejected' && request.feePaid;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="modal-overlay" onClick={onClose} style={{ zIndex: 1350, padding: '16px' }}>
      <div 
        className="modal-content" 
        onClick={(e) => e.stopPropagation()} 
        style={{ 
          maxWidth: '680px', 
          width: '100%', 
          maxHeight: '94vh',
          background: 'var(--bg-card)',
          border: '1px solid var(--border-light)',
          boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.7), var(--shadow-glow)',
          borderRadius: '20px',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Header Bar */}
        <div style={{
          padding: '16px 24px',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'var(--bg-glass-strong)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              background: 'rgba(16, 185, 129, 0.15)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--success)',
            }}>
              <CheckCircle2 size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: '800', margin: 0, color: 'var(--text-primary)' }}>
                Official Fee Payment Receipt
              </h3>
              <p style={{ fontSize: '0.76rem', color: 'var(--text-muted)', margin: 0 }}>
                Verified institutional fee transaction record
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              onClick={handlePrint}
              className="btn btn-primary btn-sm"
              style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
              id="btn-print-receipt"
            >
              <Printer size={15} />
              Print / Save PDF
            </button>
            <button onClick={onClose} className="btn btn-secondary btn-icon" style={{ borderRadius: '50%', width: '34px', height: '34px' }}>
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Printable Receipt Frame */}
        <div style={{ padding: '24px', overflowY: 'auto', background: '#070b14' }}>
          <div 
            id="printable-receipt"
            style={{
              background: '#ffffff',
              color: '#0f172a',
              borderRadius: '14px',
              padding: '36px 38px',
              border: '2px solid #cbd5e1',
              boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
              position: 'relative',
              fontFamily: "'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
            }}
          >
            {/* Watermark */}
            <div style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%) rotate(-25deg)',
              fontSize: '110px',
              fontWeight: '900',
              color: isRefunded ? 'rgba(239, 68, 68, 0.08)' : 'rgba(16, 185, 129, 0.08)',
              pointerEvents: 'none',
              userSelect: 'none',
            }}>
              {isRefunded ? 'REFUNDED' : 'PAID'}
            </div>

            {/* University & Accounts Header */}
            <div style={{ textAlign: 'center', borderBottom: '2px solid #e2e8f0', paddingBottom: '16px', marginBottom: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                <ShieldCheck size={28} color="#0f172a" />
                <h2 style={{ fontSize: '1.35rem', fontWeight: '800', margin: 0, color: '#0f172a', letterSpacing: '0.02em', textTransform: 'uppercase' }}>
                  Autonomous Institute of Technology
                </h2>
              </div>
              <p style={{ fontSize: '0.8rem', color: '#64748b', margin: 0 }}>
                Office of Academic Affairs • Student Fee & Accounts Section
              </p>
              <div style={{
                display: 'inline-block',
                marginTop: '10px',
                padding: '4px 14px',
                borderRadius: '20px',
                background: isRefunded ? '#fee2e2' : '#dcfce7',
                border: `1px solid ${isRefunded ? '#fca5a5' : '#86efac'}`,
                color: isRefunded ? '#b91c1c' : '#166534',
                fontSize: '0.78rem',
                fontWeight: '800',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}>
                {isRefunded ? 'FEE REFUND INITIATED' : 'E-PAYMENT CONFIRMATION RECEIPT'}
              </div>
            </div>

            {/* Receipt Summary Grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '12px',
              padding: '14px 18px',
              background: '#f8fafc',
              borderRadius: '10px',
              border: '1px solid #e2e8f0',
              marginBottom: '20px',
              fontSize: '0.84rem',
            }}>
              <div>
                <span style={{ color: '#64748b', fontSize: '0.72rem', textTransform: 'uppercase', fontWeight: '600' }}>
                  Receipt Number
                </span>
                <div style={{ fontWeight: '800', color: '#0f172a', fontFamily: 'monospace', fontSize: '0.94rem' }}>
                  {receiptId}
                </div>
              </div>

              <div>
                <span style={{ color: '#64748b', fontSize: '0.72rem', textTransform: 'uppercase', fontWeight: '600' }}>
                  Transaction Date & Time
                </span>
                <div style={{ fontWeight: '700', color: '#0f172a' }}>
                  {appliedDate} • {appliedTime}
                </div>
              </div>

              <div>
                <span style={{ color: '#64748b', fontSize: '0.72rem', textTransform: 'uppercase', fontWeight: '600' }}>
                  Student Roll Number
                </span>
                <div style={{ fontWeight: '700', color: '#0f172a', fontFamily: 'monospace' }}>
                  {rollNumber}
                </div>
              </div>

              <div>
                <span style={{ color: '#64748b', fontSize: '0.72rem', textTransform: 'uppercase', fontWeight: '600' }}>
                  Student Full Name
                </span>
                <div style={{ fontWeight: '700', color: '#0f172a' }}>
                  {studentName}
                </div>
              </div>

              <div>
                <span style={{ color: '#64748b', fontSize: '0.72rem', textTransform: 'uppercase', fontWeight: '600' }}>
                  Department / Program
                </span>
                <div style={{ fontWeight: '600', color: '#334155' }}>
                  {department}
                </div>
              </div>

              <div>
                <span style={{ color: '#64748b', fontSize: '0.72rem', textTransform: 'uppercase', fontWeight: '600' }}>
                  Payment Mode & Ref
                </span>
                <div style={{ fontWeight: '700', color: '#0f172a' }}>
                  {paymentMethod} ({paymentRef.slice(0, 14)}...)
                </div>
              </div>
            </div>

            {/* Line Items Table */}
            <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '20px' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #cbd5e1', textAlign: 'left' }}>
                  <th style={{ padding: '8px 4px', fontSize: '0.76rem', color: '#475569', textTransform: 'uppercase' }}>Description / Purpose</th>
                  <th style={{ padding: '8px 4px', fontSize: '0.76rem', color: '#475569', textTransform: 'uppercase', textAlign: 'center' }}>Tracking Serial</th>
                  <th style={{ padding: '8px 4px', fontSize: '0.76rem', color: '#475569', textTransform: 'uppercase', textAlign: 'right' }}>Amount</th>
                </tr>
              </thead>
              <tbody>
                <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                  <td style={{ padding: '12px 4px', fontSize: '0.88rem', fontWeight: '600', color: '#0f172a' }}>
                    Fee for {certificateType}
                    <div style={{ fontSize: '0.74rem', color: '#64748b', fontWeight: 'normal' }}>
                      Purpose: {request.purpose || 'Official Academic Credential'}
                    </div>
                  </td>
                  <td style={{ padding: '12px 4px', fontSize: '0.82rem', fontFamily: 'monospace', color: '#334155', textAlign: 'center' }}>
                    {request.certificateNumber || 'OCRS-2026-9842'}
                  </td>
                  <td style={{ padding: '12px 4px', fontSize: '0.92rem', fontWeight: '700', color: '#0f172a', textAlign: 'right' }}>
                    ₹{numericFee}
                  </td>
                </tr>
                <tr>
                  <td colSpan={2} style={{ padding: '8px 4px', textAlign: 'right', fontSize: '0.8rem', color: '#64748b' }}>
                    Taxes & Levies (Exempt):
                  </td>
                  <td style={{ padding: '8px 4px', textAlign: 'right', fontSize: '0.82rem', color: '#64748b' }}>
                    ₹0.00
                  </td>
                </tr>
                <tr style={{ borderTop: '2px solid #0f172a' }}>
                  <td colSpan={2} style={{ padding: '10px 4px', textAlign: 'right', fontSize: '0.95rem', fontWeight: '800', color: '#0f172a' }}>
                    Total Amount Paid:
                  </td>
                  <td style={{ padding: '10px 4px', textAlign: 'right', fontSize: '1.15rem', fontWeight: '900', color: '#166534' }}>
                    ₹{numericFee}
                  </td>
                </tr>
              </tbody>
            </table>

            {/* Refund Reminder Notice if Rejected */}
            {isRefunded && (
              <div style={{
                padding: '12px 16px',
                borderRadius: '8px',
                background: '#fef2f2',
                border: '1px solid #f87171',
                marginBottom: '20px',
                color: '#991b1b',
                fontSize: '0.8rem',
              }}>
                <strong>⚠️ Refund Reminder Notice:</strong> As this request was rejected ({request.rejectionReason || 'Institutional review'}), a full refund of <strong>{feeAmount}</strong> has been initiated to your original {paymentMethod} account. Refund Ref: <strong>{request.refundReference || 'RFD-2026-8819'}</strong>. Expected credit within 2–3 business days.
              </div>
            )}

            {/* Footer Sign-off and Barcode */}
            <div style={{
              display: 'flex',
              alignItems: 'flex-end',
              justifyContent: 'space-between',
              paddingTop: '16px',
              borderTop: '1px solid #e2e8f0',
              marginTop: '12px',
            }}>
              <div>
                <div style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '4px 8px',
                  background: '#f1f5f9',
                  borderRadius: '6px',
                  fontFamily: 'monospace',
                  fontSize: '0.72rem',
                  color: '#475569',
                }}>
                  <QrCode size={16} />
                  <span>TRANSACTION RECORD HASH: 8f92c10a48b1</span>
                </div>
                <p style={{ fontSize: '0.68rem', color: '#94a3b8', margin: '4px 0 0 0' }}>
                  Generated digitally by OCRS Academic Accounts. No physical signature required.
                </p>
              </div>

              <div style={{ textAlign: 'center' }}>
                <div style={{
                  fontFamily: "'Brush Script MT', cursive",
                  fontSize: '1.4rem',
                  color: '#1e3a8a',
                  marginBottom: '2px',
                }}>
                  Accounts Controller
                </div>
                <div style={{ width: '130px', height: '1px', background: '#94a3b8', margin: '0 auto 4px auto' }} />
                <div style={{ fontSize: '0.74rem', fontWeight: '700', color: '#0f172a' }}>
                  Finance & Accounts Section
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div style={{
          padding: '14px 24px',
          borderTop: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'var(--bg-glass-strong)',
        }}>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            Keep this receipt for your personal academic finance records.
          </span>
          <button onClick={onClose} className="btn btn-secondary">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
