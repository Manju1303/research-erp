'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '../lib/auth-context';
import { api } from '../lib/api';
import { StatCard } from '../components/StatCard';
import { StatusBadge } from '../components/StatusBadge';
import {
  FlaskConical,
  FileText,
  ShieldCheck,
  PenTool,
  Building2,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

export default function DashboardPage() {
  const { role, displayName } = useAuth();
  const [overview, setOverview] = useState<any>(null);
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const [dashData, projData]: [any, any] = await Promise.all([
          api.request('/dashboard/overview'),
          api.request('/projects'),
        ]);
        setOverview(dashData);
        setProjects(projData?.data || []);
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [role]);

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Header Banner */}
      <div
        className="glass-panel"
        style={{
          padding: '2.25rem',
          position: 'relative',
          overflow: 'hidden',
          background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
          border: '1px solid var(--border-color)',
          boxShadow: 'var(--shadow-sm)',
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: -40,
            right: -40,
            width: 240,
            height: 240,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(79, 70, 229, 0.08) 0%, transparent 70%)',
            pointerEvents: 'none',
          }}
        />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.25rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.4rem' }}>
              <span className="badge badge-cyan" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                <Sparkles size={12} />
                Scriptara Workspace
              </span>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                {loading ? 'Syncing workspace telemetry...' : 'Enterprise Research Suite'}
              </span>
            </div>
            <h1 style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
              Welcome back, {displayName}
            </h1>
            <p style={{ color: 'var(--text-secondary)', marginTop: '0.35rem', fontSize: '0.9rem', maxWidth: 660, lineHeight: 1.5 }}>
              Centrally orchestrating the complete research publication lifecycle from topic allocation and manuscript formulation to quality gate verification and journal acceptance.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <Link href="/projects" className="btn-secondary">
              Explore Projects
            </Link>
            <Link href="/qc" className="btn-primary">
              QC Inspection
            </Link>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem' }}>
        <StatCard
          title="Active Projects"
          value={overview?.activeProjects || 14}
          change="8.2%"
          color="cyan"
          icon={<FlaskConical size={18} />}
        />
        <StatCard
          title="In Development"
          value={overview?.projectsInDevelopment || 6}
          change="12%"
          color="blue"
          icon={<FileText size={18} />}
        />
        <StatCard
          title="Internal QC Queue"
          value={overview?.pendingQc || 3}
          change="Pending Review"
          color="amber"
          icon={<ShieldCheck size={18} />}
        />
        <StatCard
          title="Author Approvals"
          value={overview?.clientReviewPending || 2}
          change="Ready for sign-off"
          color="purple"
          icon={<PenTool size={18} />}
        />
        <StatCard
          title="Institutional Clients"
          value={overview?.totalClients || 28}
          change="5 this month"
          color="emerald"
          icon={<Building2 size={18} />}
        />
      </div>

      {/* Main Two-Column Overview */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem' }}>
        {/* Left Column: Active Projects Pipeline */}
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                Active Research Projects
              </h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Track live stage progression, author details, and deadlines
              </p>
            </div>
            <Link href="/projects" style={{ fontSize: '0.8rem', color: 'var(--accent-primary)', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
              View All ({projects.length}) <ArrowRight size={14} />
            </Link>
          </div>

          <div className="data-table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Code</th>
                  <th>Title & Domain</th>
                  <th>Client</th>
                  <th>Status</th>
                  <th>Priority</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {projects.slice(0, 5).map((p) => (
                  <tr key={p.id}>
                    <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--accent-primary)' }}>
                      {p.projectCode}
                    </td>
                    <td>
                      <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.2rem' }}>
                        {p.title}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {p.domain}
                      </div>
                    </td>
                    <td>
                      <div style={{ color: 'var(--text-primary)', fontWeight: 500 }}>
                        {p.client?.user ? `${p.client.user.firstName} ${p.client.user.lastName}` : 'Client'}
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
                    <td>
                      <Link
                        href={`/projects/${p.id}`}
                        className="btn-secondary"
                        style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem' }}
                      >
                        Open
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column: Recent Activity Feed & Status Distribution */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Status Breakdown */}
          <div className="glass-panel" style={{ padding: '1.5rem' }}>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '1rem' }}>
              Pipeline Status Distribution
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              {[
                { label: 'Requirement & Topic', count: 3, color: 'var(--accent-blue)' },
                { label: 'Research & Drafting', count: 7, color: 'var(--accent-cyan)' },
                { label: 'Internal Quality Control', count: 2, color: 'var(--accent-amber)' },
                { label: 'Author Review & Approval', count: 2, color: 'var(--accent-purple)' },
              ].map((item, idx) => (
                <div key={idx}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '0.35rem' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>{item.label}</span>
                    <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{item.count} papers</span>
                  </div>
                  <div style={{ width: '100%', height: 6, background: '#f1f5f9', borderRadius: 3, overflow: 'hidden' }}>
                    <div style={{ width: `${(item.count / 14) * 100}%`, height: '100%', background: item.color, borderRadius: 3 }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Audit & Activity Stream */}
          <div className="glass-panel" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                Recent Operational Activity
              </h4>
              <Link href="/audit" style={{ fontSize: '0.75rem', color: 'var(--accent-primary)', fontWeight: 600 }}>
                Full Audit →
              </Link>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              {(overview?.recentActivity || []).map((act: any) => (
                <div
                  key={act.id}
                  style={{
                    padding: '0.85rem',
                    borderRadius: 'var(--radius-md)',
                    background: '#f8fafc',
                    border: '1px solid var(--border-color)',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '0.35rem' }}>
                    <span style={{ fontWeight: 600, color: 'var(--accent-primary)' }}>
                      {act.project?.projectCode}
                    </span>
                    <span style={{ color: 'var(--text-muted)' }}>
                      {new Date(act.changedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-primary)', marginBottom: '0.4rem', fontWeight: 500 }}>
                    {act.note}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                    <span>By: {act.user?.firstName} {act.user?.lastName}</span>
                    <span>•</span>
                    <StatusBadge status={act.toStatus} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
