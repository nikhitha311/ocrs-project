import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import AuthLanding from './components/AuthLanding';
import StudentPortal from './components/StudentPortal';
import AdminPortal from './components/AdminPortal';
import PublicVerify from './components/PublicVerify';
import NewRequestModal from './components/NewRequestModal';
import CertificateModal from './components/CertificateModal';
import EmailTestModal from './components/EmailTestModal';
import AdminLoginModal from './components/AdminLoginModal';
import StudentLoginModal from './components/StudentLoginModal';
import ProfileModal from './components/ProfileModal';
import DocumentsModal from './components/DocumentsModal';
import HelpChatbot from './components/HelpChatbot';
import ReceiptModal from './components/ReceiptModal';
import PaymentModal from './components/PaymentModal';

const BACKEND_BASE_URL = 'http://localhost:5000';

const INITIAL_REQUESTS = [
  {
    id: '9841',
    certificateNumber: 'OCRS-2026-9841',
    certificateType: 'Bonafide Certificate',
    studentName: 'Nikhitha Mandhula',
    rollNumber: '24881A12A1',
    department: 'Information Technology (IT)',
    academicYear: '2024-2026',
    studentEmail: 'nikhithamandhula18@gmail.com',
    purpose: 'Passport Application',
    urgency: 'Normal',
    notes: 'Required for Tatkal passport verification',
    status: 'Approved',
    appliedDate: 'Sep 24, 2026',
    appliedTime: '10:30 AM',
    appliedTimestamp: 1727154000000,
    dateApproved: 'September 25, 2026',
    documentName: 'college_id_card.pdf',
    fee: 'Free',
    feePaid: false,
    paymentMethod: 'N/A (Institutional)',
    receiptNumber: 'REC-2026-9841',
  },
  {
    id: '9842',
    certificateNumber: 'OCRS-2026-9842',
    certificateType: 'Transfer Certificate (TC)',
    studentName: 'Nikhitha Mandhula',
    rollNumber: '24881A12A1',
    department: 'Information Technology (IT)',
    academicYear: '2024-2026',
    studentEmail: 'nikhithamandhula18@gmail.com',
    purpose: 'Education Loan Application',
    urgency: 'Urgent',
    notes: 'Bank loan submission deadline on Monday',
    status: 'Pending',
    appliedDate: 'Sep 26, 2026',
    appliedTime: '02:15 PM',
    appliedTimestamp: 1727339700000,
    dateApproved: null,
    documentName: 'fee_structure_receipt.pdf',
    fee: '₹100',
    feePaid: true,
    paymentMethod: 'UPI',
    paymentReference: 'UPI982348102938',
    receiptNumber: 'REC-2026-9842',
  },
  {
    id: '9843',
    certificateNumber: 'OCRS-2026-9843',
    certificateType: 'Medium of Instruction (English)',
    studentName: 'Nikhitha Mandhula',
    rollNumber: '24881A12A1',
    department: 'Information Technology (IT)',
    academicYear: '2024-2026',
    studentEmail: 'nikhithamandhula18@gmail.com',
    purpose: 'Higher Education Admissions (MS Abroad)',
    urgency: 'Normal',
    notes: 'Official MOI letter required by university',
    status: 'Approved',
    appliedDate: 'Sep 20, 2026',
    appliedTime: '11:45 AM',
    appliedTimestamp: 1726812900000,
    dateApproved: 'September 22, 2026',
    documentName: 'semester_marksheet.pdf',
    fee: 'Free',
    feePaid: false,
    paymentMethod: 'N/A (Institutional)',
    receiptNumber: 'REC-2026-9843',
  }
];

