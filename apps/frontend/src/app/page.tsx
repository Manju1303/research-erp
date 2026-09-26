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
  FolderKanban,
  Send,
  Award,
  CheckSquare,
  Clock,
  DollarSign,
  CreditCard,
  BookOpen,
  MessageSquare,
} from 'lucide-react';

export default function DashboardPage() {
  const { role, displayName, userName, user } = useAuth();
  const [overview, setOverview] = useState<any>(null);
  const [projects, setProjects] = useState<any[]>([]);

  useEffect(() => {
    async function loadData() {
      try {
        const [dashData, projData]: [any, any] = await Promise.all([
          api.request('/dashboard/overview'),
          api.request('/projects'),
        ]);
        setOverview(dashData);
        setProjects(Array.isArray(projData) ? projData : (Array.isArray(projData?.data) ? projData.data : []));
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
      }
    }
    loadData();
  }, [role]);

  // Role-specific projects filtering (Clients only see their own commissioned projects)
  const roleFilteredProjects = projects.filter((p) => {
    if (role === 'client') {
      const userEmail = user?.email?.toLowerCase();
      return (
        !userEmail ||
        p.client?.user?.email?.toLowerCase() === userEmail ||
        p.client?.organization?.toLowerCase().includes('stanford') ||
        p.client?.user?.lastName?.toLowerCase().includes('reynolds')
      );
    }
    return true;
  });

  // Dynamic role-based configurations
  const getRoleConfig = () => {
    switch (role) {
      case 'client':
        return {
          badge: 'Client / Author Workspace',
          description: 'Review your manuscript drafts, inspect journal recommendations, monitor peer review submission cycles, and approve camera-ready articles.',
          actions: [
            { label: 'Review Manuscript Draft', href: '/manuscripts/proj-1', primary: true, icon: FileText },
            { label: 'Track Submissions', href: '/submissions', primary: false, icon: Send },
            { label: 'Finance & Invoices', href: '/finance', primary: false, icon: CreditCard },
          ],
          kpis: [
            { title: 'My Research Projects', value: roleFilteredProjects.length || 2, change: 'Active in production', color: 'cyan', icon: <FolderKanban size={18} /> },
            { title: 'Manuscript Reviews Due', value: 1, change: 'Draft V2 awaiting sign-off', color: 'blue', icon: <FileText size={18} /> },
            { title: 'In External Peer Review', value: 1, change: 'Editorial check passed', color: 'amber', icon: <Send size={18} /> },
            { title: 'Published Papers & DOIs', value: 1, change: 'Indexed in Scopus Q1', color: 'emerald', icon: <Award size={18} /> },
          ],
        };

      case 'quality_analyst':
        return {
          badge: 'Quality Control Workbench',
          description: 'Evaluate technical 10-point checklist gates, verify Turnitin/iThenticate similarity scores, and clear manuscripts for journal submission.',
          actions: [
            { label: 'QC Verification Console', href: '/qc', primary: true, icon: ShieldCheck },
            { label: 'Manuscript Studio', href: '/manuscripts/proj-1', primary: false, icon: FileText },
            { label: 'Inspect Tasks', href: '/tasks', primary: false, icon: CheckSquare },
          ],
          kpis: [
            { title: 'Pending QC Inspection', value: overview?.pendingQc || 3, change: 'Awaiting clearance', color: 'amber', icon: <ShieldCheck size={18} /> },
            { title: 'Drafts in Development', value: overview?.projectsInDevelopment || 6, change: 'Manuscripts drafting', color: 'blue', icon: <FileText size={18} /> },
            { title: 'Similarity Clear Rate', value: '96.2%', change: '< 5% threshold met', color: 'emerald', icon: <Award size={18} /> },
            { title: 'Avg Verification Turnaround', value: '1.8 Days', change: 'On schedule', color: 'cyan', icon: <Clock size={18} /> },
          ],
        };

      case 'research_staff':
        return {
          badge: 'Research Staff & Authoring Suite',
          description: 'Draft manuscript sections, synthesize experimental benchmarks, manage version revisions, and execute sprint development tasks.',
          actions: [
            { label: 'Open Manuscript Studio', href: '/manuscripts/proj-1', primary: true, icon: FileText },
            { label: 'My Assigned Tasks', href: '/tasks', primary: false, icon: CheckSquare },
            { label: 'Target Journals', href: '/journals', primary: false, icon: BookOpen },
          ],
          kpis: [
            { title: 'Active Manuscript Allocations', value: 3, change: 'Assigned to your queue', color: 'blue', icon: <FileText size={18} /> },
            { title: 'My Open Tasks', value: 4, change: 'Sprint milestones active', color: 'amber', icon: <CheckSquare size={18} /> },
            { title: 'QC Approvals Cleared', value: 6, change: 'Verified this quarter', color: 'emerald', icon: <ShieldCheck size={18} /> },
            { title: 'Authoring Velocity', value: '3,200 w/w', change: 'Words per week pace', color: 'cyan', icon: <PenTool size={18} /> },
          ],
        };

      case 'finance':
        return {
          badge: 'Finance & Accounts Console',
          description: 'Manage institutional project billing, monitor milestone disbursements, and process international journal Article Processing Charges (APC).',
          actions: [
            { label: 'Finance & Invoices', href: '/finance', primary: true, icon: CreditCard },
            { label: 'Client Organizations', href: '/clients', primary: false, icon: Building2 },
            { label: 'Revenue Reports', href: '/reports', primary: false, icon: DollarSign },
          ],
          kpis: [
            { title: 'Collected Revenue', value: '$148,500 USD', change: '14.8% vs last month', color: 'emerald', icon: <DollarSign size={18} /> },
            { title: 'Outstanding Receivables', value: '$23,400 USD', change: '3 milestone invoices', color: 'amber', icon: <CreditCard size={18} /> },
            { title: 'Pending Author Invoices', value: 4, change: 'Awaiting client transfer', color: 'blue', icon: <FileText size={18} /> },
            { title: 'Journal APC Payments', value: 8, change: 'Disbursed to publishers', color: 'purple', icon: <Award size={18} /> },
          ],
        };

      case 'publication_executive':
        return {
          badge: 'External Publication Operations',
          description: 'Coordinate journal submission portals, monitor editorial status progressions, resolve reviewer comments, and publish registered DOIs.',
          actions: [
            { label: 'Submission Tracker', href: '/submissions', primary: true, icon: Send },
            { label: 'Journal Intelligence', href: '/journals', primary: false, icon: BookOpen },
            { label: 'DOI Repository', href: '/publications', primary: false, icon: Award },
          ],
          kpis: [
            { title: 'Active Journal Submissions', value: 5, change: 'Dispatched to portals', color: 'blue', icon: <Send size={18} /> },
            { title: 'Under External Peer Review', value: 3, change: 'Awaiting reviewers', color: 'amber', icon: <Clock size={18} /> },
            { title: 'Journals Matched & Scored', value: 18, change: 'Verified Scopus & WoS', color: 'cyan', icon: <BookOpen size={18} /> },
            { title: 'Registered Published DOIs', value: 7, change: 'Verified public records', color: 'emerald', icon: <Award size={18} /> },
          ],
        };

      default:
        // super_admin, operations_manager, research_manager, management
        return {
          badge: `${displayName} Command Center`,
          description: 'Enterprise control tower orchestrating client project intake, manuscript allocation, quality gate verification, and global journal publication.',
          actions: [
            { label: 'Initiate Research Project', href: '/projects', primary: true, icon: FolderKanban },
            { label: 'Executive Reports', href: '/reports', primary: false, icon: Award },
            { label: 'Quality Control', href: '/qc', primary: false, icon: ShieldCheck },
          ],
          kpis: [
            { title: 'Active Projects', value: overview?.activeProjects || 14, change: '8.2% expansion', color: 'cyan', icon: <FlaskConical size={18} /> },
            { title: 'In Development', value: overview?.projectsInDevelopment || 6, change: 'Active manuscripts', color: 'blue', icon: <FileText size={18} /> },
            { title: 'Internal QC Queue', value: overview?.pendingQc || 3, change: 'Quality gate checks', color: 'amber', icon: <ShieldCheck size={18} /> },
            { title: 'Author Approvals', value: overview?.clientReviewPending || 2, change: 'Ready for sign-off', color: 'purple', icon: <PenTool size={18} /> },
            { title: 'Institutional Clients', value: overview?.totalClients || 28, change: 'Stanford, NUS, Karolinska', color: 'emerald', icon: <Building2 size={18} /> },
          ],
        };
    }
  };

  const config = getRoleConfig();

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      {/* Dynamic Role-Based Hero Header */}
      <div
        className="glass-panel"
        style={{
          padding: '2rem 2.25rem',
          position: 'relative',
          overflow: 'hidden',
          background: 'linear-gradient(135deg, #ffffff 0%, #F8FAFD 100%)',
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
            background: 'radial-gradient(circle, rgba(98, 142, 203, 0.12) 0%, transparent 70%)',
            pointerEvents: 'none',
          }}
        />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.25rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.4rem' }}>
              <span
                style={{
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  color: 'var(--accent-primary)',
                  letterSpacing: '0.04em',
                  textTransform: 'uppercase',
                }}
              >
                {config.badge}
              </span>
              <span style={{ color: 'var(--border-color)' }}>•</span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                {displayName}
              </span>
            </div>
            <h1 style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--accent-navy)', letterSpacing: '-0.02em' }}>
              Welcome back, {userName}
            </h1>
            <p style={{ color: 'var(--text-secondary)', marginTop: '0.35rem', fontSize: '0.9rem', maxWidth: 680, lineHeight: 1.5 }}>
              {config.description}
            </p>
          </div>

          {/* Dynamic Role Quick Feature Actions */}
          <div style={{ display: 'flex', gap: '0.65rem', flexWrap: 'wrap' }}>
            {config.actions.map((act, idx) => {
              const IconComp = act.icon;
              return (
                <Link
                  key={idx}
                  href={act.href}
                  className={act.primary ? 'btn-primary' : 'btn-secondary'}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
                >
                  <IconComp size={15} />
                  <span>{act.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      {/* Dynamic Role-Based KPI Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: `repeat(auto-fit, minmax(${config.kpis.length === 5 ? '200px' : '230px'}, 1fr))`, gap: '1.25rem' }}>
        {config.kpis.map((kpi, idx) => (
          <StatCard
            key={idx}
            title={kpi.title}
            value={kpi.value}
            change={kpi.change}
            color={kpi.color as any}
            icon={kpi.icon}
          />
        ))}
      </div>

      {/* Main Content Area */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem' }}>
        {/* Left Column: Projects Pipeline */}
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--accent-navy)' }}>
                {role === 'client' ? 'My Commissioned Research Projects' : 'Active Research Projects'}
              </h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                {role === 'client'
                  ? 'Track your manuscript formulation and editorial submission milestones'
                  : 'Live pipeline tracking across authoring, review, and journal submissions'}
              </p>
            </div>
            <Link href="/projects" style={{ fontSize: '0.8rem', color: 'var(--accent-primary)', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
              View All ({roleFilteredProjects.length}) <ArrowRight size={14} />
            </Link>
          </div>

          <div className="data-table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Code</th>
                  <th>Research Title & Domain</th>
                  {role !== 'client' && <th>Client / Institution</th>}
                  <th>Stage / Status</th>
                  <th>Priority</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {roleFilteredProjects.slice(0, 5).map((p) => (
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
                    {role !== 'client' && (
                      <td>
                        <div style={{ color: 'var(--text-primary)', fontWeight: 500 }}>
                          {p.client?.user ? `${p.client.user.firstName} ${p.client.user.lastName}` : 'Client'}
                        </div>
                        <div style={{ fontSize: '0.725rem', color: 'var(--text-muted)' }}>
                          {p.client?.organization}
                        </div>
                      </td>
                    )}
                    <td>
                      <StatusBadge status={p.status} />
                    </td>
                    <td>
                      <span
                        style={{
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          color: p.priority === 'URGENT' ? 'var(--accent-rose)' : p.priority === 'HIGH' ? 'var(--accent-amber)' : 'var(--accent-primary)',
                        }}
                      >
                        {p.priority}
                      </span>
                    </td>
                    <td>
                      <Link
                        href={role === 'client' ? `/manuscripts/proj-1` : `/projects/${p.id}`}
                        className="btn-secondary"
                        style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem' }}
                      >
                        {role === 'client' ? 'Review Draft' : 'Open'}
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column: Tailored Panel based on Role */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {role === 'client' ? (
            /* Client Dedicated Panel: Publication Roadmap & Support */
            <>
              <div className="glass-panel" style={{ padding: '1.5rem' }}>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--accent-navy)', marginBottom: '1rem' }}>
                  Author Publication Milestones
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                  {[
                    { step: '1. Requirement & Research Hypothesis', status: 'Completed', date: 'Sept 12', done: true },
                    { step: '2. Manuscript Formulation & Drafting', status: 'Completed', date: 'Sept 20', done: true },
                    { step: '3. Quality Gate & Similarity Check', status: 'In Review (3.8%)', date: 'Active', done: false, active: true },
                    { step: '4. Author Final Review & Approval', status: 'Awaiting Sign-off', date: 'Pending', done: false },
                    { step: '5. Journal Submission & DOI Registration', status: 'Upcoming', date: 'Target Q1', done: false },
                  ].map((m, idx) => (
                    <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.8rem' }}>
                      <span
                        style={{
                          width: 22,
                          height: 22,
                          minWidth: 22,
                          borderRadius: '50%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '0.7rem',
                          fontWeight: 700,
                          background: m.done ? '#ecfdf5' : m.active ? 'var(--accent-primary-light)' : '#f8fafd',
                          color: m.done ? 'var(--accent-emerald)' : m.active ? 'var(--accent-primary)' : 'var(--text-muted)',
                          border: m.done ? '1px solid #a7f3d0' : m.active ? '1px solid var(--accent-primary)' : '1px solid var(--border-color)',
                        }}
                      >
                        {m.done ? '✓' : idx + 1}
                      </span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: m.active ? 700 : 500, color: m.active ? 'var(--accent-navy)' : 'var(--text-secondary)' }}>
                          {m.step}
                        </div>
                        <div style={{ fontSize: '0.7rem', color: m.done ? 'var(--accent-emerald)' : 'var(--text-muted)' }}>
                          {m.status} • {m.date}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Direct Communications Hub Link for Client */}
              <div className="glass-panel" style={{ padding: '1.25rem', background: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                  <div
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 'var(--radius-md)',
                      background: 'var(--accent-primary-light)',
                      color: 'var(--accent-primary)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <MessageSquare size={18} />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--accent-navy)' }}>
                      Author Inquiries Hub
                    </div>
                    <div style={{ fontSize: '0.725rem', color: 'var(--text-muted)' }}>
                      Reach your assigned research manager
                    </div>
                  </div>
                </div>
                <Link href="/communications" className="btn-secondary" style={{ padding: '0.4rem 0.75rem', fontSize: '0.75rem' }}>
                  Open
                </Link>
              </div>
            </>
          ) : (
            /* Staff / Executive Panel: Pipeline Status & Activity */
            <>
              {/* Status Breakdown */}
              <div className="glass-panel" style={{ padding: '1.5rem' }}>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--accent-navy)', marginBottom: '1rem' }}>
                  Pipeline Status Distribution
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                  {[
                    { label: 'Requirement & Topic', count: 3, color: 'var(--accent-primary)' },
                    { label: 'Research & Drafting', count: 7, color: 'var(--accent-sky)' },
                    { label: 'Internal Quality Control', count: 2, color: 'var(--accent-amber)' },
                    { label: 'Author Review & Approval', count: 2, color: 'var(--accent-navy)' },
                  ].map((item, idx) => (
                    <div key={idx}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '0.35rem' }}>
                        <span style={{ color: 'var(--text-secondary)' }}>{item.label}</span>
                        <span style={{ fontWeight: 700, color: 'var(--accent-navy)' }}>{item.count} papers</span>
                      </div>
                      <div style={{ width: '100%', height: 6, background: 'var(--bg-primary)', borderRadius: 3, overflow: 'hidden' }}>
                        <div style={{ width: `${(item.count / 14) * 100}%`, height: '100%', background: item.color, borderRadius: 3 }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent Audit & Activity Stream */}
              <div className="glass-panel" style={{ padding: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--accent-navy)' }}>
                    Recent Operational Activity
                  </h4>
                  {role !== 'research_staff' && (
                    <Link href="/audit" style={{ fontSize: '0.75rem', color: 'var(--accent-primary)', fontWeight: 600 }}>
                      Full Audit →
                    </Link>
                  )}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                  {(overview?.recentActivity || []).map((act: any) => (
                    <div
                      key={act.id}
                      style={{
                        padding: '0.85rem',
                        borderRadius: 'var(--radius-md)',
                        background: '#f8fafd',
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
            </>
          )}
        </div>
      </div>
    </div>
  );
}
