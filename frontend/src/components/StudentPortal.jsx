import React, { useState } from 'react';
import { 
  PlusCircle, Search, Clock, CheckCircle2, XCircle, FileText, 
  Download, LogIn, Lock, User, CreditCard, Receipt, ArrowUpDown, AlertCircle, RefreshCw, ShieldCheck
} from 'lucide-react';

export default function StudentPortal({
  requests = [],
  currentUser,
  onOpenStudentLogin,
  onOpenNewRequest,
  onOpenCertificate,
  onOpenProfile,
  onOpenReceipt,
  onPayRequest,
  onVerifyCertificate,
}) {
  const [activeTab, setActiveTab] = useState('requests'); // 'requests' | 'payments'
  const [filterStatus, setFilterStatus] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('newest'); // 'newest' | 'oldest'

  // If a student is logged in, prioritize showing their requests or all student requests
  const studentRequests = currentUser?.role === 'student'
    ? requests.filter(r => !currentUser.rollNumber || r.rollNumber === currentUser.rollNumber || r.studentName === currentUser.name)
    : requests;

  // Strict sorting by timing: Newest first by default
  const sortedRequests = [...studentRequests].sort((a, b) => {
    const timeA = a.appliedTimestamp || (new Date(a.appliedDate).getTime()) || parseInt(a.id, 10) || 0;
    const timeB = b.appliedTimestamp || (new Date(b.appliedDate).getTime()) || parseInt(b.id, 10) || 0;
    if (sortBy === 'oldest') {
      return timeA - timeB;
    }
    return timeB - timeA;
  });

  const filteredRequests = sortedRequests.filter((req) => {
    const matchesStatus = filterStatus === 'All' || req.status.toLowerCase() === filterStatus.toLowerCase();
    const matchesSearch = 
      req.certificateType.toLowerCase().includes(searchTerm.toLowerCase()) ||
      req.certificateNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (req.receiptNumber && req.receiptNumber.toLowerCase().includes(searchTerm.toLowerCase())) ||
      req.purpose.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  // Payment transactions list
  const paymentTransactions = sortedRequests.filter(r => r.fee && r.fee !== 'Free' || r.receiptNumber);

  const totalCount = studentRequests.length;
  const pendingCount = studentRequests.filter(r => r.status === 'Pending').length;
  const approvedCount = studentRequests.filter(r => r.status === 'Approved').length;
  const rejectedCount = studentRequests.filter(r => r.status === 'Rejected').length;

  const handleApplyClick = () => {
    if (!currentUser) {
      onOpenStudentLogin();
    } else {
      onOpenNewRequest();
    }
  };

  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '32px 24px' }}>
      {/* Welcome Banner */}
      <div className="glass-panel" style={{
        padding: '32px',
        marginBottom: '28px',
        background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.85) 0%, rgba(15, 23, 42, 0.95) 100%)',
        position: 'relative',
        overflow: 'hidden',
        border: '1px solid rgba(99, 102, 241, 0.25)',
      }}>
        <div style={{
          position: 'absolute',
          top: '-40px',
          right: '-40px',
          width: '240px',
          height: '240px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(99, 102, 241, 0.2) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
              <span className="badge badge-processing">Student Portal</span>
              {currentUser?.rollNumber ? (
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '4px 12px',
                    borderRadius: '8px',
                    background: 'rgba(99, 102, 241, 0.18)',
                    border: '1px solid rgba(99, 102, 241, 0.35)',
                    color: '#c7d2fe',
                    fontSize: '0.82rem',
                  }}
                >
                  <User size={13} color="var(--accent-primary)" />
                  Roll No: <strong style={{ color: '#fff' }}>{currentUser.rollNumber}</strong> ({currentUser.department || 'IT'})
                </span>
              ) : (
                <span style={{ fontSize: '0.82rem', color: '#fbbf24' }}>
                  Guest Session (Log in to track your personal records)
                </span>
              )}
            </div>

            <h1 style={{ fontSize: '1.9rem', fontWeight: '800', marginBottom: '6px' }}>
              {currentUser ? `Welcome back, ${currentUser.name}` : 'Welcome to Student Certificate Portal'}
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', maxWidth: '640px', margin: 0 }}>
              Track your academic certificates, view official fee receipts, and download verified credentials.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {!currentUser && (
              <button
                onClick={onOpenStudentLogin}
                className="btn btn-secondary"
                style={{ padding: '12px 20px', fontSize: '0.95rem' }}
              >
                <LogIn size={18} />
                Student Login
              </button>
            )}

            <button
              onClick={handleApplyClick}
              className="btn btn-primary"
              style={{ padding: '12px 24px', fontSize: '0.98rem' }}
            >
              <PlusCircle size={20} />
              Apply New Certificate
            </button>
          </div>
        </div>
      </div>

      {/* Main Subtab Switcher: Certificate Requests vs. Payment History Dashboard */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px',
        marginBottom: '24px',
        borderBottom: '1px solid var(--border-subtle)',
        paddingBottom: '12px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            type="button"
            onClick={() => setActiveTab('requests')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 20px',
              borderRadius: 'var(--radius-full)',
              fontSize: '0.92rem',
              fontWeight: activeTab === 'requests' ? '700' : '500',
              color: activeTab === 'requests' ? '#ffffff' : 'var(--text-secondary)',
              background: activeTab === 'requests' ? 'var(--accent-primary)' : 'rgba(255, 255, 255, 0.05)',
              border: 'none',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
          >
            <FileText size={16} />
            Certificate Applications ({totalCount})
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('payments')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 20px',
              borderRadius: 'var(--radius-full)',
              fontSize: '0.92rem',
              fontWeight: activeTab === 'payments' ? '700' : '500',
              color: activeTab === 'payments' ? '#ffffff' : 'var(--text-secondary)',
              background: activeTab === 'payments' ? '#10b981' : 'rgba(255, 255, 255, 0.05)',
              border: 'none',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
          >
            <CreditCard size={16} />
            Payment & Receipts History ({paymentTransactions.length})
          </button>
        </div>

        {/* Timings Sort By Dropdown */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Clock size={14} /> Timing:
          </span>
          <select
            className="form-select"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            style={{ padding: '6px 12px', fontSize: '0.82rem', borderRadius: '8px' }}
          >
            <option value="newest">Newest Applications First</option>
            <option value="oldest">Oldest Applications First</option>
          </select>
        </div>
      </div>

      {/* VIEW 1: CERTIFICATE REQUESTS */}
      {activeTab === 'requests' && (
        <>
          {/* Metric Cards Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '18px',
            marginBottom: '28px',
          }}>
            {/* Total */}
            <div className="glass-panel" style={{ padding: '18px 22px', display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{
                width: '46px',
                height: '46px',
                borderRadius: '12px',
                background: 'rgba(99, 102, 241, 0.15)',
                border: '1px solid rgba(99, 102, 241, 0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <FileText size={22} color="#818cf8" />
              </div>
              <div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontWeight: '600' }}>TOTAL REQUESTS</div>
                <div style={{ fontSize: '1.6rem', fontWeight: '800', color: 'var(--text-primary)' }}>{totalCount}</div>
              </div>
            </div>

            {/* Pending */}
            <div className="glass-panel" style={{ padding: '18px 22px', display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{
                width: '46px',
                height: '46px',
                borderRadius: '12px',
                background: 'rgba(245, 158, 11, 0.15)',
                border: '1px solid rgba(245, 158, 11, 0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <Clock size={22} color="#fbbf24" />
              </div>
              <div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontWeight: '600' }}>PENDING REVIEW</div>
                <div style={{ fontSize: '1.6rem', fontWeight: '800', color: '#fbbf24' }}>{pendingCount}</div>
              </div>
            </div>

            {/* Approved */}
            <div className="glass-panel" style={{ padding: '18px 22px', display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{
                width: '46px',
                height: '46px',
                borderRadius: '12px',
                background: 'rgba(16, 185, 129, 0.15)',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <CheckCircle2 size={22} color="#34d399" />
              </div>
              <div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontWeight: '600' }}>APPROVED & ISSUED</div>
                <div style={{ fontSize: '1.6rem', fontWeight: '800', color: '#34d399' }}>{approvedCount}</div>
              </div>
            </div>

            {/* Rejections */}
            <div className="glass-panel" style={{ padding: '18px 22px', display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{
                width: '46px',
                height: '46px',
                borderRadius: '12px',
                background: 'rgba(239, 68, 68, 0.15)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <XCircle size={22} color="#f87171" />
              </div>
              <div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontWeight: '600' }}>REJECTED</div>
                <div style={{ fontSize: '1.6rem', fontWeight: '800', color: '#f87171' }}>{rejectedCount}</div>
              </div>
            </div>
          </div>

          {/* Search & Filters */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '16px',
            marginBottom: '20px',
          }}>
            <div style={{ position: 'relative', minWidth: '300px', flex: '1', maxWidth: '400px' }}>
              <Search size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="text"
                className="form-input"
                placeholder="Search certificate type or tracking ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ width: '100%', paddingLeft: '40px' }}
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {['All', 'Approved', 'Pending', 'Rejected'].map((status) => (
                <button
                  key={status}
                  onClick={() => setFilterStatus(status)}
                  className="btn btn-sm"
                  style={{
                    background: filterStatus === status ? 'var(--accent-primary)' : 'var(--bg-glass-strong)',
                    color: filterStatus === status ? '#fff' : 'var(--text-secondary)',
                    border: filterStatus === status ? '1px solid var(--accent-primary)' : '1px solid var(--border-subtle)',
                  }}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>

          {/* Requests List */}
          {filteredRequests.length === 0 ? (
            <div className="glass-panel" style={{ padding: '60px 24px', textAlign: 'center' }}>
              <FileText size={48} color="var(--text-muted)" style={{ marginBottom: '16px', opacity: 0.5 }} />
              <h3 style={{ fontSize: '1.2rem', marginBottom: '8px' }}>No certificate requests found</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '20px' }}>
                {searchTerm ? 'Try adjusting your search criteria' : 'You have not submitted any certificate requests yet.'}
              </p>
              <button onClick={handleApplyClick} className="btn btn-primary">
                <PlusCircle size={16} /> Apply Now
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {filteredRequests.map((req) => (
                <div
                  key={req.id}
                  className="glass-panel"
                  style={{
                    padding: '22px 26px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '14px',
                    borderLeft: `5px solid ${
                      req.status === 'Approved' ? '#10b981' :
                      req.status === 'Pending' ? '#f59e0b' : '#ef4444'
                    }`,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
                    {/* Certificate Title & Status */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                      <div style={{
                        width: '46px',
                        height: '46px',
                        borderRadius: '10px',
                        background: req.status === 'Approved' ? 'rgba(16, 185, 129, 0.12)' : 'rgba(99, 102, 241, 0.12)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: `1px solid ${req.status === 'Approved' ? 'rgba(16, 185, 129, 0.3)' : 'rgba(99, 102, 241, 0.3)'}`,
                      }}>
                        <FileText size={22} color={req.status === 'Approved' ? '#34d399' : '#818cf8'} />
                      </div>

                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                          <h3 style={{ fontSize: '1.08rem', fontWeight: '800', margin: 0, color: 'var(--text-primary)' }}>
                            {req.certificateType}
                          </h3>
                          <span className={`badge ${
                            req.status === 'Approved' ? 'badge-approved' :
                            req.status === 'Pending' ? 'badge-pending' : 'badge-rejected'
                          }`}>
                            {req.status}
                          </span>
                          {req.status === 'Rejected' && (
                            <span style={{
                              fontSize: '0.72rem',
                              fontWeight: '700',
                              color: '#f87171',
                              background: 'rgba(239, 68, 68, 0.15)',
                              border: '1px solid rgba(239, 68, 68, 0.4)',
                              borderRadius: '6px',
                              padding: '2px 8px',
                            }}>
                              Rejected — Cannot re-apply
                            </span>
                          )}
                          {req.urgency === 'Urgent' && (
                            <span className="badge badge-rejected" style={{ fontSize: '0.68rem' }}>Urgent Priority</span>
                          )}
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '14px', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                          <span>Tracking: <strong style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>{req.certificateNumber}</strong></span>
                          <span>•</span>
                          <span>Purpose: <span style={{ color: 'var(--text-secondary)' }}>{req.purpose}</span></span>
                          <span>•</span>
                          <span>Applied: <strong>{req.appliedDate}</strong> {req.appliedTime && `at ${req.appliedTime}`}</span>
                        </div>
                      </div>
                    </div>

                    {/* Actions: Received certificates show [Download PDF] [Download Receipt] [Verify] */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {req.status === 'Approved' ? (
                        <>
                          <button
                            onClick={() => onOpenCertificate(req)}
                            className="btn btn-primary btn-sm"
                            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                            title="Download official PDF certificate"
                          >
                            <Download size={14} />
                            Download PDF
                          </button>

                          {req.receiptNumber && (
                            <button
                              onClick={() => onOpenReceipt && onOpenReceipt(req)}
                              className="btn btn-secondary btn-sm"
                              style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                              title="Download official payment receipt"
                            >
                              <Receipt size={14} color="#818cf8" />
                              Download Receipt
                            </button>
                          )}

                          <button
                            onClick={() => onVerifyCertificate ? onVerifyCertificate(req) : (onOpenCertificate && onOpenCertificate(req))}
                            className="btn btn-secondary btn-sm"
                            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                            title="Verify digital seal"
                          >
                            <ShieldCheck size={14} color="#34d399" />
                            Verify
                          </button>
                        </>
                      ) : req.status === 'Pending' ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          {req.fee && req.fee !== 'Free' && !req.feePaid && (
                            <button
                              onClick={() => onPayRequest && onPayRequest(req)}
                              className="btn btn-primary btn-sm"
                              style={{
                                background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                                borderColor: '#f59e0b',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                                boxShadow: '0 2px 8px rgba(245, 158, 11, 0.35)',
                              }}
                            >
                              <CreditCard size={14} />
                              Pay Now ({req.fee})
                            </button>
                          )}
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                            <Clock size={16} color="#fbbf24" />
                            <span>Estimated: 24–48h</span>
                          </div>
                        </div>
                      ) : (
                        <span style={{
                          fontSize: '0.78rem',
                          fontWeight: '700',
                          color: '#f87171',
                          padding: '6px 12px',
                          background: 'rgba(239, 68, 68, 0.1)',
                          border: '1px solid rgba(239, 68, 68, 0.3)',
                          borderRadius: '8px',
                        }}>
                          Rejected — Cannot re-apply
                        </span>
                      )}
                    </div>
                  </div>

                  {/* PROMINENT REJECTION REASON & REFUND REMINDER NOTICE */}
                  {req.status === 'Rejected' && (
                    <div style={{
                      padding: '12px 18px',
                      borderRadius: '10px',
                      background: 'rgba(239, 68, 68, 0.12)',
                      border: '1px solid rgba(239, 68, 68, 0.35)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '6px',
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#fca5a5', fontSize: '0.86rem', fontWeight: '700' }}>
                        <XCircle size={16} color="#f87171" />
                        Application Rejected by Academic Controller
                      </div>
                      <div style={{ fontSize: '0.84rem', color: '#fed7d7' }}>
                        <strong>Reason:</strong> {req.rejectionReason || 'Institutional review criteria not satisfied or incomplete ID verification.'}
                      </div>

                      {/* Fee Refund Reminder */}
                      {(req.refundNotice || req.feePaid) && (
                        <div style={{
                          marginTop: '4px',
                          padding: '8px 12px',
                          borderRadius: '8px',
                          background: 'rgba(245, 158, 11, 0.15)',
                          border: '1px solid rgba(245, 158, 11, 0.3)',
                          color: '#fbbf24',
                          fontSize: '0.8rem',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                        }}>
                          <CreditCard size={15} />
                          <span>
                            <strong>Fee Refund Reminder:</strong> {req.refundNotice || `Full refund of ${req.fee} initiated to original payment method. Expected in 2–3 business days.`}
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* VIEW 2: PAYMENT & RECEIPTS HISTORY DASHBOARD */}
      {activeTab === 'payments' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Payment Stats Overview */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: '16px',
          }}>
            <div className="glass-panel" style={{ padding: '20px 24px' }}>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontWeight: '700', textTransform: 'uppercase' }}>
                Total Transactions Recorded
              </div>
              <div style={{ fontSize: '1.8rem', fontWeight: '900', color: '#818cf8', marginTop: '4px' }}>
                {paymentTransactions.length}
              </div>
              <p style={{ margin: '4px 0 0 0', fontSize: '0.76rem', color: 'var(--text-muted)' }}>
                Including UPI, Cards, and Institutional standard clearances
              </p>
            </div>

            <div className="glass-panel" style={{ padding: '20px 24px' }}>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontWeight: '700', textTransform: 'uppercase' }}>
                Verified Official Receipts
              </div>
              <div style={{ fontSize: '1.8rem', fontWeight: '900', color: '#10b981', marginTop: '4px' }}>
                {paymentTransactions.filter(r => r.receiptNumber).length}
              </div>
              <p style={{ margin: '4px 0 0 0', fontSize: '0.76rem', color: 'var(--text-muted)' }}>
                Click 'View Receipt' below to print or download PDF
              </p>
            </div>
          </div>

          {/* Payment Transactions Table */}
          <div className="glass-panel" style={{ overflow: 'hidden' }}>
            <div style={{ padding: '16px 22px', borderBottom: '1px solid var(--border-subtle)', background: 'var(--bg-glass-strong)' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: '800', margin: 0, color: 'var(--text-primary)' }}>
                Official Fee Payment & Ledger History
              </h3>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: '2px 0 0 0' }}>
                All transaction receipts generated digitally with audit trail
              </p>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ background: 'var(--bg-glass)', borderBottom: '1px solid var(--border-subtle)' }}>
                    <th style={{ padding: '14px 18px', fontSize: '0.76rem', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase' }}>
                      Receipt ID
                    </th>
                    <th style={{ padding: '14px 18px', fontSize: '0.76rem', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase' }}>
                      Certificate Requested
                    </th>
                    <th style={{ padding: '14px 18px', fontSize: '0.76rem', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase' }}>
                      Amount Paid
                    </th>
                    <th style={{ padding: '14px 18px', fontSize: '0.76rem', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase' }}>
                      Payment Mode
                    </th>
                    <th style={{ padding: '14px 18px', fontSize: '0.76rem', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase' }}>
                      Transaction Date & Timing
                    </th>
                    <th style={{ padding: '14px 18px', fontSize: '0.76rem', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase' }}>
                      Ledger Status
                    </th>
                    <th style={{ padding: '14px 18px', fontSize: '0.76rem', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase', textAlign: 'right' }}>
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {paymentTransactions.length === 0 ? (
                    <tr>
                      <td colSpan={7} style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
                        No fee transactions recorded yet.
                      </td>
                    </tr>
                  ) : (
                    paymentTransactions.map((trx) => {
                      const isTrxPaid = trx.fee && trx.fee !== 'Free' || trx.certificateType?.includes('Transfer') || trx.certificateType?.includes('Migration');
                      const feeVal = trx.fee || (trx.certificateType?.includes('Migration') ? '₹150' : trx.certificateType?.includes('Transfer') ? '₹100' : 'Free');
                      const isRefund = trx.status === 'Rejected' && isTrxPaid;

                      return (
                        <tr 
                          key={trx.id} 
                          style={{ borderBottom: '1px solid var(--border-subtle)', transition: 'background 0.2s ease' }}
                          onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-glass)'}
                          onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                        >
                          {/* Receipt ID */}
                          <td style={{ padding: '14px 18px' }}>
                            <span style={{ fontWeight: '700', fontFamily: 'var(--font-mono)', color: 'var(--accent-primary)', fontSize: '0.86rem' }}>
                              {trx.receiptNumber || `REC-2026-${trx.id}`}
                            </span>
                          </td>

                          {/* Certificate */}
                          <td style={{ padding: '14px 18px' }}>
                            <div style={{ fontWeight: '600', color: 'var(--text-primary)', fontSize: '0.88rem' }}>
                              {trx.certificateType}
                            </div>
                            <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                              Serial: {trx.certificateNumber}
                            </div>
                          </td>

                          {/* Amount */}
                          <td style={{ padding: '14px 18px' }}>
                            <span style={{
                              fontWeight: '800',
                              fontSize: '0.92rem',
                              color: isRefund ? '#f87171' : isTrxPaid ? '#10b981' : 'var(--text-primary)',
                            }}>
                              {feeVal}
                            </span>
                          </td>

                          {/* Mode */}
                          <td style={{ padding: '14px 18px' }}>
                            <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                              {trx.paymentMethod || 'UPI (Online)'}
                            </span>
                          </td>

                          {/* Date & Timing */}
                          <td style={{ padding: '14px 18px' }}>
                            <div style={{ fontSize: '0.82rem', color: 'var(--text-primary)' }}>
                              {trx.appliedDate}
                            </div>
                            <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                              {trx.appliedTime || '08:30 AM'}
                            </div>
                          </td>

                          {/* Status */}
                          <td style={{ padding: '14px 18px' }}>
                            {isRefund ? (
                              <span style={{
                                padding: '3px 8px',
                                borderRadius: '6px',
                                background: 'rgba(239, 68, 68, 0.15)',
                                color: '#f87171',
                                border: '1px solid rgba(239, 68, 68, 0.35)',
                                fontSize: '0.72rem',
                                fontWeight: '700',
                              }}>
                                REFUND INITIATED
                              </span>
                            ) : isTrxPaid ? (
                              <span style={{
                                padding: '3px 8px',
                                borderRadius: '6px',
                                background: 'rgba(16, 185, 129, 0.15)',
                                color: '#10b981',
                                border: '1px solid rgba(16, 185, 129, 0.35)',
                                fontSize: '0.72rem',
                                fontWeight: '700',
                              }}>
                                SUCCESS / PAID
                              </span>
                            ) : (
                              <span style={{
                                padding: '3px 8px',
                                borderRadius: '6px',
                                background: 'var(--bg-glass-strong)',
                                color: 'var(--text-muted)',
                                border: '1px solid var(--border-subtle)',
                                fontSize: '0.72rem',
                                fontWeight: '600',
                              }}>
                                INSTITUTIONAL FREE
                              </span>
                            )}
                          </td>

                          {/* Action: View Receipt */}
                          <td style={{ padding: '14px 18px', textAlign: 'right' }}>
                            <button
                              onClick={() => onOpenReceipt && onOpenReceipt(trx)}
                              className="btn btn-secondary btn-sm"
                              style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}
                            >
                              <Receipt size={14} color="var(--accent-primary)" />
                              View Receipt
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
