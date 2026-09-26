'use client';

import React, { useState, useEffect } from 'react';
import { api } from '../../lib/api';

export default function AuditTrailPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [filterEntity, setFilterEntity] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadLogs() {
      try {
        const res: any = await api.request('/audit-logs');
        setLogs(Array.isArray(res) ? res : (Array.isArray(res?.data) ? res.data : []));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadLogs();
  }, []);

  const filteredLogs = logs.filter((log) => {
    if (!filterEntity) return true;
    return log.entity === filterEntity;
  });

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      {/* Top Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.65rem', fontWeight: 800, color: 'var(--accent-navy)', letterSpacing: '-0.02em' }}>
            System Audit Trail & Security Logs
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
            Cryptographically sealed audit trail capturing every mutating state change, permission grant, and QC gate decision.
          </p>
        </div>

        <select
          value={filterEntity}
          onChange={(e) => setFilterEntity(e.target.value)}
          className="form-input"
          style={{ width: 'auto', minWidth: 190 }}
        >
          <option value="">All Entity Audit Logs</option>
          <option value="Project">Projects</option>
          <option value="ManuscriptVersion">Manuscript Versions</option>
          <option value="ProjectStaff">Staff Assignments</option>
          <option value="User">User Accounts</option>
        </select>
      </div>

      {/* Audit Logs Table */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>Loading audit trail...</div>
      ) : (
      <div className="data-table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Timestamp (UTC)</th>
              <th>Operator</th>
              <th>Role</th>
              <th>Action Executed</th>
              <th>Entity</th>
              <th>IP Address</th>
              <th>Audit Metadata</th>
            </tr>
          </thead>
          <tbody>
            {filteredLogs.map((log) => (
              <tr key={log.id}>
                <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                  {new Date(log.createdAt).toISOString().replace('T', ' ').slice(0, 19)}
                </td>
                <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                  {log.userEmail}
                </td>
                <td>
                  <span className="badge badge-purple">{log.userRole}</span>
                </td>
                <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--accent-primary)', fontWeight: 600 }}>
                  {log.action}
                </td>
                <td>
                  <span className="badge badge-blue">{log.entity}</span>
                </td>
                <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  {log.ipAddress}
                </td>
                <td style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', maxWidth: 280 }}>
                  <code style={{ fontFamily: 'var(--font-mono)', background: '#f1f5f9', border: '1px solid #e2e8f0', color: '#334155', padding: '0.2rem 0.4rem', borderRadius: 4 }}>
                    {JSON.stringify(log.metadata || {})}
                  </code>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      )}
    </div>
  );
}
