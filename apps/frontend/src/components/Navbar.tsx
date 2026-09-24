'use client';

import React from 'react';
import { useAuth } from '../lib/auth-context';

export const Navbar: React.FC = () => {
  const { user, displayName } = useAuth();

  return (
    <header
      style={{
        height: 64,
        borderBottom: '1px solid var(--border-color)',
        backgroundColor: 'rgba(10, 15, 29, 0.75)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 2rem',
        position: 'sticky',
        top: 0,
        zIndex: 30,
      }}
    >
      {/* Global Search Bar */}
      <div style={{ position: 'relative', width: 340 }}>
        <input
          type="text"
          placeholder="Global search by Project ID, DOI, Researcher, Journal..."
          className="form-input"
          style={{
            paddingLeft: '2.4rem',
            height: 38,
            fontSize: '0.8rem',
            background: 'rgba(255, 255, 255, 0.04)',
          }}
        />
        <span
          style={{
            position: 'absolute',
            left: '0.85rem',
            top: '50%',
            transform: 'translateY(-50%)',
            fontSize: '0.9rem',
            color: 'var(--text-muted)',
          }}
        >
          🔍
        </span>
      </div>

      {/* Right Controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
        {/* Quick notification indicator */}
        <button
          style={{
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid var(--border-color)',
            width: 38,
            height: 38,
            borderRadius: 'var(--radius-md)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            position: 'relative',
            color: 'var(--text-primary)',
          }}
        >
          🔔
          <span
            style={{
              position: 'absolute',
              top: 7,
              right: 7,
              width: 8,
              height: 8,
              borderRadius: '50%',
              background: 'var(--accent-cyan)',
              boxShadow: '0 0 8px var(--accent-cyan)',
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
              fontSize: '0.85rem',
              color: '#ffffff',
            }}
          >
            {user?.firstName?.[0] || 'A'}
          </div>
          <div>
            <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>
              {user ? `${user.firstName} ${user.lastName}` : 'System User'}
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--accent-cyan)', fontWeight: 500 }}>
              {displayName}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
