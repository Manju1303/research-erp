'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { Sidebar } from './Sidebar';
import { Navbar } from './Navbar';
import { useSidebar } from '../lib/sidebar-context';

export const AppShell: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const pathname = usePathname();
  const { isMobileOpen, closeMobile } = useSidebar();

  if (pathname === '/login') {
    return <main style={{ minHeight: '100vh', width: '100%', backgroundColor: 'var(--bg-primary)' }}>{children}</main>;
  }

  return (
    <div className="app-container">
      {/* Mobile Drawer Backdrop */}
      <div
        className={`sidebar-backdrop ${isMobileOpen ? 'active' : ''}`}
        onClick={closeMobile}
        aria-hidden="true"
      />

      {/* Main Sidebar */}
      <Sidebar />

      {/* Content Area with Navbar and Pages */}
      <div className="app-content-wrapper">
        <Navbar />
        <main className="app-main-content">
          {children}
        </main>
      </div>
    </div>
  );
};
