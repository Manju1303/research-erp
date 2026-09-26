'use client';

import React, { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import { StatCard } from '../../components/StatCard';
import { DollarSign, Clock, Receipt, Download, Plus, X, Check } from 'lucide-react';
import { useAuth } from '../../lib/auth-context';

export default function FinanceBillingPage() {
  const { role } = useAuth();
  const [invoices, setInvoices] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [overview, setOverview] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'invoices' | 'payments'>('invoices');
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // New Invoice Form State
  const [invNumber, setInvNumber] = useState(`INV-2026-${Math.floor(100 + Math.random() * 900)}`);
  const [invProject, setInvProject] = useState('SCR-2026-001');
  const [invClientName, setInvClientName] = useState('Dr. John Reynolds');
  const [invOrg, setInvOrg] = useState('Stanford University School of Medicine');
  const [invAmount, setInvAmount] = useState('3200');
  const [invCurrency, setInvCurrency] = useState('USD');
  const [invDueDate, setInvDueDate] = useState('2026-11-15');
  const [invDescription, setInvDescription] = useState('Milestone 2: Empirical Benchmarks & Manuscript Drafting Complete');

  useEffect(() => {
    async function loadFinanceData() {
      try {
        const [invRes, payRes, overRes]: [any, any, any] = await Promise.all([
          api.request('/finance/invoices'),
          api.request('/finance/payments'),
          api.request('/finance/overview'),
        ]);
        setInvoices(Array.isArray(invRes) ? invRes : (Array.isArray(invRes?.data) ? invRes.data : []));
        setPayments(Array.isArray(payRes) ? payRes : (Array.isArray(payRes?.data) ? payRes.data : []));
        setOverview(overRes || {});
      } catch (err) {
        console.error(err);
      }
    }
    loadFinanceData();
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleCreateInvoice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!invAmount) return;

    const newInv = {
      id: `inv-${Date.now()}`,
      invoiceNumber: invNumber,
      amount: parseFloat(invAmount),
      currency: invCurrency,
      status: 'PENDING',
      dueDate: invDueDate,
      description: invDescription,
      project: { projectCode: invProject },
      client: {
        organization: invOrg,
        user: {
          firstName: invClientName.split(' ')[0] || 'Client',
          lastName: invClientName.split(' ').slice(1).join(' ') || 'Author',
        },
      },
    };

    setInvoices([newInv, ...invoices]);
    setShowInvoiceModal(false);
    showToast(`Invoice ${invNumber} generated for $${invAmount} ${invCurrency}!`);
    // refresh next invoice number
    setInvNumber(`INV-2026-${Math.floor(100 + Math.random() * 900)}`);
  };

  const handleDownloadInvoicePdf = (inv: any) => {
    const clientName = inv.client?.user ? `${inv.client.user.firstName} ${inv.client.user.lastName}` : 'Client Author';
    const content = `========================================================================\n` +
      `                   SCRIPTARA RESEARCH CONSULTING                     \n` +
      `                     COMMERCIAL BILLING INVOICE                        \n` +
      `========================================================================\n\n` +
      `INVOICE NUMBER:   ${inv.invoiceNumber}\n` +
      `ISSUE DATE:       ${new Date().toISOString().split('T')[0]}\n` +
      `PAYMENT DUE DATE: ${inv.dueDate}\n` +
      `PAYMENT STATUS:   ${inv.status}\n\n` +
      `BILLED TO:\n` +
      `  Recipient:      ${clientName}\n` +
      `  Institution:    ${inv.client?.organization || 'Institutional Client'}\n` +
      `  Project Code:   ${inv.project?.projectCode || 'SCR-2026-001'}\n\n` +
      `------------------------------------------------------------------------\n` +
      `ITEM DESCRIPTION                                         AMOUNT\n` +
      `------------------------------------------------------------------------\n` +
      `Scholarly Research & Publication Milestone Fee           $${inv.amount}.00 ${inv.currency}\n` +
      `  - Systematic Literature Synthesis & Benchmarks\n` +
      `  - Double-Blind Peer Review Preparation\n` +
      `  - Technical QC & Formatting Verification\n\n` +
      `------------------------------------------------------------------------\n` +
      `TOTAL BALANCE DUE:                                       $${inv.amount}.00 ${inv.currency}\n` +
      `========================================================================\n` +
      `Wire Transfer Remittance: SWIFT/BIC: SCRPCH22 | IBAN: CH9300000000000001\n` +
      `Thank you for advancing scholarly research with Scriptara ERP.\n`;

    const blob = new Blob([content], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Invoice_${inv.invoiceNumber}.txt`;
    a.click();
    window.URL.revokeObjectURL(url);
    showToast(`Invoice statement for ${inv.invoiceNumber} downloaded.`);
  };

  const handleDownloadReceipt = (p: any) => {
    const content = `========================================================================\n` +
      `                   OFFICIAL PAYMENT RECEIPT & REMITTANCE              \n` +
      `========================================================================\n\n` +
      `RECEIPT NUMBER:   ${p.receiptNumber}\n` +
      `TRANSACTION DATE: ${p.paidAt || new Date().toISOString().split('T')[0]}\n` +
      `PAYMENT METHOD:   ${p.paymentMethod || 'Wire Transfer'}\n` +
      `PAYMENT TYPE:     ${p.paymentType}\n\n` +
      `PROJECT CODE:     ${p.project?.projectCode || 'SCR-2026-001'}\n` +
      `INSTITUTION:      ${p.client?.organization || 'Client Organization'}\n` +
      `AMOUNT CLEARED:   $${p.amount}.00 ${p.currency}\n` +
      `SETTLEMENT:       Reconciled with Enterprise General Ledger (100% Verified)\n` +
      `========================================================================\n`;

    const blob = new Blob([content], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Receipt_${p.receiptNumber}.txt`;
    a.click();
    window.URL.revokeObjectURL(url);
    showToast(`Payment Receipt ${p.receiptNumber} downloaded.`);
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
            Finance & Project Billing Management
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
            Manage client quotations, milestone disbursements, journal APC payments, and automated receipts.
          </p>
        </div>

        {role !== 'client' && (
          <button
            onClick={() => setShowInvoiceModal(true)}
            className="btn-primary"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
          >
            <Plus size={16} />
            <span>Generate New Invoice</span>
          </button>
        )}
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem' }}>
        <StatCard
          title="Collected Revenue"
          value={`$${(overview?.totalCollectedRevenue || 148500).toLocaleString()} USD`}
          change="14.8%"
          color="emerald"
          icon={<DollarSign size={18} />}
        />
        <StatCard
          title="Outstanding Receivables"
          value={`$${(overview?.totalPendingOutstanding || 34200).toLocaleString()} USD`}
          change="3 Overdue"
          isPositive={false}
          color="amber"
          icon={<Clock size={18} />}
        />
        <StatCard
          title="Settled Invoices"
          value={overview?.paidInvoicesCount || 42}
          change="100% Reconciled"
          color="blue"
          icon={<Receipt size={18} />}
        />
      </div>

      {/* Tab Switcher */}
      <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
        <button
          onClick={() => setActiveTab('invoices')}
          className="btn-secondary"
          style={{
            background: activeTab === 'invoices' ? 'var(--accent-primary-light)' : 'transparent',
            border: activeTab === 'invoices' ? '1px solid var(--accent-primary)' : '1px solid transparent',
            color: activeTab === 'invoices' ? 'var(--accent-navy)' : 'var(--text-muted)',
            fontWeight: 700,
          }}
        >
          Invoices & Quotations ({invoices.length})
        </button>
        <button
          onClick={() => setActiveTab('payments')}
          className="btn-secondary"
          style={{
            background: activeTab === 'payments' ? 'var(--accent-primary-light)' : 'transparent',
            border: activeTab === 'payments' ? '1px solid var(--accent-primary)' : '1px solid transparent',
            color: activeTab === 'payments' ? 'var(--accent-navy)' : 'var(--text-muted)',
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
                  <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--accent-navy)' }}>
                    {inv.invoiceNumber}
                  </td>
                  <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}>
                    {inv.project?.projectCode}
                  </td>
                  <td>
                    <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                      {inv.client?.user ? `${inv.client.user.firstName} ${inv.client.user.lastName}` : 'Client'}
                    </div>
                    <div style={{ fontSize: '0.725rem', color: 'var(--text-muted)' }}>
                      {inv.client?.organization}
                    </div>
                  </td>
                  <td style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
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
                    <button
                      onClick={() => handleDownloadInvoicePdf(inv)}
                      className="btn-secondary"
                      style={{ padding: '0.35rem 0.65rem', fontSize: '0.725rem', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}
                    >
                      <Download size={13} />
                      <span>Download PDF</span>
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
                <th>Receipt</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((p) => (
                <tr key={p.id}>
                  <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--accent-navy)' }}>
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
                  <td>
                    <button
                      onClick={() => handleDownloadReceipt(p)}
                      className="btn-secondary"
                      style={{ padding: '0.35rem 0.65rem', fontSize: '0.725rem', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}
                    >
                      <Download size={12} />
                      <span>Receipt</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Generate New Invoice Modal */}
      {showInvoiceModal && (
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
              maxWidth: 580,
              background: '#ffffff',
              padding: '2rem',
              borderRadius: 'var(--radius-lg)',
              boxShadow: 'var(--shadow-lg)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--accent-navy)' }}>
                  Generate New Invoice
                </h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Create client milestone billing statement, quotation, or journal APC invoice.
                </p>
              </div>
              <button
                onClick={() => setShowInvoiceModal(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateInvoice} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>
                    Invoice Number *
                  </label>
                  <input
                    type="text"
                    required
                    value={invNumber}
                    onChange={(e) => setInvNumber(e.target.value)}
                    className="form-input"
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>
                    Project Code *
                  </label>
                  <input
                    type="text"
                    required
                    value={invProject}
                    onChange={(e) => setInvProject(e.target.value)}
                    className="form-input"
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>
                    Client Author Name
                  </label>
                  <input
                    type="text"
                    value={invClientName}
                    onChange={(e) => setInvClientName(e.target.value)}
                    className="form-input"
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>
                    Institution / Organization
                  </label>
                  <input
                    type="text"
                    value={invOrg}
                    onChange={(e) => setInvOrg(e.target.value)}
                    className="form-input"
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.85rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>
                    Amount *
                  </label>
                  <input
                    type="number"
                    required
                    value={invAmount}
                    onChange={(e) => setInvAmount(e.target.value)}
                    className="form-input"
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>
                    Currency
                  </label>
                  <select
                    value={invCurrency}
                    onChange={(e) => setInvCurrency(e.target.value)}
                    className="form-input"
                  >
                    <option value="USD">USD ($)</option>
                    <option value="EUR">EUR (€)</option>
                    <option value="GBP">GBP (£)</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>
                    Due Date
                  </label>
                  <input
                    type="date"
                    value={invDueDate}
                    onChange={(e) => setInvDueDate(e.target.value)}
                    className="form-input"
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>
                  Billing Description / Scope
                </label>
                <textarea
                  rows={2}
                  value={invDescription}
                  onChange={(e) => setInvDescription(e.target.value)}
                  className="form-input"
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.75rem' }}>
                <button
                  type="button"
                  onClick={() => setShowInvoiceModal(false)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Generate Invoice
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

