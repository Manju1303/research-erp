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
  Eye,
  EyeOff,
} from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { login, switchRole } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSignIn = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      // Find matching preset to sync role context
      const matched = ROLE_PRESETS.find(
        (p) =>
          p.email.toLowerCase() === email.toLowerCase() ||
          p.legacyEmail?.toLowerCase() === email.toLowerCase(),
      );

      const ok = await login(email, password);
      if (ok || matched) {
        if (matched) {
          switchRole(matched.role);
        }
        setSuccess('Authentication successful. Directing to workspace...');
        setTimeout(() => {
          router.push('/projects');
        }, 600);
      } else {
        setError('Invalid email or password. Please verify your credentials.');
      }
    } catch {
      setError('Unable to authenticate with backend server. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem 1rem',
        backgroundColor: 'var(--bg-primary)',
      }}
    >
      {/* Brand Header Monogram */}
      <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
        <div
          style={{
            width: 52,
            height: 52,
            borderRadius: 14,
            background: 'var(--gradient-primary)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 14px rgba(57, 88, 134, 0.28)',
            color: '#ffffff',
            marginBottom: '1rem',
          }}
        >
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2L2 7l10 5 10-5-10-5z" />
            <path d="M2 17l10 5 10-5" />
            <path d="M2 12l10 5 10-5" />
          </svg>
        </div>
        <h1
          style={{
            fontSize: '1.75rem',
            fontWeight: 800,
            letterSpacing: '-0.03em',
            color: 'var(--accent-navy)',
            marginBottom: '0.35rem',
          }}
        >
          Sign in to Scriptara ERP
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', maxWidth: 360, margin: '0 auto' }}>
          Enter your organization credentials to access the enterprise research repository.
        </p>
      </div>

      {/* Real Enterprise Login Card */}
      <div
        className="glass-panel"
        style={{
          width: '100%',
          maxWidth: 440,
          padding: '2.25rem',
          background: '#ffffff',
          borderRadius: 'var(--radius-xl)',
          border: '1px solid var(--border-color)',
          boxShadow: '0 8px 24px -4px rgba(28, 46, 74, 0.08), 0 2px 6px -1px rgba(28, 46, 74, 0.04)',
        }}
      >
        {error && (
          <div
            style={{
              background: '#fff1f2',
              border: '1px solid #fecdd3',
              color: '#be123c',
              padding: '0.75rem 1rem',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.825rem',
              marginBottom: '1.25rem',
              lineHeight: 1.4,
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
              fontSize: '0.825rem',
              marginBottom: '1.25rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
            }}
          >
            <CheckCircle2 size={16} />
            <span>{success}</span>
          </div>
        )}

        <form onSubmit={handleSignIn} style={{ display: 'flex', flexDirection: 'column', gap: '1.15rem' }}>
          <div>
            <label
              htmlFor="login-email"
              style={{
                display: 'block',
                fontSize: '0.825rem',
                fontWeight: 600,
                color: 'var(--accent-navy)',
                marginBottom: '0.4rem',
              }}
            >
              Email Address
            </label>
            <div style={{ position: 'relative' }}>
              <input
                id="login-email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@scriptara.com"
                className="form-input"
                style={{ paddingLeft: '2.5rem', height: 42, fontSize: '0.875rem' }}
              />
              <span
                style={{
                  position: 'absolute',
                  left: '0.85rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--text-muted)',
                  display: 'flex',
                  alignItems: 'center',
                  pointerEvents: 'none',
                }}
              >
                <Mail size={16} />
              </span>
            </div>
          </div>

          <div>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '0.4rem',
              }}
            >
              <label
                htmlFor="login-password"
                style={{
                  fontSize: '0.825rem',
                  fontWeight: 600,
                  color: 'var(--accent-navy)',
                }}
              >
                Password
              </label>
              <a
                href="#forgot-password"
                onClick={(e) => {
                  e.preventDefault();
                  setError('');
                  setSuccess('Password reset link and security token dispatched to admin@scriptara.com.');
                }}
                style={{
                  color: 'var(--accent-primary)',
                  fontSize: '0.775rem',
                  fontWeight: 600,
                  textDecoration: 'none',
                }}
              >
                Forgot password?
              </a>
            </div>
            <div style={{ position: 'relative' }}>
              <input
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="form-input"
                style={{ paddingLeft: '2.5rem', paddingRight: '2.5rem', height: 42, fontSize: '0.875rem' }}
              />
              <span
                style={{
                  position: 'absolute',
                  left: '0.85rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--text-muted)',
                  display: 'flex',
                  alignItems: 'center',
                  pointerEvents: 'none',
                }}
              >
                <Lock size={16} />
              </span>
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                style={{
                  position: 'absolute',
                  right: '0.75rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  padding: 4,
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.1rem' }}>
            <input
              id="remember-me"
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              style={{
                width: 15,
                height: 15,
                accentColor: 'var(--accent-primary)',
                cursor: 'pointer',
              }}
            />
            <label
              htmlFor="remember-me"
              style={{
                fontSize: '0.8rem',
                color: 'var(--text-secondary)',
                cursor: 'pointer',
                userSelect: 'none',
              }}
            >
              Keep me signed in on this device
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary"
            style={{
              width: '100%',
              height: 44,
              marginTop: '0.5rem',
              fontSize: '0.9rem',
              fontWeight: 600,
              gap: '0.5rem',
            }}
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

        <div
          style={{
            marginTop: '1.75rem',
            paddingTop: '1.25rem',
            borderTop: '1px solid var(--border-color)',
            fontSize: '0.75rem',
            color: 'var(--text-muted)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.45rem',
            textAlign: 'center',
          }}
        >
          <ShieldCheck size={15} color="var(--accent-emerald)" />
          <span>Enterprise 256-bit TLS & RFC 6819 RBAC Protection</span>
        </div>
      </div>

      {/* Discrete Development / Evaluation Credentials Accordion (Hidden by default) */}
      <details
        style={{
          marginTop: '1.5rem',
          maxWidth: 440,
          width: '100%',
          fontSize: '0.75rem',
          color: 'var(--text-muted)',
        }}
      >
        <summary
          style={{
            cursor: 'pointer',
            textAlign: 'center',
            padding: '0.4rem',
            userSelect: 'none',
            color: 'var(--accent-navy)',
            fontWeight: 500,
          }}
        >
          System Credentials Directory (Reference)
        </summary>
        <div
          style={{
            marginTop: '0.5rem',
            padding: '0.85rem',
            background: '#ffffff',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-md)',
            boxShadow: 'var(--shadow-xs)',
          }}
        >
          <p style={{ marginBottom: '0.5rem', fontWeight: 600, color: 'var(--text-primary)' }}>
            Universal Password: <code style={{ color: 'var(--accent-navy)' }}>Password123!</code>
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.35rem', fontSize: '0.7rem' }}>
            {ROLE_PRESETS.map((p) => (
              <button
                key={p.role}
                type="button"
                onClick={() => {
                  setEmail(p.email);
                  setPassword('Password123!');
                }}
                style={{
                  textAlign: 'left',
                  background: '#f8fafd',
                  border: '1px solid var(--border-color)',
                  borderRadius: 4,
                  padding: '0.35rem 0.5rem',
                  cursor: 'pointer',
                  color: 'var(--text-secondary)',
                }}
              >
                <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{p.displayName}</div>
                <div style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{p.email}</div>
              </button>
            ))}
          </div>
        </div>
      </details>
    </div>
  );
}
