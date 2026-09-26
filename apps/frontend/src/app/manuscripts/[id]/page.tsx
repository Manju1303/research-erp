'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '../../../lib/auth-context';
import { StatusBadge } from '../../../components/StatusBadge';
import { ShieldCheck, Plus, Check, ArrowLeft } from 'lucide-react';

export default function ManuscriptStudioPage() {
  const { role, displayName, userName } = useAuth();

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
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', minHeight: 'calc(100vh - 120px)' }}>
      {/* Studio Header Bar */}
      <div className="glass-panel" style={{ padding: '1.25rem 1.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem' }}>
            <Link href="/projects/proj-1" style={{ fontSize: '0.8rem', color: 'var(--accent-primary)', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
              <ArrowLeft size={13} />
              <span>SCR-2026-001 Workspace</span>
            </Link>
            <span style={{ color: 'var(--text-muted)' }}>|</span>
            <span style={{ fontWeight: 700, color: 'var(--accent-navy)' }}>Manuscript Studio</span>
            <StatusBadge status={selectedVersion === 2 ? 'QC_PENDING' : 'DRAFT'} />
            {userName && (
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                {role === 'client' ? 'Author / Reviewer' : 'Editor'}: <strong style={{ color: 'var(--accent-navy)' }}>{userName}</strong> ({displayName})
              </span>
            )}
          </div>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="form-input"
            style={{
              fontSize: '1.2rem',
              fontWeight: 800,
              color: 'var(--accent-navy)',
              background: 'transparent',
              border: 'none',
              padding: 0,
              width: '100%',
              maxWidth: 750,
              boxShadow: 'none',
            }}
          />
        </div>

        {/* Action Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {/* Version Selector */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: '#f8fafd', border: '1px solid var(--border-color)', padding: '0.35rem 0.75rem', borderRadius: 'var(--radius-md)' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Version:</span>
            <select
              value={selectedVersion}
              onChange={(e) => setSelectedVersion(Number(e.target.value))}
              style={{ background: 'transparent', border: 'none', color: 'var(--accent-primary)', fontWeight: 700, cursor: 'pointer', outline: 'none' }}
            >
              <option value={2}>Draft V2 (Latest - QC Pending)</option>
              <option value={1}>Draft V1 (Archived)</option>
            </select>
          </div>

          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
            {wordCount} words
          </span>

          <button onClick={handleSaveDraft} className="btn-secondary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
            {saveStatus === 'saving' ? 'Saving...' : saveStatus === 'saved' ? (
              <>
                <Check size={14} color="var(--accent-emerald)" />
                <span>Saved</span>
              </>
            ) : 'Save Draft'}
          </button>

          {role !== 'client' && (
            <button onClick={handleCreateVersion} className="btn-primary">
              <Plus size={14} />
              <span>Tag Version V{selectedVersion + 1}</span>
            </button>
          )}

          {role !== 'client' ? (
            <Link href="/qc" className="btn-primary" style={{ background: 'var(--gradient-primary)', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
              <ShieldCheck size={15} />
              <span>Submit to QC</span>
            </Link>
          ) : (
            <button
              onClick={() => alert('Draft revision approved by Author! Ready for final submission.')}
              className="btn-primary"
              style={{ background: 'var(--gradient-primary)', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
            >
              <Check size={15} />
              <span>Approve Draft</span>
            </button>
          )}
        </div>
      </div>

      {/* Editor & Outline Container */}
      <div style={{ display: 'grid', gridTemplateColumns: '240px 1fr 300px', gap: '1.25rem', minHeight: 520, flex: 1 }}>
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
                color: activeSection === sec.key ? 'var(--accent-navy)' : 'var(--text-secondary)',
                background: activeSection === sec.key ? 'var(--accent-primary-light)' : 'transparent',
                border: activeSection === sec.key ? '1px solid var(--accent-primary)' : '1px solid transparent',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
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
        <div className="glass-panel" style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', minHeight: 520, background: '#ffffff' }}>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            style={{
              flex: 1,
              minHeight: 480,
              height: '100%',
              width: '100%',
              background: 'transparent',
              border: 'none',
              color: 'var(--text-primary)',
              fontFamily: 'var(--font-sans)',
              fontSize: '0.95rem',
              lineHeight: 1.8,
              resize: 'none',
              outline: 'none',
              paddingBottom: '3.5rem',
            }}
          />
        </div>

        {/* Right: Version Metadata & QC Status */}
        <div className="glass-panel" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1.25rem', overflowY: 'auto' }}>
          <div>
            <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
              Version Metadata (V{selectedVersion})
            </h4>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              <div>Author: <strong style={{ color: 'var(--text-primary)' }}>Dr. Sarah Chen</strong></div>
              <div>Last Edit: <strong style={{ color: 'var(--text-primary)' }}>15 mins ago</strong></div>
              <div>Word Target: <strong style={{ color: 'var(--accent-primary)' }}>5,000 / 6,000</strong></div>
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
          <div style={{ padding: '1rem', borderRadius: 'var(--radius-md)', background: '#fffbeb', border: '1px solid #fde68a' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
              <ShieldCheck size={16} color="var(--accent-amber)" />
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
