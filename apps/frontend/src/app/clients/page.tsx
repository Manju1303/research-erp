'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { api } from '../../lib/api';
import { Search, UserPlus, ArrowRight, X, Check } from 'lucide-react';
import { useAuth } from '../../lib/auth-context';

export default function ClientsPage() {
  const { role } = useAuth();
  const [clients, setClients] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [selectedClient, setSelectedClient] = useState<any | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // New Client Profile Form
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [organization, setOrganization] = useState('');
  const [fieldOfStudy, setFieldOfStudy] = useState('Bioinformatics');
  const [designation, setDesignation] = useState('Associate Professor');
  const [orcidId, setOrcidId] = useState('0000-0002-8419-5512');
  const [country, setCountry] = useState('United States');

  useEffect(() => {
    async function fetchClients() {
      try {
        const res: any = await api.request('/clients');
        setClients(Array.isArray(res) ? res : (Array.isArray(res?.data) ? res.data : []));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchClients();
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleRegisterClient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName || !lastName || !organization) return;

    const newClient = {
      id: `c-${Date.now()}`,
      organization,
      fieldOfStudy,
      designation,
      orcidId,
      country,
      user: {
        firstName,
        lastName,
        email: email || `${firstName.toLowerCase()}.${lastName.toLowerCase()}@${organization.toLowerCase().replace(/[^a-z]/g, '')}.edu`,
      },
      _count: { projects: 1 },
    };

    setClients([newClient, ...clients]);
    setShowRegisterModal(false);
    showToast(`Researcher profile for Dr. ${firstName} ${lastName} registered successfully!`);
    setFirstName('');
    setLastName('');
    setEmail('');
    setOrganization('');
  };

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
      {/* Toast Notification */}
      {toastMessage && (
        <div
          style={{
            position: 'fixed',
            bottom: '2rem',
            right: '2rem',
            background: 'var(--accent-navy)',
            color: '#ffffff',
            padding: '0.85rem 1.4rem',
            borderRadius: 'var(--radius-md)',
            boxShadow: 'var(--shadow-lg)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.6rem',
            zIndex: 9999,
            fontSize: '0.85rem',
            fontWeight: 600,
          }}
        >
          <Check size={16} color="var(--accent-sky)" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.65rem', fontWeight: 800, color: 'var(--accent-navy)', letterSpacing: '-0.02em' }}>
            Institutional Researchers & Authors Directory
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
            Manage client profiles, verified ORCID credentials, university affiliations, and publication portfolios.
          </p>
        </div>

        {role !== 'client' && (
          <button
            onClick={() => setShowRegisterModal(true)}
            className="btn-primary"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
          >
            <UserPlus size={15} />
            <span>Register Researcher Profile</span>
          </button>
        )}
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
      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>Loading authors & researchers...</div>
      ) : (
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
                  background: 'var(--accent-navy)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 800,
                  fontSize: '1.1rem',
                  color: '#ffffff',
                }}
              >
                {c.user?.firstName?.[0] || 'R'}
              </div>
              <div>
                <div style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--accent-navy)' }}>
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
                <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent-navy)', fontWeight: 600 }}>
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
              <span className="badge badge-blue">
                {c._count?.projects || 1} Research Papers
              </span>
              <button
                onClick={() => setSelectedClient(c)}
                className="btn-secondary"
                style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}
              >
                <span>View Portfolio</span>
                <ArrowRight size={13} />
              </button>
            </div>
          </div>
        ))}
      </div>
      )}

      {/* Register Researcher Profile Modal */}
      {showRegisterModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.45)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 999,
            padding: '1.5rem',
          }}
        >
          <div
            className="glass-panel animate-fade-in"
            style={{
              width: '100%',
              maxWidth: 580,
              background: '#ffffff',
              padding: '2rem',
              borderRadius: 'var(--radius-lg)',
              boxShadow: 'var(--shadow-lg)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--accent-navy)' }}>
                  Register Researcher Profile
                </h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Onboard academic investigator, institutional affiliation, and ORCID profile.
                </p>
              </div>
              <button
                onClick={() => setShowRegisterModal(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleRegisterClient} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>
                    First Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Elena"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="form-input"
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>
                    Last Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Rostova"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="form-input"
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>
                    Academic Institution *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. University of Cambridge"
                    value={organization}
                    onChange={(e) => setOrganization(e.target.value)}
                    className="form-input"
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>
                    Official Email
                  </label>
                  <input
                    type="email"
                    placeholder="e.g. elena@cam.ac.uk"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="form-input"
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>
                    Field of Study / Domain
                  </label>
                  <input
                    type="text"
                    value={fieldOfStudy}
                    onChange={(e) => setFieldOfStudy(e.target.value)}
                    className="form-input"
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>
                    Designation
                  </label>
                  <input
                    type="text"
                    value={designation}
                    onChange={(e) => setDesignation(e.target.value)}
                    className="form-input"
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>
                    ORCID iD
                  </label>
                  <input
                    type="text"
                    value={orcidId}
                    onChange={(e) => setOrcidId(e.target.value)}
                    className="form-input"
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>
                    Country
                  </label>
                  <input
                    type="text"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    className="form-input"
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.75rem' }}>
                <button
                  type="button"
                  onClick={() => setShowRegisterModal(false)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Save Researcher Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Portfolio Modal */}
      {selectedClient && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.5)',
            backdropFilter: 'blur(5px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 999,
            padding: '1.5rem',
          }}
        >
          <div
            className="glass-panel animate-fade-in"
            style={{
              width: '100%',
              maxWidth: 640,
              background: '#ffffff',
              padding: '2rem',
              borderRadius: 'var(--radius-lg)',
              boxShadow: 'var(--shadow-lg)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div
                  style={{
                    width: 52,
                    height: 52,
                    borderRadius: '50%',
                    background: 'var(--accent-navy)',
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.25rem',
                    fontWeight: 800,
                  }}
                >
                  {selectedClient.user?.firstName?.[0] || 'R'}
                </div>
                <div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--accent-navy)' }}>
                    {selectedClient.user?.firstName} {selectedClient.user?.lastName}
                  </h3>
                  <div style={{ fontSize: '0.8rem', color: 'var(--accent-primary)', fontWeight: 600 }}>
                    {selectedClient.designation || 'Principal Investigator'} • {selectedClient.organization}
                  </div>
                </div>
              </div>

              <button
                onClick={() => setSelectedClient(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Researcher Info Pill Grid */}
            <div
              style={{
                background: 'var(--twine-1)',
                border: '1px solid var(--twine-2)',
                borderRadius: 'var(--radius-md)',
                padding: '1rem',
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '0.75rem',
                fontSize: '0.8rem',
                marginBottom: '1.25rem',
              }}
            >
              <div>
                <span style={{ color: 'var(--text-muted)' }}>ORCID ID: </span>
                <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--accent-navy)' }}>
                  {selectedClient.orcidId || '0000-0002-1825-0097'}
                </span>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Field: </span>
                <strong style={{ color: 'var(--text-primary)' }}>{selectedClient.fieldOfStudy}</strong>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Contact: </span>
                <span style={{ color: 'var(--accent-primary)' }}>{selectedClient.user?.email}</span>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Country: </span>
                <span style={{ color: 'var(--text-primary)' }}>{selectedClient.country || 'Global'}</span>
              </div>
            </div>

            {/* Research Portfolio Works */}
            <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--accent-navy)', marginBottom: '0.75rem' }}>
              Active Commissioned Research Papers
            </h4>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
              <div
                style={{
                  padding: '1rem',
                  borderRadius: 'var(--radius-md)',
                  background: '#f8fafd',
                  border: '1px solid var(--border-color)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--accent-navy)' }}>
                    Deep Learning Approaches in Somatic Genomic Variant Detection
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                    Target: Nature Machine Intelligence • Code: SCR-2026-001
                  </div>
                </div>
                <Link
                  href="/manuscripts/proj-1"
                  className="btn-secondary"
                  style={{ padding: '0.35rem 0.65rem', fontSize: '0.75rem', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}
                >
                  <span>Open Studio</span>
                  <ArrowRight size={12} />
                </Link>
              </div>

              <div
                style={{
                  padding: '1rem',
                  borderRadius: 'var(--radius-md)',
                  background: '#f8fafd',
                  border: '1px solid var(--border-color)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--accent-navy)' }}>
                    Thermal Stability Optimization in Perovskite-Silicon Tandem Solar Cells
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                    Target: Advanced Energy Materials • Code: SCR-2026-002
                  </div>
                </div>
                <span className="badge badge-blue">Drafting V1</span>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
              <button
                onClick={() => setSelectedClient(null)}
                className="btn-secondary"
              >
                Close Portfolio
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

