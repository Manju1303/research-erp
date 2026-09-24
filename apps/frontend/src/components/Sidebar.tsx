'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth, ROLE_PRESETS } from '../lib/auth-context';

export const Sidebar: React.FC = () => {
  const pathname = usePathname();
  const { role, switchRole } = useAuth();

  const navItems = [
    { label: 'Overview', href: '/', icon: '📊', roles: ['all'] },
    { label: 'Research Projects', href: '/projects', icon: '📁', roles: ['all'] },
    { label: 'Manuscript Studio', href: '/manuscripts/proj-1', icon: '📝', roles: ['super_admin', 'operations_manager', 'research_manager', 'research_staff', 'client'] },
    { label: 'Quality Control (QC)', href: '/qc', icon: '🛡️', roles: ['super_admin', 'quality_analyst', 'operations_manager', 'research_manager'] },
    { label: 'Journal Intelligence', href: '/journals', icon: '📖', roles: ['super_admin', 'operations_manager', 'research_manager', 'publication_executive', 'client', 'management'] },
    { label: 'Submission Tracker', href: '/submissions', icon: '📬', roles: ['super_admin', 'operations_manager', 'publication_executive', 'management', 'client'] },
    { label: 'Published & DOIs', href: '/publications', icon: '🏆', roles: ['all'] },
    { label: 'Tasks & Workflow', href: '/tasks', icon: '✅', roles: ['super_admin', 'operations_manager', 'research_manager', 'research_staff'] },
    { label: 'Client Directory', href: '/clients', icon: '👥', roles: ['super_admin', 'operations_manager', 'research_manager', 'finance', 'management'] },
    { label: 'Finance & Billing', href: '/finance', icon: '💳', roles: ['super_admin', 'operations_manager', 'finance', 'management', 'client'] },
    { label: 'Communications Hub', href: '/communications', icon: '💬', roles: ['all'] },
    { label: 'Reports & Workload', href: '/reports', icon: '📈', roles: ['super_admin', 'operations_manager', 'management'] },
    { label: 'Audit Trail & Security', href: '/audit', icon: '🔒', roles: ['super_admin', 'operations_manager', 'management'] },
  ];

  const filteredNav = navItems.filter(
    (item) => item.roles.includes('all') || item.roles.includes(role),
  );

  return (
    <aside
      style={{
        width: 260,
        backgroundColor: 'rgba(10, 15, 29, 0.95)',
        borderRight: '1px solid var(--border-color)',
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        position: 'sticky',
        top: 0,
        zIndex: 40,
      }}
    >
      {/* Brand Header */}
      <div
        style={{
          padding: '1.25rem 1.25rem',
          borderBottom: '1px solid var(--border-color)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
        }}
      >
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: 10,
            background: 'var(--gradient-primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.15rem',
            boxShadow: '0 0 15px rgba(6, 182, 212, 0.4)',
          }}
        >
          🔬
        </div>
        <div>
          <div style={{ fontWeight: 800, fontSize: '1.05rem', letterSpacing: '-0.02em', color: '#ffffff' }}>
            INZOVATE
          </div>
          <div style={{ fontSize: '0.675rem', color: 'var(--accent-cyan)', fontWeight: 600, letterSpacing: '0.05em' }}>
            RESEARCH ERP
          </div>
        </div>
      </div>

      {/* Role Switcher Demo Console */}
      <div style={{ padding: '0.85rem 1.25rem', borderBottom: '1px solid var(--border-color)' }}>
        <label style={{ display: 'block', fontSize: '0.675rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.35rem', letterSpacing: '0.05em' }}>
          Active Persona (RBAC)
        </label>
        <select
          value={role}
          onChange={(e) => switchRole(e.target.value)}
          className="form-input"
          style={{
            fontSize: '0.75rem',
            padding: '0.4rem 0.6rem',
            background: 'rgba(16, 26, 48, 0.9)',
            border: '1px solid rgba(59, 130, 246, 0.3)',
            cursor: 'pointer',
          }}
        >
          {ROLE_PRESETS.map((p) => (
            <option key={p.role} value={p.role}>
              {p.displayName}
            </option>
          ))}
        </select>
      </div>

      {/* Navigation Links */}
      <nav style={{ flex: 1, padding: '0.85rem 0.65rem', display: 'flex', flexDirection: 'column', gap: '0.2rem', overflowY: 'auto' }}>
        {filteredNav.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.55rem 0.75rem',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.825rem',
                fontWeight: isActive ? 600 : 500,
                color: isActive ? '#ffffff' : 'var(--text-secondary)',
                background: isActive ? 'rgba(59, 130, 246, 0.15)' : 'transparent',
                border: isActive ? '1px solid rgba(59, 130, 246, 0.3)' : '1px solid transparent',
                transition: 'all 0.2s ease',
              }}
            >
              <span style={{ fontSize: '1.05rem' }}>{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer Info */}
      <div style={{ padding: '0.85rem 1.25rem', borderTop: '1px solid var(--border-color)', fontSize: '0.725rem', color: 'var(--text-muted)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--accent-emerald)', boxShadow: '0 0 8px var(--accent-emerald)' }} />
          <span style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>v1.0.0 Production Suite</span>
        </div>
        <div>All 9 Roles Active</div>
      </div>
    </aside>
  );
};
