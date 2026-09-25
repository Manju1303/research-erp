'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth, ROLE_PRESETS } from '../lib/auth-context';
import {
  LayoutDashboard,
  FolderKanban,
  FileEdit,
  ShieldCheck,
  BookOpen,
  Send,
  Award,
  CheckSquare,
  Users,
  CreditCard,
  MessageSquare,
  BarChart3,
  Lock,
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const pathname = usePathname();
  const { role, switchRole } = useAuth();

  const navItems = [
    { label: 'Overview', href: '/', icon: LayoutDashboard, roles: ['all'] },
    { label: 'Research Projects', href: '/projects', icon: FolderKanban, roles: ['all'] },
    { label: 'Manuscript Studio', href: '/manuscripts/proj-1', icon: FileEdit, roles: ['super_admin', 'operations_manager', 'research_manager', 'research_staff', 'client'] },
    { label: 'Quality Control (QC)', href: '/qc', icon: ShieldCheck, roles: ['super_admin', 'quality_analyst', 'operations_manager', 'research_manager'] },
    { label: 'Journal Intelligence', href: '/journals', icon: BookOpen, roles: ['super_admin', 'operations_manager', 'research_manager', 'publication_executive', 'client', 'management'] },
    { label: 'Submission Tracker', href: '/submissions', icon: Send, roles: ['super_admin', 'operations_manager', 'publication_executive', 'management', 'client'] },
    { label: 'Published & DOIs', href: '/publications', icon: Award, roles: ['all'] },
    { label: 'Tasks & Workflow', href: '/tasks', icon: CheckSquare, roles: ['super_admin', 'operations_manager', 'research_manager', 'research_staff'] },
    { label: 'Client Directory', href: '/clients', icon: Users, roles: ['super_admin', 'operations_manager', 'research_manager', 'finance', 'management'] },
    { label: 'Finance & Billing', href: '/finance', icon: CreditCard, roles: ['super_admin', 'operations_manager', 'finance', 'management', 'client'] },
    { label: 'Communications Hub', href: '/communications', icon: MessageSquare, roles: ['all'] },
    { label: 'Reports & Workload', href: '/reports', icon: BarChart3, roles: ['super_admin', 'operations_manager', 'management'] },
    { label: 'Audit Trail & Security', href: '/audit', icon: Lock, roles: ['super_admin', 'operations_manager', 'management'] },
  ];

  const filteredNav = navItems.filter(
    (item) => item.roles.includes('all') || item.roles.includes(role),
  );

  return (
    <aside
      style={{
        width: 260,
        backgroundColor: '#ffffff',
        borderRight: '1px solid var(--border-color)',
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        position: 'sticky',
        top: 0,
        zIndex: 40,
        boxShadow: '1px 0 3px 0 rgba(15, 23, 42, 0.03)',
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
            width: 38,
            height: 38,
            borderRadius: 10,
            background: 'var(--gradient-primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 2px 8px rgba(79, 70, 229, 0.25)',
            color: '#ffffff',
          }}
        >
          {/* Custom Scriptara SVG Monogram */}
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2L2 7l10 5 10-5-10-5z" />
            <path d="M2 17l10 5 10-5" />
            <path d="M2 12l10 5 10-5" />
          </svg>
        </div>
        <div>
          <div style={{ fontWeight: 800, fontSize: '1.1rem', letterSpacing: '-0.02em', color: 'var(--text-primary)' }}>
            SCRIPTARA
          </div>
          <div style={{ fontSize: '0.675rem', color: 'var(--accent-primary)', fontWeight: 700, letterSpacing: '0.06em' }}>
            RESEARCH ERP
          </div>
        </div>
      </div>

      {/* Role Switcher Console */}
      <div style={{ padding: '0.85rem 1.25rem', borderBottom: '1px solid var(--border-color)', background: '#fafbfc' }}>
        <label style={{ display: 'block', fontSize: '0.675rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.35rem', letterSpacing: '0.05em' }}>
          Active Persona (RBAC)
        </label>
        <select
          value={role}
          onChange={(e) => switchRole(e.target.value)}
          className="form-input"
          style={{
            fontSize: '0.75rem',
            padding: '0.45rem 0.65rem',
            background: '#ffffff',
            border: '1px solid var(--border-color)',
            cursor: 'pointer',
            fontWeight: 500,
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
      <nav style={{ flex: 1, padding: '0.85rem 0.65rem', display: 'flex', flexDirection: 'column', gap: '0.25rem', overflowY: 'auto' }}>
        {filteredNav.map((item) => {
          const isActive = pathname === item.href;
          const IconComponent = item.icon;
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
                color: isActive ? 'var(--accent-primary)' : 'var(--text-secondary)',
                background: isActive ? 'var(--accent-primary-light)' : 'transparent',
                borderLeft: isActive ? '3px solid var(--accent-primary)' : '3px solid transparent',
                transition: 'all 0.15s ease',
              }}
            >
              <IconComponent size={17} strokeWidth={isActive ? 2.3 : 1.9} color={isActive ? 'var(--accent-primary)' : 'var(--text-muted)'} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer Info */}
      <div style={{ padding: '0.85rem 1.25rem', borderTop: '1px solid var(--border-color)', fontSize: '0.725rem', color: 'var(--text-muted)', background: '#fafbfc' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--accent-emerald)', boxShadow: '0 0 6px rgba(5, 150, 105, 0.4)' }} />
          <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>v1.0 Production Suite</span>
        </div>
        <div>All 9 Enterprise Roles Active</div>
      </div>
    </aside>
  );
};
