'use client';

import React, { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import { Search, UserPlus, ArrowRight, Building2, Mail, Globe, Award } from 'lucide-react';

export default function ClientsPage() {
  const [clients, setClients] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchClients() {
      try {
        const res: any = await api.request('/clients');
        setClients(res?.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchClients();
  }, []);

  const filtered = clients.filter((c) => {
    if (!search) return true;
    const term = search.toLowerCase();
    return (
      c.organization?.toLowerCase().includes(term) ||
      c.fieldOfStudy?.toLowerCase().includes(term) ||
      c.user?.firstName?.toLowerCase().includes(term) ||
      c.user?.lastName?.toLowerCase().includes(term) ||
      c.user?.email?.toLowerCase().includes(term)
    );
  });

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      {/* Top Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.65rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
            Institutional Researchers & Authors Directory
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: '0.2rem' }}>
            Manage client profiles, verified ORCID credentials, university affiliations, and publication portfolios.
          </p>
        </div>

        <button className="btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
          <UserPlus size={15} />
          <span>Register Researcher Profile</span>
        </button>
      </div>

      {/* Search Input */}
      <div className="glass-panel" style={{ padding: '1.25rem' }}>
        <div style={{ position: 'relative', width: '100%', maxWidth: 450 }}>
          <input
            type="text"
            placeholder="Search by Author Name, Institution, Field, or Email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="form-input"
            style={{ paddingLeft: '2.4rem' }}
          />
          <span style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', display: 'flex', alignItems: 'center' }}>
            <Search size={16} />
          </span>
        </div>
      </div>

      {/* Researchers Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem' }}>
        {filtered.map((c) => (
          <div
            key={c.id}
            className="glass-panel"
            style={{
              padding: '1.5rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem',
              position: 'relative',
              overflow: 'hidden',
              background: '#ffffff',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: '50%',
                  background: 'var(--gradient-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 800,
                  fontSize: '1.1rem',
                  color: '#ffffff',
                  boxShadow: '0 2px 8px rgba(79, 70, 229, 0.25)',
                }}
              >
                {c.user?.firstName?.[0] || 'R'}
              </div>
              <div>
                <div style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  {c.user?.firstName} {c.user?.lastName}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--accent-primary)', fontWeight: 600 }}>
                  {c.designation || 'Principal Researcher'}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem', fontSize: '0.825rem', color: 'var(--text-secondary)' }}>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Institution: </span>
                <strong style={{ color: 'var(--text-primary)' }}>{c.organization}</strong>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Research Domain: </span>
                <span>{c.fieldOfStudy}</span>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>ORCID ID: </span>
                <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent-emerald)', fontWeight: 600 }}>
                  {c.orcidId || '0000-0002-1825-0097'}
                </span>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Country: </span>
                <span>{c.country || 'Global'}</span>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Email: </span>
                <span style={{ color: 'var(--accent-primary)' }}>{c.user?.email}</span>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '0.75rem', borderTop: '1px solid var(--border-color)', marginTop: 'auto' }}>
              <span className="badge badge-purple">
                {c._count?.projects || 1} Research Papers
              </span>
              <button className="btn-secondary" style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                <span>View Portfolio</span>
                <ArrowRight size={13} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
