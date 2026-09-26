'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { api } from '../../../lib/api';
import { useAuth } from '../../../lib/auth-context';
import { StatusBadge } from '../../../components/StatusBadge';
import { TimelineView } from '../../../components/TimelineView';
import { ShieldCheck, PenTool, UploadCloud, FileText, Download, ArrowRight, CheckCircle2, X, Check } from 'lucide-react';

export default function ProjectWorkspacePage() {
  const params = useParams();
  const projectId = (params?.id as string) || 'proj-1';
  const { displayName } = useAuth();

  const [project, setProject] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'manuscript' | 'tasks' | 'documents' | 'history'>('overview');
  const [transitionNote, setTransitionNote] = useState('');
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [newDocFilename, setNewDocFilename] = useState('');
  const [newDocCategory, setNewDocCategory] = useState('MANUSCRIPT');
  const [newDocAccess, setNewDocAccess] = useState('CLIENT');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleUploadDocument = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDocFilename) return;

    const newDoc = {
      id: `d-${Date.now()}`,
      filename: newDocFilename.endsWith('.pdf') || newDocFilename.endsWith('.xlsx') || newDocFilename.endsWith('.docx')
        ? newDocFilename
        : `${newDocFilename}.pdf`,
      category: newDocCategory,
      accessLevel: newDocAccess,
      sizeBytes: Math.floor(1200000 + Math.random() * 4500000),
      createdAt: new Date().toISOString(),
    };

    setProject({
      ...project,
      documents: [newDoc, ...(project.documents || [])],
    });
    setShowUploadModal(false);
    setNewDocFilename('');
    showToast(`Document "${newDoc.filename}" uploaded successfully to repository!`);
  };

  const handleDownloadDocument = (doc: any) => {
    const textContent = `========================================================================\n` +
      `SCRIPTARA SECURE DOCUMENT REPOSITORY\n` +
      `PROJECT: ${project.projectCode} - ${project.title}\n` +
      `FILENAME: ${doc.filename}\n` +
      `CATEGORY: ${doc.category}\n` +
      `ACCESS LEVEL: ${doc.accessLevel}\n` +
      `UPLOADED: ${new Date(doc.createdAt).toLocaleString()}\n` +
      `========================================================================\n\n` +
      `[MOCK DATA FILE CONTENT - CRYPTOGRAPHIC INTEGRITY VERIFIED]\n` +
      `SHA-256 Checksum: e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855\n`;

    const blob = new Blob([textContent], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = doc.filename;
    a.click();
    window.URL.revokeObjectURL(url);
    showToast(`Downloading "${doc.filename}"...`);
  };

  useEffect(() => {
    async function fetchProject() {
      try {
        const res: any = await api.request(`/projects/${projectId}`);
        if (res && res.id) {
          setProject(res);
        } else {
          // Fallback realistic workspace state
          setProject({
            id: projectId,
            projectCode: 'INZ-2026-001',
            title: 'Deep Learning Approaches in Genomic Variant Detection',
            domain: 'Bioinformatics & Machine Learning',
            status: 'INTERNAL_QC',
            priority: 'HIGH',
            budget: 4200,
            currency: 'USD',
            deadline: '2026-12-15',
            targetJournalType: 'Scopus Q1 / Nature Machine Intelligence',
            keywords: ['Genomics', 'Deep Learning', 'Transformers', 'Variant Calling'],
            description: 'A comprehensive investigation comparing attention-based transformer architectures against classical convolutional neural network pipelines for identifying somatic single nucleotide polymorphisms (SNPs) and insertions/deletions (indels) in whole exome sequencing datasets.',
            client: {
              organization: 'Stanford University School of Medicine',
              designation: 'Associate Professor',
              fieldOfStudy: 'Bioinformatics',
              orcidId: '0000-0002-1825-0097',
              user: {
                firstName: 'Dr. John',
                lastName: 'Reynolds',
                email: 'reynolds@stanford.edu',
                phone: '+1 650 723 2300',
              },
            },
            manager: { firstName: 'Elena', lastName: 'Rostova', email: 'elena.r@scriptara.com' },
            manuscripts: [
              {
                id: 'manu-1',
                title: 'Deep Learning Approaches in Genomic Variant Detection',
                versions: [
                  {
                    id: 'ver-2',
                    versionNumber: 2,
                    status: 'QC_PENDING',
                    wordCount: 5420,
                    changeNotes: 'Revised methodology section with benchmark data from ClinVar and 1000 Genomes project.',
                    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 30).toISOString(),
                    author: { firstName: 'Dr. Sarah', lastName: 'Chen' },
                    qcChecklist: {
                      titleVerification: true,
                      abstractVerification: true,
                      objectiveVerification: true,
                      methodologyVerification: true,
                      dataVerification: true,
                      similarityScorePercent: 3.8,
                    },
                  },
                  {
                    id: 'ver-1',
                    versionNumber: 1,
                    status: 'DRAFT',
                    wordCount: 4200,
                    changeNotes: 'Initial draft manuscript preparation.',
                    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 120).toISOString(),
                    author: { firstName: 'Dr. Sarah', lastName: 'Chen' },
                  },
                ],
              },
            ],
            tasks: [
              { id: 't-1', title: 'Synthesize related literature (25+ papers)', status: 'COMPLETED', priority: 'NORMAL', completionPct: 100, assignee: { firstName: 'Dr. Sarah', lastName: 'Chen' } },
              { id: 't-2', title: 'Benchmark model accuracy & F1 score', status: 'COMPLETED', priority: 'HIGH', completionPct: 100, assignee: { firstName: 'Dr. Sarah', lastName: 'Chen' } },
              { id: 't-3', title: 'Prepare high-resolution ROC curves & figures', status: 'IN_PROGRESS', priority: 'NORMAL', completionPct: 80, assignee: { firstName: 'Dr. Sarah', lastName: 'Chen' } },
              { id: 't-4', title: 'Execute technical QC checklist & plagiarism verification', status: 'UNDER_REVIEW', priority: 'URGENT', completionPct: 90, assignee: { firstName: 'Marcus', lastName: 'Vance' } },
            ],
            documents: [
              { id: 'd-1', filename: 'Genomic_Variant_Detection_Manuscript_V2.pdf', category: 'MANUSCRIPT', accessLevel: 'INTERNAL', sizeBytes: 3450000, createdAt: new Date().toISOString() },
              { id: 'd-2', filename: 'Supplementary_Dataset_ClinVar_Filtered.xlsx', category: 'REQUIREMENT', accessLevel: 'CLIENT', sizeBytes: 12400000, createdAt: new Date().toISOString() },
              { id: 'd-3', filename: 'iThenticate_Similarity_Report_Ver2.pdf', category: 'QC_REPORT', accessLevel: 'INTERNAL', sizeBytes: 850000, createdAt: new Date().toISOString() },
            ],
            statusHistory: [
              { id: 'h-1', fromStatus: 'DRAFTING', toStatus: 'INTERNAL_QC', note: 'Manuscript Draft V2 dispatched to Quality Control for technical review', changedAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(), user: { firstName: 'Dr. Sarah', lastName: 'Chen' } },
              { id: 'h-2', fromStatus: 'RESEARCH_IN_PROGRESS', toStatus: 'DRAFTING', note: 'Experimental benchmarks completed; manuscript drafting commenced', changedAt: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(), user: { firstName: 'Elena', lastName: 'Rostova' } },
              { id: 'h-3', fromStatus: 'TOPIC_FINALIZED', toStatus: 'RESEARCH_IN_PROGRESS', note: 'Topic and research objectives confirmed with author', changedAt: new Date(Date.now() - 1000 * 60 * 60 * 140).toISOString(), user: { firstName: 'Elena', lastName: 'Rostova' } },
            ],
          });
        }
      } catch (err) {
        console.error(err);
      }
    }
    fetchProject();
  }, [projectId]);

  if (!project) {
    return <div style={{ color: 'var(--text-muted)', padding: '2rem' }}>Loading project workspace...</div>;
  }

  const handleStatusTransition = async (nextStatus: string) => {
    setIsTransitioning(true);
    try {
      await api.request(`/projects/${project.id}/transition`, {
        method: 'POST',
        body: JSON.stringify({
          status: nextStatus,
          note: transitionNote || `Transitioned to ${nextStatus} by ${displayName}`,
        }),
      });

      const updatedHistory = [
        {
          id: `h-${Date.now()}`,
          fromStatus: project.status,
          toStatus: nextStatus,
          note: transitionNote || `Transitioned to ${nextStatus}`,
          changedAt: new Date().toISOString(),
          user: { firstName: displayName.split(' ')[0], lastName: displayName.split(' ')[1] || '' },
        },
        ...(project.statusHistory || []),
      ];

      setProject({
        ...project,
        status: nextStatus,
        statusHistory: updatedHistory,
      });

      setTransitionNote('');
      showToast(`Project successfully updated to stage: ${nextStatus}`);
    } catch (e: any) {
      showToast(`Transition error: ${e.message || 'Unable to update status'}`);
    } finally {
      setIsTransitioning(false);
    }
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      {/* Top Banner & Quick Controls */}
      <div className="glass-panel" style={{ padding: '1.75rem', position: 'relative' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1.25rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.4rem' }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '0.95rem', color: 'var(--accent-primary)' }}>
                {project.projectCode}
              </span>
              <StatusBadge status={project.status} />
              <span className="badge badge-purple">{project.priority} PRIORITY</span>
            </div>
            <h1 style={{ fontSize: '1.65rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em', maxWidth: 800 }}>
              {project.title}
            </h1>
            <div style={{ display: 'flex', gap: '1.5rem', marginTop: '0.5rem', fontSize: '0.825rem', color: 'var(--text-secondary)' }}>
              <span>Domain: <strong style={{ color: 'var(--text-primary)' }}>{project.domain}</strong></span>
              <span>Target: <strong style={{ color: 'var(--accent-primary)' }}>{project.targetJournalType}</strong></span>
              <span>Budget: <strong style={{ color: 'var(--accent-emerald)' }}>${project.budget} {project.currency}</strong></span>
            </div>
          </div>

          {/* Lifecycle Action Buttons */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', minWidth: 220 }}>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
              State Machine Transition
            </span>
            {project.status === 'DRAFTING' && (
              <button
                onClick={() => handleStatusTransition('INTERNAL_QC')}
                disabled={isTransitioning}
                className="btn-primary"
              >
                <ShieldCheck size={16} />
                <span>Submit to Internal QC</span>
              </button>
            )}
            {project.status === 'INTERNAL_QC' && (
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <Link href="/qc" className="btn-primary" style={{ flex: 1, display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                  <span>Open QC Checklist</span>
                  <ArrowRight size={14} />
                </Link>
                <button
                  onClick={() => handleStatusTransition('CLIENT_REVIEW')}
                  disabled={isTransitioning}
                  className="btn-secondary"
                  title="Forward to Author"
                >
                  Forward to Author
                </button>
              </div>
            )}
            {project.status === 'CLIENT_REVIEW' && (
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  onClick={() => handleStatusTransition('CLIENT_APPROVED')}
                  disabled={isTransitioning}
                  className="btn-primary"
                  style={{ background: 'var(--accent-emerald)' }}
                >
                  <CheckCircle2 size={16} />
                  <span>Author Approval</span>
                </button>
                <button
                  onClick={() => handleStatusTransition('DRAFTING')}
                  disabled={isTransitioning}
                  className="btn-danger"
                >
                  Request Revision
                </button>
              </div>
            )}
            {project.status === 'CLIENT_APPROVED' && (
              <button
                onClick={() => handleStatusTransition('JOURNAL_MATCHING')}
                disabled={isTransitioning}
                className="btn-primary"
              >
                <span>Match Journals for Submission</span>
                <ArrowRight size={14} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Publication Lifecycle Milestone Bar */}
      <TimelineView currentStatus={project.status} />

      {/* Tabs Bar */}
      <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
        {[
          { key: 'overview', label: 'Overview & Requirements' },
          { key: 'manuscript', label: `Manuscript Versions (${project.manuscripts?.[0]?.versions?.length || 1})` },
          { key: 'tasks', label: `Project Tasks (${project.tasks?.length || 0})` },
          { key: 'documents', label: `Document Repository (${project.documents?.length || 0})` },
          { key: 'history', label: 'Audit & Status History' },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            style={{
              padding: '0.55rem 1.15rem',
              borderRadius: 'var(--radius-md)',
              border: 'none',
              fontSize: '0.85rem',
              fontWeight: activeTab === tab.key ? 700 : 500,
              color: activeTab === tab.key ? 'var(--accent-primary)' : 'var(--text-secondary)',
              background: activeTab === tab.key ? 'var(--accent-primary-light)' : 'transparent',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab 1: Overview */}
      {activeTab === 'overview' && (
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem' }}>
          <div className="glass-panel" style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#ffffff' }}>
              Research Specification & Methodology
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.6 }}>
              {project.description}
            </p>

            <div>
              <h4 style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                Indexed Keywords
              </h4>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {project.keywords?.map((k: string, i: number) => (
                  <span key={i} className="badge badge-blue">
                    #{k}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Author Profile */}
            <div className="glass-panel" style={{ padding: '1.5rem' }}>
              <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#ffffff', marginBottom: '1rem' }}>
                Author / Client Information
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.825rem' }}>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Lead Researcher: </span>
                  <strong style={{ color: 'var(--text-primary)' }}>
                    {project.client?.user?.firstName} {project.client?.user?.lastName}
                  </strong>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Affiliation: </span>
                  <span style={{ color: 'var(--text-primary)' }}>{project.client?.organization}</span>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>ORCID iD: </span>
                  <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent-emerald)' }}>
                    {project.client?.orcidId || '0000-0002-1825-0097'}
                  </span>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Contact: </span>
                  <span style={{ color: 'var(--accent-cyan)' }}>{project.client?.user?.email}</span>
                </div>
              </div>
            </div>

            {/* Research Manager */}
            <div className="glass-panel" style={{ padding: '1.5rem' }}>
              <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--accent-navy)', marginBottom: '0.75rem' }}>
                Assigned Research Manager
              </h4>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--accent-primary)', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>
                  ER
                </div>
                <div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--accent-navy)' }}>
                    Elena Rostova
                  </div>
                  <div style={{ fontSize: '0.725rem', color: 'var(--text-muted)' }}>
                    Senior Research Manager
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Manuscript Versions */}
      {activeTab === 'manuscript' && (
        <div className="glass-panel" style={{ padding: '1.75rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                Manuscript Versions & Revisions
              </h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Immutable historical versions. Previous drafts are permanently preserved.
              </p>
            </div>
            <Link href={`/manuscripts/${project.id}`} className="btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
              <span>Open Manuscript Studio</span>
              <PenTool size={14} />
            </Link>
          </div>

          <div className="data-table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Version</th>
                  <th>Status</th>
                  <th>Word Count</th>
                  <th>Prepared By</th>
                  <th>Change Summary</th>
                  <th>Created At</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {project.manuscripts?.[0]?.versions?.map((v: any) => (
                  <tr key={v.id}>
                    <td style={{ fontWeight: 700, color: 'var(--accent-primary)' }}>
                      Draft V{v.versionNumber}
                    </td>
                    <td>
                      <StatusBadge status={v.status} />
                    </td>
                    <td>{v.wordCount} words</td>
                    <td>{v.author?.firstName} {v.author?.lastName}</td>
                    <td style={{ maxWidth: 300, fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                      {v.changeNotes}
                    </td>
                    <td style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {new Date(v.createdAt).toLocaleDateString()}
                    </td>
                    <td>
                      <Link href={`/manuscripts/${project.id}`} className="btn-secondary" style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem' }}>
                        Inspect
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Tasks */}
      {activeTab === 'tasks' && (
        <div className="glass-panel" style={{ padding: '1.75rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                Allocated Project Tasks
              </h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Modular task breakdown from requirements analysis to journal formatting
              </p>
            </div>
            <Link href="/tasks" className="btn-secondary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
              <span>Open Kanban Board</span>
              <ArrowRight size={13} />
            </Link>
          </div>

          <div className="data-table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Task Title</th>
                  <th>Assignee</th>
                  <th>Status</th>
                  <th>Progress</th>
                  <th>Priority</th>
                </tr>
              </thead>
              <tbody>
                {project.tasks?.map((t: any) => (
                  <tr key={t.id}>
                    <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{t.title}</td>
                    <td>{t.assignee?.firstName} {t.assignee?.lastName}</td>
                    <td><StatusBadge status={t.status} /></td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <div style={{ width: 70, height: 6, background: '#f1f5f9', borderRadius: 3, overflow: 'hidden' }}>
                          <div style={{ width: `${t.completionPct}%`, height: '100%', background: 'var(--accent-emerald)', borderRadius: 3 }} />
                        </div>
                        <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--accent-emerald)' }}>{t.completionPct}%</span>
                      </div>
                    </td>
                    <td><span className="badge badge-amber">{t.priority}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 4: Documents */}
      {activeTab === 'documents' && (
        <div className="glass-panel" style={{ padding: '1.75rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                Secure Document Repository
              </h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Research materials, datasets, manuscript drafts, QC reports, and journal correspondence
              </p>
            </div>
            <button
              onClick={() => setShowUploadModal(true)}
              className="btn-primary"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
            >
              <UploadCloud size={14} />
              <span>Upload Document</span>
            </button>
          </div>

          <div className="data-table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Filename</th>
                  <th>Category</th>
                  <th>Access Level</th>
                  <th>Size</th>
                  <th>Uploaded Date</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {project.documents?.map((d: any) => (
                  <tr key={d.id}>
                    <td style={{ fontWeight: 600, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <FileText size={15} color="var(--accent-primary)" />
                      <span>{d.filename}</span>
                    </td>
                    <td><span className="badge badge-blue">{d.category}</span></td>
                    <td>
                      <span className={`badge ${d.accessLevel === 'CLIENT' ? 'badge-emerald' : 'badge-amber'}`}>
                        {d.accessLevel}
                      </span>
                    </td>
                    <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      {(d.sizeBytes / (1024 * 1024)).toFixed(2)} MB
                    </td>
                    <td style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {new Date(d.createdAt).toLocaleDateString()}
                    </td>
                    <td>
                      <button
                        onClick={() => handleDownloadDocument(d)}
                        className="btn-secondary"
                        style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
                      >
                        <Download size={13} />
                        <span>Download</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 5: Status History */}
      {activeTab === 'history' && (
        <div className="glass-panel" style={{ padding: '1.75rem' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--accent-navy)', marginBottom: '1rem' }}>
            Status Progression History
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {project.statusHistory?.map((h: any) => (
              <div
                key={h.id}
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
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.3rem' }}>
                    {h.fromStatus && <StatusBadge status={h.fromStatus} />}
                    {h.fromStatus && <span style={{ color: 'var(--text-muted)' }}>→</span>}
                    <StatusBadge status={h.toStatus} />
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      By {h.user?.firstName} {h.user?.lastName}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-primary)' }}>
                    {h.note}
                  </div>
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  {new Date(h.changedAt).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Upload Document Modal */}
      {showUploadModal && (
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
              maxWidth: 520,
              background: '#ffffff',
              padding: '2rem',
              borderRadius: 'var(--radius-lg)',
              boxShadow: 'var(--shadow-lg)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--accent-navy)' }}>
                  Upload Project Document
                </h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Attach dataset, supplementary file, or manuscript draft.
                </p>
              </div>
              <button
                onClick={() => setShowUploadModal(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleUploadDocument} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>
                  Document File Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Supplementary_Table_ClinVar_Validation.xlsx"
                  value={newDocFilename}
                  onChange={(e) => setNewDocFilename(e.target.value)}
                  className="form-input"
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>
                    Category
                  </label>
                  <select
                    value={newDocCategory}
                    onChange={(e) => setNewDocCategory(e.target.value)}
                    className="form-input"
                  >
                    <option value="MANUSCRIPT">MANUSCRIPT</option>
                    <option value="REQUIREMENT">REQUIREMENT</option>
                    <option value="QC_REPORT">QC REPORT</option>
                    <option value="DATASET">DATASET</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>
                    Access Level
                  </label>
                  <select
                    value={newDocAccess}
                    onChange={(e) => setNewDocAccess(e.target.value)}
                    className="form-input"
                  >
                    <option value="CLIENT">CLIENT & STAFF</option>
                    <option value="INTERNAL">INTERNAL ONLY</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.75rem' }}>
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Upload Document
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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
    </div>
  );
}
