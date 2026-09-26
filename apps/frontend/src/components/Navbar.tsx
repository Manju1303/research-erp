'use client';

import React from 'react';
import { useAuth } from '../lib/auth-context';
import { useSidebar } from '../lib/sidebar-context';
import { Search, Bell, Menu, PanelLeftClose, PanelLeftOpen, LogOut } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, displayName, logout } = useAuth();
  const { isCollapsed, toggleCollapse, toggleMobile, isMobile } = useSidebar();

  return (
    <header className="navbar-header">
      {/* Left Controls: Sidebar Hide/Toggle + Search */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', flex: 1, minWidth: 0 }}>
        {/* Sidebar Hide / Toggle Button */}
        <button
          onClick={isMobile ? toggleMobile : toggleCollapse}
          aria-label={isMobile ? 'Open navigation drawer' : isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          title={isMobile ? 'Open navigation drawer' : isCollapsed ? 'Expand sidebar' : 'Hide / Collapse sidebar'}
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
            color: 'var(--text-secondary)',
            boxShadow: 'var(--shadow-xs)',
            transition: 'all 0.15s ease',
            flexShrink: 0,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = 'var(--accent-ice)';
            e.currentTarget.style.background = '#F8FAFD';
            e.currentTarget.style.color = 'var(--accent-primary)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = 'var(--border-color)';
            e.currentTarget.style.background = '#ffffff';
            e.currentTarget.style.color = 'var(--text-secondary)';
          }}
        >
          {isMobile ? (
            <Menu size={18} />
          ) : isCollapsed ? (
            <PanelLeftOpen size={18} />
          ) : (
            <PanelLeftClose size={18} />
          )}
        </button>

        {/* Global Search Bar (Responsive) */}
        <div className="navbar-search-container">
          <input
            type="text"
            placeholder="Search projects, DOIs, authors..."
            className="form-input"
            style={{
              paddingLeft: '2.4rem',
              height: 38,
              fontSize: '0.825rem',
              background: 'var(--bg-primary)',
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
      </div>

      {/* Right Controls: Notifications, User Profile & Logout Button */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexShrink: 0 }}>
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
            flexShrink: 0,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = 'var(--accent-ice)';
            e.currentTarget.style.background = '#F8FAFD';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = 'var(--border-color)';
            e.currentTarget.style.background = '#ffffff';
          }}
          title="Notifications"
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
              boxShadow: '0 0 6px rgba(98, 142, 203, 0.4)',
            }}
          />
        </button>

        {/* User Card */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <div
            style={{
              width: 36,
              height: 36,
              minWidth: 36,
              borderRadius: '50%',
              background: 'var(--gradient-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
              fontSize: '0.85rem',
              color: '#ffffff',
              boxShadow: '0 2px 6px rgba(57, 88, 134, 0.25)',
            }}
          >
            {user?.firstName?.[0] || 'A'}
          </div>
          <div className="navbar-user-text">
            <div style={{ fontSize: '0.825rem', fontWeight: 700, color: 'var(--accent-navy)', whiteSpace: 'nowrap' }}>
              {user ? `${user.firstName} ${user.lastName}` : 'Alex Vance'}
            </div>
            <div style={{ fontSize: '0.675rem', color: 'var(--accent-primary)', fontWeight: 600, whiteSpace: 'nowrap' }}>
              {displayName}
            </div>
          </div>
        </div>

        {/* Dedicated Logout Button */}
        <button
          onClick={logout}
          aria-label="Sign out"
          title="Sign Out of Session"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.4rem',
            height: 38,
            padding: '0 0.85rem',
            borderRadius: 'var(--radius-md)',
            border: '1px solid #fee2e2',
            background: '#fff1f2',
            color: '#be123c',
            fontSize: '0.775rem',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 0.15s ease',
            boxShadow: 'var(--shadow-xs)',
            flexShrink: 0,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = '#ffe4e6';
            e.currentTarget.style.borderColor = '#fca5a5';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = '#fff1f2';
            e.currentTarget.style.borderColor = '#fee2e2';
          }}
        >
          <LogOut size={15} />
          <span className="navbar-logout-text">Log Out</span>
        </button>
      </div>
    </header>
  );
};
