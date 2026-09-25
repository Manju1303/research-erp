'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth, ROLE_PRESETS } from '../lib/auth-context';
import { useSidebar } from '../lib/sidebar-context';
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
  PanelLeftClose,
  PanelLeftOpen,
  LogOut,
  X,
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const pathname = usePathname();
  const { role, switchRole, logout } = useAuth();
  const { isMobileOpen, isCollapsed, closeMobile, toggleCollapse, isMobile } = useSidebar();

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

  const sidebarStyle: React.CSSProperties = isMobile
    ? {
        position: 'fixed',
        top: 0,
        left: 0,
        bottom: 0,
        width: 280,
        height: '100vh',
        backgroundColor: '#ffffff',
        zIndex: 100,
        boxShadow: '4px 0 24px rgba(15, 23, 42, 0.15)',
        display: 'flex',
        flexDirection: 'column',
        transform: isMobileOpen ? 'translateX(0)' : 'translateX(-100%)',
        transition: 'transform 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
        overflowY: 'auto',
      }
    : {
        width: isCollapsed ? 72 : 260,
        backgroundColor: '#ffffff',
        borderRight: '1px solid var(--border-color)',
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        position: 'sticky',
        top: 0,
        zIndex: 40,
        boxShadow: '1px 0 3px 0 rgba(15, 23, 42, 0.03)',
        transition: 'width 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
        overflowX: 'hidden',
        flexShrink: 0,
      };

  return (
    <aside style={sidebarStyle}>
      {/* Brand Header */}
      <div
        style={{
          padding: isCollapsed && !isMobile ? '1.25rem 0.75rem' : '1.25rem',
          borderBottom: '1px solid var(--border-color)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: isCollapsed && !isMobile ? 'center' : 'space-between',
          gap: '0.75rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', minWidth: 0 }}>
          <div
            style={{
              width: 38,
              height: 38,
              minWidth: 38,
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
          {(!isCollapsed || isMobile) && (
            <div style={{ overflow: 'hidden' }}>
              <div style={{ fontWeight: 800, fontSize: '1.05rem', letterSpacing: '-0.02em', color: 'var(--text-primary)', whiteSpace: 'nowrap' }}>
                SCRIPTARA
              </div>
              <div style={{ fontSize: '0.65rem', color: 'var(--accent-primary)', fontWeight: 700, letterSpacing: '0.06em', whiteSpace: 'nowrap' }}>
                RESEARCH ERP
              </div>
            </div>
          )}
        </div>

        {/* Sidebar Hide/Close Toggle Button */}
        {isMobile ? (
          <button
            onClick={closeMobile}
            aria-label="Close navigation drawer"
            style={{
              background: '#f8fafc',
              border: '1px solid var(--border-color)',
              width: 34,
              height: 34,
              borderRadius: 'var(--radius-md)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: 'var(--text-muted)',
              flexShrink: 0,
            }}
          >
            <X size={18} />
          </button>
        ) : (
          !isCollapsed && (
            <button
              onClick={toggleCollapse}
              aria-label="Collapse sidebar"
              title="Collapse sidebar (hide label text)"
              style={{
                background: '#f8fafc',
                border: '1px solid var(--border-color)',
                width: 32,
                height: 32,
                borderRadius: 'var(--radius-md)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: 'var(--text-muted)',
                transition: 'all 0.15s ease',
                flexShrink: 0,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = 'var(--accent-primary)';
                e.currentTarget.style.borderColor = 'var(--accent-primary)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = 'var(--text-muted)';
                e.currentTarget.style.borderColor = 'var(--border-color)';
              }}
            >
              <PanelLeftClose size={16} />
            </button>
          )
        )}
      </div>

      {/* Role Switcher Console */}
      {(!isCollapsed || isMobile) ? (
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
      ) : (
        <div style={{ padding: '0.5rem 0', display: 'flex', justifyContent: 'center', borderBottom: '1px solid var(--border-color)' }}>
          <button
            onClick={toggleCollapse}
            title="Expand sidebar"
            style={{
              background: '#f8fafc',
              border: '1px solid var(--border-color)',
              width: 36,
              height: 36,
              borderRadius: 'var(--radius-md)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: 'var(--accent-primary)',
            }}
          >
            <PanelLeftOpen size={17} />
          </button>
        </div>
      )}

      {/* Navigation Links */}
      <nav style={{ flex: 1, padding: isCollapsed && !isMobile ? '0.75rem 0.4rem' : '0.85rem 0.65rem', display: 'flex', flexDirection: 'column', gap: '0.25rem', overflowY: 'auto' }}>
        {filteredNav.map((item) => {
          const isActive = pathname === item.href;
          const IconComponent = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => {
                if (isMobile) closeMobile();
              }}
              title={isCollapsed && !isMobile ? item.label : undefined}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: isCollapsed && !isMobile ? 'center' : 'flex-start',
                gap: '0.75rem',
                padding: isCollapsed && !isMobile ? '0.65rem 0' : '0.55rem 0.75rem',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.825rem',
                fontWeight: isActive ? 600 : 500,
                color: isActive ? 'var(--accent-primary)' : 'var(--text-secondary)',
                background: isActive ? 'var(--accent-primary-light)' : 'transparent',
                borderLeft: isCollapsed && !isMobile ? 'none' : isActive ? '3px solid var(--accent-primary)' : '3px solid transparent',
                transition: 'all 0.15s ease',
              }}
            >
              <IconComponent size={18} strokeWidth={isActive ? 2.3 : 1.9} color={isActive ? 'var(--accent-primary)' : 'var(--text-muted)'} />
              {(!isCollapsed || isMobile) && <span style={{ whiteSpace: 'nowrap' }}>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Footer Info & Permanent Logout Button */}
      <div
        style={{
          padding: isCollapsed && !isMobile ? '0.75rem 0.4rem' : '0.85rem 1.25rem',
          borderTop: '1px solid var(--border-color)',
          fontSize: '0.725rem',
          color: 'var(--text-muted)',
          background: '#fafbfc',
        }}
      >
        {(!isCollapsed || isMobile) ? (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--accent-emerald)', boxShadow: '0 0 6px rgba(5, 150, 105, 0.4)' }} />
              <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>v1.0 Production Suite</span>
            </div>
            <div style={{ fontSize: '0.7rem' }}>All 9 Enterprise Roles Active</div>

            {/* Logout Button in Sidebar */}
            <button
              onClick={() => {
                if (isMobile) closeMobile();
                logout();
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.45rem',
                width: '100%',
                marginTop: '0.75rem',
                padding: '0.55rem 0.75rem',
                borderRadius: 'var(--radius-md)',
                border: '1px solid #fee2e2',
                background: '#fff1f2',
                color: '#be123c',
                fontSize: '0.75rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#ffe4e6';
                e.currentTarget.style.borderColor = '#fca5a5';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#fff1f2';
                e.currentTarget.style.borderColor = '#fee2e2';
              }}
              title="Sign Out of Session"
            >
              <LogOut size={14} />
              <span>Log Out</span>
            </button>
          </>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
            <span
              style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--accent-emerald)', boxShadow: '0 0 6px rgba(5, 150, 105, 0.4)' }}
              title="Online / Production Suite"
            />
            <button
              onClick={logout}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 38,
                height: 38,
                borderRadius: 'var(--radius-md)',
                border: '1px solid #fee2e2',
                background: '#fff1f2',
                color: '#be123c',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
              title="Log Out"
            >
              <LogOut size={16} />
            </button>
          </div>
        )}
      </div>
    </aside>
  );
};
