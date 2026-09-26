'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '../lib/auth-context';
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
  X,
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const pathname = usePathname();
  const { role } = useAuth();
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
        boxShadow: '4px 0 24px rgba(28, 46, 74, 0.15)',
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
        boxShadow: '1px 0 3px 0 rgba(28, 46, 74, 0.03)',
        transition: 'width 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
        overflowX: 'hidden',
        flexShrink: 0,
      };

  return (
    <aside style={sidebarStyle}>
      {/* Brand Header */}
      <div
        style={{
          padding: isCollapsed && !isMobile ? '1rem 0.5rem' : '1.25rem',
          borderBottom: '1px solid var(--border-color)',
          display: 'flex',
          flexDirection: isCollapsed && !isMobile ? 'column' : 'row',
          alignItems: 'center',
          justifyContent: isCollapsed && !isMobile ? 'center' : 'space-between',
          gap: '0.65rem',
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
              boxShadow: '0 2px 8px rgba(57, 88, 134, 0.25)',
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
              <div style={{ fontWeight: 800, fontSize: '1.05rem', letterSpacing: '-0.02em', color: 'var(--accent-navy)', whiteSpace: 'nowrap' }}>
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
              background: '#f8fafd',
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
          <button
            onClick={toggleCollapse}
            aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            style={{
              background: '#f8fafd',
              border: '1px solid var(--border-color)',
              width: 32,
              height: 32,
              borderRadius: 'var(--radius-md)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: 'var(--text-secondary)',
              transition: 'all 0.15s ease',
              flexShrink: 0,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = 'var(--accent-primary)';
              e.currentTarget.style.borderColor = 'var(--accent-primary)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = 'var(--text-secondary)';
              e.currentTarget.style.borderColor = 'var(--border-color)';
            }}
          >
            {isCollapsed ? <PanelLeftOpen size={16} /> : <PanelLeftClose size={16} />}
          </button>
        )}
      </div>

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
                fontWeight: isActive ? 700 : 500,
                color: isActive ? 'var(--accent-navy)' : 'var(--text-secondary)',
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

      {/* Footer System Status / Version Indicator */}
      {(!isCollapsed || isMobile) ? (
        <div
          style={{
            padding: '0.85rem 1rem',
            borderTop: '1px solid var(--border-color)',
            background: '#f8fafd',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '0.725rem',
            color: 'var(--text-muted)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
            <span
              style={{
                width: 7,
                height: 7,
                borderRadius: '50%',
                background: 'var(--accent-emerald)',
                boxShadow: '0 0 6px rgba(16, 185, 129, 0.4)',
                display: 'inline-block',
              }}
            />
            <span style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>Scriptara Cloud</span>
          </div>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.675rem', fontWeight: 600, color: 'var(--accent-primary)' }}>v1.0.4</span>
        </div>
      ) : (
        <div
          style={{
            padding: '0.85rem 0',
            borderTop: '1px solid var(--border-color)',
            background: '#f8fafd',
            display: 'flex',
            justifyContent: 'center',
          }}
          title="Scriptara Cloud (Active v1.0.4)"
        >
          <span
            style={{
              width: 7,
              height: 7,
              borderRadius: '50%',
              background: 'var(--accent-emerald)',
              boxShadow: '0 0 6px rgba(16, 185, 129, 0.4)',
              display: 'inline-block',
            }}
          />
        </div>
      )}
    </aside>
  );
};
