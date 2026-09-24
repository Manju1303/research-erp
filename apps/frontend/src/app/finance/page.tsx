'use client';

import React, { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import { StatCard } from '../../components/StatCard';

export default function FinanceBillingPage() {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [overview, setOverview] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'invoices' | 'payments'>('invoices');

  useEffect(() => {
    async function loadFinanceData() {
      try {
        const [invRes, payRes, overRes]: [any, any, any] = await Promise.all([
          api.request('/finance/invoices'),
          api.request('/finance/payments'),
          api.request('/finance/overview'),
        ]);
        setInvoices(invRes?.data || []);
        setPayments(payRes?.data || []);
        setOverview(overRes || {});
      } catch (err) {
        console.error(err);
      }
    }
    loadFinanceData();
  }, []);

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      {/* Top Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.3rem' }}>
            <span className="badge badge-emerald">Accounting & Receivables</span>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Project Billing & Journal APC</span>
          </div>
          <h1 style={{ fontSize: '1.65rem', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.02em' }}>
            Finance & Project Billing Management
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: '0.2rem' }}>
            Manage client quotations, milestone disbursements, journal APC payments, and automated receipts.
          </p>
        </div>

        <button className="btn-primary">
          + Generate New Invoice
        </button>
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem' }}>
        <StatCard
          title="Collected Revenue"
          value={`$${(overview?.totalCollectedRevenue || 148500).toLocaleString()} USD`}
          change="14.8%"
          color="emerald"
          icon="💰"
        />
        <StatCard
          title="Outstanding Receivables"
          value={`$${(overview?.totalPendingOutstanding || 34200).toLocaleString()} USD`}
          change="3 Overdue"
          isPositive={false}
          color="amber"
          icon="⏳"
        />
        <StatCard
          title="Settled Invoices"
          value={overview?.paidInvoicesCount || 42}
          change="100% Reconciled"
          color="blue"
          icon="🧾"
        />
      </div>

      {/* Tab Switcher */}
      <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
        <button
          onClick={() => setActiveTab('invoices')}
          className="btn-secondary"
          style={{
            background: activeTab === 'invoices' ? 'rgba(59, 130, 246, 0.2)' : 'transparent',
            border: activeTab === 'invoices' ? '1px solid var(--accent-blue)' : 'none',
            color: activeTab === 'invoices' ? '#ffffff' : 'var(--text-muted)',
            fontWeight: 700,
          }}
        >
          Invoices & Quotations ({invoices.length})
        </button>
        <button
          onClick={() => setActiveTab('payments')}
          className="btn-secondary"
          style={{
            background: activeTab === 'payments' ? 'rgba(59, 130, 246, 0.2)' : 'transparent',
            border: activeTab === 'payments' ? '1px solid var(--accent-blue)' : 'none',
            color: activeTab === 'payments' ? '#ffffff' : 'var(--text-muted)',
            fontWeight: 700,
          }}
        >
          Payment Receipts ({payments.length})
        </button>
      </div>

      {/* Invoices View */}
      {activeTab === 'invoices' && (
        <div className="data-table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Invoice #</th>
                <th>Project Code</th>
                <th>Author & Institution</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Due Date</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((inv) => (
                <tr key={inv.id}>
                  <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--accent-cyan)' }}>
                    {inv.invoiceNumber}
                  </td>
                  <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}>
                    {inv.project?.projectCode}
                  </td>
                  <td>
                    <div style={{ fontWeight: 600, color: '#ffffff' }}>
                      {inv.client?.user ? `${inv.client.user.firstName} ${inv.client.user.lastName}` : 'Client'}
                    </div>
                    <div style={{ fontSize: '0.725rem', color: 'var(--text-muted)' }}>
                      {inv.client?.organization}
                    </div>
                  </td>
                  <td style={{ fontWeight: 700, color: '#ffffff' }}>
                    ${inv.amount} {inv.currency}
                  </td>
                  <td>
                    <span className={`badge ${inv.status === 'PAID' ? 'badge-emerald' : 'badge-amber'}`}>
                      {inv.status}
                    </span>
                  </td>
                  <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    {inv.dueDate}
                  </td>
                  <td>
                    <button className="btn-secondary" style={{ padding: '0.35rem 0.65rem', fontSize: '0.725rem' }}>
                      Download PDF ⬇
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Payments View */}
      {activeTab === 'payments' && (
        <div className="data-table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Receipt #</th>
                <th>Project</th>
                <th>Institution</th>
                <th>Amount Paid</th>
                <th>Payment Type</th>
                <th>Method</th>
                <th>Date Paid</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((p) => (
                <tr key={p.id}>
                  <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--accent-emerald)' }}>
                    {p.receiptNumber}
                  </td>
                  <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}>
                    {p.project?.projectCode}
                  </td>
                  <td>{p.client?.organization}</td>
                  <td style={{ fontWeight: 700, color: 'var(--accent-emerald)' }}>
                    +${p.amount} {p.currency}
                  </td>
                  <td><span className="badge badge-blue">{p.paymentType}</span></td>
                  <td style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{p.paymentMethod}</td>
                  <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{p.paidAt}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
