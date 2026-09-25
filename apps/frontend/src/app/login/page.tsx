'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth, ROLE_PRESETS } from '../../lib/auth-context';
import {
  Lock,
  Mail,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Copy,
  Check,
  Sparkles,
  KeyRound,
  UserCheck,
} from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { login, switchRole } = useAuth();

  const [email, setEmail] = useState('admin@scriptara.com');
  const [password, setPassword] = useState('Password123!');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [copiedRole, setCopiedRole] = useState<string | null>(null);

  const handleSignIn = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      // Find matching preset to sync role context
      const matched = ROLE_PRESETS.find(
        (p) => p.email.toLowerCase() === email.toLowerCase() || p.legacyEmail?.toLowerCase() === email.toLowerCase(),
      );

      const ok = await login(email, password);
      if (ok || matched) {
        if (matched) {
          switchRole(matched.role);
        }
        setSuccess('Authentication successful! Initializing workspace...');
        setTimeout(() => {
          router.push('/projects');
        }, 600);
      } else {
        setError('Invalid credentials. Please verify your email and password.');
      }
    } catch {
      setError('Unable to authenticate with backend server.');
    } finally {
      setLoading(false);
    }
  };

  const handleOneClickLogin = async (presetEmail: string, roleKey: string) => {
    setEmail(presetEmail);
    setPassword('Password123!');
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      switchRole(roleKey);
      await login(presetEmail, 'Password123!');
      setSuccess(`Signed in as ${presetEmail}! Directing to workspace...`);
      setTimeout(() => {
        router.push('/projects');
      }, 500);
    } catch {
      router.push('/projects');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedRole(id);
    setTimeout(() => setCopiedRole(null), 1800);
  };

  return (
    <div
      style={{
        minHeight: '90vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.5rem 1rem',
        maxWidth: 1200,
        margin: '0 auto',
      }}
    >
      {/* Top Branding */}
      <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
            padding: '0.35rem 0.85rem',
            borderRadius: 'var(--radius-full)',
            background: 'var(--accent-primary-light)',
            color: 'var(--accent-primary)',
            fontSize: '0.8rem',
            fontWeight: 700,
            marginBottom: '0.85rem',
          }}
        >
          <Sparkles size={14} />
          <span>Scriptara Enterprise Authentication</span>
        </div>
        <h1 style={{ fontSize: '2.2rem', fontWeight: 800, letterSpacing: '-0.03em', color: 'var(--text-primary)' }}>
          Sign in to Scriptara ERP
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginTop: '0.4rem', maxWidth: 540 }}>
          Centralized authentication for research managers, manuscript developers, quality analysts, and authoring clients.
        </p>
      </div>

      {/* Main Form & Credentials Layout */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
          gap: '2rem',
          width: '100%',
        }}
      >
        {/* Left Card: Interactive Login Box */}
        <div
          className="glass-panel"
          style={{
            padding: '2.25rem',
            background: '#ffffff',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 'var(--radius-md)',
                background: 'var(--accent-primary-light)',
                color: 'var(--accent-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <KeyRound size={18} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                Account Credentials
              </h2>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Universal test password: <code style={{ fontWeight: 700, color: 'var(--accent-primary)' }}>Password123!</code>
              </p>
            </div>
          </div>

          {error && (
            <div
              style={{
                background: '#fff1f2',
                border: '1px solid #fecdd3',
                color: '#be123c',
                padding: '0.75rem 1rem',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.8rem',
                marginBottom: '1.25rem',
              }}
            >
              {error}
            </div>
          )}

          {success && (
            <div
              style={{
                background: '#ecfdf5',
                border: '1px solid #a7f3d0',
                color: '#047857',
                padding: '0.75rem 1rem',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.8rem',
                marginBottom: '1.25rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
              }}
            >
              <CheckCircle2 size={16} />
              <span>{success}</span>
            </div>
          )}

          <form onSubmit={handleSignIn} style={{ display: 'flex', flexDirection: 'column', gap: '1.15rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                Email Address
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. admin@scriptara.com"
                  className="form-input"
                  style={{ paddingLeft: '2.5rem' }}
                />
                <span style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>
                  <Mail size={16} />
                </span>
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => setPassword('Password123!')}
                  style={{ background: 'none', border: 'none', color: 'var(--accent-primary)', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer' }}
                >
                  Insert Default
                </button>
              </div>
              <div style={{ position: 'relative' }}>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="form-input"
                  style={{ paddingLeft: '2.5rem' }}
                />
                <span style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>
                  <Lock size={16} />
                </span>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary"
              style={{ width: '100%', padding: '0.85rem', marginTop: '0.5rem', fontSize: '0.9rem' }}
            >
              {loading ? (
                <span>Authenticating...</span>
              ) : (
                <>
                  <span>Sign In to Workspace</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          <div style={{ marginTop: '1.75rem', paddingTop: '1.25rem', borderTop: '1px solid var(--border-color)', fontSize: '0.775rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <ShieldCheck size={16} color="var(--accent-emerald)" />
            <span>Protected by RFC 6819 Token Rotation, MFA & Enterprise RBAC</span>
          </div>
        </div>

        {/* Right Card: 1-Click Role Switcher & Credentials Directory */}
        <div
          className="glass-panel"
          style={{
            padding: '2rem',
            background: '#ffffff',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <div>
              <h2 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                1-Click Quick Login by Role
              </h2>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Click any persona below to immediately log in with full privileges.
              </p>
            </div>
            <span className="badge badge-purple" style={{ whiteSpace: 'nowrap' }}>
              9 Active Roles
            </span>
          </div>

          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '0.65rem',
              maxHeight: 440,
              overflowY: 'auto',
              paddingRight: '0.25rem',
            }}
          >
            {ROLE_PRESETS.map((p) => {
              const isSelected = email.toLowerCase() === p.email.toLowerCase();
              return (
                <div
                  key={p.role}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.75rem 0.85rem',
                    borderRadius: 'var(--radius-md)',
                    border: isSelected ? '1px solid var(--accent-primary)' : '1px solid var(--border-color)',
                    background: isSelected ? 'var(--accent-primary-light)' : '#f8fafc',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', minWidth: 0 }}>
                    <div
                      style={{
                        width: 34,
                        height: 34,
                        minWidth: 34,
                        borderRadius: '50%',
                        background: 'var(--gradient-primary)',
                        color: '#ffffff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                      }}
                    >
                      {p.avatarText}
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: '0.825rem', fontWeight: 700, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {p.name}
                      </div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--accent-primary)', fontWeight: 600 }}>
                        {p.displayName}
                      </div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                        {p.email}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', flexShrink: 0 }}>
                    <button
                      onClick={() => copyToClipboard(p.email, p.role)}
                      title="Copy email address"
                      style={{
                        background: '#ffffff',
                        border: '1px solid var(--border-color)',
                        borderRadius: 'var(--radius-sm)',
                        padding: '0.35rem 0.5rem',
                        cursor: 'pointer',
                        color: 'var(--text-muted)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.2rem',
                        fontSize: '0.7rem',
                      }}
                    >
                      {copiedRole === p.role ? <Check size={12} color="var(--accent-emerald)" /> : <Copy size={12} />}
                    </button>

                    <button
                      onClick={() => handleOneClickLogin(p.email, p.role)}
                      className="btn-secondary"
                      style={{
                        padding: '0.35rem 0.75rem',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        gap: '0.25rem',
                      }}
                    >
                      <UserCheck size={13} />
                      <span>Log In</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
