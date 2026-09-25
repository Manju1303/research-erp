'use client';

import React, { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import { Award, Download, Plus, ExternalLink } from 'lucide-react';

export default function PublicationsTrackerPage() {
  const [publications, setPublications] = useState<any[]>([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    async function loadPublications() {
      try {
        const res: any = await api.request('/publications');
        setPublications(res?.data || []);
      } catch (err) {
        console.error(err);
      }
    }
    loadPublications();
  }, []);

  const filtered = publications.filter((p) => {
    if (!search) return true;
    return (
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.doi?.toLowerCase().includes(search.toLowerCase()) ||
      p.submission?.journal?.name.toLowerCase().includes(search.toLowerCase())
    );
  });

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      {/* Top Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.35rem' }}>
            <span className="badge badge-emerald">Final Deliverables</span>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Scholarly Publications & DOIs</span>
          </div>
          <h1 style={{ fontSize: '1.65rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
            Published Manuscripts & DOI Repository
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: '0.2rem' }}>
            Permanent public registry of accepted papers, registered DOIs, volume citations, published PDFs, and verification certificates.
          </p>
        </div>

        <button className="btn-primary" style={{ background: 'var(--accent-emerald)', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
          <Plus size={16} />
          <span>Register Published Article</span>
        </button>
      </div>

      {/* Search Filter Bar */}
      <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
        <input
          type="text"
          placeholder="Filter by title, DOI, or journal..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="form-input"
          style={{ maxWidth: 380 }}
        />
      </div>

      {/* Publications Table */}
      <div className="data-table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Article Title & Journal</th>
              <th>Digital Object Identifier (DOI)</th>
              <th>Citation Metadata</th>
              <th>Publication Date</th>
              <th>Institution</th>
              <th>Final PDF</th>
              <th>Certificate</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((pub) => (
              <tr key={pub.id}>
                <td>
                  <div style={{ fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.2rem' }}>
                    {pub.title}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--accent-primary)', fontWeight: 600 }}>
                    {pub.submission?.journal?.name}
                  </div>
                </td>
                <td>
                  <a
                    href={pub.articleUrl}
                    target="_blank"
                    rel="noreferrer"
                    style={{ fontFamily: 'var(--font-mono)', fontSize: '0.775rem', color: 'var(--accent-emerald)', textDecoration: 'underline', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}
                  >
                    <span>doi:{pub.doi}</span>
                    <ExternalLink size={12} />
                  </a>
                </td>
                <td style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  <div>{pub.volume}, {pub.issue}</div>
                  <div style={{ fontSize: '0.725rem', color: 'var(--text-muted)' }}>{pub.pageNumbers}</div>
                </td>
                <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  {pub.publicationDate}
                </td>
                <td style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  {pub.project?.client?.organization}
                </td>
                <td>
                  <button className="btn-secondary" style={{ padding: '0.35rem 0.65rem', fontSize: '0.725rem', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                    <Download size={12} />
                    <span>PDF</span>
                  </button>
                </td>
                <td>
                  <button className="btn-secondary" style={{ padding: '0.35rem 0.65rem', fontSize: '0.725rem', borderColor: '#a7f3d0', color: 'var(--accent-emerald)', display: 'inline-flex', alignItems: 'center', gap: '0.3rem', background: '#ecfdf5' }}>
                    <Award size={12} />
                    <span>Certificate</span>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
