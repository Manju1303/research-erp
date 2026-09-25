import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '../lib/auth-context';
import { Sidebar } from '../components/Sidebar';
import { Navbar } from '../components/Navbar';

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
          <div style={{ display: 'flex', minHeight: '100vh', width: '100%', backgroundColor: 'var(--bg-primary)' }}>
            <Sidebar />
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
              <Navbar />
              <main style={{ flex: 1, padding: '2rem', overflowY: 'auto' }}>
                {children}
              </main>
            </div>
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
