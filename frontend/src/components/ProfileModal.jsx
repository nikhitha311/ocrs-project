import React, { useState } from 'react';
import { 
  X, User, Mail, Phone, Edit3, Save, CheckCircle2, ShieldCheck,
  GraduationCap, Calendar, BookOpen, Hash, Building2
} from 'lucide-react';

export default function ProfileModal({
  isOpen,
  onClose,
  currentUser,
  targetStudent = null,
  onUpdateUser,
}) {
  const student = targetStudent || currentUser;
  const studentName = student?.name || student?.studentName || 'Nikhitha Mandhula';
  const rollNumber = student?.rollNumber || '24881A12A1';
  const department = student?.department || 'Information Technology (IT)';
  const program = student?.program || 'B.Tech';
  const batch = student?.batch || student?.academicYear || '2024 - 2028';
  const semester = student?.semester || '6th Semester';
  const admissionYear = student?.admissionYear || '2024';
  const email = student?.email || student?.studentEmail || 'nikhithamandhula18@gmail.com';
  const phone = student?.phone || '+91 98765 43210';

  const isSelf = currentUser && currentUser.role === 'student' && (!targetStudent || currentUser.rollNumber === rollNumber);
  const isAdminViewing = currentUser?.role === 'admin';

  const [isEditingContact, setIsEditingContact] = useState(false);
  const [editEmail, setEditEmail] = useState(email);
  const [editPhone, setEditPhone] = useState(phone);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState(null);

  if (!isOpen) return null;

  const handleSaveContact = (e) => {
    e.preventDefault();
    if (onUpdateUser) {
      onUpdateUser({ email: editEmail, phone: editPhone });
    }
    setIsEditingContact(false);
    setSaveSuccessMsg('Contact information updated successfully!');
    setTimeout(() => setSaveSuccessMsg(null), 3000);
  };

  const initials = studentName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map(p => p[0].toUpperCase())
    .join('') || 'NM';

  return (
    <div className="modal-overlay" onClick={onClose} style={{ zIndex: 1200, padding: '16px' }}>
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
          display: 'flex',
          flexDirection: 'column',
          borderRadius: '20px',
          overflow: 'hidden',
        }}
      >
        {/* Header with Avatar & Name */}
        <div style={{
          padding: '24px 28px',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'var(--bg-glass-strong)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            {/* Avatar Circle with Initials */}
            <div style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              fontSize: '1.3rem',
              fontWeight: '800',
              boxShadow: '0 4px 16px rgba(99, 102, 241, 0.4)',
              border: '2px solid rgba(255, 255, 255, 0.2)',
              flexShrink: 0,
            }}>
              {initials}
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <h3 style={{ fontSize: '1.35rem', fontWeight: '800', margin: 0, color: 'var(--text-primary)' }}>
                  {studentName}
                </h3>
                <span style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontSize: '0.72rem',
                  fontWeight: '700',
                  padding: '2px 8px',
                  borderRadius: '12px',
                  background: 'rgba(16, 185, 129, 0.18)',
                  color: '#10b981',
                  border: '1px solid rgba(16, 185, 129, 0.35)',
                }}>
                  <CheckCircle2 size={12} />
                  Verified Student
                </span>
              </div>
              <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)', margin: '4px 0 0 0' }}>
                Roll Number: <strong style={{ color: 'var(--accent-primary)', fontFamily: 'var(--font-mono)' }}>{rollNumber}</strong>
              </p>
            </div>
          </div>

          <button 
            onClick={onClose} 
            className="btn btn-secondary btn-icon"
            style={{ borderRadius: '50%', width: '36px', height: '36px', padding: 0 }}
            title="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body - Strictly Personal Details Only */}
        <div style={{ padding: '28px', overflowY: 'auto', flex: 1 }}>
          {saveSuccessMsg && (
            <div style={{
              padding: '12px 16px',
              marginBottom: '20px',
              borderRadius: '10px',
              background: 'rgba(16, 185, 129, 0.15)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              color: '#10b981',
              fontSize: '0.86rem',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}>
              <CheckCircle2 size={16} />
              {saveSuccessMsg}
            </div>
          )}

          {/* Section Heading & Edit Button */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <div>
              <h4 style={{ fontSize: '1.1rem', fontWeight: '800', margin: 0, color: 'var(--text-primary)' }}>
                Personal & Academic Details
              </h4>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: '2px 0 0 0' }}>
                Official student record enrolled with University Registrar
              </p>
            </div>

            {isAdminViewing ? (
              <span style={{
                fontSize: '0.74rem',
                fontWeight: '700',
                padding: '4px 10px',
                borderRadius: '8px',
                background: 'rgba(16, 185, 129, 0.15)',
                color: '#34d399',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
              }}>
                <ShieldCheck size={14} /> Registrar Verified
              </span>
            ) : isSelf ? (
              !isEditingContact ? (
                <button
                  type="button"
                  onClick={() => setIsEditingContact(true)}
                  className="btn btn-secondary btn-sm"
                  style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  <Edit3 size={14} />
                  Edit Contact Info
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsEditingContact(false)}
                  className="btn btn-secondary btn-sm"
                >
                  Cancel Edit
                </button>
              )
            ) : null}
          </div>

          {/* 9 Personal Fields Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '14px' }}>
            {/* 1. Full Name */}
            <div style={{ padding: '14px 18px', borderRadius: '12px', background: 'var(--bg-glass-strong)', border: '1px solid var(--border-subtle)' }}>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '700', letterSpacing: '0.04em' }}>
                Full Name
              </span>
              <p style={{ margin: '4px 0 0 0', fontWeight: '700', color: 'var(--text-primary)', fontSize: '0.96rem' }}>
                {studentName}
              </p>
            </div>

            {/* 2. Roll Number */}
            <div style={{ padding: '14px 18px', borderRadius: '12px', background: 'var(--bg-glass-strong)', border: '1px solid var(--border-subtle)' }}>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '700', letterSpacing: '0.04em' }}>
                Roll Number
              </span>
              <p style={{ margin: '4px 0 0 0', fontWeight: '700', color: 'var(--accent-primary)', fontFamily: 'var(--font-mono)', fontSize: '0.96rem' }}>
                {rollNumber}
              </p>
            </div>

            {/* 3. Department */}
            <div style={{ padding: '14px 18px', borderRadius: '12px', background: 'var(--bg-glass-strong)', border: '1px solid var(--border-subtle)' }}>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '700', letterSpacing: '0.04em' }}>
                Department
              </span>
              <p style={{ margin: '4px 0 0 0', fontWeight: '600', color: 'var(--text-primary)', fontSize: '0.92rem' }}>
                {department}
              </p>
            </div>

            {/* 4. Program */}
            <div style={{ padding: '14px 18px', borderRadius: '12px', background: 'var(--bg-glass-strong)', border: '1px solid var(--border-subtle)' }}>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '700', letterSpacing: '0.04em' }}>
                Program
              </span>
              <p style={{ margin: '4px 0 0 0', fontWeight: '600', color: 'var(--text-primary)', fontSize: '0.92rem' }}>
                {program}
              </p>
            </div>

            {/* 5. Batch */}
            <div style={{ padding: '14px 18px', borderRadius: '12px', background: 'var(--bg-glass-strong)', border: '1px solid var(--border-subtle)' }}>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '700', letterSpacing: '0.04em' }}>
                Batch
              </span>
              <p style={{ margin: '4px 0 0 0', fontWeight: '600', color: 'var(--text-primary)', fontSize: '0.92rem' }}>
                {batch}
              </p>
            </div>

            {/* 6. Semester */}
            <div style={{ padding: '14px 18px', borderRadius: '12px', background: 'var(--bg-glass-strong)', border: '1px solid var(--border-subtle)' }}>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '700', letterSpacing: '0.04em' }}>
                Semester
              </span>
              <p style={{ margin: '4px 0 0 0', fontWeight: '600', color: 'var(--text-primary)', fontSize: '0.92rem' }}>
                {semester}
              </p>
            </div>

            {/* 7. Admission Year */}
            <div style={{ padding: '14px 18px', borderRadius: '12px', background: 'var(--bg-glass-strong)', border: '1px solid var(--border-subtle)' }}>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '700', letterSpacing: '0.04em' }}>
                Admission Year
              </span>
              <p style={{ margin: '4px 0 0 0', fontWeight: '600', color: 'var(--text-primary)', fontSize: '0.92rem' }}>
                {admissionYear}
              </p>
            </div>

            {/* 8. Email - Editable */}
            <div style={{ 
              padding: '14px 18px', 
              borderRadius: '12px', 
              background: 'var(--bg-glass-strong)', 
              border: isEditingContact ? '1px solid var(--accent-primary)' : '1px solid var(--border-subtle)',
              gridColumn: isEditingContact ? 'span 2' : 'auto'
            }}>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '700', letterSpacing: '0.04em', display: 'flex', alignItems: 'center', gap: '5px' }}>
                <Mail size={12} /> Email (Official)
              </span>
              {isEditingContact ? (
                <input
                  type="email"
                  className="form-input"
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  style={{ marginTop: '8px', width: '100%' }}
                  required
                />
              ) : (
                <p style={{ margin: '4px 0 0 0', fontWeight: '600', color: 'var(--accent-primary)', fontSize: '0.92rem' }}>
                  {email}
                </p>
              )}
            </div>

            {/* 9. Phone - Editable */}
            <div style={{ 
              padding: '14px 18px', 
              borderRadius: '12px', 
              background: 'var(--bg-glass-strong)', 
              border: isEditingContact ? '1px solid var(--accent-primary)' : '1px solid var(--border-subtle)',
              gridColumn: isEditingContact ? 'span 2' : 'auto'
            }}>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '700', letterSpacing: '0.04em', display: 'flex', alignItems: 'center', gap: '5px' }}>
                <Phone size={12} /> Phone Number
              </span>
              {isEditingContact ? (
                <input
                  type="tel"
                  className="form-input"
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  style={{ marginTop: '8px', width: '100%' }}
                  required
                />
              ) : (
                <p style={{ margin: '4px 0 0 0', fontWeight: '600', color: 'var(--text-primary)', fontSize: '0.92rem' }}>
                  {phone}
                </p>
              )}
            </div>
          </div>

          {/* Save / Cancel buttons when editing */}
          {isEditingContact && (
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '18px' }}>
              <button 
                type="button" 
                onClick={() => setIsEditingContact(false)} 
                className="btn btn-secondary"
              >
                Cancel
              </button>
              <button 
                type="button" 
                onClick={handleSaveContact} 
                className="btn btn-primary" 
                style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <Save size={15} />
                Save Contact Info
              </button>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div style={{
          padding: '16px 28px',
          borderTop: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'var(--bg-glass-strong)',
        }}>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            Office of Academic Affairs • Student Records Registry
          </span>
          <button onClick={onClose} className="btn btn-secondary btn-sm">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
