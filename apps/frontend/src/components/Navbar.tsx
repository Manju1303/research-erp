'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../lib/auth-context';
import { useSidebar } from '../lib/sidebar-context';
import { Search, Bell, Menu, LogOut, X, CheckCheck, FileText, ShieldCheck, CreditCard } from 'lucide-react';

interface NotificationItem {
  id: string;
  title: string;
  desc: string;
  time: string;
  href: string;
  unread: boolean;
  type: 'project' | 'qc' | 'finance';
}

export const Navbar: React.FC = () => {
  const { user, displayName, logout } = useAuth();
  const { toggleMobile, isMobile } = useSidebar();
  const router = useRouter();

  const [searchQuery, setSearchQuery] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  const [notifications, setNotifications] = useState<NotificationItem[]>([
    {
      id: 'n-1',
      title: 'Similarity Screening Passed (3.8%)',
      desc: 'Project SCR-2026-001 (Distributed Computing) cleared 10-point checklist.',
      time: '12m ago',
      href: '/qc',
      unread: true,
      type: 'qc',
    },
    {
      id: 'n-2',
      title: 'Manuscript Draft V2 Ready for Review',
      desc: 'Stanford University commissioned paper awaiting author approval sign-off.',
      time: '45m ago',
      href: '/manuscripts/proj-1',
      unread: true,
      type: 'project',
    },
    {
      id: 'n-3',
      title: 'Invoice Disbursed: INV-2026-004',
      desc: 'Milestone disbursement of $4,500 USD registered by accounts team.',
      time: '2h ago',
      href: '/finance',
      unread: true,
      type: 'finance',
    },
  ]);

  const unreadCount = notifications.filter((n) => n.unread).length;

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/projects?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
  };

  const markOneRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, unread: false } : n)));
  };

  // Close notifications on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    }
    if (showNotifications) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showNotifications]);

  return (
    <header className="navbar-header">
      {/* Left Controls: Mobile Drawer Trigger + Search */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', flex: 1, minWidth: 0 }}>
        {/* Mobile Navigation Drawer Trigger (Mobile Only - Desktop toggle is in Sidebar header) */}
        {isMobile && (
          <button
            onClick={toggleMobile}
            aria-label="Open navigation drawer"
            title="Open navigation drawer"
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
            <Menu size={18} />
          </button>
        )}

        {/* Global Search Bar (Responsive) */}
        <form onSubmit={handleSearchSubmit} className="navbar-search-container" style={{ position: 'relative' }}>
          <input
            type="text"
            placeholder="Search projects, DOIs, authors... (Press Enter)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="form-input"
            style={{
              paddingLeft: '2.4rem',
              paddingRight: searchQuery ? '2rem' : '1rem',
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
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              style={{
                position: 'absolute',
                right: '0.65rem',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                padding: 2,
              }}
              title="Clear search"
            >
              <X size={14} />
            </button>
          )}
        </form>
      </div>

      {/* Right Controls: Notifications, User Profile & Logout Button */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexShrink: 0 }}>
        {/* Quick notification indicator & Popover */}
        <div ref={notifRef} style={{ position: 'relative' }}>
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            style={{
              background: showNotifications ? '#F8FAFD' : '#ffffff',
              borderColor: showNotifications ? 'var(--accent-ice)' : 'var(--border-color)',
              border: '1px solid',
              width: 38,
              height: 38,
              borderRadius: 'var(--radius-md)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              position: 'relative',
              color: showNotifications ? 'var(--accent-primary)' : 'var(--text-secondary)',
              boxShadow: 'var(--shadow-xs)',
              transition: 'all 0.15s ease',
              flexShrink: 0,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'var(--accent-ice)';
              e.currentTarget.style.background = '#F8FAFD';
            }}
            onMouseLeave={(e) => {
              if (!showNotifications) {
                e.currentTarget.style.borderColor = 'var(--border-color)';
                e.currentTarget.style.background = '#ffffff';
              }
            }}
            title={unreadCount > 0 ? `${unreadCount} unread notifications` : 'Notifications'}
          >
            <Bell size={17} />
            {unreadCount > 0 && (
              <span
                style={{
                  position: 'absolute',
                  top: 5,
                  right: 5,
                  minWidth: 16,
                  height: 16,
                  borderRadius: 8,
                  background: 'var(--accent-primary)',
                  boxShadow: '0 0 6px rgba(98, 142, 203, 0.4)',
                  color: '#ffffff',
                  fontSize: '0.65rem',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '0 2px',
                }}
              >
                {unreadCount}
              </span>
            )}
          </button>

          {/* Notifications Dropdown Panel */}
          {showNotifications && (
            <div
              className="glass-panel animate-fade-in"
              style={{
                position: 'absolute',
                top: 'calc(100% + 0.5rem)',
                right: 0,
                width: 340,
                maxHeight: 420,
                overflowY: 'auto',
                background: '#ffffff',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-lg)',
                boxShadow: '0 12px 28px -4px rgba(28, 46, 74, 0.12), 0 4px 8px -2px rgba(28, 46, 74, 0.04)',
                zIndex: 100,
                padding: '1rem',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', paddingBottom: '0.5rem', borderBottom: '1px solid var(--border-color)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <span style={{ fontWeight: 800, fontSize: '0.875rem', color: 'var(--accent-navy)' }}>
                    System Alerts
                  </span>
                  {unreadCount > 0 && (
                    <span className="badge badge-blue" style={{ fontSize: '0.65rem', padding: '0.1rem 0.4rem' }}>
                      {unreadCount} new
                    </span>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--accent-primary)',
                      fontSize: '0.725rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.2rem',
                    }}
                  >
                    <CheckCheck size={13} />
                    <span>Mark all read</span>
                  </button>
                )}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {notifications.map((item) => (
                  <Link
                    key={item.id}
                    href={item.href}
                    onClick={() => {
                      markOneRead(item.id);
                      setShowNotifications(false);
                    }}
                    style={{
                      display: 'block',
                      padding: '0.65rem',
                      borderRadius: 'var(--radius-md)',
                      background: item.unread ? 'var(--bg-primary)' : '#ffffff',
                      border: item.unread ? '1px solid var(--border-color)' : '1px solid transparent',
                      textDecoration: 'none',
                      transition: 'background 0.15s ease',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = '#F0F3FA';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = item.unread ? 'var(--bg-primary)' : '#ffffff';
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                      <div
                        style={{
                          width: 26,
                          height: 26,
                          minWidth: 26,
                          borderRadius: '50%',
                          background:
                            item.type === 'qc'
                              ? '#ecfdf5'
                              : item.type === 'finance'
                              ? '#faf5ff'
                              : 'var(--accent-primary-light)',
                          color:
                            item.type === 'qc'
                              ? 'var(--accent-emerald)'
                              : item.type === 'finance'
                              ? 'var(--accent-navy)'
                              : 'var(--accent-primary)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          marginTop: 2,
                        }}
                      >
                        {item.type === 'qc' ? <ShieldCheck size={14} /> : item.type === 'finance' ? <CreditCard size={14} /> : <FileText size={14} />}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: '0.8rem', fontWeight: item.unread ? 700 : 600, color: 'var(--accent-navy)', marginBottom: '0.15rem' }}>
                          {item.title}
                        </div>
                        <div style={{ fontSize: '0.725rem', color: 'var(--text-secondary)', lineHeight: 1.3, marginBottom: '0.25rem' }}>
                          {item.desc}
                        </div>
                        <div style={{ fontSize: '0.675rem', color: 'var(--text-muted)' }}>
                          {item.time}
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>

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
