'use client';

import React, { useState } from 'react';
import { StatusBadge } from '../../components/StatusBadge';

interface TaskItem {
  id: string;
  projectCode: string;
  title: string;
  status: 'TODO' | 'IN_PROGRESS' | 'UNDER_REVIEW' | 'COMPLETED';
  priority: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';
  completionPct: number;
  assignee: string;
  dueDate: string;
}

export default function TasksKanbanPage() {
  const [tasks, setTasks] = useState<TaskItem[]>([
    { id: '1', projectCode: 'INZ-2026-001', title: 'Synthesize related literature on transformer variant callers', status: 'COMPLETED', priority: 'NORMAL', completionPct: 100, assignee: 'Dr. Sarah Chen', dueDate: '2026-10-15' },
    { id: '2', projectCode: 'INZ-2026-001', title: 'Benchmark model against GATK and DeepVariant on ClinVar', status: 'COMPLETED', priority: 'HIGH', completionPct: 100, assignee: 'Dr. Sarah Chen', dueDate: '2026-10-25' },
    { id: '3', projectCode: 'INZ-2026-001', title: 'Execute technical QC checklist & plagiarism screening', status: 'UNDER_REVIEW', priority: 'URGENT', completionPct: 90, assignee: 'Marcus Vance', dueDate: '2026-11-02' },
    { id: '4', projectCode: 'INZ-2026-002', title: 'Perform thermal stability degradation simulations for perovskite layer', status: 'IN_PROGRESS', priority: 'HIGH', completionPct: 65, assignee: 'Alex Vance', dueDate: '2026-11-10' },
    { id: '5', projectCode: 'INZ-2026-003', title: 'Design smart contract state transitions for patient consent module', status: 'IN_PROGRESS', priority: 'NORMAL', completionPct: 40, assignee: 'Dr. Sarah Chen', dueDate: '2026-11-18' },
    { id: '6', projectCode: 'INZ-2026-003', title: 'Perform formal verification of access-control logic', status: 'TODO', priority: 'NORMAL', completionPct: 0, assignee: 'David Mercer', dueDate: '2026-11-28' },
  ]);

  const [activeFilter, setActiveFilter] = useState('');

  const COLUMNS = [
    { key: 'TODO', label: 'To Do', color: 'var(--text-muted)' },
    { key: 'IN_PROGRESS', label: 'In Progress', color: 'var(--accent-blue)' },
    { key: 'UNDER_REVIEW', label: 'Under Review', color: 'var(--accent-amber)' },
    { key: 'COMPLETED', label: 'Completed', color: 'var(--accent-emerald)' },
  ];

  const moveTask = (taskId: string, targetStatus: any) => {
    setTasks(
      tasks.map((t) => {
        if (t.id === taskId) {
          const completionPct = targetStatus === 'COMPLETED' ? 100 : t.completionPct === 100 ? 50 : t.completionPct;
          return { ...t, status: targetStatus, completionPct };
        }
        return t;
      }),
    );
  };

  const filteredTasks = tasks.filter((t) => {
    if (!activeFilter) return true;
    return t.priority === activeFilter;
  });

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      {/* Top Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.65rem', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.02em' }}>
            Operational Task & Workflow Board
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: '0.2rem' }}>
            Monitor and advance development tasks assigned to research staff, reviewers, and publication executives.
          </p>
        </div>

        {/* Priority Filter Buttons */}
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Priority:</span>
          {['', 'URGENT', 'HIGH', 'NORMAL'].map((p) => (
            <button
              key={p}
              onClick={() => setActiveFilter(p)}
              className="btn-secondary"
              style={{
                padding: '0.35rem 0.75rem',
                fontSize: '0.75rem',
                background: activeFilter === p ? 'rgba(59, 130, 246, 0.25)' : 'rgba(255,255,255,0.04)',
                border: activeFilter === p ? '1px solid var(--accent-blue)' : '1px solid var(--border-color)',
              }}
            >
              {p || 'All'}
            </button>
          ))}
        </div>
      </div>

      {/* 4-Column Kanban Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(260px, 1fr))', gap: '1.25rem', alignItems: 'flex-start' }}>
        {COLUMNS.map((col) => {
          const colTasks = filteredTasks.filter((t) => t.status === col.key);

          return (
            <div
              key={col.key}
              className="glass-panel"
              style={{
                padding: '1.25rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem',
                background: 'rgba(13, 21, 39, 0.6)',
                minHeight: '600px',
              }}
            >
              {/* Column Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: col.color }} />
                  <span style={{ fontWeight: 700, fontSize: '0.9rem', color: '#ffffff' }}>
                    {col.label}
                  </span>
                </div>
                <span
                  style={{
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    background: 'rgba(255,255,255,0.08)',
                    padding: '0.15rem 0.5rem',
                    borderRadius: 'var(--radius-full)',
                    color: 'var(--text-secondary)',
                  }}
                >
                  {colTasks.length}
                </span>
              </div>

              {/* Task Cards */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                {colTasks.map((task) => (
                  <div
                    key={task.id}
                    style={{
                      padding: '1.1rem',
                      borderRadius: 'var(--radius-md)',
                      background: 'rgba(16, 26, 48, 0.85)',
                      border: '1px solid var(--border-color)',
                      boxShadow: 'var(--shadow-sm)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.65rem',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.725rem', color: 'var(--accent-cyan)', fontWeight: 600 }}>
                        {task.projectCode}
                      </span>
                      <span
                        style={{
                          fontSize: '0.675rem',
                          fontWeight: 700,
                          padding: '0.15rem 0.45rem',
                          borderRadius: 'var(--radius-full)',
                          background:
                            task.priority === 'URGENT'
                              ? 'rgba(244, 63, 94, 0.15)'
                              : task.priority === 'HIGH'
                              ? 'rgba(245, 158, 11, 0.15)'
                              : 'rgba(59, 130, 246, 0.15)',
                          color:
                            task.priority === 'URGENT'
                              ? '#fb7185'
                              : task.priority === 'HIGH'
                              ? '#fbbf24'
                              : '#60a5fa',
                        }}
                      >
                        {task.priority}
                      </span>
                    </div>

                    <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#ffffff', lineHeight: 1.4 }}>
                      {task.title}
                    </div>

                    {/* Completion bar */}
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
                        <span>Progress</span>
                        <span style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>{task.completionPct}%</span>
                      </div>
                      <div style={{ width: '100%', height: 4, background: 'rgba(255,255,255,0.06)', borderRadius: 2, overflow: 'hidden' }}>
                        <div style={{ width: `${task.completionPct}%`, height: '100%', background: 'var(--accent-cyan)', borderRadius: 2 }} />
                      </div>
                    </div>

                    {/* Footer Info & Quick Move */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '0.4rem', borderTop: '1px solid rgba(255,255,255,0.04)', fontSize: '0.725rem', color: 'var(--text-muted)' }}>
                      <span>👤 {task.assignee}</span>
                      <span>📅 {task.dueDate}</span>
                    </div>

                    {/* Move Actions */}
                    <div style={{ display: 'flex', gap: '0.35rem', marginTop: '0.2rem' }}>
                      {col.key !== 'TODO' && (
                        <button
                          onClick={() => moveTask(task.id, 'TODO')}
                          style={{ flex: 1, padding: '0.25rem', fontSize: '0.65rem', background: 'rgba(255,255,255,0.05)', border: 'none', borderRadius: 4, color: 'var(--text-muted)', cursor: 'pointer' }}
                        >
                          ← To Do
                        </button>
                      )}
                      {col.key !== 'IN_PROGRESS' && (
                        <button
                          onClick={() => moveTask(task.id, 'IN_PROGRESS')}
                          style={{ flex: 1, padding: '0.25rem', fontSize: '0.65rem', background: 'rgba(59,130,246,0.15)', border: 'none', borderRadius: 4, color: '#60a5fa', cursor: 'pointer' }}
                        >
                          In Progress
                        </button>
                      )}
                      {col.key !== 'COMPLETED' && (
                        <button
                          onClick={() => moveTask(task.id, 'COMPLETED')}
                          style={{ flex: 1, padding: '0.25rem', fontSize: '0.65rem', background: 'rgba(16,185,129,0.15)', border: 'none', borderRadius: 4, color: '#34d399', cursor: 'pointer' }}
                        >
                          Done ✓
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
