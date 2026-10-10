import React, { useState, useEffect } from 'react';
import { 
  X, FileText, UploadCloud, CheckCircle2, Clock, Sparkles, 
  CreditCard, QrCode, Building, ShieldCheck, Check, Copy, ArrowRight, DollarSign, AlertCircle
} from 'lucide-react';
import QRCode from 'qrcode';
import confetti from 'canvas-confetti';

const CERTIFICATE_TYPES = [
  { id: 'bonafide', name: 'Bonafide Certificate', fee: 'Free', turnaround: '24 Hours' },
  { id: 'study_conduct', name: 'Study & Conduct Certificate', fee: 'Free', turnaround: '24-48 Hours' },
  { id: 'medium_instruction', name: 'Medium of Instruction (English)', fee: 'Free', turnaround: '48 Hours' },
  { id: 'course_completion', name: 'Course Completion Certificate', fee: 'Free', turnaround: '2-3 Days' },
  { id: 'transfer_cert', name: 'Transfer Certificate (TC)', fee: '₹100', turnaround: '3-5 Days' },
  { id: 'migration_cert', name: 'Migration Certificate', fee: '₹150', turnaround: '3-5 Days' },
];

export default function NewRequestModal({ isOpen, onClose, onSubmitRequest, onShowReceipt, currentUser, requests = [] }) {
  const [formData, setFormData] = useState({
    certificateType: 'Transfer Certificate (TC)',
    studentName: 'Nikhitha Mandhula',
    rollNumber: '24881A12A1',
    department: 'Information Technology (IT)',
    academicYear: '2024-2026',
    studentEmail: 'nikhithamandhula18@gmail.com',
    purpose: 'Higher Education Admissions',
    customPurpose: '',
    urgency: 'Normal',
    notes: '',
  });

  useEffect(() => {
    if (currentUser) {
      setFormData(prev => ({
        ...prev,
        studentName: currentUser.name || prev.studentName,
        rollNumber: currentUser.rollNumber || prev.rollNumber,
        department: currentUser.department || prev.department,
        studentEmail: currentUser.email || prev.studentEmail,
      }));
    }
  }, [currentUser]);

  const [fileName, setFileName] = useState('student_id_card.pdf');
  const [fileDataUrl, setFileDataUrl] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  // Issue 3: Certificate Types with eligibility status
  const [eligibleTypes, setEligibleTypes] = useState([
    { id: 'bonafide', name: 'Bonafide Certificate', fee: 'Free', turnaround: '24 Hours', eligible: true, reason: null },
    { id: 'study_conduct', name: 'Study & Conduct Certificate', fee: 'Free', turnaround: '24-48 Hours', eligible: true, reason: null },
    { id: 'medium_instruction', name: 'Medium of Instruction (English)', fee: 'Free', turnaround: '48 Hours', eligible: true, reason: null },
    { id: 'course_completion', name: 'Course Completion Certificate', fee: 'Free', turnaround: '2-3 Days', eligible: true, reason: null },
    { id: 'transfer_cert', name: 'Transfer Certificate (TC)', fee: '₹100', turnaround: '3-5 Days', eligible: true, reason: null },
    { id: 'migration_cert', name: 'Migration Certificate', fee: '₹150', turnaround: '3-5 Days', eligible: true, reason: null },
  ]);

  // Fetch certificate types along with eligibility: GET /api/certificate-types/eligible
  useEffect(() => {
    let isMounted = true;
    const fetchEligibility = async () => {
      try {
        const roll = encodeURIComponent(currentUser?.rollNumber || formData.rollNumber || '24881A12A1');
        const name = encodeURIComponent(currentUser?.name || formData.studentName || '');
        const res = await fetch(`http://localhost:5000/api/certificate-types/eligible?rollNumber=${roll}&studentName=${name}`);
        if (res.ok) {
          const data = await res.json();
          if (isMounted && Array.isArray(data) && data.length > 0) {
            setEligibleTypes(prev => data.map(item => {
              const match = CERTIFICATE_TYPES.find(c => c.id === item.id || c.name.toLowerCase() === item.name.toLowerCase()) || {};
              return {
                id: item.id,
                name: item.name,
                fee: item.fee === 0 ? 'Free' : (typeof item.fee === 'number' ? `₹${item.fee}` : item.fee),
                turnaround: match.turnaround || '24-48 Hours',
                eligible: item.eligible !== false,
                reason: item.reason || null,
              };
            }));
            return;
          }
        }
      } catch (err) {
        // Fallback to local computation
      }

      // Local fallback computation from requests prop
      if (isMounted) {
        const studentReqs = requests.filter(r => 
          (r.studentName === formData.studentName || (currentUser?.rollNumber && r.rollNumber === currentUser.rollNumber))
        );

        setEligibleTypes(CERTIFICATE_TYPES.map(cert => {
          const matchReqs = studentReqs.filter(r => 
            r.certificateType === cert.name || r.typeId === cert.id
          );
          const isRejected = matchReqs.some(r => (r.status || '').toUpperCase() === 'REJECTED');
          const isIssued = matchReqs.some(r => {
            const s = (r.status || '').toUpperCase();
            return s === 'APPROVED' || s === 'ISSUED';
          });
          const isActive = matchReqs.some(r => {
            const s = (r.status || '').toUpperCase();
            return ['PENDING', 'SUBMITTED', 'IN_REVIEW'].includes(s);
          });

          if (isRejected) {
            return { ...cert, eligible: false, reason: 'previously_rejected' };
          }
          if (isIssued) {
            return { ...cert, eligible: false, reason: 'already_issued' };
          }
          if (isActive) {
            return { ...cert, eligible: false, reason: 'active_request' };
          }
          return { ...cert, eligible: true, reason: null };
        }));
      }
    };

    fetchEligibility();
    return () => { isMounted = false; };
  }, [isOpen, currentUser, requests, formData.rollNumber, formData.studentName]);

  // If currently selected certificate type is not eligible, switch to first eligible
  useEffect(() => {
    const cur = eligibleTypes.find(c => c.name === formData.certificateType);
    if (cur && !cur.eligible) {
      const firstEligible = eligibleTypes.find(c => c.eligible);
      if (firstEligible) {
        setFormData(prev => ({ ...prev, certificateType: firstEligible.name }));
      }
    }
  }, [eligibleTypes]);

  const allIneligible = eligibleTypes.length > 0 && eligibleTypes.every(t => !t.eligible);

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileName(file.name);
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = () => setFileDataUrl(reader.result);
        reader.readAsDataURL(file);
      } else {
        setFileDataUrl(null);
      }
    }
  };

  // Duplicate Check: has this certificate already been issued to this student?
  const alreadyIssued = requests.find(r => 
    (r.studentName === formData.studentName || (currentUser?.rollNumber && r.rollNumber === currentUser.rollNumber)) &&
    r.certificateType === formData.certificateType &&
    ((r.status || '').toUpperCase() === 'APPROVED' || (r.status || '').toUpperCase() === 'ISSUED')
  );

  // Active in-progress check
  const activeExistingRequest = requests.find(r =>
    (r.studentName === formData.studentName || (currentUser?.rollNumber && r.rollNumber === currentUser.rollNumber)) &&
    r.certificateType === formData.certificateType &&
    ['PENDING', 'SUBMITTED', 'IN_REVIEW'].includes((r.status || '').toUpperCase())
  );

  // Payment states for Transfer Certificate (TC) and paid certificates
  const [paymentMethod, setPaymentMethod] = useState('upi'); // 'upi' | 'card' | 'netbanking'
  const [qrDataUrl, setQrDataUrl] = useState('');
  const [copiedUpi, setCopiedUpi] = useState(false);
  const [upiRefId, setUpiRefId] = useState('UPI' + Math.floor(100000000000 + Math.random() * 900000000000));
  
  // Card states
  const [cardNumber, setCardNumber] = useState('4532 8920 1102 8841');
  const [cardHolder, setCardHolder] = useState('Nikhitha Mandhula');
  const [cardExpiry, setCardExpiry] = useState('08/28');
  const [cardCvv, setCardCvv] = useState('842');

  // Net banking state
  const [selectedBank, setSelectedBank] = useState('State Bank of India (SBI)');

  const selectedCert = eligibleTypes.find(c => c.name === formData.certificateType) || CERTIFICATE_TYPES[0];
  const isPaidCert = selectedCert.fee !== 'Free' && selectedCert.fee !== 0;
  const numericFee = isPaidCert ? parseInt(String(selectedCert.fee).replace(/[^\d]/g, ''), 10) : 0;

  // Generate UPI QR Code dynamically
  useEffect(() => {
    if (isPaidCert) {
      const upiUrl = `upi://pay?pa=ocrs.college@upi&pn=Academic%20Affairs%20OCRS&am=${numericFee}&cu=INR&tn=Fee%20for%20${encodeURIComponent(formData.certificateType)}`;
      QRCode.toDataURL(upiUrl, {
        width: 170,
        margin: 1,
        color: {
          dark: '#0f172a',
          light: '#ffffff',
        },
      })
      .then(url => setQrDataUrl(url))
      .catch(err => console.error('QR code error', err));
    }
  }, [formData.certificateType, numericFee, isPaidCert]);

  if (!isOpen) return null;

  const handleCopyUpi = () => {
    navigator.clipboard.writeText('ocrs.college@upi');
    setCopiedUpi(true);
    setTimeout(() => setCopiedUpi(false), 2000);
  };

  const handleCardNumberChange = (e) => {
    let val = e.target.value.replace(/\D/g, '').substring(0, 16);
    let formatted = val.match(/.{1,4}/g)?.join(' ') || val;
    setCardNumber(formatted);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError(null);
    setSubmitting(true);

    // Backend duplicate guards validation (POST /api/student/requests)
    try {
      const res = await fetch('http://localhost:5000/api/student/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          typeId: selectedCert.id,
          certificateType: formData.certificateType,
          studentName: formData.studentName,
          rollNumber: formData.rollNumber,
          department: formData.department,
          academicYear: formData.academicYear,
          studentEmail: formData.studentEmail,
          purpose: formData.purpose === 'Other' ? formData.customPurpose : formData.purpose,
          urgency: formData.urgency,
          notes: formData.notes,
        }),
      });

      if (!res.ok) {
        const errorJson = await res.json().catch(() => ({}));
        if (errorJson.error) {
          setSubmitError(errorJson.error);
          setSubmitting(false);
          return;
        }
      }
    } catch (err) {
      // Local fallback guards when backend server is offline
      const isRejectedLocal = requests.some(r => 
        (r.studentName === formData.studentName || (currentUser?.rollNumber && r.rollNumber === currentUser.rollNumber)) &&
        r.certificateType === formData.certificateType &&
        (r.status || '').toUpperCase() === 'REJECTED'
      );
      if (isRejectedLocal) {
        setSubmitError("This certificate request was rejected. Please contact the registrar office.");
        setSubmitting(false);
        return;
      }
      if (alreadyIssued) {
        setSubmitError("This certificate has already been issued.");
        setSubmitting(false);
        return;
      }
      if (activeExistingRequest) {
        setSubmitError("You already have an active request.");
        setSubmitting(false);
        return;
      }
    }

    const now = new Date();
    const appliedDate = now.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    const appliedTime = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const appliedTimestamp = Date.now();

    const newRequest = {
      id: Math.floor(1000 + Math.random() * 9000).toString(),
      certificateNumber: `OCRS-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      certificateType: formData.certificateType,
      typeId: selectedCert.id,
      studentName: formData.studentName,
      rollNumber: formData.rollNumber,
      department: formData.department,
      academicYear: formData.academicYear,
      studentEmail: formData.studentEmail,
      purpose: formData.purpose === 'Other' ? formData.customPurpose : formData.purpose,
      urgency: formData.urgency,
      notes: formData.notes,
      status: 'Pending',
      appliedDate,
      appliedTime,
      appliedTimestamp,
      dateApproved: null,
      documentName: fileName,
      documentDataUrl: fileDataUrl,
      // Payment details
      fee: selectedCert.fee,
      feePaid: false,
      paymentMethod: isPaidCert ? 'UPI' : 'N/A (Institutional)',
      receiptNumber: null,
      paymentReference: null,
    };

    onSubmitRequest(newRequest);
    setSubmitting(false);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose} style={{ zIndex: 1100, padding: '16px' }}>
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
              background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.2), rgba(168, 85, 247, 0.2))',
              border: '1px solid rgba(99, 102, 241, 0.35)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <FileText size={20} color="var(--accent-primary)" />
            </div>
            <div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: '800', margin: 0, color: 'var(--text-primary)' }}>
                Apply for Certificate
              </h3>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: 0 }}>
                Direct submission to Academic Affairs & Faculty Verification
              </p>
            </div>
          </div>
          <button onClick={onClose} className="btn btn-secondary btn-icon" style={{ borderRadius: '50%', width: '34px', height: '34px' }}>
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} style={{ padding: '24px', overflowY: 'auto', maxHeight: 'calc(94vh - 80px)' }}>
          
          {/* ALL INELIGIBLE WARNING BANNER (Issue 2) */}
          {allIneligible && (
            <div style={{
              padding: '14px 18px',
              marginBottom: '18px',
              borderRadius: '12px',
              background: 'rgba(239, 68, 68, 0.12)',
              border: '1.5px solid rgba(239, 68, 68, 0.4)',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
            }}>
              <AlertCircle size={20} color="#f87171" style={{ flexShrink: 0 }} />
              <div>
                <div style={{ fontSize: '0.9rem', fontWeight: '800', color: '#fca5a5' }}>
                  No Eligible Certificates
                </div>
                <div style={{ fontSize: '0.82rem', color: '#fecaca', marginTop: '2px' }}>
                  You have no eligible certificates to request. Contact registrar.
                </div>
              </div>
            </div>
          )}

          {/* BACKEND / DUPLICATE ERROR BANNER */}
          {submitError && (
            <div style={{
              padding: '12px 16px',
              marginBottom: '18px',
              borderRadius: '12px',
              background: 'rgba(239, 68, 68, 0.15)',
              border: '1.5px solid rgba(239, 68, 68, 0.5)',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '10px',
            }}>
              <AlertCircle size={18} color="var(--danger)" style={{ flexShrink: 0, marginTop: '2px' }} />
              <div style={{ fontSize: '0.84rem', fontWeight: '700', color: '#fca5a5' }}>
                {submitError}
              </div>
            </div>
          )}

          {/* Certificate Type Selection */}
          <div className="form-group">
            <label className="form-label" style={{ fontWeight: '600', color: 'var(--text-primary)' }}>
              Select Certificate Type
            </label>
            <select
              className="form-select"
              value={formData.certificateType}
              onChange={(e) => {
                setFormData({ ...formData, certificateType: e.target.value });
                setSubmitError(null);
              }}
              style={{ fontSize: '0.95rem', padding: '12px 14px' }}
              required
              disabled={allIneligible}
            >
              {eligibleTypes.map((cert) => (
                <option key={cert.id} value={cert.name} disabled={!cert.eligible}>
                  {cert.name} ({cert.turnaround}) — {cert.fee === 'Free' || cert.fee === 0 ? 'Free' : cert.fee}
                  {!cert.eligible
                    ? cert.reason === 'previously_rejected'
                      ? ' — (Previously rejected)'
                      : cert.reason === 'already_issued'
                        ? ' — (Already issued)'
                        : ' — (Request in progress)'
                    : ''}
                </option>
              ))}
            </select>

            {/* ALREADY ISSUED / DUPLICATE WARNING */}
            {alreadyIssued && (
              <div style={{
                padding: '12px 16px',
                marginTop: '12px',
                borderRadius: '10px',
                background: 'rgba(239, 68, 68, 0.12)',
                border: '1.5px solid rgba(239, 68, 68, 0.4)',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '10px',
              }}>
                <AlertCircle size={18} color="var(--danger)" style={{ flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <div style={{ fontSize: '0.86rem', fontWeight: '800', color: 'var(--danger)' }}>
                    Certificate Already Issued
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                    This certificate has already been issued to you. Duplicate requests are not allowed.
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Student Info Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="form-group">
              <label className="form-label">Student Full Name</label>
              <input
                type="text"
                className="form-input"
                value={formData.studentName}
                onChange={(e) => setFormData({ ...formData, studentName: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Roll Number</label>
              <input
                type="text"
                className="form-input"
                value={formData.rollNumber}
                onChange={(e) => setFormData({ ...formData, rollNumber: e.target.value })}
                required
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="form-group">
              <label className="form-label">Department / Branch</label>
              <input
                type="text"
                className="form-input"
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Academic Year</label>
              <input
                type="text"
                className="form-input"
                value={formData.academicYear}
                onChange={(e) => setFormData({ ...formData, academicYear: e.target.value })}
                required
              />
            </div>
          </div>

          {/* Purpose & Notification Email */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="form-group">
              <label className="form-label">Purpose of Certificate</label>
              <select
                className="form-select"
                value={formData.purpose}
                onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
              >
                <option value="Higher Education Admissions">Higher Education Admissions</option>
                <option value="Passport Application">Passport Application</option>
                <option value="Education Loan Application">Education Loan Application</option>
                <option value="Internship / Job Application">Internship / Job Application</option>
                <option value="Government Scholarship">Government Scholarship</option>
                <option value="Visa Processing">Visa Processing</option>
                <option value="Other">Other Purpose</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Notification Email (Gmail)</label>
              <input
                type="email"
                className="form-input"
                value={formData.studentEmail}
                onChange={(e) => setFormData({ ...formData, studentEmail: e.target.value })}
                required
              />
            </div>
          </div>

          {formData.purpose === 'Other' && (
            <div className="form-group">
              <label className="form-label">Specify Purpose</label>
              <input
                type="text"
                className="form-input"
                placeholder="Describe why you need this certificate..."
                value={formData.customPurpose}
                onChange={(e) => setFormData({ ...formData, customPurpose: e.target.value })}
                required
              />
            </div>
          )}

          {/* Supporting Document Upload by Student */}
          <div className="form-group">
            <label className="form-label" style={{ fontWeight: '600', color: 'var(--text-primary)' }}>
              Supporting Document (Upload Your Student ID Card / Proof)
            </label>
            <div style={{
              border: '2px dashed var(--border-light)',
              borderRadius: 'var(--radius-md)',
              padding: '16px',
              textAlign: 'center',
              background: 'var(--bg-glass-strong)',
              position: 'relative',
              cursor: 'pointer',
              transition: 'border-color 0.2s ease',
            }}>
              <input
                type="file"
                accept="image/*,.pdf"
                onChange={handleFileUpload}
                style={{
                  position: 'absolute',
                  inset: 0,
                  opacity: 0,
                  cursor: 'pointer',
                  width: '100%',
                  height: '100%',
                  zIndex: 2,
                }}
              />
              <UploadCloud size={24} color="var(--accent-primary)" style={{ marginBottom: '6px' }} />
              <p style={{ fontSize: '0.86rem', color: 'var(--text-primary)', margin: 0, fontWeight: '600' }}>
                {fileName ? <span style={{ color: 'var(--success)' }}>✓ Attached: {fileName}</span> : 'Click to Upload Student ID Card / Proof'}
              </p>
              <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', margin: '3px 0 0 0' }}>
                JPG, PNG, PDF up to 5MB • Click to browse or change document anytime
              </p>
              {fileDataUrl && (
                <div style={{ marginTop: '10px' }}>
                  <img src={fileDataUrl} alt="Uploaded Proof Thumbnail" style={{ maxHeight: '90px', borderRadius: '8px', border: '1px solid var(--border-subtle)' }} />
                </div>
              )}
            </div>
          </div>

          {/* ==========================================================
             SPECIAL PAYMENT SECTION FOR TRANSFER CERTIFICATE (TC) OR PAID
             ========================================================== */}
          {isPaidCert ? (
            <div style={{
              marginTop: '22px',
              marginBottom: '20px',
              padding: '20px',
              borderRadius: '16px',
              background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.08) 0%, rgba(16, 185, 129, 0.06) 100%)',
              border: '1.5px solid var(--accent-primary)',
              boxShadow: '0 8px 24px rgba(99, 102, 241, 0.15)',
            }}>
              {/* Fee Notice Header */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <ShieldCheck size={18} color="var(--success)" />
                    <span style={{ fontSize: '0.98rem', fontWeight: '800', color: 'var(--text-primary)' }}>
                      Institutional Issuance Fee Required
                    </span>
                  </div>
                  <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: '3px 0 0 0' }}>
                    Official registrar processing & archival fee for {formData.certificateType}
                  </p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Amount Due</span>
                  <div style={{ fontSize: '1.45rem', fontWeight: '800', color: 'var(--success)', fontFamily: 'var(--font-mono)' }}>
                    {selectedCert.fee}
                  </div>
                </div>
              </div>

              {/* Payment Method Selector Tabs */}
              <div style={{ marginBottom: '16px' }}>
                <label className="form-label" style={{ fontWeight: '600', color: 'var(--text-primary)', marginBottom: '8px' }}>
                  Choose Payment Method:
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                  {/* UPI Option */}
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('upi')}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '5px',
                      padding: '12px 8px',
                      borderRadius: '12px',
                      border: paymentMethod === 'upi' ? '2px solid var(--accent-primary)' : '1px solid var(--border-subtle)',
                      background: paymentMethod === 'upi' ? 'rgba(99, 102, 241, 0.15)' : 'var(--bg-glass-strong)',
                      color: paymentMethod === 'upi' ? 'var(--text-primary)' : 'var(--text-secondary)',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    <QrCode size={20} color={paymentMethod === 'upi' ? 'var(--accent-primary)' : 'currentColor'} />
                    <span style={{ fontSize: '0.82rem', fontWeight: '700' }}>UPI (Scan QR)</span>
                    <span style={{ fontSize: '0.68rem', color: 'var(--success)', fontWeight: '600' }}>Instant</span>
                  </button>

                  {/* Card Option */}
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('card')}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '5px',
                      padding: '12px 8px',
                      borderRadius: '12px',
                      border: paymentMethod === 'card' ? '2px solid var(--accent-primary)' : '1px solid var(--border-subtle)',
                      background: paymentMethod === 'card' ? 'rgba(99, 102, 241, 0.15)' : 'var(--bg-glass-strong)',
                      color: paymentMethod === 'card' ? 'var(--text-primary)' : 'var(--text-secondary)',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    <CreditCard size={20} color={paymentMethod === 'card' ? 'var(--accent-primary)' : 'currentColor'} />
                    <span style={{ fontSize: '0.82rem', fontWeight: '700' }}>Debit / Credit Card</span>
                    <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Visa / RuPay</span>
                  </button>

                  {/* Net Banking Option */}
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('netbanking')}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '5px',
                      padding: '12px 8px',
                      borderRadius: '12px',
                      border: paymentMethod === 'netbanking' ? '2px solid var(--accent-primary)' : '1px solid var(--border-subtle)',
                      background: paymentMethod === 'netbanking' ? 'rgba(99, 102, 241, 0.15)' : 'var(--bg-glass-strong)',
                      color: paymentMethod === 'netbanking' ? 'var(--text-primary)' : 'var(--text-secondary)',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    <Building size={20} color={paymentMethod === 'netbanking' ? 'var(--accent-primary)' : 'currentColor'} />
                    <span style={{ fontSize: '0.82rem', fontWeight: '700' }}>Net Banking</span>
                    <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>All Banks</span>
                  </button>
                </div>
              </div>

              {/* METHOD 1: UPI WITH REAL GENERATED QR CODE */}
              {paymentMethod === 'upi' && (
                <div style={{
                  padding: '18px',
                  borderRadius: '14px',
                  background: 'var(--bg-glass-strong)',
                  border: '1px solid var(--border-subtle)',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
                    {/* QR Code Container */}
                    <div style={{
                      padding: '10px',
                      background: '#ffffff',
                      borderRadius: '12px',
                      boxShadow: '0 4px 15px rgba(0, 0, 0, 0.15)',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      border: '2px solid #e2e8f0',
                    }}>
                      {qrDataUrl ? (
                        <img 
                          src={qrDataUrl} 
                          alt="UPI Payment QR Code" 
                          style={{ width: '135px', height: '135px', display: 'block' }}
                        />
                      ) : (
                        <div style={{ width: '135px', height: '135px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <QrCode size={40} color="#64748b" />
                        </div>
                      )}
                      <span style={{ fontSize: '0.68rem', fontWeight: '800', color: '#0f172a', marginTop: '4px' }}>
                        SCAN WITH ANY UPI APP
                      </span>
                    </div>

                    {/* UPI Info & Apps */}
                    <div style={{ flex: 1, minWidth: '220px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                        <span style={{
                          fontSize: '0.7rem',
                          fontWeight: '800',
                          padding: '2px 8px',
                          borderRadius: '6px',
                          background: 'rgba(16, 185, 129, 0.2)',
                          color: 'var(--success)',
                        }}>
                          GPay • PhonePe • Paytm • BHIM
                        </span>
                      </div>

                      <div style={{ marginBottom: '10px' }}>
                        <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>College Registrar UPI ID</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '2px' }}>
                          <span style={{
                            fontFamily: 'var(--font-mono)',
                            fontWeight: '700',
                            fontSize: '0.92rem',
                            color: 'var(--text-primary)',
                            background: 'rgba(0, 0, 0, 0.25)',
                            padding: '4px 10px',
                            borderRadius: '8px',
                            border: '1px solid var(--border-subtle)',
                          }}>
                            ocrs.college@upi
                          </span>
                          <button
                            type="button"
                            onClick={handleCopyUpi}
                            className="btn btn-secondary btn-sm"
                            style={{ padding: '4px 8px', fontSize: '0.75rem', gap: '4px' }}
                          >
                            {copiedUpi ? <Check size={13} color="var(--success)" /> : <Copy size={13} />}
                            {copiedUpi ? 'Copied' : 'Copy'}
                          </button>
                        </div>
                      </div>

                      {/* Reference ID / Status */}
                      <div>
                        <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Transaction Reference Number</span>
                        <input
                          type="text"
                          className="form-input"
                          value={upiRefId}
                          onChange={(e) => setUpiRefId(e.target.value)}
                          placeholder="e.g. UPI893421098432"
                          style={{ fontSize: '0.82rem', padding: '6px 10px', marginTop: '3px' }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* METHOD 2: DEBIT / CREDIT CARD DETAILS */}
              {paymentMethod === 'card' && (
                <div style={{
                  padding: '18px',
                  borderRadius: '14px',
                  background: 'var(--bg-glass-strong)',
                  border: '1px solid var(--border-subtle)',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                    <span style={{ fontSize: '0.82rem', fontWeight: '700', color: 'var(--text-primary)' }}>
                      Enter Card Details
                    </span>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                      🔒 256-Bit SSL Encrypted
                    </span>
                  </div>

                  <div className="form-group" style={{ marginBottom: '12px' }}>
                    <label className="form-label" style={{ fontSize: '0.75rem' }}>Card Number</label>
                    <input
                      type="text"
                      className="form-input"
                      value={cardNumber}
                      onChange={handleCardNumberChange}
                      placeholder="4532 •••• •••• ••••"
                      maxLength={19}
                      style={{ fontFamily: 'var(--font-mono)', fontSize: '0.92rem' }}
                      required={paymentMethod === 'card'}
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '10px' }}>
                    <div className="form-group" style={{ margin: 0 }}>
                      <label className="form-label" style={{ fontSize: '0.75rem' }}>Cardholder Name</label>
                      <input
                        type="text"
                        className="form-input"
                        value={cardHolder}
                        onChange={(e) => setCardHolder(e.target.value)}
                        placeholder="Name on card"
                        style={{ fontSize: '0.85rem' }}
                        required={paymentMethod === 'card'}
                      />
                    </div>
                    <div className="form-group" style={{ margin: 0 }}>
                      <label className="form-label" style={{ fontSize: '0.75rem' }}>Expiry</label>
                      <input
                        type="text"
                        className="form-input"
                        value={cardExpiry}
                        onChange={(e) => setCardExpiry(e.target.value)}
                        placeholder="MM/YY"
                        maxLength={5}
                        style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem', textAlign: 'center' }}
                        required={paymentMethod === 'card'}
                      />
                    </div>
                    <div className="form-group" style={{ margin: 0 }}>
                      <label className="form-label" style={{ fontSize: '0.75rem' }}>CVV</label>
                      <input
                        type="password"
                        className="form-input"
                        value={cardCvv}
                        onChange={(e) => setCardCvv(e.target.value)}
                        placeholder="•••"
                        maxLength={4}
                        style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem', textAlign: 'center' }}
                        required={paymentMethod === 'card'}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* METHOD 3: NET BANKING */}
              {paymentMethod === 'netbanking' && (
                <div style={{
                  padding: '18px',
                  borderRadius: '14px',
                  background: 'var(--bg-glass-strong)',
                  border: '1px solid var(--border-subtle)',
                }}>
                  <label className="form-label" style={{ fontSize: '0.82rem', fontWeight: '600' }}>
                    Select Your Bank:
                  </label>
                  <select
                    className="form-select"
                    value={selectedBank}
                    onChange={(e) => setSelectedBank(e.target.value)}
                    style={{ fontSize: '0.9rem', marginTop: '6px' }}
                  >
                    <option value="State Bank of India (SBI)">State Bank of India (SBI)</option>
                    <option value="HDFC Bank">HDFC Bank</option>
                    <option value="ICICI Bank">ICICI Bank</option>
                    <option value="Axis Bank">Axis Bank</option>
                    <option value="Punjab National Bank (PNB)">Punjab National Bank (PNB)</option>
                    <option value="Bank of Baroda">Bank of Baroda</option>
                    <option value="Canara Bank">Canara Bank</option>
                  </select>
                  <p style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '8px', margin: '8px 0 0 0' }}>
                    You will be directed to institutional net banking gateway to authorize ₹{numericFee}.
                  </p>
                </div>
              )}
            </div>
          ) : null}

          {/* Action buttons */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
            <button type="button" onClick={onClose} className="btn btn-secondary">
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={submitting || allIneligible || (!selectedCert.eligible && !allIneligible)} 
              className="btn btn-primary"
              style={{
                padding: '12px 26px',
                fontSize: '0.95rem',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                opacity: (submitting || allIneligible || (!selectedCert.eligible && !allIneligible)) ? 0.6 : 1,
                cursor: (submitting || allIneligible || (!selectedCert.eligible && !allIneligible)) ? 'not-allowed' : 'pointer',
              }}
            >
              {submitting ? (
                <>
                  <span className="pulse-dot" style={{ background: '#fff' }} />
                  {isPaidCert ? 'Verifying Payment & Submitting...' : 'Submitting Request...'}
                </>
              ) : allIneligible ? (
                <>
                  <CheckCircle2 size={17} />
                  All Certificates Received
                </>
              ) : isPaidCert ? (
                <>
                  <CheckCircle2 size={17} />
                  Pay {selectedCert.fee} & Submit Application
                </>
              ) : (
                <>
                  <Sparkles size={17} />
                  Submit Certificate Request
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
