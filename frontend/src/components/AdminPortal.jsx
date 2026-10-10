import React, { useState } from 'react';
import { 
  ShieldCheck, Check, X, Search, Mail, Eye, Download, UserCheck, 
  AlertCircle, RefreshCw, Lock, LogIn, Calendar, Clock, DollarSign, 
  FileText, Edit3, Filter, AlertTriangle, ArrowUpDown, CheckCircle2, User, Sparkles, TrendingUp
} from 'lucide-react';
import confetti from 'canvas-confetti';
import ProofModal from './ProofModal';
import DocumentAuditModal from './DocumentAuditModal';
import AdminProfileModal from './AdminProfileModal';
import RejectReasonModal from './RejectReasonModal';

export default function AdminPortal({
  requests,
  currentUser,
  onOpenAdminLogin,
  onApprove,
  onReject,
  onOpenCertificate,
  onSendEmail,
  onUpdateAdmin,
  onOpenStudentProfile,
  onOpenReceipt,
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('All'); // 'All' | 'Pending' | 'Approved' | 'Rejected'
  const [activeQueueTab, setActiveQueueTab] = useState('pending'); // 'pending' | 'history' (Issue 5C)
  const [timeFilter, setTimeFilter] = useState('all'); // 'all' | 'today' | 'yesterday' | 'week'
  const [purposeFilter, setPurposeFilter] = useState('all'); // 'all' | specific purpose
  const [sortBy, setSortBy] = useState('newest'); // 'newest' | 'oldest' | 'urgent' (Issue 5B)
  const [actionLoading, setActionLoading] = useState(null);

  // Modal states
  const [selectedProofRequest, setSelectedProofRequest] = useState(null);
  const [auditRequest, setAuditRequest] = useState(null);
  const [isAdminProfileOpen, setIsAdminProfileOpen] = useState(false);
  const [rejectModalRequest, setRejectModalRequest] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleConfirmReject = async (id, reason, refundNotice) => {
    onReject(id, reason, refundNotice);
    showToast('Request rejected · Student notified');

    // Automatically send status update email explaining reason & refund reminder
    const target = requests.find(r => r.id === id);
    if (onSendEmail && target) {
      try {
        await onSendEmail({
          to: target.studentEmail || 'nikhithamandhula18@gmail.com',
          studentName: target.studentName,
          certificateType: target.certificateType,
          status: 'Rejected',
          rejectionReason: reason,
          refundNotice,
        });
      } catch (err) {
        console.error('Error dispatching rejection email:', err);
      }
    }
  };

  // If not logged in as admin, show security access gate
  if (!currentUser || currentUser.role !== 'admin') {
    return (
      <div style={{ maxWidth: '640px', margin: '60px auto', padding: '0 24px' }}>
        <div className="glass-panel" style={{
          padding: '48px 32px',
          textAlign: 'center',
          border: '1px solid rgba(16, 185, 129, 0.3)',
          background: 'var(--bg-card)',
        }}>
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '16px',
            background: 'rgba(16, 185, 129, 0.15)',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--success)',
            marginBottom: '20px',
          }}>
            <Lock size={32} />
          </div>

          <h2 style={{ fontSize: '1.6rem', fontWeight: '800', marginBottom: '8px', color: 'var(--text-primary)' }}>
            Admin Verification Required
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', maxWidth: '440px', margin: '0 auto 24px auto' }}>
            This console is restricted to institutional faculty and academic controllers. Please authenticate with administrator credentials to manage requests.
          </p>

          <button
            onClick={onOpenAdminLogin}
            className="btn btn-primary"
            style={{
              padding: '12px 28px',
              fontSize: '1rem',
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              borderColor: '#10b981',
              boxShadow: '0 4px 14px rgba(16, 185, 129, 0.35)',
            }}
          >
            <ShieldCheck size={18} />
            Authenticate as Admin
          </button>
        </div>
      </div>
    );
  }

  // Duplicate Check: Check if an approved certificate of the same type already exists for this student
  const getExistingApprovedCert = (currentReq) => {
    return requests.find(r => 
      r.id !== currentReq.id && 
      (r.rollNumber === currentReq.rollNumber || r.studentName === currentReq.studentName) &&
      r.certificateType === currentReq.certificateType &&
      r.status === 'Approved'
    );
  };

  // History & Appeal Calculations
  const todayAppeals = requests.filter(r => {
    const appliedStr = (r.appliedDate || '').toLowerCase();
    return appliedStr.includes('today') || appliedStr.includes('sep 30') || appliedStr.includes('oct 1');
  });

  const yesterdayAppeals = requests.filter(r => {
    const appliedStr = (r.appliedDate || '').toLowerCase();
    return appliedStr.includes('yesterday') || appliedStr.includes('sep 29') || appliedStr.includes('sep 26');
  });

  // Purpose / Need Aggregation
  const purposeMap = requests.reduce((acc, r) => {
    const p = r.purpose || 'Other Purpose';
    acc[p] = (acc[p] || 0) + 1;
    return acc;
  }, {});

  // ISSUE 5C: Pending Queue vs History segregation
  const isPendingStatus = (s) => ['pending', 'in_review', 'in review', 'submitted'].includes((s || '').toLowerCase());
  const isHistoryStatus = (s) => ['approved', 'issued', 'rejected'].includes((s || '').toLowerCase());

  const pendingCount = requests.filter(r => isPendingStatus(r.status)).length;
  const historyCount = requests.filter(r => isHistoryStatus(r.status)).length;

  const currentPool = requests.filter(r => {
    if (activeQueueTab === 'pending') return isPendingStatus(r.status);
    return isHistoryStatus(r.status);
  });

  // Filter & Segregate requests by status, search, time, and need/purpose
  const filteredRequests = currentPool.filter((req) => {
    const matchesFilter = filterType === 'All' || req.status.toLowerCase() === filterType.toLowerCase();
    const matchesSearch = 
      req.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      req.rollNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      req.certificateType.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (req.receiptNumber && req.receiptNumber.toLowerCase().includes(searchTerm.toLowerCase()));

    // Time segregation check
    let matchesTime = true;
    const appliedStr = (req.appliedDate || '').toLowerCase();
    if (timeFilter === 'today') {
      matchesTime = appliedStr.includes('sep 30') || appliedStr.includes('oct 1') || appliedStr.includes('oct 10') || appliedStr.includes('today');
    } else if (timeFilter === 'yesterday') {
      matchesTime = appliedStr.includes('sep 29') || appliedStr.includes('sep 26') || appliedStr.includes('oct 9') || appliedStr.includes('yesterday');
    } else if (timeFilter === 'week') {
      matchesTime = appliedStr.includes('sep 2') || appliedStr.includes('sep 3') || appliedStr.includes('oct');
    }

    // Purpose / Need check
    let matchesPurpose = true;
    if (purposeFilter !== 'all') {
      matchesPurpose = req.purpose === purposeFilter;
    }

    return matchesFilter && matchesSearch && matchesTime && matchesPurpose;
  });

  // Sorting: newest application first by default (Issue 5B)
  const sortedRequests = [...filteredRequests].sort((a, b) => {
    if (sortBy === 'urgent') {
      return (b.urgency === 'Urgent' ? 1 : 0) - (a.urgency === 'Urgent' ? 1 : 0);
    }
    const timeA = a.appliedTimestamp || (new Date(a.appliedDate).getTime()) || (parseInt(a.id, 10) || 0);
    const timeB = b.appliedTimestamp || (new Date(b.appliedDate).getTime()) || (parseInt(b.id, 10) || 0);
    if (sortBy === 'oldest') {
      return timeA - timeB;
    }
    return timeB - timeA;
  });

  // Date grouping headers (Issue 5B)
  const groupedRequests = sortedRequests.reduce((acc, req) => {
    let header = 'Earlier Records';
    const appliedStr = (req.appliedDate || '').toLowerCase();
    if (appliedStr.includes('today') || appliedStr.includes('oct 10')) {
      header = 'Today (Oct 10, 2026)';
    } else if (appliedStr.includes('yesterday') || appliedStr.includes('oct 9')) {
      header = 'Yesterday (Oct 9, 2026)';
    } else if (appliedStr.includes('oct 8')) {
      header = 'Oct 8, 2026';
    } else if (appliedStr.includes('sep 26')) {
      header = 'Sep 26, 2026';
    } else if (appliedStr.includes('sep 24')) {
      header = 'Sep 24, 2026';
    } else if (appliedStr.includes('sep 20')) {
      header = 'Sep 20, 2026';
    } else if (req.appliedDate) {
      header = req.appliedDate;
    }
    if (!acc[header]) acc[header] = [];
    acc[header].push(req);
    return acc;
  }, {});

  // Shared DateTime helper: formatDateTime(date) -> "Oct 1, 2026 at 03:45 PM" (Issue 5A)
  const formatDateTime = (dateVal, timeVal) => {
    if (!dateVal) return 'Oct 1, 2026 at 03:45 PM';
    if (timeVal) return `${dateVal} at ${timeVal}`;
    if (String(dateVal).includes('at')) return dateVal;
    const d = new Date(dateVal);
    if (!isNaN(d.getTime())) {
      const dStr = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      const tStr = d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
      return `${dStr} at ${tStr}`;
    }
    return `${dateVal} at 03:45 PM`;
  };

  const handleApproveWithEmail = async (reqId, updatedFields = {}) => {
    setActionLoading(reqId);
    try {
      const targetReq = requests.find(r => r.id === reqId);
      onApprove(reqId, updatedFields);

      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 },
      });

      if (onSendEmail && targetReq) {
        await onSendEmail({
          to: targetReq.studentEmail || 'nikhithamandhula18@gmail.com',
          studentName: targetReq.studentName, // original legal name
          certificateType: targetReq.certificateType,
        });
      }
    } catch (err) {
      console.error('Email dispatch error:', err);
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div style={{ maxWidth: '1360px', margin: '0 auto', padding: '32px 24px' }}>
      {/* Admin Header with Live Identity */}
      <div className="glass-panel" style={{
        padding: '28px 32px',
        marginBottom: '24px',
        background: 'var(--bg-card)',
        border: '1px solid rgba(16, 185, 129, 0.35)',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
              <span className="badge badge-approved">Faculty & Admin Console</span>
              <span style={{ fontSize: '0.84rem', color: 'var(--success)', fontWeight: '700' }}>
                Controller: {currentUser.name} ({currentUser.designation || 'Dean'})
              </span>
            </div>
            <h1 style={{ fontSize: '1.85rem', fontWeight: '800', margin: 0, color: 'var(--text-primary)' }}>
              Certificate Audit & Approval Hub
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '4px' }}>
              Audit student ID proofs, inspect and edit paper details, track payments with transaction IDs, and inspect student records.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button
              onClick={() => setIsAdminProfileOpen(true)}
              className="btn btn-secondary"
              style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
              title="Edit your official admin name, designation, and signature details"
            >
              <Edit3 size={16} color="var(--accent-primary)" />
              Edit Admin Details
            </button>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '10px 16px',
              background: 'rgba(16, 185, 129, 0.12)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
            }}>
              <ShieldCheck size={26} color="var(--success)" />
              <div>
                <div style={{ fontSize: '0.72rem', color: 'var(--success)', fontWeight: '800' }}>DIGITAL SIGNATURE</div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-primary)', fontWeight: '700' }}>AICTE Seal Active</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* REQUIREMENT 6: Application History & Daily Analytics (Yesterday vs. Today & Need Breakdown) */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
        gap: '14px',
        marginBottom: '24px',
      }}>
        {/* Card 1: Today's Appeals */}
        <div 
          onClick={() => setTimeFilter(timeFilter === 'today' ? 'all' : 'today')}
          style={{
            padding: '18px 20px',
            borderRadius: '16px',
            background: timeFilter === 'today' ? 'rgba(16, 185, 129, 0.18)' : 'var(--bg-glass-strong)',
            border: `1px solid ${timeFilter === 'today' ? 'rgba(16, 185, 129, 0.5)' : 'var(--border-subtle)'}`,
            cursor: 'pointer',
            transition: 'all 0.2s ease',
          }}
          title="Click to view appeals filed Today"
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase' }}>
              Appeals Filed Today
            </span>
            <span style={{ padding: '3px 8px', borderRadius: '6px', background: 'rgba(16, 185, 129, 0.2)', color: '#10b981', fontSize: '0.72rem', fontWeight: '800' }}>
              Today
            </span>
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: '900', color: '#10b981' }}>
            {todayAppeals.length} <span style={{ fontSize: '0.88rem', fontWeight: '600', color: 'var(--text-muted)' }}>Students</span>
          </div>
          <p style={{ margin: '4px 0 0 0', fontSize: '0.76rem', color: 'var(--text-secondary)' }}>
            {timeFilter === 'today' ? '✓ Showing today\'s appeals (Click to reset)' : 'Click to filter today\'s requests'}
          </p>
        </div>

        {/* Card 2: Yesterday's Appeals */}
        <div 
          onClick={() => setTimeFilter(timeFilter === 'yesterday' ? 'all' : 'yesterday')}
          style={{
            padding: '18px 20px',
            borderRadius: '16px',
            background: timeFilter === 'yesterday' ? 'rgba(99, 102, 241, 0.18)' : 'var(--bg-glass-strong)',
            border: `1px solid ${timeFilter === 'yesterday' ? 'rgba(99, 102, 241, 0.5)' : 'var(--border-subtle)'}`,
            cursor: 'pointer',
            transition: 'all 0.2s ease',
          }}
          title="Click to view appeals filed Yesterday"
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase' }}>
              Appeals Filed Yesterday
            </span>
            <span style={{ padding: '3px 8px', borderRadius: '6px', background: 'rgba(99, 102, 241, 0.2)', color: '#818cf8', fontSize: '0.72rem', fontWeight: '800' }}>
              Yesterday
            </span>
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: '900', color: '#818cf8' }}>
            {yesterdayAppeals.length} <span style={{ fontSize: '0.88rem', fontWeight: '600', color: 'var(--text-muted)' }}>Students</span>
          </div>
          <p style={{ margin: '4px 0 0 0', fontSize: '0.76rem', color: 'var(--text-secondary)' }}>
            {timeFilter === 'yesterday' ? '✓ Showing yesterday\'s appeals (Click to reset)' : 'Click to filter yesterday\'s requests'}
          </p>
        </div>

        {/* Card 3: All-Time History & Status */}
        <div style={{
          padding: '18px 20px',
          borderRadius: '16px',
          background: 'var(--bg-glass-strong)',
          border: '1px solid var(--border-subtle)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase' }}>
              All-Time Appeals History
            </span>
            <span style={{ fontSize: '0.72rem', color: 'var(--accent-primary)', fontWeight: '700' }}>
              {requests.length} Total
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div>
              <div style={{ fontSize: '1.4rem', fontWeight: '800', color: '#f59e0b' }}>
                {requests.filter(r => r.status === 'Pending').length}
              </div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Pending</div>
            </div>
            <div style={{ width: '1px', height: '28px', background: 'var(--border-subtle)' }} />
            <div>
              <div style={{ fontSize: '1.4rem', fontWeight: '800', color: '#10b981' }}>
                {requests.filter(r => r.status === 'Approved').length}
              </div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Approved</div>
            </div>
            <div style={{ width: '1px', height: '28px', background: 'var(--border-subtle)' }} />
            <div>
              <div style={{ fontSize: '1.4rem', fontWeight: '800', color: '#f87171' }}>
                {requests.filter(r => r.status === 'Rejected').length}
              </div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Rejected</div>
            </div>
          </div>
        </div>
      </div>

      {/* Need / Purpose Breakdown Filter Bar */}
      <div style={{
        padding: '14px 20px',
        borderRadius: '14px',
        background: 'var(--bg-glass-strong)',
        border: '1px solid var(--border-subtle)',
        marginBottom: '20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <TrendingUp size={16} color="var(--accent-primary)" />
          <span style={{ fontSize: '0.82rem', fontWeight: '700', color: 'var(--text-primary)' }}>
            Appeals by Student Need / Purpose:
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={() => setPurposeFilter('all')}
            style={{
              padding: '4px 10px',
              borderRadius: 'var(--radius-full)',
              fontSize: '0.75rem',
              fontWeight: purposeFilter === 'all' ? '700' : '500',
              background: purposeFilter === 'all' ? 'var(--accent-primary)' : 'rgba(255, 255, 255, 0.05)',
              color: purposeFilter === 'all' ? '#fff' : 'var(--text-secondary)',
              border: 'none',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
          >
            All Needs ({requests.length})
          </button>

          {Object.entries(purposeMap).map(([purposeName, count]) => (
            <button
              key={purposeName}
              type="button"
              onClick={() => setPurposeFilter(purposeFilter === purposeName ? 'all' : purposeName)}
              style={{
                padding: '4px 12px',
                borderRadius: 'var(--radius-full)',
                fontSize: '0.75rem',
                fontWeight: purposeFilter === purposeName ? '700' : '500',
                background: purposeFilter === purposeName ? 'var(--accent-primary)' : 'rgba(99, 102, 241, 0.12)',
                color: purposeFilter === purposeName ? '#fff' : '#c7d2fe',
                border: `1px solid ${purposeFilter === purposeName ? 'var(--accent-primary)' : 'rgba(99, 102, 241, 0.25)'}`,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
              title={`Click to filter requests needed for ${purposeName}`}
            >
              {purposeName} ({count})
            </button>
          ))}
        </div>
      </div>

      {/* ISSUE 5C: Pending Queue vs History Tab Switcher */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        marginBottom: '20px',
        borderBottom: '1px solid var(--border-subtle)',
        paddingBottom: '14px',
      }}>
        <button
          type="button"
          onClick={() => {
            setActiveQueueTab('pending');
            setFilterType('All');
          }}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 22px',
            borderRadius: 'var(--radius-full)',
            fontSize: '0.94rem',
            fontWeight: activeQueueTab === 'pending' ? '800' : '600',
            background: activeQueueTab === 'pending' ? 'var(--accent-primary)' : 'rgba(255, 255, 255, 0.05)',
            color: activeQueueTab === 'pending' ? '#ffffff' : 'var(--text-secondary)',
            border: `1px solid ${activeQueueTab === 'pending' ? 'var(--accent-primary)' : 'var(--border-subtle)'}`,
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            boxShadow: activeQueueTab === 'pending' ? '0 4px 14px rgba(99, 102, 241, 0.35)' : 'none',
          }}
        >
          <Clock size={16} />
          Pending Queue ({pendingCount})
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveQueueTab('history');
            setFilterType('All');
          }}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 22px',
            borderRadius: 'var(--radius-full)',
            fontSize: '0.94rem',
            fontWeight: activeQueueTab === 'history' ? '800' : '600',
            background: activeQueueTab === 'history' ? '#10b981' : 'rgba(255, 255, 255, 0.05)',
            color: activeQueueTab === 'history' ? '#ffffff' : 'var(--text-secondary)',
            border: `1px solid ${activeQueueTab === 'history' ? '#10b981' : 'var(--border-subtle)'}`,
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            boxShadow: activeQueueTab === 'history' ? '0 4px 14px rgba(16, 185, 129, 0.35)' : 'none',
          }}
        >
          <CheckCircle2 size={16} />
          History ({historyCount})
        </button>
      </div>

      {/* Control Bar: Search, Status Filters, Time Segregation, and Sorting */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px',
        marginBottom: '20px',
      }}>
        {/* Search */}
        <div style={{ position: 'relative', minWidth: '300px', flex: '1', maxWidth: '380px' }}>
          <Search size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            className="form-input"
            placeholder="Search student, roll number, receipt ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ width: '100%', paddingLeft: '40px' }}
          />
        </div>

        {/* Filters Group */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          {/* Status filters */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'var(--bg-glass-strong)', padding: '4px', borderRadius: 'var(--radius-full)', border: '1px solid var(--border-subtle)' }}>
            {['All', 'Pending', 'Approved', 'Rejected'].map((status) => (
              <button
                key={status}
                onClick={() => setFilterType(status)}
                style={{
                  padding: '5px 12px',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '0.8rem',
                  fontWeight: filterType === status ? '700' : '500',
                  color: filterType === status ? '#ffffff' : 'var(--text-secondary)',
                  background: filterType === status ? 'var(--accent-primary)' : 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
              >
                {status}
              </button>
            ))}
          </div>

          {/* Time Segregation Dropdown / Buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Clock size={14} /> Time:
            </span>
            <select
              className="form-select"
              value={timeFilter}
              onChange={(e) => setTimeFilter(e.target.value)}
              style={{ padding: '6px 12px', fontSize: '0.82rem', borderRadius: '8px' }}
            >
              <option value="all">All Dates & History</option>
              <option value="today">Today's Appeals</option>
              <option value="yesterday">Yesterday's Appeals</option>
              <option value="week">Past 7 Days</option>
            </select>
          </div>

          {/* Sort By Dropdown */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <ArrowUpDown size={14} /> Sort:
            </span>
            <select
              className="form-select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              style={{ padding: '6px 12px', fontSize: '0.82rem', borderRadius: '8px' }}
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="urgent">Urgent Priority First</option>
            </select>
          </div>
        </div>
      </div>

      {/* Applications Table */}
      <div className="glass-panel" style={{ overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: 'var(--bg-glass-strong)', borderBottom: '1px solid var(--border-subtle)' }}>
                <th style={{ padding: '16px 20px', fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase' }}>
                  Student Details (Click Roll No for Profile)
                </th>
                <th style={{ padding: '16px 20px', fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase' }}>
                  Certificate Requested
                </th>
                <th style={{ padding: '16px 20px', fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase' }}>
                  Student ID Proof & Purpose
                </th>
                <th style={{ padding: '16px 20px', fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase' }}>
                  Fee & Transaction ID (Side)
                </th>
                <th style={{ padding: '16px 20px', fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase' }}>
                  Status
                </th>
                <th style={{ padding: '16px 20px', fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase', textAlign: 'right' }}>
                  Admin Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {Object.keys(groupedRequests).length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.92rem' }}>
                    No requests found matching your filter criteria.
                  </td>
                </tr>
              ) : (
                Object.entries(groupedRequests).map(([dateGroupHeader, groupReqs]) => (
                  <React.Fragment key={dateGroupHeader}>
                    {/* Date grouping header row (Issue 5B) */}
                    <tr style={{ background: 'rgba(99, 102, 241, 0.08)', borderBottom: '1px solid var(--border-subtle)' }}>
                      <td colSpan={6} style={{ padding: '8px 20px', fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                        <span style={{ fontWeight: '800', color: 'var(--accent-primary)' }}>── {dateGroupHeader} ──</span>
                        <span style={{ marginLeft: '12px', fontSize: '0.74rem', color: 'var(--text-muted)', fontWeight: '600' }}>
                          {groupReqs.length} request{groupReqs.length > 1 ? 's' : ''}
                        </span>
                      </td>
                    </tr>
                    {groupReqs.map((req) => {
                      const existingApproved = req.status === 'Pending' ? getExistingApprovedCert(req) : null;
                      const isPaid = req.fee && req.fee !== 'Free' || req.certificateType.includes('Transfer') || req.certificateType.includes('Migration');
                      const feeValue = req.fee || (req.certificateType.includes('Migration') ? '₹150' : req.certificateType.includes('Transfer') ? '₹100' : 'Free');
                      const receiptId = req.receiptNumber || 'REC-2026-8819';

                      return (
                        <tr 
                          key={req.id} 
                          style={{
                            borderBottom: '1px solid var(--border-subtle)',
                            transition: 'background 0.2s ease',
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-glass)'}
                          onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                        >
                          {/* REQUIREMENT 5: Student Details with Clickable Roll Number opening Profile */}
                          <td style={{ padding: '16px 20px' }}>
                            <div style={{ fontWeight: '700', color: 'var(--text-primary)', fontSize: '0.95rem' }}>
                              {req.studentName}
                            </div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                              {/* CLICKABLE ROLL NUMBER LINK */}
                              <button
                                type="button"
                                onClick={() => onOpenStudentProfile && onOpenStudentProfile(req)}
                                style={{
                                  background: 'rgba(99, 102, 241, 0.15)',
                                  border: '1px solid rgba(99, 102, 241, 0.35)',
                                  color: 'var(--accent-primary)',
                                  padding: '2px 8px',
                                  borderRadius: '6px',
                                  cursor: 'pointer',
                                  fontWeight: '700',
                                  fontSize: '0.78rem',
                                  fontFamily: 'var(--font-mono)',
                                  transition: 'all 0.2s ease',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '4px',
                                }}
                                title="Click Roll Number to inspect complete student academic dossier & documents"
                              >
                                <User size={11} />
                                {req.rollNumber}
                              </button>
                              <span>• {req.department}</span>
                            </div>
                          </td>

                          {/* Certificate Requested & Duplicate Warning */}
                          <td style={{ padding: '16px 20px' }}>
                            <div style={{ fontWeight: '600', color: 'var(--accent-primary)', fontSize: '0.92rem' }}>
                              {req.certificateType}
                            </div>
                            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                              <Calendar size={13} /> Applied: {formatDateTime(req.appliedDate, req.appliedTime)}
                            </div>

                        {/* DUPLICATE WARNING: If already issued earlier */}
                        {existingApproved && (
                          <div style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            marginTop: '6px',
                            padding: '3px 8px',
                            borderRadius: '6px',
                            background: 'rgba(239, 68, 68, 0.15)',
                            border: '1px solid rgba(239, 68, 68, 0.35)',
                            color: '#f87171',
                            fontSize: '0.72rem',
                            fontWeight: '700',
                          }}>
                            <AlertTriangle size={13} />
                            Already Issued ({existingApproved.appliedDate})
                          </div>
                        )}
                      </td>

                      {/* REQUIREMENT 2: Purpose & Attached Student ID Proof */}
                      <td style={{ padding: '16px 20px' }}>
                        <div style={{ fontSize: '0.86rem', color: 'var(--text-secondary)' }}>
                          {req.purpose}
                        </div>
                        
                        {/* Clickable Attached Document */}
                        <button
                          type="button"
                          onClick={() => setSelectedProofRequest(req)}
                          className="btn-link"
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '5px',
                            marginTop: '4px',
                            padding: '3px 8px',
                            borderRadius: '6px',
                            background: 'rgba(99, 102, 241, 0.12)',
                            border: '1px solid rgba(99, 102, 241, 0.25)',
                            color: 'var(--accent-primary)',
                            fontSize: '0.78rem',
                            fontWeight: '600',
                            cursor: 'pointer',
                          }}
                          title="Click to view attached student ID card & proof"
                        >
                          <Eye size={13} />
                          📄 {req.documentName || 'student_id_card.pdf'}
                        </button>
                      </td>

                      {/* REQUIREMENT 4: PAYMENT & FEE COLUMN ON THE SIDE WITH TRANSACTION ID */}
                      <td style={{ padding: '16px 20px' }}>
                        {isPaid ? (
                          <div>
                            <div style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '5px',
                              padding: '3px 8px',
                              borderRadius: '6px',
                              background: 'rgba(16, 185, 129, 0.15)',
                              border: '1px solid rgba(16, 185, 129, 0.35)',
                              color: 'var(--success)',
                              fontSize: '0.78rem',
                              fontWeight: '700',
                            }}>
                              <CheckCircle2 size={13} />
                              PAID {feeValue}
                            </div>
                            <div style={{ marginTop: '3px' }}>
                              <button
                                type="button"
                                onClick={() => onOpenReceipt && onOpenReceipt(req)}
                                style={{
                                  fontSize: '0.74rem',
                                  color: 'var(--accent-primary)',
                                  fontFamily: 'var(--font-mono)',
                                  fontWeight: '700',
                                  background: 'rgba(99, 102, 241, 0.12)',
                                  border: '1px solid rgba(99, 102, 241, 0.3)',
                                  borderRadius: '4px',
                                  padding: '2px 8px',
                                  cursor: 'pointer',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '4px',
                                }}
                                title="Click to view & verify official fee payment receipt"
                              >
                                ID: {receiptId}
                              </button>
                            </div>
                            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                              Mode: {req.paymentMethod || 'UPI'}
                            </div>
                          </div>
                        ) : (
                          <div style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            padding: '3px 8px',
                            borderRadius: '6px',
                            background: 'var(--bg-glass-strong)',
                            border: '1px solid var(--border-subtle)',
                            color: 'var(--text-muted)',
                            fontSize: '0.75rem',
                            fontWeight: '600',
                          }}>
                            FREE (Institutional)
                          </div>
                        )}
                      </td>

                      {/* Status */}
                      <td style={{ padding: '16px 20px' }}>
                        <span className={`badge ${
                          req.status === 'Approved' ? 'badge-approved' :
                          req.status === 'Pending' ? 'badge-pending' : 'badge-rejected'
                        }`}>
                          {req.status}
                        </span>
                      </td>

                      {/* Admin Actions */}
                      <td style={{ padding: '16px 20px', textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                          {req.status === 'Pending' && (
                            <>
                              {/* Primary Action: Review & Audit Document before approving */}
                              <button
                                onClick={() => setAuditRequest(req)}
                                className="btn btn-primary btn-sm"
                                title="Review ID proof, check and edit paper document details, and preview certificate before approving"
                                style={{
                                  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                                  borderColor: '#10b981',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '6px',
                                }}
                              >
                                <Edit3 size={14} />
                                Review & Audit
                              </button>

                              <button
                                onClick={() => setRejectModalRequest(req)}
                                className="btn btn-secondary btn-sm"
                                title="Reject Request with Reason & Refund Notice"
                                style={{ color: 'var(--danger)' }}
                              >
                                <X size={14} />
                                Reject
                              </button>
                            </>
                          )}

                          {req.status === 'Approved' && (
                            <button
                              onClick={() => onOpenCertificate(req)}
                              className="btn btn-secondary btn-sm"
                              style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                            >
                              <Eye size={14} color="var(--accent-primary)" />
                              View Certificate
                            </button>
                          )}
                        </div>
                      </td>
                      </tr>
                    );
                  })}
                </React.Fragment>
              ))
            )}
          </tbody>
          </table>
        </div>
      </div>

      {/* Attached Student ID Proof Viewer Modal */}
      <ProofModal
        isOpen={Boolean(selectedProofRequest)}
        onClose={() => setSelectedProofRequest(null)}
        request={selectedProofRequest}
      />

      {/* Document Review, Audit, and Paper Edit Modal with Live Preview */}
      <DocumentAuditModal
        isOpen={Boolean(auditRequest)}
        onClose={() => setAuditRequest(null)}
        request={auditRequest}
        onApproveWithData={(id, data) => handleApproveWithEmail(id, data)}
        onReject={(id) => {
          const target = requests.find(r => r.id === id);
          setAuditRequest(null);
          setRejectModalRequest(target || auditRequest);
        }}
        onViewProof={(r) => setSelectedProofRequest(r)}
      />

      {/* Reject Reason & Fee Refund Reminder Modal */}
      <RejectReasonModal
        isOpen={Boolean(rejectModalRequest)}
        onClose={() => setRejectModalRequest(null)}
        request={rejectModalRequest}
        onConfirmReject={handleConfirmReject}
      />

      {/* Toast Notification Alert */}
      {toastMessage && (
        <div style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          background: '#1e293b',
          border: '1.5px solid #10b981',
          color: '#f1f5f9',
          padding: '12px 20px',
          borderRadius: '12px',
          boxShadow: '0 10px 25px rgba(0, 0, 0, 0.5), 0 0 15px rgba(16, 185, 129, 0.3)',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          zIndex: 9999,
          fontSize: '0.88rem',
          fontWeight: '600',
        }}>
          <CheckCircle2 size={18} color="#34d399" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
