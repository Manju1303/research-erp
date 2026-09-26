'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { api } from '../../lib/api';
import { StatusBadge } from '../../components/StatusBadge';
import { Edit3, Send, Clock, Plus, X, Check } from 'lucide-react';
import { useAuth } from '../../lib/auth-context';

export default function SubmissionsPage() {
  const { role } = useAuth();
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Modal States
  const [showNewModal, setShowNewModal] = useState(false);
  const [editingSub, setEditingSub] = useState<any | null>(null);

  // New Submission Form
  const [newJournal, setNewJournal] = useState('');
  const [newRefId, setNewRefId] = useState('');
  const [newProjectTitle, setNewProjectTitle] = useState('');
  const [newClientOrg, setNewClientOrg] = useState('Stanford University');
  const [newDate, setNewDate] = useState(new Date().toISOString().split('T')[0]);
  const [newContact, setNewContact] = useState('editorial@nature.com');
  const [newExpectedDate, setNewExpectedDate] = useState('2026-11-20');
  const [newStatus, setNewStatus] = useState('SUBMITTED');

  // Edit Submission Form
  const [editStatus, setEditStatus] = useState('');
  const [editNotes, setEditNotes] = useState('');
  const [editExpectedDate, setEditExpectedDate] = useState('');

  useEffect(() => {
    async function loadSubmissions() {
      try {
        const res: any = await api.request('/submissions');
        setSubmissions(Array.isArray(res) ? res : (Array.isArray(res?.data) ? res.data : []));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadSubmissions();
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleCreateSubmission = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newJournal || !newProjectTitle) return;

    const created = {
      id: `sub-${Date.now()}`,
      submissionRefId: newRefId || `SUB-${Date.now().toString().slice(-5)}`,
      status: newStatus,
      submissionDate: newDate,
      editorialContact: newContact,
      expectedResponseDate: newExpectedDate,
      journal: { name: newJournal },
      project: {
        title: newProjectTitle,
        client: { organization: newClientOrg },
      },
      revisions: [],
    };

    setSubmissions([created, ...submissions]);
    setShowNewModal(false);
    setNewJournal('');
    setNewProjectTitle('');
    setNewRefId('');
    showToast(`Journal submission logged for "${newJournal}". Ref ID: ${created.submissionRefId}`);
  };

  const handleOpenEditorialUpdate = (sub: any) => {
    setEditingSub(sub);
    setEditStatus(sub.status);
    setEditNotes(sub.notes || '');
    setEditExpectedDate(sub.expectedResponseDate || '2026-11-30');
  };

  const handleSaveEditorialUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSub) return;

    setSubmissions(
      submissions.map((s) => {
        if (s.id === editingSub.id) {
          const isRevision = editStatus === 'REVISION_REQUIRED';
          const updatedRevisions = isRevision
            ? [...(s.revisions || []), { date: new Date().toISOString(), note: editNotes }]
            : (s.revisions || []);

          return {
            ...s,
            status: editStatus,
            expectedResponseDate: editExpectedDate,
            revisions: updatedRevisions,
          };
        }
        return s;
      }),
    );

    showToast(`Editorial status updated to ${editStatus} for Ref ${editingSub.submissionRefId || editingSub.id}`);
    setEditingSub(null);
  };

  const filtered = submissions.filter((s) => !statusFilter || s.status === statusFilter);

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
            Journal Submission & Peer Review Tracker
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
            Coordinate manuscript submissions to external journal portals, track editorial check progression, and log reviewer feedback.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="form-input"
            style={{ width: 'auto', minWidth: 180 }}
          >
            <option value="">All Submission States</option>
            <option value="SUBMITTED">Submitted</option>
            <option value="UNDER_REVIEW">Under Review</option>
            <option value="REVISION_REQUIRED">Revision Required</option>
            <option value="ACCEPTED">Accepted</option>
            <option value="PUBLISHED">Published</option>
          </select>

          {role !== 'client' && (
            <button
              onClick={() => setShowNewModal(true)}
              className="btn-primary"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
            >
              <Plus size={15} />
              <span>Record New Submission</span>
            </button>
          )}
        </div>
      </div>

      {/* Submissions Table */}
      <div className="data-table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Journal & Ref ID</th>
              <th>Research Project & Author</th>
              <th>Status</th>
              <th>Submission Date</th>
              <th>Editorial Contact</th>
              <th>Expected Response</th>
              <th>Revisions</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={8} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                    <Clock size={16} className="animate-spin" />
                    <span>Loading submissions pipeline...</span>
                  </div>
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={8} style={{ textAlign: 'center', padding: '3.5rem 1rem', color: 'var(--text-muted)' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'var(--accent-primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-navy)' }}>
                      <Send size={20} />
                    </div>
                    <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.95rem' }}>
                      No submissions found
                    </div>
                    <div style={{ fontSize: '0.8rem', maxWidth: 380, color: 'var(--text-secondary)' }}>
                      Active projects that pass internal QC and author review will appear here when submitted to targeted journals.
                    </div>
                  </div>
                </td>
              </tr>
            ) : (
              filtered.map((s) => (
                <tr key={s.id}>
                  <td>
                    <div style={{ fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.2rem' }}>
                      {s.journal?.name}
                    </div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--accent-primary)', fontWeight: 600 }}>
                      Ref: {s.submissionRefId || 'Pending Ref'}
                    </div>
                  </td>
                  <td>
                    <Link href={`/projects/proj-1`} style={{ fontWeight: 600, color: 'var(--accent-navy)', display: 'block' }}>
                      {s.project?.title || 'Genomic Variant Detection'}
                    </Link>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {s.project?.client?.organization || 'Stanford University'}
                    </span>
                  </td>
                  <td>
                    <StatusBadge status={s.status} />
                  </td>
                  <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    {s.submissionDate}
                  </td>
                  <td style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    {s.editorialContact}
                  </td>
                  <td style={{ fontSize: '0.8rem', color: 'var(--accent-navy)', fontWeight: 600 }}>
                    {s.expectedResponseDate}
                  </td>
                  <td>
                    <span className="badge badge-blue">
                      Cycle #{s.revisions?.length || 1}
                    </span>
                  </td>
                  <td>
                    <button
                      onClick={() => handleOpenEditorialUpdate(s)}
                      className="btn-secondary"
                      style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
                    >
                      <Edit3 size={13} />
                      <span>Editorial Update</span>
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Record New Submission Modal */}
      {showNewModal && (
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
                  Record Journal Submission
                </h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Log manuscript submission reference ID, journal details, and editorial contacts.
                </p>
              </div>
              <button
                onClick={() => setShowNewModal(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateSubmission} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>
                  Target Journal *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. IEEE Transactions on Medical Imaging"
                  value={newJournal}
                  onChange={(e) => setNewJournal(e.target.value)}
                  className="form-input"
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>
                  Project Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Deep Learning Approaches in Somatic Variant Detection"
                  value={newProjectTitle}
                  onChange={(e) => setNewProjectTitle(e.target.value)}
                  className="form-input"
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>
                    Submission Reference ID
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. TMI-2026-0914"
                    value={newRefId}
                    onChange={(e) => setNewRefId(e.target.value)}
                    className="form-input"
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>
                    Initial Status
                  </label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value)}
                    className="form-input"
                  >
                    <option value="SUBMITTED">SUBMITTED</option>
                    <option value="UNDER_REVIEW">UNDER REVIEW</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>
                    Submission Date
                  </label>
                  <input
                    type="date"
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                    className="form-input"
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>
                    Expected Response Date
                  </label>
                  <input
                    type="date"
                    value={newExpectedDate}
                    onChange={(e) => setNewExpectedDate(e.target.value)}
                    className="form-input"
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>
                    Editorial Contact Email
                  </label>
                  <input
                    type="email"
                    value={newContact}
                    onChange={(e) => setNewContact(e.target.value)}
                    className="form-input"
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>
                    Client Organization
                  </label>
                  <input
                    type="text"
                    value={newClientOrg}
                    onChange={(e) => setNewClientOrg(e.target.value)}
                    className="form-input"
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.75rem' }}>
                <button
                  type="button"
                  onClick={() => setShowNewModal(false)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Record Submission
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Editorial Update Modal */}
      {editingSub && (
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
              maxWidth: 540,
              background: '#ffffff',
              padding: '2rem',
              borderRadius: 'var(--radius-lg)',
              boxShadow: 'var(--shadow-lg)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--accent-navy)' }}>
                  Editorial Status Update
                </h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Ref: <strong style={{ color: 'var(--accent-navy)' }}>{editingSub.submissionRefId || 'Pending'}</strong> • {editingSub.journal?.name}
                </p>
              </div>
              <button
                onClick={() => setEditingSub(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveEditorialUpdate} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>
                  Update Submission Status *
                </label>
                <select
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value)}
                  className="form-input"
                  style={{ fontWeight: 600 }}
                >
                  <option value="SUBMITTED">SUBMITTED (Initial Check)</option>
                  <option value="UNDER_REVIEW">UNDER REVIEW (Peer Review Active)</option>
                  <option value="REVISION_REQUIRED">REVISION REQUIRED (Major/Minor Revisions)</option>
                  <option value="ACCEPTED">ACCEPTED (Camera Ready)</option>
                  <option value="PUBLISHED">PUBLISHED (Final DOI Live)</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>
                  Editorial Remarks & Reviewer Feedback:
                </label>
                <textarea
                  rows={4}
                  placeholder="Paste editor decision letter, reviewer comments, or required changes..."
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  className="form-input"
                  style={{ fontSize: '0.825rem' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>
                  Next Expected Response Date:
                </label>
                <input
                  type="date"
                  value={editExpectedDate}
                  onChange={(e) => setEditExpectedDate(e.target.value)}
                  className="form-input"
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.75rem' }}>
                <button
                  type="button"
                  onClick={() => setEditingSub(null)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Save Editorial Update
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

