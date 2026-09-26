'use client';

import React, { useState } from 'react';
import { CheckCircle2, XCircle, Download, Check } from 'lucide-react';

interface QCItem {
  id: string;
  label: string;
  category: string;
  description: string;
  checked: boolean;
}

export default function QualityControlPage() {
  const [selectedProject, setSelectedProject] = useState('SCR-2026-001');
  const [similarityScore, setSimilarityScore] = useState<number>(3.8);
  const [qcNotes, setQcNotes] = useState(
    'Manuscript adheres strictly to IEEE transactions guidelines. Experimental benchmarks against ClinVar verified. Code reproducibility scripts linked in GitHub repository.',
  );
  const [decision, setDecision] = useState<'QC_PASSED' | 'QC_FAILED'>('QC_PASSED');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const [checks, setChecks] = useState<QCItem[]>([
    { id: '1', label: 'Novelty & Research Gap Defined', category: 'SCOPE', description: 'Explicit problem statement with clear differentiation from prior SOTA literature.', checked: true },
    { id: '2', label: 'Technical Methodology Precision', category: 'METHODOLOGY', description: 'Complete mathematical formulations, algorithm pseudocode, and hyperparameter tables provided.', checked: true },
    { id: '3', label: 'Empirical Rigor & Benchmark Validation', category: 'EVALUATION', description: 'Statistical significance testing, error margins, and comparison against baseline standards.', checked: true },
    { id: '4', label: 'Plagiarism / Similarity Index (<10%)', category: 'SIMILARITY', description: 'Cross-checked against iThenticate and Turnitin database without self-plagiarism flags.', checked: true },
    { id: '5', label: 'Citation Integrity & Reference Style', category: 'CITATIONS', description: 'All in-text citations mapped to bibliography. Minimum 80% indexed in Scopus/WoS from last 5 years.', checked: true },
    { id: '6', label: 'Target Journal Scope Compatibility', category: 'JOURNAL_FIT', description: 'Subject alignment with target journal aims and scope (Bioinformatics / Machine Learning).', checked: true },
    { id: '7', label: 'Manuscript Formatting & Typography', category: 'FORMATTING', description: 'Compliant with target publication LaTeX/Word template, font styles, and margins.', checked: true },
    { id: '8', label: 'High-Resolution Figures & Illustrations', category: 'MEDIA', description: 'Vector graphics or 300+ DPI TIFF/PNG images with intelligible legends and captions.', checked: true },
    { id: '9', label: 'Conflict of Interest & Funding Disclosure', category: 'ETHICS', description: 'Institutional ethics approval numbers and funding sponsor acknowledgments fully declared.', checked: true },
    { id: '10', label: 'Data & Source Code Availability', category: 'REPRODUCIBILITY', description: 'Public or controlled repository DOI provided for model weights, dataset partitions, and scripts.', checked: true },
  ]);

  const toggleCheck = (id: string) => {
    setChecks(
      checks.map((c) => (c.id === id ? { ...c, checked: !c.checked } : c)),
    );
  };

  const completedCount = checks.filter((c) => c.checked).length;
  const allPassed = completedCount === checks.length;

  const handleSaveDecision = () => {
    showToast(`QC Verification Decision recorded: ${decision}! Project status updated to ${decision === 'QC_PASSED' ? 'Author Sign-off' : 'Revision Required'}.`);
  };

  const handleDownloadReport = () => {
    const reportText = `========================================================================\n` +
      `ITHENTICATE / TURNITIN AUTHENTICATED SIMILARITY REPORT\n` +
      `PROJECT: ${selectedProject}\n` +
      `PRIMARY SIMILARITY INDEX: ${similarityScore}%\n` +
      `INTERNET SOURCES: 0.8%\n` +
      `PUBLICATIONS: 2.4%\n` +
      `STUDENT PAPERS: 0.6%\n` +
      `========================================================================\n\n` +
      `QC CLEARANCE: PASSED (Under 10% strict threshold)\n` +
      `METHODOLOGY VERIFIED: No uncredited verbatim text detected.\n` +
      `LEAD QUALITY ANALYST: Marcus Vance, PhD\n` +
      `AUDIT SIGNATURE: 0x9f88421b8c4d12\n`;

    const blob = new Blob([reportText], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `iThenticate_Report_${selectedProject}.txt`;
    a.click();
    window.URL.revokeObjectURL(url);
    showToast(`Similarity screening report for ${selectedProject} downloaded.`);
  };

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

      {/* QC Header Banner */}
      <div className="glass-panel" style={{ padding: '1.75rem', position: 'relative', background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 style={{ fontSize: '1.65rem', fontWeight: 800, color: 'var(--accent-navy)', letterSpacing: '-0.02em' }}>
              Internal Quality Control (QC) Workbench
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
              Enforce rigorous technical, ethical, formatting, and similarity standards before external journal submission.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <select
              value={selectedProject}
              onChange={(e) => {
                setSelectedProject(e.target.value);
                showToast(`Loaded inspection checklist for ${e.target.value}`);
              }}
              className="form-input"
              style={{ width: 'auto', minWidth: 200, fontWeight: 700 }}
            >
              <option value="SCR-2026-001">SCR-2026-001 (Genomic Variants)</option>
              <option value="SCR-2026-002">SCR-2026-002 (Perovskite Cells)</option>
              <option value="SCR-2026-003">SCR-2026-003 (Consent Contracts)</option>
            </select>

            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Checklist Progress</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: allPassed ? 'var(--accent-emerald)' : 'var(--accent-amber)' }}>
                {completedCount} / {checks.length} Verified
              </div>
            </div>
            <div
              style={{
                width: 50,
                height: 50,
                borderRadius: '50%',
                background: allPassed ? '#ecfdf5' : '#fffbeb',
                border: `2px solid ${allPassed ? 'var(--accent-emerald)' : 'var(--accent-amber)'}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.1rem',
                fontWeight: 800,
                color: allPassed ? 'var(--accent-emerald)' : 'var(--accent-amber)',
              }}
            >
              {Math.round((completedCount / checks.length) * 100)}%
            </div>
          </div>
        </div>
      </div>

      {/* Main Two-Column Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.8fr 1fr', gap: '1.5rem' }}>
        {/* Left: 10-Point Checklist */}
        <div className="glass-panel" style={{ padding: '1.75rem', background: '#ffffff' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              Mandatory QC Checklist
            </h3>
            <span style={{ fontSize: '0.8rem', color: 'var(--accent-primary)', fontWeight: 600 }}>
              Inspecting: SCR-2026-001 (Draft V2)
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {checks.map((item, idx) => (
              <div
                key={item.id}
                onClick={() => toggleCheck(item.id)}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '0.85rem',
                  padding: '1rem',
                  borderRadius: 'var(--radius-md)',
                  background: item.checked ? '#f0fdf4' : '#f8fafc',
                  border: item.checked ? '1px solid #bbf7d0' : '1px solid var(--border-color)',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                <input
                  type="checkbox"
                  checked={item.checked}
                  onChange={() => {}}
                  style={{
                    width: 18,
                    height: 18,
                    marginTop: 2,
                    accentColor: 'var(--accent-emerald)',
                    cursor: 'pointer',
                  }}
                />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                    {idx + 1}. {item.label}
                  </div>
                  <div style={{ fontSize: '0.775rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                    {item.description}
                  </div>
                </div>
                {item.checked ? (
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent-emerald)' }}>
                    ✓ PASSED
                  </span>
                ) : (
                  <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--accent-rose)' }}>
                    PENDING
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Right: Plagiarism & Final Determination Panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Similarity & Plagiarism Card */}
          <div className="glass-panel" style={{ padding: '1.5rem', background: '#ffffff' }}>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '1rem' }}>
              Plagiarism / Similarity Screening
            </h4>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>iThenticate Similarity Index:</span>
              <span
                style={{
                  fontSize: '1.4rem',
                  fontWeight: 800,
                  color: similarityScore < 10 ? 'var(--accent-emerald)' : 'var(--accent-rose)',
                }}
              >
                {similarityScore}%
              </span>
            </div>

            <input
              type="range"
              min={0}
              max={30}
              step={0.1}
              value={similarityScore}
              onChange={(e) => setSimilarityScore(parseFloat(e.target.value))}
              style={{ width: '100%', accentColor: 'var(--accent-primary)', marginBottom: '0.5rem' }}
            />

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--text-muted)' }}>
              <span>0% (Ideal)</span>
              <span>10% Threshold</span>
              <span>30% (High)</span>
            </div>

            <div style={{ marginTop: '1rem', padding: '0.75rem', borderRadius: 'var(--radius-md)', background: 'var(--twine-1)', border: '1px solid var(--twine-2)', fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.5rem' }}>
              <div>
                Report: <strong>iThenticate_Report_{selectedProject}.pdf</strong>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>0 matches exceeding 0.8%</div>
              </div>
              <button
                type="button"
                onClick={handleDownloadReport}
                className="btn-secondary"
                style={{ padding: '0.3rem 0.6rem', fontSize: '0.7rem', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}
              >
                <Download size={12} />
                <span>Download Report</span>
              </button>
            </div>
          </div>

          {/* Quality Analyst Sign-off Card */}
          <div className="glass-panel" style={{ padding: '1.5rem', background: '#ffffff' }}>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '1rem' }}>
              Final QC Gate Sign-Off
            </h4>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.4rem' }}>
                Reviewer Evaluation Notes:
              </label>
              <textarea
                rows={4}
                value={qcNotes}
                onChange={(e) => setQcNotes(e.target.value)}
                className="form-input"
                style={{ fontSize: '0.8rem' }}
              />
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.25rem' }}>
              <button
                type="button"
                onClick={() => setDecision('QC_PASSED')}
                style={{
                  flex: 1,
                  padding: '0.65rem',
                  borderRadius: 'var(--radius-md)',
                  border: decision === 'QC_PASSED' ? '2px solid var(--accent-emerald)' : '1px solid var(--border-color)',
                  background: decision === 'QC_PASSED' ? '#ecfdf5' : '#ffffff',
                  color: decision === 'QC_PASSED' ? 'var(--accent-emerald)' : 'var(--text-muted)',
                  fontWeight: 700,
                  fontSize: '0.8rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.35rem',
                }}
              >
                <CheckCircle2 size={15} />
                <span>Pass QC</span>
              </button>
              <button
                type="button"
                onClick={() => setDecision('QC_FAILED')}
                style={{
                  flex: 1,
                  padding: '0.65rem',
                  borderRadius: 'var(--radius-md)',
                  border: decision === 'QC_FAILED' ? '2px solid var(--accent-rose)' : '1px solid var(--border-color)',
                  background: decision === 'QC_FAILED' ? '#fff1f2' : '#ffffff',
                  color: decision === 'QC_FAILED' ? 'var(--accent-rose)' : 'var(--text-muted)',
                  fontWeight: 700,
                  fontSize: '0.8rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.35rem',
                }}
              >
                <XCircle size={15} />
                <span>Request Revision</span>
              </button>
            </div>

            <button
              onClick={handleSaveDecision}
              className="btn-primary"
              style={{ width: '100%' }}
            >
              Commit QC Verification
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
