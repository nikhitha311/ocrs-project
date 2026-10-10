import React, { useState } from 'react';
import { Search, ShieldCheck, CheckCircle2, XCircle, Award, ExternalLink, Calendar, FileText } from 'lucide-react';

export default function PublicVerify({ requests, onOpenCertificate }) {
  const [query, setQuery] = useState('');
  const [result, setResult] = useState(null);
  const [hasSearched, setHasSearched] = useState(false);

  const handleVerify = (e) => {
    e.preventDefault();
    setHasSearched(true);
    const cleaned = query.trim().toUpperCase();

    // Look for matching certificate
    const match = requests.find(r => 
      r.status === 'Approved' && (
        r.certificateNumber.toUpperCase() === cleaned ||
        r.id === cleaned ||
        r.rollNumber.toUpperCase() === cleaned
      )
    );

    setResult(match || null);
  };

  const sampleSearch = (code) => {
    setQuery(code);
    setHasSearched(true);
    const match = requests.find(r => r.certificateNumber === code || r.status === 'Approved');
    setResult(match || null);
  };

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '40px 24px' }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '36px' }}>
        <div style={{
          width: '56px',
          height: '56px',
          borderRadius: '16px',
          background: 'var(--accent-gradient)',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '16px',
          boxShadow: 'var(--shadow-glow)',
        }}>
          <ShieldCheck size={32} color="#ffffff" />
        </div>
        <h1 style={{ fontSize: '2.2rem', fontWeight: '800', marginBottom: '8px' }}>
          Official Credential Verification
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', maxWidth: '580px', margin: '0 auto' }}>
          Instantly verify the authenticity of certificates issued by Autonomous Institute of Technology via blockchain-grade validation.
        </p>
      </div>

      {/* Verification Input Box */}
      <div className="glass-panel" style={{ padding: '32px', marginBottom: '32px' }}>
        <form onSubmit={handleVerify} style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flex: '1', minWidth: '280px' }}>
            <Search size={20} color="var(--text-muted)" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              className="form-input"
              placeholder="Enter Certificate Number (e.g., OCRS-2026-9841)"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              style={{ width: '100%', paddingLeft: '48px', fontSize: '1rem', height: '52px' }}
              required
            />
          </div>
          <button type="submit" className="btn btn-primary" style={{ padding: '0 28px', height: '52px', fontSize: '1rem' }}>
            <ShieldCheck size={18} />
            Verify Now
          </button>
        </form>

        {/* Quick sample pills */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '16px', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
          <span>Try sample:</span>
          {requests.filter(r => r.status === 'Approved').slice(0, 2).map((req) => (
            <button
              key={req.id}
              onClick={() => sampleSearch(req.certificateNumber)}
              style={{
                background: 'rgba(99, 102, 241, 0.15)',
                color: '#a5b4fc',
                border: '1px solid rgba(99, 102, 241, 0.3)',
                borderRadius: 'var(--radius-full)',
                padding: '3px 10px',
                cursor: 'pointer',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.78rem',
              }}
            >
              {req.certificateNumber}
            </button>
          ))}
        </div>
      </div>

      {/* Verification Results Panel */}
      {hasSearched && (
        <div className="glass-panel" style={{
          padding: '32px',
          border: `1px solid ${result ? 'rgba(16, 185, 129, 0.4)' : 'rgba(239, 68, 68, 0.4)'}`,
          background: result ? 'rgba(16, 185, 129, 0.05)' : 'rgba(239, 68, 68, 0.05)',
          animation: 'slideUp 0.3s ease-out',
        }}>
          {result ? (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                <CheckCircle2 size={32} color="#10b981" />
                <div>
                  <h3 style={{ fontSize: '1.3rem', color: '#34d399', margin: 0, fontWeight: '800' }}>
                    Authentic & Verified Certificate
                  </h3>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0 }}>
                    Official digital credential verified from institutional ledger.
                  </p>
                </div>
              </div>

              {/* Record details */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '16px',
                padding: '20px',
                background: 'rgba(15, 23, 42, 0.8)',
                borderRadius: 'var(--radius-md)',
                marginBottom: '20px',
              }}>
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>STUDENT NAME</div>
                  <div style={{ fontWeight: '700', fontSize: '1rem', color: '#fff' }}>{result.studentName}</div>
                </div>

                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>ROLL NUMBER</div>
                  <div style={{ fontWeight: '700', fontSize: '1rem', color: '#fff', fontFamily: 'var(--font-mono)' }}>{result.rollNumber}</div>
                </div>

                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>CERTIFICATE TYPE</div>
                  <div style={{ fontWeight: '700', fontSize: '1rem', color: '#a5b4fc' }}>{result.certificateType}</div>
                </div>

                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>ISSUE DATE</div>
                  <div style={{ fontWeight: '700', fontSize: '1rem', color: '#fff' }}>{result.dateApproved || 'September 2026'}</div>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button onClick={() => onOpenCertificate(result)} className="btn btn-primary btn-sm">
                  <ExternalLink size={15} />
                  View Original Certificate
                </button>
              </div>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '16px' }}>
              <XCircle size={40} color="#f87171" style={{ marginBottom: '12px' }} />
              <h3 style={{ fontSize: '1.25rem', color: '#f87171', marginBottom: '6px' }}>
                Certificate Not Found
              </h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: 0 }}>
                No active or approved certificate matches this identifier. Please verify the code or contact the academic administration.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
