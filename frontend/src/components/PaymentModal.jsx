import React, { useState, useEffect } from 'react';
import { X, CheckCircle2, ExternalLink, Download, Loader2, AlertCircle } from 'lucide-react';

const BACKEND_BASE_URL = 'http://localhost:5000';

export default function PaymentModal({ isOpen, onClose, request, onPaymentSuccess }) {
  const [loading, setLoading] = useState(true);
  const [paymentData, setPaymentData] = useState(null);
  const [upiTxnId, setUpiTxnId] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [successReceiptNo, setSuccessReceiptNo] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen && request?.id) {
      setLoading(true);
      setError(null);
      setSuccessReceiptNo(null);
      setUpiTxnId('');

      fetch(`${BACKEND_BASE_URL}/api/student/requests/${request.id}/payment`)
        .then((res) => res.json())
        .then((data) => {
          if (data.status === 'NOT_REQUIRED') {
            onClose();
          } else {
            setPaymentData(data);
          }
        })
        .catch((err) => {
          console.error(err);
          setError('Failed to load UPI payment details.');
        })
        .finally(() => setLoading(false));
    }
  }, [isOpen, request?.id]);

  const handleConfirm = async (e) => {
    e.preventDefault();
    if (!upiTxnId.trim()) {
      setError('Please enter your UPI Transaction ID');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch(`${BACKEND_BASE_URL}/api/student/requests/${request.id}/payment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ upiTxnId: upiTxnId.trim() }),
      });

      const data = await res.json();
      if (res.ok && data.ok) {
        setSuccessReceiptNo(data.receiptNo);
        if (onPaymentSuccess) {
          onPaymentSuccess(request.id, data.receiptNo, upiTxnId.trim());
        }
        setTimeout(() => {
          onClose();
        }, 3000);
      } else {
        setError(data.error || 'Failed to confirm payment.');
      }
    } catch (err) {
      setError('Connection error confirming payment.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen || !request) return null;

  return (
    <div className="modal-overlay" onClick={onClose} style={{ zIndex: 1250, padding: '16px' }}>
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: '520px',
          width: '100%',
          background: 'var(--bg-card)',
          border: '1px solid var(--border-light)',
          borderRadius: '20px',
          padding: '28px',
          textAlign: 'center',
          boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.7)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '800', color: 'var(--text-primary)' }}>
            Real UPI Payment
          </h3>
          <button onClick={onClose} className="btn btn-secondary btn-icon" style={{ borderRadius: '50%', width: '32px', height: '32px' }}>
            <X size={16} />
          </button>
        </div>

        {loading ? (
          <div style={{ padding: '40px 0', color: 'var(--text-muted)' }}>
            <Loader2 size={32} className="spin" style={{ margin: '0 auto 12px' }} />
            <p style={{ margin: 0, fontSize: '0.9rem' }}>Generating secure UPI QR code...</p>
          </div>
        ) : successReceiptNo ? (
          <div style={{ padding: '20px 0' }}>
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              background: 'rgba(16, 185, 129, 0.15)',
              border: '2px solid #10b981',
              color: '#10b981',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px',
            }}>
              <CheckCircle2 size={36} />
            </div>
            <h4 style={{ fontSize: '1.2rem', fontWeight: '800', color: '#10b981', margin: '0 0 8px' }}>
              Payment recorded ✓
            </h4>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', margin: '0 0 20px' }}>
              Receipt sent to your registered Gmail inbox ({successReceiptNo}).
            </p>
            <a
              href={`${BACKEND_BASE_URL}/api/student/requests/${request.id}/receipt`}
              download
              target="_blank"
              rel="noreferrer"
              className="btn btn-primary"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '10px 20px' }}
            >
              <Download size={16} /> Download Receipt
            </a>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '16px' }}>
              Redirecting to dashboard in 3 seconds...
            </p>
          </div>
        ) : paymentData ? (
          <div>
            <div style={{ fontSize: '2.2rem', fontWeight: '900', color: '#10b981', marginBottom: '4px' }}>
              ₹{paymentData.amount}
            </div>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', margin: '0 0 16px' }}>
              Fee for {request.certificateType} (Tracking ID: {request.trackingId || request.id})
            </p>

            <div style={{
              background: '#ffffff',
              padding: '16px',
              borderRadius: '16px',
              display: 'inline-block',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
              marginBottom: '14px',
            }}>
              <img
                src={paymentData.qrDataUrl}
                alt="UPI Payment QR Code"
                style={{ width: '220px', height: '220px', display: 'block' }}
              />
            </div>

            <div style={{ marginBottom: '14px' }}>
              <a
                href={paymentData.upiLink}
                className="btn btn-secondary"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.86rem', padding: '8px 18px' }}
              >
                <ExternalLink size={15} /> Open in UPI App
              </a>
            </div>

            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', margin: '0 0 20px', fontWeight: '500' }}>
              Scan with PhonePe, GPay, Paytm, BHIM or any UPI app
            </p>

            {error && (
              <div style={{
                background: 'rgba(239, 68, 68, 0.15)',
                border: '1px solid #ef4444',
                color: '#f87171',
                borderRadius: '8px',
                padding: '8px 12px',
                fontSize: '0.82rem',
                marginBottom: '14px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                justifyContent: 'center',
              }}>
                <AlertCircle size={15} /> {error}
              </div>
            )}

            <form onSubmit={handleConfirm}>
              <div style={{ textAlign: 'left', marginBottom: '16px' }}>
                <label style={{ fontSize: '0.82rem', fontWeight: '600', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
                  UPI Transaction ID
                </label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Enter UPI Txn ID / Ref Number..."
                  value={upiTxnId}
                  onChange={(e) => setUpiTxnId(e.target.value)}
                  required
                  style={{ width: '100%', fontFamily: 'var(--font-mono)' }}
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="btn btn-primary"
                style={{ width: '100%', padding: '12px', fontSize: '0.96rem', fontWeight: '700' }}
              >
                {submitting ? 'Confirming Payment...' : "I've Paid — Confirm"}
              </button>
            </form>
          </div>
        ) : null}
      </div>
    </div>
  );
}
