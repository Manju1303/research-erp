'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '../../lib/auth-context';
import { StatusBadge } from '../../components/StatusBadge';

interface QcCheckItem {
  id: string;
  label: string;
  description: string;
  checked: boolean;
}

export default function QualityControlPage() {
  const { role, displayName } = useAuth();

  const [activeManuscript, setActiveManuscript] = useState('INZ-2026-001 (Draft V2)');
  const [similarityScore, setSimilarityScore] = useState<number>(3.8);
  const [qcNotes, setQcNotes] = useState('All 10 quality checks verified against IEEE and Nature Machine Intelligence requirements. References in Vancouver/IEEE style checked.');
  const [decision, setDecision] = useState<'QC_PASSED' | 'QC_FAILED' | 'PENDING'>('QC_PASSED');

  const [checks, setChecks] = useState<QcCheckItem[]>([
    { id: 'c1', label: 'Title & Subtitle Verification', description: 'Confirm title accurately reflects scope and avoids over-generalization', checked: true },
    { id: 'c2', label: 'Abstract & Keywords Verification', description: 'Verify word count (under 250 words) and indexed keyword compliance', checked: true },
    { id: 'c3', label: 'Research Objective & Gap Alignment', description: 'Ensure problem statement and stated research gaps are clearly addressed', checked: true },
    { id: 'c4', label: 'Methodology & Algorithmic Rigor', description: 'Check experimental equations, model hyper-parameters, and reproducibility', checked: true },
    { id: 'c5', label: 'Experimental Dataset & Validation', description: 'Verify raw data provenance, benchmark splits, and statistical validity', checked: true },
    { id: 'c6', label: 'Citation & Reference Verification', description: 'Confirm at least 80% recent peer-reviewed references with active DOIs', checked: true },
    { id: 'c7', label: 'Journal Formatting & Layout Compliance', description: 'Double column format, figure resolution (300+ DPI), table captions', checked: true },
    { id: 'c8', label: 'Plagiarism / Similarity Screening', description: 'iThenticate / Turnitin check (< 10% overall, < 1% single source)', checked: true },
    { id: 'c9', label: 'Journal Author Guidelines Compliance', description: 'Target journal author declaration, conflict of interest, and data availability statement', checked: true },
    { id: 'c10', label: 'Author Information & ORCID Validation', description: 'All author names, affiliations, emails, and ORCID identifiers validated', checked: true },
  ]);

  const toggleCheck = (id: string) => {
    setChecks(checks.map((c) => (c.id === id ? { ...c, checked: !c.checked } : c)));
  };

  const allPassed = checks.every((c) => c.checked) && similarityScore < 10;
  const completedCount = checks.filter((c) => c.checked).length;

  const handleSaveDecision = () => {
    if (decision === 'QC_PASSED' && !allPassed) {
      alert('Cannot mark QC as PASSED while some checklist items remain unverified or similarity score exceeds threshold!');
      return;
    }
    alert(`QC Decision recorded successfully: ${decision}! Manuscript status updated.`);
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      {/* QC Header Banner */}
      <div className="glass-panel" style={{ padding: '1.75rem', position: 'relative' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.3rem' }}>
              <span className="badge badge-amber">Quality Gate 10-Point System</span>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Pre-Submission Verification</span>
            </div>
            <h1 style={{ fontSize: '1.65rem', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.02em' }}>
              Internal Quality Control (QC) Workbench
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: '0.2rem' }}>
              Enforce rigorous technical, ethical, formatting, and similarity standards before external journal submission.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
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
                background: allPassed ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)',
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
        <div className="glass-panel" style={{ padding: '1.75rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#ffffff' }}>
              Mandatory QC Checklist
            </h3>
            <span style={{ fontSize: '0.8rem', color: 'var(--accent-cyan)' }}>
              Inspecting: INZ-2026-001 (Draft V2)
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
                  background: item.checked ? 'rgba(16, 185, 129, 0.05)' : 'rgba(255, 255, 255, 0.02)',
                  border: item.checked ? '1px solid rgba(16, 185, 129, 0.25)' : '1px solid var(--border-color)',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
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
                  <div style={{ fontSize: '0.875rem', fontWeight: 600, color: item.checked ? '#ffffff' : 'var(--text-secondary)' }}>
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
          <div className="glass-panel" style={{ padding: '1.5rem' }}>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#ffffff', marginBottom: '1rem' }}>
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
              style={{ width: '100%', accentColor: 'var(--accent-cyan)', marginBottom: '0.5rem' }}
            />

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--text-muted)' }}>
              <span>0% (Ideal)</span>
              <span>10% Threshold</span>
              <span>30% (High)</span>
            </div>

            <div style={{ marginTop: '1rem', padding: '0.75rem', borderRadius: 'var(--radius-md)', background: 'rgba(255,255,255,0.03)', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
              Report attached: <strong>iThenticate_Similarity_Report_Ver2.pdf</strong> (0 internet matches exceeding 0.8%)
            </div>
          </div>

          {/* Quality Analyst Sign-off Card */}
          <div className="glass-panel" style={{ padding: '1.5rem' }}>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#ffffff', marginBottom: '1rem' }}>
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
                  background: decision === 'QC_PASSED' ? 'rgba(16, 185, 129, 0.2)' : 'transparent',
                  color: decision === 'QC_PASSED' ? 'var(--accent-emerald)' : 'var(--text-muted)',
                  fontWeight: 700,
                  fontSize: '0.8rem',
                  cursor: 'pointer',
                }}
              >
                ✓ Pass QC
              </button>
              <button
                type="button"
                onClick={() => setDecision('QC_FAILED')}
                style={{
                  flex: 1,
                  padding: '0.65rem',
                  borderRadius: 'var(--radius-md)',
                  border: decision === 'QC_FAILED' ? '2px solid var(--accent-rose)' : '1px solid var(--border-color)',
                  background: decision === 'QC_FAILED' ? 'rgba(244, 63, 94, 0.2)' : 'transparent',
                  color: decision === 'QC_FAILED' ? 'var(--accent-rose)' : 'var(--text-muted)',
                  fontWeight: 700,
                  fontSize: '0.8rem',
                  cursor: 'pointer',
                }}
              >
                ✕ Request Revision
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