export default function App() {
  // Navigation & Authentication State
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('ocrs_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return null;
      }
    }
    // Start at the Portal Selection screen
    return null;
  });

  const [activeTab, setActiveTab] = useState(() => {
    // If user is already logged in, go to their portal; otherwise landing
    const savedUser = localStorage.getItem('ocrs_user');
    if (savedUser) {
      try {
        const u = JSON.parse(savedUser);
        return u.role === 'admin' ? 'admin' : 'student';
      } catch (e) {
        return 'landing';
      }
    }
    return 'landing';
  });

  // Requests State
  const [requests, setRequests] = useState(() => {
    const saved = localStorage.getItem('ocrs_requests');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return INITIAL_REQUESTS;
      }
    }
    return INITIAL_REQUESTS;
  });

  const [backendStatus, setBackendStatus] = useState({ online: false, checking: true });
  const [isNewRequestOpen, setIsNewRequestOpen] = useState(false);
  const [selectedCertificate, setSelectedCertificate] = useState(null);
  const [isEmailTestOpen, setIsEmailTestOpen] = useState(false);
  const [isAdminLoginOpen, setIsAdminLoginOpen] = useState(false);
  const [isStudentLoginOpen, setIsStudentLoginOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isDocumentsOpen, setIsDocumentsOpen] = useState(false);
  const [selectedProfileStudent, setSelectedProfileStudent] = useState(null);
  const [selectedReceipt, setSelectedReceipt] = useState(null);
  const [payingRequest, setPayingRequest] = useState(null);

  const handleOpenProfile = (student = null) => {
    setSelectedProfileStudent(student || currentUser);
    setIsProfileOpen(true);
  };

  // Sync to localStorage
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('ocrs_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('ocrs_user');
    }
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem('ocrs_requests', JSON.stringify(requests));
  }, [requests]);

  // Ping backend health
  const checkBackendHealth = async () => {
    try {
      const res = await fetch(`${BACKEND_BASE_URL}/api/health`);
      if (res.ok) {
        const data = await res.json();
        setBackendStatus({ online: true, checking: false, data });
      } else {
        setBackendStatus({ online: false, checking: false });
      }
    } catch (e) {
      setBackendStatus({ online: false, checking: false });
    }
  };

  useEffect(() => {
    checkBackendHealth();
    const interval = setInterval(checkBackendHealth, 12000);
    return () => clearInterval(interval);
  }, []);

  // Send email via backend endpoint
  const handleSendEmailViaBackend = async ({ to, studentName, certificateType, status, rejectionReason, refundNotice }) => {
    try {
      const response = await fetch(`${BACKEND_BASE_URL}/api/requests/send-test-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to, studentName, certificateType, status, rejectionReason, refundNotice }),
      });
      return await response.json();
    } catch (err) {
      return { success: false, error: 'Could not connect to backend server at ' + BACKEND_BASE_URL };
    }
  };

  // Login Handlers
  const handleAdminLoginSuccess = (adminUser) => {
    setCurrentUser(adminUser);
    setActiveTab('admin');
  };

  const handleStudentLoginSuccess = (studentUser) => {
    setCurrentUser(studentUser);
    setActiveTab('student');
  };

  const handleQuickStudentLogin = () => {
    const student = {
      role: 'student',
      name: 'Nikhitha Mandhula',
      rollNumber: '24881A12A1',
      email: 'nikhithamandhula18@gmail.com',
      department: 'Information Technology (IT)',
      academicYear: '2024-2026',
    };
    setCurrentUser(student);
    setActiveTab('student');
  };

  const handleQuickAdminLogin = () => {
    const admin = {
      role: 'admin',
      name: 'Dr. K. S. Ramanujam',
      email: 'admin@ocrs.edu',
      designation: 'Dean of Academic Affairs',
    };
    setCurrentUser(admin);
    setActiveTab('admin');
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setActiveTab('landing');
  };

  // Submit new request
  const handleSubmitRequest = (newReq) => {
    setRequests(prev => [newReq, ...prev]);
    if (newReq.fee && newReq.fee !== 'Free' && !newReq.feePaid) {
      setPayingRequest(newReq);
    }
  };

  const handlePaymentSuccess = (reqId, receiptNo, upiTxnId) => {
    setRequests(prev => prev.map(r => {
      if (r.id === reqId) {
        return {
          ...r,
          status: 'Pending',
          feePaid: true,
          receiptNumber: receiptNo,
          paymentReference: upiTxnId,
        };
      }
      return r;
    }));
  };

  // Approve request
  const handleApprove = (id) => {
    setRequests(prev => prev.map(req => {
      if (req.id === id) {
        return {
          ...req,
          status: 'Approved',
          dateApproved: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
        };
      }
      return req;
    }));
  };

  // Reject request with reason and refund reminder notice
  const handleReject = (id, reason = 'Document verification criteria not satisfied', refundNotice = null) => {
    setRequests(prev => prev.map(req => {
      if (req.id === id) {
        return {
          ...req,
          status: 'Rejected',
          rejectionReason: reason,
          refundNotice: refundNotice || (req.feePaid ? `Full refund of ${req.fee} initiated. Ref: RFD-${Date.now().toString().slice(-6)}` : null),
          dateRejected: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }),
        };
      }
      return req;
    }));
  };

  // If user is not logged in and not on public verify, display the Landing Choice Screen
  const showLanding = !currentUser && activeTab !== 'verify';

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* If logged in or on verify tab, show Navbar */}
      {!showLanding && (
        <Navbar
          activeTab={activeTab}
          setActiveTab={(tab) => {
            if (tab === 'landing') {
              handleLogout();
            } else {
              setActiveTab(tab);
            }
          }}
          currentUser={currentUser}
          onOpenStudentLogin={() => setIsStudentLoginOpen(true)}
          onOpenAdminLogin={() => setIsAdminLoginOpen(true)}
          onLogout={handleLogout}
          backendStatus={backendStatus}
          onOpenEmailTest={() => setIsEmailTestOpen(true)}
          onOpenProfile={() => handleOpenProfile(currentUser)}
          onOpenDocuments={() => setIsDocumentsOpen(true)}
        />
      )}

      {/* Main Content Area */}
      <main style={{ flex: 1 }}>
        {showLanding ? (
          <AuthLanding
            onLoginSuccess={(user) => {
              setCurrentUser(user);
              setActiveTab(user.role === 'admin' ? 'admin' : 'student');
            }}
            onGoToVerify={() => setActiveTab('verify')}
            backendStatus={backendStatus}
            onOpenEmailTest={() => setIsEmailTestOpen(true)}
          />
        ) : (
          <div style={{ paddingBottom: '60px' }}>
            {activeTab === 'student' && (
              <StudentPortal
                requests={requests}
                currentUser={currentUser}
                onOpenStudentLogin={() => setIsStudentLoginOpen(true)}
                onOpenNewRequest={() => setIsNewRequestOpen(true)}
                onOpenCertificate={(cert) => setSelectedCertificate(cert)}
                onOpenProfile={handleOpenProfile}
                onOpenReceipt={(req) => setSelectedReceipt(req)}
                onPayRequest={(req) => setPayingRequest(req)}
                onVerifyCertificate={(req) => setActiveTab('verify')}
              />
            )}

            {activeTab === 'admin' && (
              <AdminPortal
                requests={requests}
                currentUser={currentUser}
                onOpenAdminLogin={() => setIsAdminLoginOpen(true)}
                onApprove={handleApprove}
                onReject={handleReject}
                onOpenCertificate={(cert) => setSelectedCertificate(cert)}
                onSendEmail={handleSendEmailViaBackend}
                onOpenStudentProfile={handleOpenProfile}
                onOpenReceipt={(req) => setSelectedReceipt(req)}
              />
            )}

            {activeTab === 'verify' && (
              <PublicVerify
                requests={requests}
                onOpenCertificate={(cert) => setSelectedCertificate(cert)}
              />
            )}
          </div>
        )}
      </main>

      {/* Modals */}
      <AdminLoginModal
        isOpen={isAdminLoginOpen}
        onClose={() => setIsAdminLoginOpen(false)}
        onLoginSuccess={handleAdminLoginSuccess}
      />

      <StudentLoginModal
        isOpen={isStudentLoginOpen}
        onClose={() => setIsStudentLoginOpen(false)}
        onLoginSuccess={handleStudentLoginSuccess}
      />

      <NewRequestModal
        isOpen={isNewRequestOpen}
        currentUser={currentUser}
        onClose={() => setIsNewRequestOpen(false)}
        onSubmitRequest={handleSubmitRequest}
        onShowReceipt={(req) => setSelectedReceipt(req)}
      />

      <CertificateModal
        certificate={selectedCertificate}
        onClose={() => setSelectedCertificate(null)}
        onSendEmail={handleSendEmailViaBackend}
      />

      <EmailTestModal
        isOpen={isEmailTestOpen}
        onClose={() => setIsEmailTestOpen(false)}
        onSendEmail={handleSendEmailViaBackend}
      />

      <ProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        currentUser={currentUser}
        targetStudent={selectedProfileStudent}
        onUpdateUser={(updated) => setCurrentUser(prev => ({ ...prev, ...updated }))}
      />

      {/* Student Academic Documents & Received Certificates Modal (Issue 4) */}
      <DocumentsModal
        isOpen={isDocumentsOpen}
        onClose={() => setIsDocumentsOpen(false)}
        currentUser={currentUser}
        requests={requests}
        onOpenCertificate={(cert) => setSelectedCertificate(cert)}
        onOpenReceipt={(req) => setSelectedReceipt(req)}
        onVerifyCertificate={(req) => setActiveTab('verify')}
      />

      {/* Official Fee Payment Receipt Modal */}
      <ReceiptModal
        isOpen={Boolean(selectedReceipt)}
        onClose={() => setSelectedReceipt(null)}
        request={selectedReceipt}
      />

      {/* Real UPI Payment Modal */}
      <PaymentModal
        isOpen={Boolean(payingRequest)}
        onClose={() => setPayingRequest(null)}
        request={payingRequest}
        onPaymentSuccess={handlePaymentSuccess}
      />

      {/* 24/7 Swiggy-Style Academic Concierge & Emergency Tatkal Chatbot */}
      <HelpChatbot 
        requests={requests} 
        currentUser={currentUser} 
      />

      {/* Footer shown on portal views */}
      {!showLanding && (
        <footer style={{
          borderTop: '1px solid var(--border-subtle)',
          padding: '24px',
          textAlign: 'center',
          background: 'rgba(10, 15, 29, 0.95)',
          fontSize: '0.82rem',
          color: 'var(--text-muted)',
        }}>
          <div style={{ maxWidth: '1280px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              © 2026 Online Certificate Request System (OCRS) • Academic Affairs Department
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <span>Backend: <strong style={{ color: backendStatus.online ? '#34d399' : '#f87171' }}>{backendStatus.online ? 'Connected (Port 5000)' : 'Offline'}</strong></span>
              <span>•</span>
              <span>Gmail OAuth2: <strong style={{ color: '#818cf8' }}>Enabled</strong></span>
            </div>
          </div>
        </footer>
      )}
    </div>
  );
}
