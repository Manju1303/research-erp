'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { api } from '../../lib/api';
import { StatusBadge } from '../../components/StatusBadge';
import { useAuth } from '../../lib/auth-context';
import { Search, Plus, ArrowRight, X, Clock, FolderKanban } from 'lucide-react';

export default function ProjectsPage() {
  const { role } = useAuth();
  const [projects, setProjects] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // New Project Form State
  const [newTitle, setNewTitle] = useState('');
  const [newDomain, setNewDomain] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newPriority, setNewPriority] = useState('NORMAL');
  const [newBudget, setNewBudget] = useState('3500');
  const [newTargetJournal, setNewTargetJournal] = useState('Scopus Q1 / WoS');
  const [newKeywords, setNewKeywords] = useState('');

  useEffect(() => {
    loadProjects();
  }, [role, statusFilter, priorityFilter]);

  async function loadProjects() {
    setLoading(true);
    try {
      const res: any = await api.request('/projects');
      let list = Array.isArray(res) ? res : (Array.isArray(res?.data) ? res.data : []);
      if (statusFilter) {
        list = list.filter((p: any) => p.status === statusFilter);
      }
      if (priorityFilter) {
        list = list.filter((p: any) => p.priority === priorityFilter);
      }
      setProjects(list);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  const filteredProjects = projects.filter((p) => {
    if (!search) return true;
    const term = search.toLowerCase();
    return (
      p.title?.toLowerCase().includes(term) ||
      p.projectCode?.toLowerCase().includes(term) ||
      p.domain?.toLowerCase().includes(term) ||
      p.client?.organization?.toLowerCase().includes(term)
    );
  });

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.request('/projects', {
        method: 'POST',
        body: JSON.stringify({
          title: newTitle,
          domain: newDomain,
          description: newDescription,
          priority: newPriority,
          budget: parseFloat(newBudget) || 0,
          targetJournalType: newTargetJournal,
          keywords: newKeywords.split(',').map((k) => k.trim()).filter(Boolean),
          clientId: 'c-1',
        }),
      });

      // Add to local state
      const createdItem = {
        id: `proj-${Date.now()}`,
        projectCode: `SCR-2026-${String(projects.length + 1).padStart(3, '0')}`,
        title: newTitle,
        domain: newDomain,
        priority: newPriority,
        status: 'REQUIREMENT_SUBMITTED',
        budget: parseFloat(newBudget) || 0,
        currency: 'USD',
        createdAt: new Date().toISOString(),
        client: {
          organization: 'Stanford University',
          user: { firstName: 'Dr. John', lastName: 'Reynolds', email: 'reynolds@stanford.edu' },
        },
        _count: { tasks: 0, manuscripts: 0, documents: 0 },
      };

      setProjects([createdItem, ...projects]);
      setShowModal(false);
      showToast(`Research project "${newTitle.slice(0, 32)}..." registered successfully!`);
      setNewTitle('');
      setNewDomain('');
      setNewDescription('');
    } catch (err: any) {
      showToast(`Could not create project: ${err.message || 'Server error'}`);
    }
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Top Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.65rem', fontWeight: 800, color: 'var(--accent-navy)', letterSpacing: '-0.02em' }}>
            Research Projects Repository
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: '0.2rem' }}>
            Comprehensive directory of all client requirements, allocated research manuscripts, and publication progress.
          </p>
        </div>

        <button onClick={() => setShowModal(true)} className="btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
          <Plus size={16} />
          <span>{role === 'client' ? 'Submit Research Requirement' : 'Initiate Research Project'}</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="glass-panel" style={{ padding: '1.25rem', display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ flex: 1, minWidth: 260, position: 'relative' }}>
          <input
            type="text"
            placeholder="Search by Title, Code, Domain, or Client University..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="form-input"
            style={{ paddingLeft: '2.3rem' }}
          />
          <span style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', display: 'flex', alignItems: 'center' }}>
            <Search size={16} />
          </span>
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="form-input"
          style={{ width: 'auto', minWidth: 170, cursor: 'pointer' }}
        >
          <option value="">All Lifecycle Stages</option>
          <option value="REQUIREMENT_SUBMITTED">Requirement Submitted</option>
          <option value="TOPIC_FINALIZED">Topic Finalized</option>
          <option value="RESEARCH_IN_PROGRESS">Research In Progress</option>
          <option value="DRAFTING">Drafting</option>
          <option value="INTERNAL_QC">Internal QC</option>
          <option value="CLIENT_REVIEW">Client Review</option>
          <option value="CLIENT_APPROVED">Client Approved</option>
        </select>

        <select
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value)}
          className="form-input"
          style={{ width: 'auto', minWidth: 140, cursor: 'pointer' }}
        >
          <option value="">All Priorities</option>
          <option value="LOW">Low</option>
          <option value="NORMAL">Normal</option>
          <option value="HIGH">High</option>
          <option value="URGENT">Urgent</option>
        </select>
      </div>

      {/* Projects Table */}
      <div className="data-table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Project Code</th>
              <th>Research Title & Domain</th>
              <th>Author / Institution</th>
              <th>Stage / Status</th>
              <th>Priority</th>
              <th>Target Indexing</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                    <Clock size={16} className="animate-spin" />
                    <span>Loading projects...</span>
                  </div>
                </td>
              </tr>
            ) : filteredProjects.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: '3.5rem 1rem', color: 'var(--text-muted)' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{ width: 44, height: 44, borderRadius: '50%', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
                      <FolderKanban size={20} />
                    </div>
                    <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>No research projects found</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Try adjusting your search query or lifecycle filters.</div>
                  </div>
                </td>
              </tr>
            ) : (
              filteredProjects.map((p) => (
                <tr key={p.id}>
                  <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--accent-primary)' }}>
                    {p.projectCode}
                  </td>
                  <td>
                    <Link href={`/projects/${p.id}`} style={{ fontWeight: 600, color: 'var(--text-primary)', display: 'block', marginBottom: '0.2rem' }}>
                      {p.title}
                    </Link>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {p.domain}
                    </span>
                  </td>
                  <td>
                    <div style={{ color: 'var(--text-primary)', fontWeight: 500 }}>
                      {p.client?.user ? `${p.client.user.firstName} ${p.client.user.lastName}` : 'Lead Author'}
                    </div>
                    <div style={{ fontSize: '0.725rem', color: 'var(--text-muted)' }}>
                      {p.client?.organization}
                    </div>
                  </td>
                  <td>
                    <StatusBadge status={p.status} />
                  </td>
                  <td>
                    <span
                      style={{
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        color: p.priority === 'URGENT' ? 'var(--accent-rose)' : p.priority === 'HIGH' ? 'var(--accent-amber)' : 'var(--accent-blue)',
                      }}
                    >
                      {p.priority}
                    </span>
                  </td>
                  <td style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    {p.targetJournalType || 'Scopus / WoS'}
                  </td>
                  <td>
                    <Link
                      href={`/projects/${p.id}`}
                      className="btn-secondary"
                      style={{ padding: '0.4rem 0.85rem', fontSize: '0.75rem', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
                    >
                      <span>Workspace</span>
                      <ArrowRight size={13} />
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* New Project Modal */}
      {showModal && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.5)',
            backdropFilter: 'blur(6px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100,
            padding: '1.5rem',
          }}
        >
          <div
            className="glass-panel animate-fade-in"
            style={{
              width: '100%',
              maxWidth: 680,
              padding: '2rem',
              maxHeight: '90vh',
              overflowY: 'auto',
              background: '#ffffff',
              border: '1px solid var(--border-color)',
              boxShadow: 'var(--shadow-lg)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--accent-navy)' }}>
                  {role === 'client' ? 'Submit New Research Requirement' : 'Initiate Research Project'}
                </h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  {role === 'client'
                    ? 'Submit your research hypothesis, target journal tier, and study objectives to our editorial team.'
                    : 'Collect full research requirement specifications and target indexing criteria.'}
                </p>
              </div>
              <button
                onClick={() => setShowModal(false)}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateProject} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.775rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
                  Proposed Research Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Scalable Federated Learning Algorithms for Biomedical Edge Devices"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="form-input"
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.775rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
                    Research Domain *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Distributed Computing & Artificial Intelligence"
                    value={newDomain}
                    onChange={(e) => setNewDomain(e.target.value)}
                    className="form-input"
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.775rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
                    Priority
                  </label>
                  <select
                    value={newPriority}
                    onChange={(e) => setNewPriority(e.target.value)}
                    className="form-input"
                  >
                    <option value="LOW">Low</option>
                    <option value="NORMAL">Normal</option>
                    <option value="HIGH">High</option>
                    <option value="URGENT">Urgent (Expedited)</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.775rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
                  Research Problem & Methodology Abstract
                </label>
                <textarea
                  rows={3}
                  placeholder="Outline the core research gap, objective, dataset availability, and proposed methodology..."
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  className="form-input"
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.775rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
                    Target Journal / Indexing Requirements
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Scopus Q1, Web of Science (SCIE)"
                    value={newTargetJournal}
                    onChange={(e) => setNewTargetJournal(e.target.value)}
                    className="form-input"
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.775rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
                    Project Budget ($ USD)
                  </label>
                  <input
                    type="number"
                    placeholder="3500"
                    value={newBudget}
                    onChange={(e) => setNewBudget(e.target.value)}
                    className="form-input"
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.775rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
                  Keywords (comma separated)
                </label>
                <input
                  type="text"
                  placeholder="Federated Learning, Edge Computing, Privacy Preservation, Genomics"
                  value={newKeywords}
                  onChange={(e) => setNewKeywords(e.target.value)}
                  className="form-input"
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Create Project Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toastMessage && (
        <div
          className="animate-fade-in"
          style={{
            position: 'fixed',
            bottom: '2rem',
            right: '2rem',
            zIndex: 9999,
            backgroundColor: 'var(--accent-navy)',
            color: '#ffffff',
            padding: '0.85rem 1.25rem',
            borderRadius: 'var(--radius-md)',
            boxShadow: 'var(--shadow-lg)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.65rem',
            fontSize: '0.875rem',
            fontWeight: 500,
            border: '1px solid var(--accent-ice)',
          }}
        >
          <div
            style={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              backgroundColor: 'var(--accent-ice)',
              boxShadow: '0 0 8px var(--accent-ice)',
            }}
          />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
