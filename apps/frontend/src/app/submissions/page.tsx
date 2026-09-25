'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { api } from '../../lib/api';
import { StatusBadge } from '../../components/StatusBadge';
import { Edit3, Send, Clock } from 'lucide-react';

export default function SubmissionsPage() {
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadSubmissions() {
      try {
        const res: any = await api.request('/submissions');
        setSubmissions(res?.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadSubmissions();
  }, []);

  const filtered = submissions.filter((s) => !statusFilter || s.status === statusFilter);

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      {/* Top Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.35rem' }}>
            <span className="badge badge-purple">External Editorial Operations</span>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Editorial & Peer Review Tracking</span>
          </div>
          <h1 style={{ fontSize: '1.65rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
            Journal Submission & Peer Review Tracker
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
            Coordinate manuscript submissions to external journal portals, track editorial check progression, and log reviewer feedback.
          </p>
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="form-input"
          style={{ width: 'auto', minWidth: 200 }}
        >
          <option value="">All Submission States</option>
          <option value="SUBMITTED">Submitted</option>
          <option value="UNDER_REVIEW">Under Review</option>
          <option value="REVISION_REQUIRED">Revision Required</option>
          <option value="ACCEPTED">Accepted</option>
          <option value="PUBLISHED">Published</option>
        </select>
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
                    <div style={{ width: 44, height: 44, borderRadius: '50%', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
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
                    <Link href={`/projects/proj-1`} style={{ fontWeight: 600, color: 'var(--text-primary)', display: 'block' }}>
                      {s.project?.title}
                    </Link>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {s.project?.client?.organization}
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
                  <td style={{ fontSize: '0.8rem', color: 'var(--accent-amber)', fontWeight: 600 }}>
                    {s.expectedResponseDate}
                  </td>
                  <td>
                    <span className="badge badge-amber">
                      Cycle #{s.revisions?.length || 1}
                    </span>
                  </td>
                  <td>
                    <button className="btn-secondary" style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem', gap: '0.35rem' }}>
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
    </div>
  );
}
