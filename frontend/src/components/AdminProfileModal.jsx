import React, { useState, useEffect } from 'react';
import { X, ShieldCheck, User, Mail, Building, Save, CheckCircle2, Award, KeyRound } from 'lucide-react';

export default function AdminProfileModal({
  isOpen,
  onClose,
  currentUser,
  onUpdateAdmin,
}) {
  const [formData, setFormData] = useState({
    name: '',
    designation: '',
    department: '',
    email: '',
    employeeCode: 'FAC-8921',
    officeLocation: 'Academic Affairs Block, Room 204',
    signatureTitle: 'Authorized Dean & Controller of Examinations',
  });

  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    if (currentUser) {
      setFormData({
        name: currentUser.name || 'Dr. K. S. Ramanujam',
        designation: currentUser.designation || 'Dean of Academic Affairs',
        department: currentUser.department || 'Academic Affairs & Examinations',
        email: currentUser.email || 'admin@ocrs.edu',
        employeeCode: currentUser.employeeCode || 'FAC-8921',
        officeLocation: currentUser.officeLocation || 'Academic Affairs Block, Room 204',
        signatureTitle: currentUser.signatureTitle || 'Authorized Dean & Controller of Examinations',
      });
    }
  }, [currentUser]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onUpdateAdmin) {
      onUpdateAdmin(formData);
    }
    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="modal-overlay" onClick={onClose} style={{ zIndex: 1250, padding: '16px' }}>
      <div 
        className="modal-content" 
        onClick={(e) => e.stopPropagation()} 
        style={{ 
          maxWidth: '640px', 
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
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
            }}>
              <ShieldCheck size={22} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: '800', margin: 0, color: 'var(--text-primary)' }}>
                Administrator & Faculty Profile
              </h3>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: 0 }}>
                Manually edit official name, designation, and institutional signature details
              </p>
            </div>
          </div>
          <button onClick={onClose} className="btn btn-secondary btn-icon" style={{ borderRadius: '50%', width: '34px', height: '34px' }}>
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} style={{ padding: '24px', overflowY: 'auto' }}>
          {saveSuccess && (
            <div style={{
              padding: '12px 16px',
              marginBottom: '16px',
              borderRadius: '10px',
              background: 'rgba(16, 185, 129, 0.15)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              color: 'var(--success)',
              fontSize: '0.86rem',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}>
              <CheckCircle2 size={16} />
              Admin details updated successfully! Live certificates will bear your new name.
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <div className="form-group">
              <label className="form-label">Administrator Full Name</label>
              <input
                type="text"
                className="form-input"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Dr. K. S. Ramanujam"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Official Designation</label>
              <input
                type="text"
                className="form-input"
                value={formData.designation}
                onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                placeholder="e.g. Dean of Academic Affairs"
                required
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <div className="form-group">
              <label className="form-label">Department / Directorate</label>
              <input
                type="text"
                className="form-input"
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                placeholder="e.g. Academic Affairs"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Official Admin Email</label>
              <input
                type="email"
                className="form-input"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="admin@ocrs.edu"
                required
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <div className="form-group">
              <label className="form-label">Employee / Faculty Code</label>
              <input
                type="text"
                className="form-input"
                value={formData.employeeCode}
                onChange={(e) => setFormData({ ...formData, employeeCode: e.target.value })}
                style={{ fontFamily: 'var(--font-mono)' }}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Office Location</label>
              <input
                type="text"
                className="form-input"
                value={formData.officeLocation}
                onChange={(e) => setFormData({ ...formData, officeLocation: e.target.value })}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Digital Signature Title (Printed on Approved Certificates)</label>
            <input
              type="text"
              className="form-input"
              value={formData.signatureTitle}
              onChange={(e) => setFormData({ ...formData, signatureTitle: e.target.value })}
              required
            />
          </div>

          {/* Signature Preview Card */}
          <div style={{
            padding: '16px',
            borderRadius: '12px',
            background: 'var(--bg-glass-strong)',
            border: '1px solid var(--border-subtle)',
            marginTop: '10px',
          }}>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '700' }}>
              Live Certificate Signature Stamp Preview:
            </span>
            <div style={{ marginTop: '8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontFamily: 'cursive', fontSize: '1.2rem', color: 'var(--accent-primary)', fontWeight: 'bold' }}>
                  {formData.name || 'Dean Signature'}
                </div>
                <div style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-primary)' }}>
                  {formData.name}
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                  {formData.signatureTitle}
                </div>
              </div>
              <div style={{
                padding: '6px 12px',
                borderRadius: '8px',
                border: '1px dashed var(--success)',
                color: 'var(--success)',
                fontSize: '0.75rem',
                fontWeight: '700',
              }}>
                ✓ OFFICIAL DIGITAL SEAL
              </div>
            </div>
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '24px' }}>
            <button type="button" onClick={onClose} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Save size={16} />
              Save Admin Details
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
