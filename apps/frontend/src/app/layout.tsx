import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '../lib/auth-context';
import { SidebarProvider } from '../lib/sidebar-context';
import { AppShell } from '../components/AppShell';

export const metadata: Metadata = {
  title: 'Scriptara — Research Publication Management Platform',
  description: 'Enterprise-grade end-to-end research paper development, manuscript formulation, and journal publication management ERP.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <SidebarProvider>
            <AppShell>{children}</AppShell>
          </SidebarProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
