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
  const [manuscriptStatus, setManuscriptStatus] = useState<string>('QC_PENDING');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const SECTION_CONTENTS: Record<string, string> = {
    abstract: `# Abstract & Indexing Keywords\n\nAccurate identification of somatic single nucleotide polymorphisms (SNPs) and structural insertions/deletions (indels) in whole exome sequencing remains a foundational challenge in computational oncology. Classical heuristic variant calling pipelines exhibit elevated false discovery rates in low-complexity repeat regions.\n\nHere, we present a transformer-based variant detection architecture that models paired-end read alignments with attention mechanisms, achieving a 2.4% higher F1 score compared to state-of-the-art CNN callers.\n\nKeywords: Deep Learning, Somatic Variant Calling, Attention Mechanism, Precision Oncology, ClinVar Benchmarks.`,
    intro: `# 1. Introduction\n\nHigh-throughput next-generation sequencing (NGS) has emerged as the cornerstone of precision oncology and clinical genomics. Accurate identification of single nucleotide polymorphisms (SNPs) and structural insertions/deletions (indels) is critical for deciphering disease predisposition and tailoring targeted molecular therapies.\n\nHowever, existing heuristic callers (such as GATK HaplotypeCaller and VarDict) exhibit elevated false discovery rates in low-complexity genomic repeats, homopolymer tracks, and regions with non-uniform sequencing coverage.\n\n## 1.1 Research Gap & Objective\n\nRecent applications of Convolutional Neural Networks (CNNs) (e.g., DeepVariant) transform local read alignments into multi-channel tensor images. While effective, CNNs are inherently restricted by local receptive fields, failing to capture long-range haplotype correlations across distant sequencing fragments.\n\nTo address this limitation, we present a self-attention Transformer framework that ingests raw base quality scores, strand bias, and paired-end topology without heuristic tensor rasterization. Our benchmarks against the ClinVar and Genome in a Bottle (GIAB) gold-standard cohorts demonstrate a 2.4% boost in F1-score with sub-15ms inference latency per megabase.`,
    methodology: `# 2. Proposed Architecture & Methodology\n\nLet $\\mathcal{X} = \\{r_1, r_2, \\dots, r_N\\}$ denote the set of candidate read alignments spanning a putative variant locus $\\mathcal{L}$. Each read $r_i$ is mapped to a dense embedding $e_i \\in \\mathbb{R}^d$ integrating nucleotide identity, Phred base qualities, mapping confidence scores, and read-pair orientation flags.\n\n## 2.1 Multi-Head Locus Attention\n\nWe pass positional embeddings through an $L$-layer Transformer encoder with $H=8$ attention heads. The cross-read attention matrix $\\mathbf{A}$ dynamically prioritizes reads that span phasing boundaries and concordant allele frequencies:\n\n$$\\mathbf{A} = \\text{softmax}\\left(\\frac{\\mathbf{Q}\\mathbf{K}^T}{\\sqrt{d_k}}\\right)\\mathbf{V}$$\n\nCandidate alleles are subsequently classified via a multi-class softmax head into Homozygous Reference, Heterozygous Variant, or Homozygous Alternate.`,
    results: `# 3. Empirical Benchmarks & Discussion\n\nWe evaluated our framework against the Genome in a Bottle (GIAB) HG001/NA12878 benchmark dataset and compared precision, recall, and F1-score against GATK HaplotypeCaller (v4.2), DeepVariant (v1.4), and Clair3.\n\n| Architecture | Precision | Recall | F1 Score | Inference / Mb |\n|---|---|---|---|---|\n| GATK HaplotypeCaller | 97.4% | 96.1% | 96.7% | 42.1s |\n| DeepVariant (CNN) | 99.1% | 98.6% | 98.8% | 14.8s |\n| **Proposed Transformer** | **99.5%** | **99.3%** | **99.4%** | **11.2s** |\n\nStatistical significance was confirmed with Wilcoxon signed-rank tests ($p < 0.001$).`,
    references: `# 4. References & Bibliography\n\n1. Poplin, R., et al. (2018). "A universal SNP and small-indel variant caller using deep neural networks." Nature Biotechnology, 36(10), 983–989. doi:10.1038/nbt.4235\n2. Zook, J. M., et al. (2016). "Extensive sequencing of seven human genomes to characterize benchmark reference materials." Scientific Data, 3, 160025. doi:10.1038/sdata.2016.25\n3. Vaswani, A., et al. (2017). "Attention is all you need." Advances in Neural Information Processing Systems (NeurIPS), 30, 5998–6008.\n4. DePristo, M. A., et al. (2011). "A framework for variation discovery and genotyping using next-generation DNA sequencing data." Nature Genetics, 43(5), 491–498.`,
  };

  const [content, setContent] = useState(SECTION_CONTENTS.intro);
  const [changeNotes, setChangeNotes] = useState('Incorporated peer benchmark evaluations on GIAB dataset.');
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleSelectSection = (key: 'abstract' | 'intro' | 'methodology' | 'results' | 'references') => {
    setActiveSection(key);
    if (SECTION_CONTENTS[key]) {
      setContent(SECTION_CONTENTS[key]);
    }
  };

  const wordCount = content.trim().split(/\s+/).filter(Boolean).length;

  const handleSaveDraft = () => {
    setSaveStatus('saving');
    setTimeout(() => {
      setSaveStatus('saved');
      showToast('Manuscript draft saved successfully.');
      setTimeout(() => setSaveStatus('idle'), 2500);
    }, 600);
  };

  const handleCreateVersion = () => {
    setSelectedVersion(selectedVersion + 1);
    showToast(`New Manuscript Version (Draft V${selectedVersion + 1}) created and committed to version tree!`);
  };

  const handleApproveDraft = () => {
    setManuscriptStatus('CLIENT_APPROVED');
    showToast('Draft revision approved by Author! Ready for final journal submission.');
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', minHeight: 'calc(100vh - 120px)' }}>
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
            <StatusBadge status={manuscriptStatus} />
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
              onClick={handleApproveDraft}
              className="btn-primary"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
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
              onClick={() => handleSelectSection(sec.key as any)}
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
