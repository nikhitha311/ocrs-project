import React, { useState, useEffect } from 'react';
import { Sun, Moon } from 'lucide-react';

export default function ThemeToggle() {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('ocrs_theme') || 'dark';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('ocrs_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
  };

  const isLight = theme === 'light';

  return (
    <button
      onClick={toggleTheme}
      type="button"
      id="manual-theme-toggle"
      title={isLight ? "Switch to Dark Theme" : "Switch to Light Theme"}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '36px',
        height: '36px',
        borderRadius: '50%',
        border: isLight ? '1px solid #cbd5e1' : '1px solid #334155',
        background: isLight ? '#f1f5f9' : '#1e293b',
        color: isLight ? '#0f172a' : '#f8fafc',
        cursor: 'pointer',
        padding: 0,
        transition: 'all 0.2s ease',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'scale(1.08)';
        e.currentTarget.style.borderColor = 'var(--accent-primary)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'scale(1)';
        e.currentTarget.style.borderColor = isLight ? '#cbd5e1' : '#334155';
      }}
    >
      {isLight ? (
        <Moon size={18} color="#0f172a" />
      ) : (
        <Sun size={18} color="#fbbf24" />
      )}
    </button>
  );
}
