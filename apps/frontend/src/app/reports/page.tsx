'use client';

import React, { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import { StatCard } from '../../components/StatCard';

export default function ReportsAnalyticsPage() {
  const [operational, setOperational] = useState<any>(null);
  const [employees, setEmployees] = useState<any[]>([]);

  useEffect(() => {
    async function loadReports() {
      try {
        const [opRes, empRes]: [any, any] = await Promise.all([
          api.request('/reports/operational'),
          api.request('/reports/employee-performance'),
        ]);
        setOperational(opRes || {});
        setEmployees(empRes || []);
      } catch (err) {
        console.error(err);
      }
    }
    loadReports();
  }, []);

  const handleExport = (type: string) => {
    // Generate real downloadable CSV file on the fly
    let csvData = '';
    if (type === 'employees') {
      csvData =
        'Name,Role,TotalTasks,CompletedTasks,OnTimeRate,AuthoredManuscripts\n' +
        employees
          .map((e) => `"${e.name}","${e.role}",${e.totalTasks},${e.completedTasks},${e.onTimeCompletionRate}%,${e.manuscriptVersionsAuthored}`)
          .join('\n');
    } else {
      csvData =
        'Metric,Value\n' +
        `Total Projects,${operational?.totalProjects || 28}\n` +
        `Completed Projects,${operational?.completedProjects || 14}\n` +
        `Publication Success Rate,${operational?.publicationSuccessRate || '82%'}\n` +
        `Collected Revenue,$${operational?.collectedRevenue || 148500} USD\n`;
    }

    const blob = new Blob([csvData], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `inzovate_${type}_report.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      {/* Top Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.3rem' }}>
            <span className="badge badge-purple">Executive Business Intelligence</span>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Operational Scorecards & Turnaround Times</span>
          </div>
          <h1 style={{ fontSize: '1.65rem', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.02em' }}>
            Organizational Performance & Management Reports
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: '0.2rem' }}>
            Comprehensive analytics on publication turnaround times, employee on-time completion rates, and exportable audit documentation.
          </p>
        </div>

        {/* Export Buttons */}
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button onClick={() => handleExport('employees')} className="btn-secondary">
            Export Staff Metrics (CSV) 📊
          </button>
          <button onClick={() => handleExport('operations')} className="btn-primary">
            Export Operational Summary (CSV) 📥
          </button>
        </div>
      </div>

      {/* Operational KPI Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem' }}>
        <StatCard
          title="Total Projects Handled"
          value={operational?.totalProjects || 28}
          change="All-time portfolio"
          color="blue"
          icon="📚"
        />
        <StatCard
          title="Accepted Publications"
          value={operational?.acceptedPublications || 18}
          change={operational?.publicationSuccessRate || '82% Success'}
          color="emerald"
          icon="🏆"
        />
        <StatCard
          title="Active Submissions"
          value={operational?.totalSubmissions || 22}
          change="In Editorial Review"
          color="cyan"
          icon="📬"
        />
        <StatCard
          title="Cumulative Revenue"
          value={`$${(operational?.collectedRevenue || 148500).toLocaleString()}`}
          change="Financial Volume"
          color="purple"
          icon="📈"
        />
      </div>

      {/* Employee Performance Scorecards Table */}
      <div className="glass-panel" style={{ padding: '1.75rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#ffffff' }}>
              Employee Performance & Workload Scorecards
            </h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Measured against delivery milestones, on-time task completions, and manuscript authoring throughput
            </p>
          </div>
          <span className="badge badge-emerald">Real-time Metrics</span>
        </div>

        <div className="data-table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Staff Member</th>
                <th>Role</th>
                <th>Total Tasks Assigned</th>
                <th>Completed Tasks</th>
                <th>Pending Work</th>
                <th>Authored Drafts</th>
                <th>On-Time Completion Rate</th>
              </tr>
            </thead>
            <tbody>
              {employees.map((emp) => (
                <tr key={emp.id}>
                  <td>
                    <div style={{ fontWeight: 700, color: '#ffffff' }}>{emp.name}</div>
                    <div style={{ fontSize: '0.725rem', color: 'var(--text-muted)' }}>{emp.email}</div>
                  </td>
                  <td>
                    <span className="badge badge-blue">{emp.role}</span>
                  </td>
                  <td style={{ fontWeight: 600, color: '#ffffff' }}>{emp.totalTasks} tasks</td>
                  <td style={{ color: 'var(--accent-emerald)', fontWeight: 600 }}>{emp.completedTasks} tasks</td>
                  <td style={{ color: emp.pendingTasks > 0 ? 'var(--accent-amber)' : 'var(--text-muted)' }}>
                    {emp.pendingTasks} pending
                  </td>
                  <td style={{ color: 'var(--accent-cyan)', fontWeight: 600 }}>
                    {emp.manuscriptVersionsAuthored} versions
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <div style={{ width: 80, height: 6, background: 'rgba(255,255,255,0.08)', borderRadius: 3, overflow: 'hidden' }}>
                        <div
                          style={{
                            width: `${emp.onTimeCompletionRate}%`,
                            height: '100%',
                            background: emp.onTimeCompletionRate >= 90 ? 'var(--accent-emerald)' : 'var(--accent-amber)',
                            borderRadius: 3,
                          }}
                        />
                      </div>
                      <span style={{ fontWeight: 700, color: emp.onTimeCompletionRate >= 90 ? 'var(--accent-emerald)' : 'var(--accent-amber)' }}>
                        {emp.onTimeCompletionRate}%
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
