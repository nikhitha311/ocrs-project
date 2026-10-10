import React, { useState, useRef, useEffect } from 'react';
import { Award, ShieldCheck, UserCheck, CheckCircle2, Mail, LogOut, LogIn, Lock, ArrowLeft, User, ChevronDown, FileText } from 'lucide-react';
import ThemeToggle from './ThemeToggle';

export default function Navbar({
  activeTab,
  setActiveTab,
  currentUser,
  onOpenStudentLogin,
  onOpenAdminLogin,
  onLogout,
  backendStatus,
  onOpenEmailTest,
  onOpenProfile,
  onOpenDocuments,
}) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const userMenuRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleTabClick = (tab) => {
    if (tab === 'admin') {
      if (currentUser?.role === 'admin') {
        setActiveTab('admin');
      } else {
        onOpenAdminLogin();
      }
    } else {
      setActiveTab(tab);
    }
  };

  return (
    <header style={{
      borderBottom: '1px solid var(--border-subtle)',
      background: 'rgba(10, 15, 29, 0.88)',
      backdropFilter: 'blur(20px)',
      position: 'sticky',
      top: 0,
      zIndex: 100,
      padding: '0 24px',
    }}>
      <div style={{
        maxWidth: '1280px',
        margin: '0 auto',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: '72px',
      }}>
        {/* Brand */}
        <div
          onClick={() => {
            if (currentUser) {
              setActiveTab(currentUser.role === 'admin' ? 'admin' : 'student');
            } else {
              onLogout();
            }
          }}
          style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}
        >
          <div style={{
            width: '42px',
            height: '42px',
            borderRadius: '12px',
            background: 'var(--accent-gradient)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: 'var(--shadow-glow)',
          }}>
            <Award size={24} color="#ffffff" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '1.25rem', fontWeight: '800', fontFamily: 'var(--font-heading)', letterSpacing: '-0.02em', background: 'linear-gradient(90deg, #fff 0%, #cbd5e1 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                OCRS
              </span>
              <span style={{
                background: 'rgba(99, 102, 241, 0.2)',
                color: '#a5b4fc',
                fontSize: '0.7rem',
                fontWeight: '700',
                padding: '2px 8px',
                borderRadius: '6px',
                border: '1px solid rgba(99, 102, 241, 0.3)',
              }}>
                v1.0
              </span>
            </div>
            <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', margin: 0 }}>
              Online Certificate Request System
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(15, 23, 42, 0.7)', padding: '4px', borderRadius: 'var(--radius-full)', border: '1px solid var(--border-subtle)' }}>
          {currentUser?.role !== 'admin' && (
            <button
              onClick={() => handleTabClick('student')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 18px',
                fontSize: '0.88rem',
                fontWeight: activeTab === 'student' ? '700' : '500',
                color: activeTab === 'student' ? '#ffffff' : 'var(--text-secondary)',
                background: activeTab === 'student' ? 'var(--accent-primary)' : 'transparent',
                border: 'none',
                borderRadius: 'var(--radius-full)',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
            >
              <UserCheck size={16} />
              Student Portal
            </button>
          )}

          {currentUser?.role === 'admin' && (
            <button
              onClick={() => handleTabClick('admin')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 18px',
                fontSize: '0.88rem',
                fontWeight: activeTab === 'admin' ? '700' : '500',
                color: activeTab === 'admin' ? '#ffffff' : 'var(--text-secondary)',
                background: activeTab === 'admin' ? '#10b981' : 'transparent',
                border: 'none',
                borderRadius: 'var(--radius-full)',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
            >
              <ShieldCheck size={16} />
              Admin Portal
            </button>
          )}

          <button
            onClick={() => handleTabClick('verify')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 18px',
              fontSize: '0.88rem',
              fontWeight: activeTab === 'verify' ? '700' : '500',
              color: activeTab === 'verify' ? '#ffffff' : 'var(--text-secondary)',
              background: activeTab === 'verify' ? 'var(--accent-primary)' : 'transparent',
              border: 'none',
              borderRadius: 'var(--radius-full)',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
          >
            <CheckCircle2 size={16} />
            Public Verification
          </button>
        </nav>

        {/* Right side */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <ThemeToggle />

          <button
            onClick={onOpenEmailTest}
            className="btn btn-secondary btn-sm"
            title="Test Gmail OAuth2 Email Delivery"
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <Mail size={15} color="var(--accent-primary)" />
            <span style={{ fontSize: '0.82rem' }}>Test Email</span>
          </button>

          <div
            title={backendStatus.online ? "Backend API running on port 5000" : "Backend offline"}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '6px 12px',
              background: backendStatus.online ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
              border: `1px solid ${backendStatus.online ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
              borderRadius: 'var(--radius-full)',
              fontSize: '0.78rem',
              fontWeight: '600',
              color: backendStatus.online ? '#34d399' : '#f87171',
            }}
          >
            <span className={`pulse-dot ${backendStatus.online ? 'pulse-dot-online' : 'pulse-dot-offline'}`} />
            {backendStatus.online ? 'Online' : 'Offline'}
          </div>

          {currentUser ? (
            <div className="relative" ref={userMenuRef} style={{ position: 'relative' }}>
              <button
                type="button"
                onClick={() => setDropdownOpen((prev) => !prev)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '6px 14px 6px 8px',
                  background: currentUser.role === 'admin' ? 'rgba(16, 185, 129, 0.12)' : 'var(--bg-glass-strong)',
                  borderRadius: 'var(--radius-full)',
                  border: `1px solid ${currentUser.role === 'admin' ? 'rgba(16, 185, 129, 0.3)' : 'rgba(99, 102, 241, 0.3)'}`,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  color: 'var(--text-primary)',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = currentUser.role === 'admin' ? 'rgba(16, 185, 129, 0.6)' : 'rgba(99, 102, 241, 0.7)';
                  e.currentTarget.style.transform = 'translateY(-1px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = currentUser.role === 'admin' ? 'rgba(16, 185, 129, 0.3)' : 'rgba(99, 102, 241, 0.3)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <div style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  background: currentUser.role === 'admin'
                    ? 'linear-gradient(135deg, #10b981, #059669)'
                    : 'linear-gradient(135deg, #ec4899, #8b5cf6)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.75rem',
                  fontWeight: '700',
                  color: '#fff',
                }}>
                  {currentUser.role === 'admin' ? 'A' : (currentUser.name ? currentUser.name.slice(0, 2).toUpperCase() : 'U')}
                </div>
                <span style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--text-primary)' }}>
                  {currentUser.name}
                </span>
                <ChevronDown
                  size={14}
                  style={{
                    color: 'var(--text-muted)',
                    transition: 'transform 0.15s ease',
                    transform: dropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)'
                  }}
                />
              </button>

              {dropdownOpen && (
                <div
                  style={{
                    position: 'absolute',
                    top: 'calc(100% + 8px)',
                    right: 0,
                    width: '190px',
                    background: '#0f172a',
                    border: '1px solid rgba(148, 163, 184, 0.18)',
                    borderRadius: '12px',
                    boxShadow: '0 12px 30px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.05)',
                    padding: '6px',
                    zIndex: 200,
                    animation: 'fadeIn 150ms ease-out',
                    backdropFilter: 'blur(16px)',
                  }}
                >
                  {currentUser.role === 'admin' ? (
                    <>
                      <button
                        type="button"
                        onClick={() => {
                          setDropdownOpen(false);
                          if (onOpenProfile) onOpenProfile();
                        }}
                        style={{
                          width: '100%',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px',
                          padding: '9px 12px',
                          fontSize: '0.82rem',
                          fontWeight: '600',
                          color: '#e2e8f0',
                          background: 'none',
                          border: 'none',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          transition: 'background 0.15s ease',
                          textAlign: 'left',
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255, 255, 255, 0.06)'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = 'none'; }}
                      >
                        <User size={15} style={{ color: '#34d399' }} />
                        <span>Admin Profile</span>
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={() => {
                          setDropdownOpen(false);
                          if (onOpenProfile) onOpenProfile();
                        }}
                        style={{
                          width: '100%',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px',
                          padding: '9px 12px',
                          fontSize: '0.82rem',
                          fontWeight: '600',
                          color: '#e2e8f0',
                          background: 'none',
                          border: 'none',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          transition: 'background 0.15s ease',
                          textAlign: 'left',
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255, 255, 255, 0.06)'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = 'none'; }}
                      >
                        <User size={15} style={{ color: '#818cf8' }} />
                        <span>My Profile</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setDropdownOpen(false);
                          if (onOpenDocuments) onOpenDocuments();
                          else setActiveTab('documents');
                        }}
                        style={{
                          width: '100%',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px',
                          padding: '9px 12px',
                          fontSize: '0.82rem',
                          fontWeight: '600',
                          color: '#e2e8f0',
                          background: 'none',
                          border: 'none',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          transition: 'background 0.15s ease',
                          textAlign: 'left',
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255, 255, 255, 0.06)'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = 'none'; }}
                      >
                        <FileText size={15} style={{ color: '#38bdf8' }} />
                        <span>My Documents</span>
                      </button>
                    </>
                  )}

                  <div style={{ height: '1px', background: 'rgba(255, 255, 255, 0.08)', margin: '4px 0' }} />

                  <button
                    type="button"
                    onClick={() => {
                      setDropdownOpen(false);
                      onLogout();
                    }}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      padding: '9px 12px',
                      fontSize: '0.82rem',
                      fontWeight: '600',
                      color: '#f87171',
                      background: 'none',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      transition: 'background 0.15s ease',
                      textAlign: 'left',
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = 'none'; }}
                  >
                    <LogOut size={15} />
                    <span>Logout</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button
                onClick={onOpenStudentLogin}
                className="btn btn-primary btn-sm"
                style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <LogIn size={14} />
                Student Login
              </button>

              <button
                onClick={onOpenAdminLogin}
                className="btn btn-secondary btn-sm"
                style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <Lock size={14} color="#fbbf24" />
                Admin Login
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}