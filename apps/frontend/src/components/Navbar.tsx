'use client';

import React from 'react';
import { useAuth } from '../lib/auth-context';
import { Search, Bell } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, displayName } = useAuth();

  return (
    <header
      style={{
        height: 64,
        borderBottom: '1px solid var(--border-color)',
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 2rem',
        position: 'sticky',
        top: 0,
        zIndex: 30,
        boxShadow: '0 1px 2px 0 rgba(15, 23, 42, 0.03)',
      }}
    >
      {/* Global Search Bar */}
      <div style={{ position: 'relative', width: 380 }}>
        <input
          type="text"
          placeholder="Global search by Project ID, DOI, Researcher, Journal..."
          className="form-input"
          style={{
            paddingLeft: '2.4rem',
            height: 38,
            fontSize: '0.825rem',
            background: '#f8fafc',
            border: '1px solid var(--border-color)',
          }}
        />
        <span
          style={{
            position: 'absolute',
            left: '0.85rem',
            top: '50%',
            transform: 'translateY(-50%)',
            display: 'flex',
            alignItems: 'center',
            color: 'var(--text-muted)',
            pointerEvents: 'none',
          }}
        >
          <Search size={16} />
        </span>
      </div>

      {/* Right Controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
        {/* Quick notification indicator */}
        <button
          style={{
            background: '#ffffff',
            border: '1px solid var(--border-color)',
            width: 38,
            height: 38,
            borderRadius: 'var(--radius-md)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            position: 'relative',
            color: 'var(--text-secondary)',
            boxShadow: 'var(--shadow-xs)',
            transition: 'all 0.15s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = '#cbd5e1';
            e.currentTarget.style.background = '#f8fafc';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = 'var(--border-color)';
            e.currentTarget.style.background = '#ffffff';
          }}
        >
          <Bell size={17} />
          <span
            style={{
              position: 'absolute',
              top: 8,
              right: 8,
              width: 7,
              height: 7,
              borderRadius: '50%',
              background: 'var(--accent-primary)',
              boxShadow: '0 0 6px rgba(79, 70, 229, 0.4)',
            }}
          />
        </button>

        {/* User Card */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div
            style={{
              width: 38,
              height: 38,
              borderRadius: '50%',
              background: 'var(--gradient-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
              fontSize: '0.875rem',
              color: '#ffffff',
              boxShadow: '0 2px 6px rgba(79, 70, 229, 0.2)',
            }}
          >
            {user?.firstName?.[0] || 'A'}
          </div>
          <div>
            <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>
              {user ? `${user.firstName} ${user.lastName}` : 'System User'}
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--accent-primary)', fontWeight: 600 }}>
              {displayName}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
