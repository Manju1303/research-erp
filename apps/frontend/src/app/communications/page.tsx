'use client';

import React, { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import { Reply, Plus, X, Check } from 'lucide-react';

export default function CommunicationsPage() {
  const [messages, setMessages] = useState<any[]>([]);
  const [typeFilter, setTypeFilter] = useState('');
  const [showCompose, setShowCompose] = useState(false);
  const [newType, setNewType] = useState('CLIENT_COMMENT');
  const [newSubject, setNewSubject] = useState('');
  const [newBody, setNewBody] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  useEffect(() => {
    async function loadCommunications() {
      try {
        const res: any = await api.request('/communications');
        setMessages(Array.isArray(res) ? res : (Array.isArray(res?.data) ? res.data : []));
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
      project: { projectCode: 'SCR-2026-001' },
      user: { firstName: 'You', lastName: '' },
    };
    setMessages([created, ...messages]);
    setShowCompose(false);
    setNewSubject('');
    setNewBody('');
    showToast(`Communication note logged successfully!`);
  };

  const handleReply = (msg: any) => {
    setNewSubject(`Re: ${msg.subject || 'Communication Note'}`);
    setNewType(msg.type);
    setNewBody(`> On ${new Date(msg.createdAt).toLocaleDateString()}, ${msg.user?.firstName || 'User'} wrote:\n> ${msg.body.slice(0, 100)}...\n\n`);
    setShowCompose(true);
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

      {/* Top Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.65rem', fontWeight: 800, color: 'var(--accent-navy)', letterSpacing: '-0.02em' }}>
            Multi-Channel Communication Management
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
            Centralizes author inquiries, editorial remarks, peer reviewer feedback, and internal staff coordination notes.
          </p>
        </div>

        <button onClick={() => setShowCompose(true)} className="btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
          <Plus size={16} />
          <span>Log Communication / Note</span>
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
              background: typeFilter === t.key ? 'var(--accent-primary-light)' : '#ffffff',
              border: typeFilter === t.key ? '1px solid var(--accent-primary)' : '1px solid var(--border-color)',
              color: typeFilter === t.key ? 'var(--accent-primary)' : 'var(--text-secondary)',
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
              background: '#ffffff',
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

            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              {msg.subject || 'Communication Notice'}
            </h3>

            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', lineHeight: 1.6 }}>
              {msg.body}
            </p>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '0.5rem', borderTop: '1px solid #f1f5f9', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              <span>Recorded by: <strong>{msg.user?.firstName} {msg.user?.lastName}</strong></span>
              <button
                onClick={() => handleReply(msg)}
                className="btn-secondary"
                style={{ padding: '0.25rem 0.65rem', fontSize: '0.7rem', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}
              >
                <Reply size={12} />
                <span>Reply / Follow-up</span>
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
            backgroundColor: 'rgba(15, 23, 42, 0.5)',
            backdropFilter: 'blur(6px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100,
            padding: '1.5rem',
          }}
        >
          <div className="glass-panel" style={{ width: '100%', maxWidth: 580, padding: '2rem', background: '#ffffff', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-lg)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                Log Communication or Internal Note
              </h3>
              <button onClick={() => setShowCompose(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                <X size={18} />
              </button>
            </div>
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
