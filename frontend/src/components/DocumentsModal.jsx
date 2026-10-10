import React, { useState, useEffect } from 'react';
import { 
  X, FileText, Download, ExternalLink, Upload, CheckCircle2, 
  AlertTriangle, ShieldCheck, Award, Receipt, Check
} from 'lucide-react';

const INITIAL_DOCS = [
  { id: 'id_card', name: 'Student ID Card', fileName: 'student_id_card.pdf', uploaded: true },
  { id: 'marksheet_10', name: '10th Marksheet', fileName: '10th_marksheet.pdf', uploaded: true },
  { id: 'marksheet_12', name: '12th Marksheet', fileName: '12th_marksheet.pdf', uploaded: true },
  { id: 'aadhaar', name: 'Aadhaar Card', fileName: 'aadhaar_card.pdf', uploaded: true },
  { id: 'transfer_cert', name: 'Transfer Certificate (TC)', fileName: 'transfer_certificate.pdf', uploaded: false },
];

export default function DocumentsModal({
  isOpen,
  onClose,
  currentUser,
  requests = [],
  onOpenCertificate,
  onOpenReceipt,
  onVerifyCertificate,
}) {
  const [documents, setDocuments] = useState(INITIAL_DOCS);
  const [fileStatusMap, setFileStatusMap] = useState({}); // { id: 'EXISTS' | 'MISSING' | 'NOT_UPLOADED' }
  const [uploadingId, setUploadingId] = useState(null);

  // Check file existence in backend/uploads/
  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;
    const checkFiles = async () => {
      const results = {};
      for (const doc of documents) {
        // If user uploaded locally in this session → EXISTS
        if (doc.dataUrl) {
          results[doc.id] = 'EXISTS';
          continue;
        }
        if (!doc.fileName) {
          results[doc.id] = 'NOT_UPLOADED';
          continue;
        }

        // Try HEAD first (fastest)
        let found = false;
        try {
          const res = await fetch(`http://localhost:5000/uploads/${doc.fileName}`, {
            method: 'HEAD',
            cache: 'no-store',
          });
          if (res.ok) {
            results[doc.id] = 'EXISTS';
            found = true;
          }
        } catch { /* fall through to GET */ }

        // Fallback: GET with range (some servers block HEAD)
        if (!found) {
          try {
            const res2 = await fetch(`http://localhost:5000/uploads/${doc.fileName}`, {
              method: 'GET',
              headers: { Range: 'bytes=0-0' },
              cache: 'no-store',
            });
            if (res2.ok || res2.status === 206) {
              results[doc.id] = 'EXISTS';
            } else {
              results[doc.id] = 'MISSING';
            }
          } catch {
            results[doc.id] = 'MISSING';
          }
        }
      }

      if (isMounted) {
        setFileStatusMap(results);
      }
    };

    checkFiles();
    return () => { isMounted = false; };
  }, [isOpen, documents]);

  if (!isOpen) return null;

  // Filter issued certificates for the logged in student
  const studentRoll = currentUser?.rollNumber || '24881A12A1';
  const studentName = currentUser?.name || 'Nikhitha Mandhula';
  const issuedCerts = requests.filter(r => {
    const isIssued = (r.status || '').toUpperCase() === 'APPROVED' || (r.status || '').toUpperCase() === 'ISSUED';
    const match = (!r.rollNumber || r.rollNumber === studentRoll || r.studentName === studentName);
    return isIssued && match;
  });

  const handleFileUpload = (docId, e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingId(docId);
    const reader = new FileReader();
    reader.onload = () => {
      setDocuments(prev => prev.map(d => {
        if (d.id === docId) {
          return {
            ...d,
            uploaded: true,
            fileName: file.name,
            dataUrl: reader.result,
          };
        }
        return d;
      }));

      setFileStatusMap(prev => ({
        ...prev,
        [docId]: 'EXISTS',
      }));
      setUploadingId(null);
    };
    reader.readAsDataURL(file);
  };

  const handleView = (doc) => {
    if (doc.dataUrl) {
      const win = window.open();
      if (win) {
        win.document.write(`<iframe src="${doc.dataUrl}" frameborder="0" style="border:0; top:0px; left:0px; bottom:0px; right:0px; width:100%; height:100%;" allowfullscreen></iframe>`);
      }
    } else {
      window.open(`http://localhost:5000/uploads/${doc.fileName}`, '_blank');
    }
  };

  const handleDownload = (doc) => {
    const url = doc.dataUrl || `http://localhost:5000/uploads/${doc.fileName}`;
    const link = document.createElement('a');
    link.href = url;
    link.download = doc.fileName || `${doc.name}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="modal-overlay" onClick={onClose} style={{ zIndex: 1200, padding: '16px' }}>
      <div 
        className="modal-content" 
        onClick={(e) => e.stopPropagation()} 
        style={{ 
          maxWidth: '820px', 
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
        {/* Header */}
        <div style={{
          padding: '22px 28px',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'var(--bg-glass-strong)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '42px',
              height: '42px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.2), rgba(168, 85, 247, 0.2))',
              border: '1px solid rgba(99, 102, 241, 0.35)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--accent-primary)',
            }}>
              <FileText size={22} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: '800', margin: 0, color: 'var(--text-primary)' }}>
                My Academic Documents & Certificates
              </h3>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: 0 }}>
                Verified institutional records & issued credentials for {studentName} ({studentRoll})
              </p>
            </div>
          </div>

          <button 
            onClick={onClose} 
            className="btn btn-secondary btn-icon"
            style={{ borderRadius: '50%', width: '34px', height: '34px' }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div style={{ padding: '24px 28px', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '28px' }}>
          
          {/* SECTION 1: MY UPLOADED DOCUMENTS */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
              <div>
                <h4 style={{ fontSize: '1.08rem', fontWeight: '800', margin: 0, color: 'var(--text-primary)' }}>
                  Section 1 — My Uploaded Documents
                </h4>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: '2px 0 0 0' }}>
                  Institutional proof documents on file with Academic Affairs
                </p>
              </div>
              <span style={{ fontSize: '0.75rem', fontWeight: '700', padding: '3px 8px', borderRadius: '6px', background: 'rgba(99, 102, 241, 0.15)', color: 'var(--accent-primary)' }}>
                {documents.filter(d => fileStatusMap[d.id] === 'EXISTS').length} / {documents.length} Available
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {documents.map((doc) => {
                const status = fileStatusMap[doc.id] || (doc.uploaded ? 'EXISTS' : 'NOT_UPLOADED');
                return (
                  <div
                    key={doc.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '14px 18px',
                      borderRadius: '12px',
                      background: 'var(--bg-glass-strong)',
                      border: '1px solid var(--border-subtle)',
                      flexWrap: 'wrap',
                      gap: '12px',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{
                        width: '38px',
                        height: '38px',
                        borderRadius: '10px',
                        background: status === 'EXISTS' ? 'rgba(16, 185, 129, 0.12)' : 'rgba(239, 68, 68, 0.12)',
                        border: `1px solid ${status === 'EXISTS' ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: status === 'EXISTS' ? '#10b981' : '#ef4444',
                      }}>
                        <FileText size={18} />
                      </div>

                      <div>
                        <div style={{ fontSize: '0.92rem', fontWeight: '700', color: 'var(--text-primary)' }}>
                          {doc.name}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                          {status === 'EXISTS' && (
                            <span style={{ color: '#10b981', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                              <CheckCircle2 size={12} /> {doc.fileName} • Verified on File
                            </span>
                          )}
                          {status === 'MISSING' && (
                            <span style={{ color: '#f87171', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                              <AlertTriangle size={12} /> File missing in backend/uploads/ — upload again
                            </span>
                          )}
                          {status === 'NOT_UPLOADED' && (
                            <span style={{ color: 'var(--text-muted)' }}>
                              Not uploaded yet (Optional for admission records)
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {status === 'EXISTS' ? (
                        <>
                          <button
                            type="button"
                            onClick={() => handleView(doc)}
                            className="btn btn-secondary btn-sm"
                            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                            title="Open file in new tab"
                          >
                            <ExternalLink size={13} /> View
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDownload(doc)}
                            className="btn btn-primary btn-sm"
                            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                            title="Download document to device"
                          >
                            <Download size={13} /> Download
                          </button>
                        </>
                      ) : (
                        <label 
                          className="btn btn-secondary btn-sm" 
                          style={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: '6px', 
                            cursor: 'pointer',
                            borderColor: status === 'MISSING' ? 'rgba(239, 68, 68, 0.4)' : undefined 
                          }}
                        >
                          <Upload size={13} />
                          {uploadingId === doc.id ? 'Uploading...' : 'Upload'}
                          <input
                            type="file"
                            accept="image/*,.pdf"
                            onChange={(e) => handleFileUpload(doc.id, e)}
                            style={{ display: 'none' }}
                          />
                        </label>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* SECTION 2: RECEIVED CERTIFICATES */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
              <div>
                <h4 style={{ fontSize: '1.08rem', fontWeight: '800', margin: 0, color: 'var(--text-primary)' }}>
                  Section 2 — Received Certificates
                </h4>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: '2px 0 0 0' }}>
                  Official issued certificates with cryptographic verification
                </p>
              </div>
              <span className="badge badge-approved">
                {issuedCerts.length} Issued
              </span>
            </div>

            {issuedCerts.length === 0 ? (
              <div style={{
                padding: '28px',
                textAlign: 'center',
                background: 'var(--bg-glass-strong)',
                borderRadius: '12px',
                border: '1px solid var(--border-subtle)',
              }}>
                <Award size={36} color="var(--text-muted)" style={{ marginBottom: '8px', opacity: 0.5 }} />
                <p style={{ fontSize: '0.86rem', color: 'var(--text-muted)', margin: 0 }}>
                  No issued certificates yet. Once an application is approved by the registrar, your official PDF certificate will appear here.
                </p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {issuedCerts.map((cert) => (
                  <div
                    key={cert.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '14px 18px',
                      borderRadius: '12px',
                      background: 'var(--bg-glass-strong)',
                      border: '1px solid rgba(16, 185, 129, 0.3)',
                      flexWrap: 'wrap',
                      gap: '12px',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{
                        width: '38px',
                        height: '38px',
                        borderRadius: '10px',
                        background: 'rgba(16, 185, 129, 0.15)',
                        border: '1px solid rgba(16, 185, 129, 0.35)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#10b981',
                      }}>
                        <Award size={18} />
                      </div>

                      <div>
                        <div style={{ fontSize: '0.94rem', fontWeight: '800', color: 'var(--text-primary)' }}>
                          {cert.certificateType}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                          Serial: <strong style={{ color: 'var(--accent-primary)', fontFamily: 'var(--font-mono)' }}>{cert.certificateNumber}</strong> • Issued: {cert.dateApproved || cert.appliedDate || 'Sep 25, 2026'}
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <button
                        type="button"
                        onClick={() => {
                          onClose();
                          if (onOpenCertificate) onOpenCertificate(cert);
                        }}
                        className="btn btn-primary btn-sm"
                        style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                      >
                        <Download size={13} /> Download PDF
                      </button>

                      {cert.receiptNumber && onOpenReceipt && (
                        <button
                          type="button"
                          onClick={() => {
                            onClose();
                            onOpenReceipt(cert);
                          }}
                          className="btn btn-secondary btn-sm"
                          style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                        >
                          <Receipt size={13} /> Download Receipt
                        </button>
                      )}

                      {onVerifyCertificate && (
                        <button
                          type="button"
                          onClick={() => {
                            onClose();
                            onVerifyCertificate(cert);
                          }}
                          className="btn btn-secondary btn-sm"
                          style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                        >
                          <ShieldCheck size={13} /> Verify
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

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
            Digital Archive System • Academic Affairs Registrar
          </span>
          <button onClick={onClose} className="btn btn-secondary btn-sm">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}