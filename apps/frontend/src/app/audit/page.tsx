'use client';

import React, { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import { Download, Eye, X, Check } from 'lucide-react';

export default function AuditTrailPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [filterEntity, setFilterEntity] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedLog, setSelectedLog] = useState<any | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

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

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const filteredLogs = logs.filter((log) => {
    if (!filterEntity) return true;
    return log.entity === filterEntity;
  });

  const handleExportCsv = () => {
    const csvHeader = 'Timestamp,OperatorEmail,Role,Action,Entity,IPAddress,Metadata\n';
    const csvRows = filteredLogs.map((l) => {
      const meta = JSON.stringify(l.metadata || {}).replace(/"/g, '""');
      return `"${l.createdAt}","${l.userEmail}","${l.userRole}","${l.action}","${l.entity}","${l.ipAddress}","${meta}"`;
    }).join('\n');

    const blob = new Blob([csvHeader + csvRows], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `scriptara_audit_trail_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    showToast(`Audit log CSV exported (${filteredLogs.length} records).`);
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
            System Audit Trail & Security Logs
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
            Cryptographically sealed audit trail capturing every mutating state change, permission grant, and QC gate decision.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.65rem', alignItems: 'center', flexWrap: 'wrap' }}>
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

          <button
            onClick={handleExportCsv}
            className="btn-primary"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
          >
            <Download size={15} />
            <span>Export CSV</span>
          </button>
        </div>
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
              <th>Metadata</th>
              <th>Inspect</th>
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
                  <span className="badge badge-blue">{log.userRole}</span>
                </td>
                <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--accent-navy)', fontWeight: 600 }}>
                  {log.action}
                </td>
                <td>
                  <span className="badge badge-cyan">{log.entity}</span>
                </td>
                <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  {log.ipAddress}
                </td>
                <td style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', maxWidth: 220, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  <code style={{ fontFamily: 'var(--font-mono)', background: 'var(--twine-1)', border: '1px solid var(--twine-2)', color: 'var(--accent-navy)', padding: '0.15rem 0.35rem', borderRadius: 4 }}>
                    {JSON.stringify(log.metadata || {})}
                  </code>
                </td>
                <td>
                  <button
                    onClick={() => setSelectedLog(log)}
                    className="btn-secondary"
                    style={{ padding: '0.3rem 0.6rem', fontSize: '0.7rem', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}
                  >
                    <Eye size={12} />
                    <span>View</span>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      )}

      {/* Inspect Audit Entry Modal */}
      {selectedLog && (
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
              maxWidth: 620,
              background: '#ffffff',
              padding: '2rem',
              borderRadius: 'var(--radius-lg)',
              boxShadow: 'var(--shadow-lg)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
              <div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--accent-navy)' }}>
                  Audit Record Inspection
                </h3>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Record ID: {selectedLog.id}
                </p>
              </div>
              <button
                onClick={() => setSelectedLog(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', fontSize: '0.8rem', marginBottom: '1.25rem' }}>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Action: </span>
                <strong style={{ color: 'var(--accent-navy)' }}>{selectedLog.action}</strong>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Entity: </span>
                <strong style={{ color: 'var(--text-primary)' }}>{selectedLog.entity}</strong>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Operator: </span>
                <span style={{ color: 'var(--text-primary)' }}>{selectedLog.userEmail}</span>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Role: </span>
                <span className="badge badge-blue">{selectedLog.userRole}</span>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>IP Address: </span>
                <span style={{ fontFamily: 'var(--font-mono)' }}>{selectedLog.ipAddress}</span>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Timestamp: </span>
                <span>{new Date(selectedLog.createdAt).toLocaleString()}</span>
              </div>
            </div>

            <div style={{ marginBottom: '1.25rem' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                Cryptographic Payload & Entity Mutation State:
              </div>
              <pre
                style={{
                  background: '#f8fafd',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-md)',
                  padding: '1rem',
                  fontSize: '0.75rem',
                  fontFamily: 'var(--font-mono)',
                  color: 'var(--accent-navy)',
                  overflowX: 'auto',
                  maxHeight: 220,
                  whiteSpace: 'pre-wrap',
                }}
              >
                {JSON.stringify(selectedLog.metadata || {}, null, 2)}
              </pre>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
              <button
                onClick={() => setSelectedLog(null)}
                className="btn-secondary"
              >
                Close Record
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

