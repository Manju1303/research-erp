'use client';

import React, { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import { Search, Sparkles, AlertTriangle, Check, X, BookOpen } from 'lucide-react';

export default function JournalsIntelligencePage() {
  const [journals, setJournals] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [indexingFilter, setIndexingFilter] = useState('');
  const [showMatcher, setShowMatcher] = useState(false);
  const [matchDomain, setMatchDomain] = useState('Bioinformatics & Machine Learning');
  const [matchKeywords, setMatchKeywords] = useState('Transformers, Genomic Variants, Clinical AI');
  const [matchBudget, setMatchBudget] = useState('3500');
  const [matchedResults, setMatchedResults] = useState<any[]>([]);
  const [isMatching, setIsMatching] = useState(false);

  useEffect(() => {
    async function loadJournals() {
      try {
        const res: any = await api.request('/journals');
        setJournals(res?.data || []);
      } catch (err) {
        console.error(err);
      }
    }
    loadJournals();
  }, []);

  const filtered = journals.filter((j) => {
    const matchesSearch =
      !search ||
      j.name.toLowerCase().includes(search.toLowerCase()) ||
      j.publisher.toLowerCase().includes(search.toLowerCase()) ||
      j.subjectArea.toLowerCase().includes(search.toLowerCase()) ||
      j.issn?.includes(search);

    const matchesIndexing = !indexingFilter || (j.indexing && j.indexing.includes(indexingFilter));

    return matchesSearch && matchesIndexing;
  });

  const runRecommendationEngine = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsMatching(true);
    try {
      const res: any = await api.request('/journals/match', {
        method: 'POST',
        body: JSON.stringify({
          domain: matchDomain,
          keywords: matchKeywords.split(',').map((k) => k.trim()),
          budget: parseFloat(matchBudget) || 0,
        }),
      });
      setMatchedResults(res || []);
    } catch (err) {
      console.error(err);
    } finally {
      setIsMatching(false);
    }
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      {/* Header Banner */}
      <div className="glass-panel" style={{ padding: '1.75rem', position: 'relative', background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.35rem' }}>
              <span className="badge badge-cyan">Journal Intelligence DB</span>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Curated External Publications</span>
            </div>
            <h1 style={{ fontSize: '1.65rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
              Centralized Journal Intelligence & Recommendation
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: '0.2rem' }}>
              Maintain verified publisher classifications, impact metrics, article processing charges (APC), and automated journal matching.
            </p>
          </div>

          <button onClick={() => setShowMatcher(true)} className="btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
            <Sparkles size={16} />
            <span>Journal Matching Assistant</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="glass-panel" style={{ padding: '1.25rem', display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ flex: 1, minWidth: 260, position: 'relative' }}>
          <input
            type="text"
            placeholder="Search by Journal Name, Publisher, Subject Area, or ISSN..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="form-input"
            style={{ paddingLeft: '2.3rem' }}
          />
          <span style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', display: 'flex', alignItems: 'center' }}>
            <Search size={16} />
          </span>
        </div>

        <select
          value={indexingFilter}
          onChange={(e) => setIndexingFilter(e.target.value)}
          className="form-input"
          style={{ width: 'auto', minWidth: 160 }}
        >
          <option value="">All Indexing Tiers</option>
          <option value="SCI">SCI / SCIE</option>
          <option value="SCOPUS_Q1">Scopus Q1</option>
          <option value="SCOPUS_Q2">Scopus Q2</option>
          <option value="PUBMED">PubMed / MEDLINE</option>
          <option value="UGC_CARE">UGC-CARE</option>
        </select>
      </div>

      {/* Journals Table */}
      <div className="data-table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Journal & Publisher</th>
              <th>ISSN & Field</th>
              <th>Impact Factor</th>
              <th>Indexing</th>
              <th>Review / Publication</th>
              <th>APC (Article Fee)</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((j) => (
              <tr key={j.id}>
                <td>
                  <div style={{ fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.2rem' }}>
                    {j.name}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {j.publisher} • {j.referenceStyle}
                  </div>
                </td>
                <td>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--accent-primary)', fontWeight: 600 }}>
                    {j.issn || 'N/A'}
                  </div>
                  <div style={{ fontSize: '0.725rem', color: 'var(--text-muted)' }}>
                    {j.subjectArea}
                  </div>
                </td>
                <td>
                  <div style={{ fontWeight: 800, color: 'var(--accent-emerald)', fontSize: '0.95rem' }}>
                    {j.impactFactor?.toFixed(1) || '3.2'}
                  </div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                    CiteScore: {j.citeScore?.toFixed(1) || '4.1'}
                  </div>
                </td>
                <td>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                    {j.indexing?.map((idx: string, i: number) => (
                      <span key={i} className="badge badge-blue" style={{ fontSize: '0.675rem' }}>
                        {idx}
                      </span>
                    ))}
                  </div>
                </td>
                <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  <div>Review: <strong>{j.reviewDurationDays || 60} days</strong></div>
                  <div>Pub: <strong>{j.publicationDurationDays || 120} days</strong></div>
                </td>
                <td>
                  <span style={{ fontWeight: 700, color: j.apc ? 'var(--accent-emerald)' : 'var(--text-muted)' }}>
                    {j.apc ? `$${j.apc} USD` : 'Free / Subscribed'}
                  </span>
                </td>
                <td>
                  <button className="btn-secondary" style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem' }}>
                    View Guidelines
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Journal Recommendation Matching Modal */}
      {showMatcher && (
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
          <div
            className="glass-panel animate-fade-in"
            style={{
              width: '100%',
              maxWidth: 780,
              padding: '2rem',
              maxHeight: '90vh',
              overflowY: 'auto',
              background: '#ffffff',
              border: '1px solid var(--border-color)',
              boxShadow: 'var(--shadow-lg)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <div>
                <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Sparkles size={18} color="var(--accent-primary)" />
                  <span>Automated Journal Matching & Recommendation</span>
                </h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Evaluates research domain, keywords, target indexing standards, and APC budget to identify optimal publication venues.
                </p>
              </div>
              <button
                onClick={() => setShowMatcher(false)}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={runRecommendationEngine} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>
                    Research Domain
                  </label>
                  <input
                    type="text"
                    value={matchDomain}
                    onChange={(e) => setMatchDomain(e.target.value)}
                    className="form-input"
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>
                    APC Budget ($ USD)
                  </label>
                  <input
                    type="number"
                    value={matchBudget}
                    onChange={(e) => setMatchBudget(e.target.value)}
                    className="form-input"
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>
                  Keywords (comma separated)
                </label>
                <input
                  type="text"
                  value={matchKeywords}
                  onChange={(e) => setMatchKeywords(e.target.value)}
                  className="form-input"
                />
              </div>

              <button type="submit" disabled={isMatching} className="btn-primary" style={{ alignSelf: 'flex-start' }}>
                {isMatching ? 'Calculating Matches...' : 'Compute Recommendation Scores'}
              </button>
            </form>

            {matchedResults.length > 0 && (
              <div>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.75rem' }}>
                  Recommended Journals Ranked by Compatibility
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {matchedResults.map((item, idx) => (
                    <div
                      key={idx}
                      style={{
                        padding: '1rem',
                        borderRadius: 'var(--radius-md)',
                        background: '#f8fafc',
                        border: '1px solid var(--border-color)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}
                    >
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
                          <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{item.journal?.name}</span>
                          <span className="badge badge-emerald">{item.matchScorePercent}% Match</span>
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          Publisher: {item.journal?.publisher} • Ref Style: {item.journal?.referenceStyle}
                        </div>
                      </div>

                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '0.85rem', fontWeight: 700, color: item.withinBudget ? 'var(--accent-emerald)' : 'var(--accent-rose)' }}>
                          APC: ${item.journal?.apc || 0} USD
                        </div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                          {item.withinBudget ? (
                            <>
                              <Check size={12} color="var(--accent-emerald)" />
                              <span>Within Budget</span>
                            </>
                          ) : (
                            <>
                              <AlertTriangle size={12} color="var(--accent-rose)" />
                              <span>Exceeds Budget</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
