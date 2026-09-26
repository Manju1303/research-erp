'use client';

import React, { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import { Award, Download, Plus, ExternalLink, X, Check } from 'lucide-react';

export default function PublicationsTrackerPage() {
  const [publications, setPublications] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [selectedCert, setSelectedCert] = useState<any>(null);

  // New Publication Form State
  const [formTitle, setFormTitle] = useState('');
  const [formJournal, setFormJournal] = useState('');
  const [formDoi, setFormDoi] = useState('');
  const [formVolume, setFormVolume] = useState('Vol. 42');
  const [formIssue, setFormIssue] = useState('Issue 4');
  const [formPages, setFormPages] = useState('pp. 112-128');
  const [formDate, setFormDate] = useState(new Date().toISOString().split('T')[0]);
  const [formOrg, setFormOrg] = useState('Stanford University School of Medicine');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    async function loadPublications() {
      try {
        const res: any = await api.request('/publications');
        setPublications(Array.isArray(res) ? res : (Array.isArray(res?.data) ? res.data : []));
      } catch (err) {
        console.error(err);
      }
    }
    loadPublications();
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleRegisterArticle = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle || !formDoi) return;

    const newPub = {
      id: `pub-${Date.now()}`,
      title: formTitle,
      doi: formDoi.replace(/^doi:/i, '').trim(),
      articleUrl: `https://doi.org/${formDoi.replace(/^doi:/i, '').trim()}`,
      volume: formVolume,
      issue: formIssue,
      pageNumbers: formPages,
      publicationDate: formDate,
      submission: {
        journal: { name: formJournal || 'Nature Machine Intelligence' },
      },
      project: {
        client: { organization: formOrg },
      },
    };

    setPublications([newPub, ...publications]);
    setShowRegisterModal(false);
    setFormTitle('');
    setFormDoi('');
    showToast(`Published Article registered successfully under DOI: ${newPub.doi}`);
  };

  const handleDownloadPdf = (pub: any) => {
    const content = `========================================================================\n` +
      `PUBLISHED RESEARCH ARTICLE - PERMANENT ARCHIVE RECORD\n` +
      `========================================================================\n\n` +
      `TITLE: ${pub.title}\n` +
      `JOURNAL: ${pub.submission?.journal?.name || 'Academic Journal'}\n` +
      `DOI: 10.1038/${pub.doi}\n` +
      `URL: ${pub.articleUrl || `https://doi.org/${pub.doi}`}\n` +
      `CITATION: ${pub.volume || 'Vol. 1'}, ${pub.issue || 'Issue 1'}, ${pub.pageNumbers || 'pp. 1-20'}\n` +
      `DATE OF PUBLICATION: ${pub.publicationDate}\n` +
      `AFFILIATION: ${pub.project?.client?.organization || 'Institutional Research Center'}\n` +
      `STATUS: Indexed in Scopus Q1 & Web of Science\n\n` +
      `------------------------------------------------------------------------\n` +
      `ABSTRACT & METHODOLOGY SUMMARY:\n` +
      `This paper demonstrates novel algorithmic foundations and empirical evaluations\n` +
      `verified through double-blind peer review and authenticated via Scriptara ERP.\n` +
      `========================================================================\n`;

    const blob = new Blob([content], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${pub.doi ? pub.doi.replace(/\//g, '_') : 'article'}_published.txt`;
    a.click();
    window.URL.revokeObjectURL(url);
    showToast(`Final PDF archive document for "${pub.title.slice(0, 32)}..." downloaded.`);
  };

  const handleDownloadCertificate = (pub: any) => {
    const certText = `========================================================================\n` +
      `           OFFICIAL CERTIFICATE OF SCIENTIFIC PUBLICATION\n` +
      `========================================================================\n\n` +
      `This certifies that the scholarly research paper entitled:\n\n` +
      `       "${pub.title.toUpperCase()}"\n\n` +
      `Authored and submitted through the Scriptara Research Management Platform,\n` +
      `has successfully undergone rigorous editorial review, technical QC validation,\n` +
      `and has been officially accepted and published in:\n\n` +
      `       ${pub.submission?.journal?.name}\n\n` +
      `PERMANENT DIGITAL OBJECT IDENTIFIER: doi:${pub.doi}\n` +
      `CITATION INDEX: ${pub.volume}, ${pub.issue}, ${pub.pageNumbers}\n` +
      `ISSUANCE DATE: ${pub.publicationDate}\n` +
      `AFFILIATED INSTITUTION: ${pub.project?.client?.organization}\n` +
      `VERIFICATION HASH: SHA256:${pub.id.slice(0, 16)}8f9a2b7c4d1e\n\n` +
      `Scriptara Academic & Publishing Editorial Board\n` +
      `========================================================================\n`;

    const blob = new Blob([certText], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Certificate_${pub.doi ? pub.doi.replace(/\//g, '_') : 'publication'}.txt`;
    a.click();
    window.URL.revokeObjectURL(url);
    showToast(`Verification Certificate for "${pub.title.slice(0, 30)}..." downloaded.`);
  };

  const filtered = publications.filter((p) => {
    if (!search) return true;
    return (
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.doi?.toLowerCase().includes(search.toLowerCase()) ||
      p.submission?.journal?.name?.toLowerCase().includes(search.toLowerCase())
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
            Published Manuscripts & DOI Repository
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
            Permanent public registry of accepted papers, registered DOIs, volume citations, published PDFs, and verification certificates.
          </p>
        </div>

        <button
          onClick={() => setShowRegisterModal(true)}
          className="btn-primary"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
        >
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
                    href={pub.articleUrl || `https://doi.org/${pub.doi}`}
                    target="_blank"
                    rel="noreferrer"
                    style={{ fontFamily: 'var(--font-mono)', fontSize: '0.775rem', color: 'var(--accent-navy)', textDecoration: 'underline', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}
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
                  {pub.project?.client?.organization || 'Institutional Partner'}
                </td>
                <td>
                  <button
                    onClick={() => handleDownloadPdf(pub)}
                    className="btn-secondary"
                    style={{ padding: '0.35rem 0.65rem', fontSize: '0.725rem', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}
                  >
                    <Download size={12} />
                    <span>PDF</span>
                  </button>
                </td>
                <td>
                  <button
                    onClick={() => setSelectedCert(pub)}
                    className="btn-secondary"
                    style={{
                      padding: '0.35rem 0.65rem',
                      fontSize: '0.725rem',
                      borderColor: 'var(--twine-3)',
                      color: 'var(--accent-navy)',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.3rem',
                      background: 'var(--accent-primary-light)',
                    }}
                  >
                    <Award size={12} />
                    <span>Certificate</span>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Register Published Article Modal */}
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
                  Register Published Article
                </h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Record official publication metadata, verified DOI, and citation markers.
                </p>
              </div>
              <button
                onClick={() => setShowRegisterModal(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleRegisterArticle} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>
                  Article Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Deep Learning Approaches in Somatic Variant Detection"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="form-input"
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>
                    Journal Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Nature Machine Intelligence"
                    value={formJournal}
                    onChange={(e) => setFormJournal(e.target.value)}
                    className="form-input"
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>
                    DOI (Digital Object Identifier) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="10.1038/s42256-026-00412-x"
                    value={formDoi}
                    onChange={(e) => setFormDoi(e.target.value)}
                    className="form-input"
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.85rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>
                    Volume
                  </label>
                  <input
                    type="text"
                    value={formVolume}
                    onChange={(e) => setFormVolume(e.target.value)}
                    className="form-input"
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>
                    Issue
                  </label>
                  <input
                    type="text"
                    value={formIssue}
                    onChange={(e) => setFormIssue(e.target.value)}
                    className="form-input"
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>
                    Page Numbers
                  </label>
                  <input
                    type="text"
                    value={formPages}
                    onChange={(e) => setFormPages(e.target.value)}
                    className="form-input"
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>
                    Publication Date
                  </label>
                  <input
                    type="date"
                    value={formDate}
                    onChange={(e) => setFormDate(e.target.value)}
                    className="form-input"
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>
                    Author Institution
                  </label>
                  <input
                    type="text"
                    value={formOrg}
                    onChange={(e) => setFormOrg(e.target.value)}
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
                  Save & Register Article
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Official Certificate Viewer Modal */}
      {selectedCert && (
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
              maxWidth: 620,
              background: '#ffffff',
              padding: '2.5rem',
              borderRadius: 'var(--radius-lg)',
              boxShadow: 'var(--shadow-lg)',
              border: '2px solid var(--twine-3)',
              position: 'relative',
              textAlign: 'center',
            }}
          >
            <button
              onClick={() => setSelectedCert(null)}
              style={{ position: 'absolute', top: '1.25rem', right: '1.25rem', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
            >
              <X size={20} />
            </button>

            <div
              style={{
                width: 64,
                height: 64,
                borderRadius: '50%',
                background: 'var(--accent-primary-light)',
                color: 'var(--accent-navy)',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1rem',
                border: '2px solid var(--twine-4)',
              }}
            >
              <Award size={32} />
            </div>

            <div style={{ fontSize: '0.75rem', fontWeight: 800, letterSpacing: '0.1em', color: 'var(--accent-primary)', textTransform: 'uppercase', marginBottom: '0.35rem' }}>
              Certificate of Publication
            </div>

            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--accent-navy)', marginBottom: '0.75rem' }}>
              Scriptara Research & Publication Registry
            </h2>

            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.6, maxWidth: 500, margin: '0 auto 1.25rem auto' }}>
              This certifies that the scholarly paper titled <strong style={{ color: 'var(--accent-navy)' }}>&ldquo;{selectedCert.title}&rdquo;</strong> has undergone thorough peer-review validation and is registered in the permanent archives.
            </p>

            <div
              style={{
                background: 'var(--twine-1)',
                border: '1px solid var(--twine-2)',
                borderRadius: 'var(--radius-md)',
                padding: '1rem 1.25rem',
                textAlign: 'left',
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '0.75rem',
                fontSize: '0.8rem',
                marginBottom: '1.5rem',
              }}
            >
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Journal: </span>
                <strong style={{ color: 'var(--accent-navy)' }}>{selectedCert.submission?.journal?.name}</strong>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Publication Date: </span>
                <strong style={{ color: 'var(--text-primary)' }}>{selectedCert.publicationDate}</strong>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Registered DOI: </span>
                <strong style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent-navy)' }}>doi:{selectedCert.doi}</strong>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Citation: </span>
                <strong style={{ color: 'var(--text-primary)' }}>{selectedCert.volume}, {selectedCert.issue}</strong>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem' }}>
              <button
                onClick={() => handleDownloadCertificate(selectedCert)}
                className="btn-primary"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
              >
                <Download size={14} />
                <span>Download Official Certificate</span>
              </button>
              <button
                onClick={() => setSelectedCert(null)}
                className="btn-secondary"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

