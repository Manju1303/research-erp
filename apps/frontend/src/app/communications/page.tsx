'use client';

import React, { useState, useEffect } from 'react';
import { api } from '../../lib/api';

export default function CommunicationsPage() {
  const [messages, setMessages] = useState<any[]>([]);
  const [typeFilter, setTypeFilter] = useState('');
  const [showCompose, setShowCompose] = useState(false);
  const [newType, setNewType] = useState('CLIENT_COMMENT');
  const [newSubject, setNewSubject] = useState('');
  const [newBody, setNewBody] = useState('');

  useEffect(() => {
    async function loadCommunications() {
      try {
        const res: any = await api.request('/communications');
        setMessages(res?.data || []);
      } catch (err) {
        console.error(err);
      }
    }
    loadCommunications();
  }, []);

  const filtered = messages.filter((m) => !typeFilter || m.type === typeFilter);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    const created = {
      id: `comm-${Date.now()}`,
      type: newType,
      subject: newSubject,
      body: newBody,
      createdAt: new Date().toISOString(),
      project: { projectCode: 'INZ-2026-001' },
      user: { firstName: 'You', lastName: '' },
    };
    setMessages([created, ...messages]);
    setShowCompose(false);
    setNewSubject('');
    setNewBody('');
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      {/* Top Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.3rem' }}>
            <span className="badge badge-blue">Centralized Correspondence</span>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Project-Linked Message Hub</span>
          </div>
          <h1 style={{ fontSize: '1.65rem', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.02em' }}>
            Multi-Channel Communication Management
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: '0.2rem' }}>
            Centralizes author inquiries, editorial remarks, peer reviewer feedback, and internal staff coordination notes.
          </p>
        </div>

        <button onClick={() => setShowCompose(true)} className="btn-primary">
          + Log Communication / Note
        </button>
      </div>

      {/* Filter Bar */}
      <div className="glass-panel" style={{ padding: '1rem 1.25rem', display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
        {[
          { key: '', label: 'All Messages' },
          { key: 'JOURNAL_COMMUNICATION', label: 'Journal & Editorial' },
          { key: 'CLIENT_COMMENT', label: 'Client / Author' },
          { key: 'INTERNAL_NOTE', label: 'Internal Staff Notes' },
        ].map((t) => (
          <button
            key={t.key}
            onClick={() => setTypeFilter(t.key)}
            className="btn-secondary"
            style={{
              padding: '0.4rem 0.85rem',
              fontSize: '0.75rem',
              background: typeFilter === t.key ? 'rgba(59, 130, 246, 0.25)' : 'rgba(255,255,255,0.03)',
              border: typeFilter === t.key ? '1px solid var(--accent-blue)' : '1px solid var(--border-color)',
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Messages Stream */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {filtered.map((msg) => (
          <div
            key={msg.id}
            className="glass-panel"
            style={{
              padding: '1.5rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.75rem',
              borderLeft:
                msg.type === 'JOURNAL_COMMUNICATION'
                  ? '4px solid var(--accent-purple)'
                  : msg.type === 'INTERNAL_NOTE'
                  ? '4px solid var(--accent-amber)'
                  : '4px solid var(--accent-cyan)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <span className={`badge ${msg.type === 'INTERNAL_NOTE' ? 'badge-amber' : msg.type === 'JOURNAL_COMMUNICATION' ? 'badge-purple' : 'badge-cyan'}`}>
                  {msg.type.replace(/_/g, ' ')}
                </span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  {msg.project?.projectCode}
                </span>
              </div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                {new Date(msg.createdAt).toLocaleString()}
              </span>
            </div>

            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#ffffff' }}>
              {msg.subject || 'Communication Notice'}
            </h3>

            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', lineHeight: 1.6 }}>
              {msg.body}
            </p>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '0.5rem', borderTop: '1px solid rgba(255,255,255,0.04)', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              <span>Recorded by: <strong>{msg.user?.firstName} {msg.user?.lastName}</strong></span>
              <button className="btn-secondary" style={{ padding: '0.25rem 0.65rem', fontSize: '0.7rem' }}>
                Reply / Follow-up ↩
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Compose Modal */}
      {showCompose && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100,
            padding: '1.5rem',
          }}
        >
          <div className="glass-panel" style={{ width: '100%', maxWidth: 580, padding: '2rem', background: '#0d1527' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#ffffff', marginBottom: '1rem' }}>
              Log Communication or Internal Note
            </h3>
            <form onSubmit={handleSendMessage} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.3rem' }}>
                  Channel Type
                </label>
                <select
                  value={newType}
                  onChange={(e) => setNewType(e.target.value)}
                  className="form-input"
                >
                  <option value="CLIENT_COMMENT">Client / Author Comment</option>
                  <option value="JOURNAL_COMMUNICATION">Journal Editorial Feedback</option>
                  <option value="INTERNAL_NOTE">Internal Confidential Staff Note</option>
                  <option value="REVISION_COMMUNICATION">Revision Instructions</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.3rem' }}>
                  Subject / Heading
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Editorial inquiry on supplementary table 4"
                  value={newSubject}
                  onChange={(e) => setNewSubject(e.target.value)}
                  className="form-input"
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.3rem' }}>
                  Communication Message Body
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="Enter full communication text..."
                  value={newBody}
                  onChange={(e) => setNewBody(e.target.value)}
                  className="form-input"
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button type="button" onClick={() => setShowCompose(false)} className="btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Log Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
