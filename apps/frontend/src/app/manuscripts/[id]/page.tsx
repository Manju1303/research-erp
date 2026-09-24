'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '../../../lib/auth-context';
import { StatusBadge } from '../../../components/StatusBadge';

export default function ManuscriptStudioPage() {
  const { role, displayName } = useAuth();

  const [selectedVersion, setSelectedVersion] = useState(2);
  const [title, setTitle] = useState('Deep Learning Approaches in Somatic Genomic Variant Detection');
  const [activeSection, setActiveSection] = useState<'abstract' | 'intro' | 'methodology' | 'results' | 'references'>('intro');
  const [content, setContent] = useState(
    `# 1. Introduction

High-throughput next-generation sequencing (NGS) has emerged as the cornerstone of precision oncology and clinical genomics. Accurate identification of single nucleotide polymorphisms (SNPs) and structural insertions/deletions (indels) is critical for deciphering disease predisposition and tailoring targeted molecular therapies.

However, existing heuristic callers (such as GATK HaplotypeCaller and VarDict) exhibit elevated false discovery rates in low-complexity genomic repeats, homopolymer tracks, and regions with non-uniform sequencing coverage.

## 1.1 Research Gap & Objective

Recent applications of Convolutional Neural Networks (CNNs) (e.g., DeepVariant) transform local read alignments into multi-channel tensor images. While effective, CNNs are inherently restricted by local receptive fields, failing to capture long-range haplotype correlations across distant sequencing fragments.

To address this limitation, we present a self-attention Transformer framework that ingests raw base quality scores, strand bias, and paired-end topology without heuristic tensor rasterization. Our benchmarks against the ClinVar and Genome in a Bottle (GIAB) gold-standard cohorts demonstrate a 2.4% boost in F1-score with sub-15ms inference latency per megabase.`,
  );
  const [changeNotes, setChangeNotes] = useState('Incorporated peer benchmark evaluations on GIAB dataset.');
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');

  const wordCount = content.trim().split(/\s+/).filter(Boolean).length;

  const handleSaveDraft = () => {
    setSaveStatus('saving');
    setTimeout(() => {
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2500);
    }, 600);
  };

  const handleCreateVersion = () => {
    alert(`New Manuscript Version (Draft V${selectedVersion + 1}) created and committed to version tree!`);
    setSelectedVersion(selectedVersion + 1);
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', height: 'calc(100vh - 120px)' }}>
      {/* Studio Header Bar */}
      <div className="glass-panel" style={{ padding: '1.25rem 1.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem' }}>
            <Link href="/projects/proj-1" style={{ fontSize: '0.8rem', color: 'var(--accent-cyan)' }}>
              ← INZ-2026-001 Workspace
            </Link>
            <span style={{ color: 'var(--text-muted)' }}>|</span>
            <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>Manuscript Studio</span>
            <StatusBadge status={selectedVersion === 2 ? 'QC_PENDING' : 'DRAFT'} />
          </div>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="form-input"
            style={{
              fontSize: '1.15rem',
              fontWeight: 800,
              color: '#ffffff',
              background: 'transparent',
              border: 'none',
              padding: 0,
              width: 650,
            }}
          />
        </div>

        {/* Action Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {/* Version Selector */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: 'rgba(255,255,255,0.05)', padding: '0.35rem 0.75rem', borderRadius: 'var(--radius-md)' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Version:</span>
            <select
              value={selectedVersion}
              onChange={(e) => setSelectedVersion(Number(e.target.value))}
              style={{ background: 'transparent', border: 'none', color: 'var(--accent-cyan)', fontWeight: 700, cursor: 'pointer', outline: 'none' }}
            >
              <option value={2} style={{ background: '#0d1527' }}>Draft V2 (Latest - QC Pending)</option>
              <option value={1} style={{ background: '#0d1527' }}>Draft V1 (Archived)</option>
            </select>
          </div>

          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
            {wordCount} words
          </span>

          <button onClick={handleSaveDraft} className="btn-secondary">
            {saveStatus === 'saving' ? 'Saving...' : saveStatus === 'saved' ? '✓ Saved' : 'Save Draft'}
          </button>

          <button onClick={handleCreateVersion} className="btn-primary">
            + Tag Version V{selectedVersion + 1}
          </button>

          <Link href="/qc" className="btn-primary" style={{ background: 'var(--accent-indigo)' }}>
            Submit to QC 🛡️
          </Link>
        </div>
      </div>

      {/* Editor & Outline Container */}
      <div style={{ display: 'grid', gridTemplateColumns: '240px 1fr 300px', gap: '1.25rem', flex: 1, minHeight: 0 }}>
        {/* Left: Paper Outline & Structural Sections */}
        <div className="glass-panel" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', overflowY: 'auto' }}>
          <h4 style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>
            Paper Sections
          </h4>
          {[
            { key: 'abstract', label: '1. Abstract & Keywords' },
            { key: 'intro', label: '2. Introduction & Gap' },
            { key: 'methodology', label: '3. Proposed Architecture' },
            { key: 'results', label: '4. Benchmarks & Results' },
            { key: 'references', label: '5. References & Bibliography' },
          ].map((sec) => (
            <button
              key={sec.key}
              onClick={() => setActiveSection(sec.key as any)}
              style={{
                textAlign: 'left',
                padding: '0.65rem 0.85rem',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.825rem',
                fontWeight: activeSection === sec.key ? 700 : 500,
                color: activeSection === sec.key ? '#ffffff' : 'var(--text-secondary)',
                background: activeSection === sec.key ? 'rgba(59, 130, 246, 0.2)' : 'transparent',
                border: activeSection === sec.key ? '1px solid rgba(59, 130, 246, 0.4)' : '1px solid transparent',
                cursor: 'pointer',
              }}
            >
              {sec.label}
            </button>
          ))}

          <div style={{ marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid var(--border-color)', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            <div>Target: <strong>Nature Machine Intelligence</strong></div>
            <div style={{ marginTop: '0.25rem' }}>Citation: <strong>IEEE Style</strong></div>
          </div>
        </div>

        {/* Center: Live Manuscript Body Editor */}
        <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', minHeight: 0 }}>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            style={{
              flex: 1,
              width: '100%',
              background: 'transparent',
              border: 'none',
              color: 'var(--text-primary)',
              fontFamily: 'var(--font-sans)',
              fontSize: '0.95rem',
              lineHeight: 1.7,
              resize: 'none',
              outline: 'none',
            }}
          />
        </div>

        {/* Right: Version Metadata & QC Status */}
        <div className="glass-panel" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1.25rem', overflowY: 'auto' }}>
          <div>
            <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: '#ffffff', marginBottom: '0.5rem' }}>
              Version Metadata (V{selectedVersion})
            </h4>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              <div>Author: <strong style={{ color: 'var(--text-primary)' }}>Dr. Sarah Chen</strong></div>
              <div>Last Edit: <strong style={{ color: 'var(--text-primary)' }}>15 mins ago</strong></div>
              <div>Word Target: <strong style={{ color: 'var(--accent-cyan)' }}>5,000 / 6,000</strong></div>
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.35rem' }}>
              Change Notes for this revision:
            </label>
            <textarea
              rows={3}
              value={changeNotes}
              onChange={(e) => setChangeNotes(e.target.value)}
              className="form-input"
              style={{ fontSize: '0.8rem' }}
            />
          </div>

          {/* QC Inspection Summary */}
          <div style={{ padding: '1rem', borderRadius: 'var(--radius-md)', background: 'rgba(245, 158, 11, 0.08)', border: '1px solid rgba(245, 158, 11, 0.25)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
              <span>🛡️</span>
              <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--accent-amber)' }}>
                Internal QC Gate
              </span>
            </div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
              Similarity score verified at <strong>3.8%</strong> via iThenticate. Plagiarism check passed. Awaiting final formatting sign-off.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
