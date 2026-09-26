import React from 'react';

const STAGES = [
  { key: 'REQUIREMENT_SUBMITTED', label: 'Requirement' },
  { key: 'TOPIC_FINALIZED', label: 'Topic Ready' },
  { key: 'RESEARCH_IN_PROGRESS', label: 'Research' },
  { key: 'DRAFTING', label: 'Drafting' },
  { key: 'INTERNAL_QC', label: 'Internal QC' },
  { key: 'CLIENT_REVIEW', label: 'Author Review' },
  { key: 'CLIENT_APPROVED', label: 'Approved' },
  { key: 'JOURNAL_MATCHING', label: 'Journal Match' },
  { key: 'SUBMISSION_PENDING', label: 'Submission' },
  { key: 'PUBLISHED', label: 'Published' },
];

export const TimelineView: React.FC<{ currentStatus: string }> = ({ currentStatus }) => {
  const currentIndex = STAGES.findIndex((s) => s.key === currentStatus);
  const activeIndex = currentIndex === -1 ? 4 : currentIndex;

  return (
    <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '2rem', background: '#ffffff' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
        <h4 style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
          Project Publication Lifecycle
        </h4>
        <span style={{ fontSize: '0.8rem', color: 'var(--accent-primary)', fontWeight: 600 }}>
          Stage {activeIndex + 1} of {STAGES.length}
        </span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', position: 'relative', width: '100%', overflowX: 'auto', paddingBottom: '0.5rem' }}>
        {STAGES.map((stage, idx) => {
          const isDone = idx < activeIndex;
          const isCurrent = idx === activeIndex;

          return (
            <React.Fragment key={stage.key}>
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  minWidth: 90,
                  position: 'relative',
                  zIndex: 2,
                }}
              >
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    background: isDone
                      ? 'var(--accent-emerald)'
                      : isCurrent
                      ? 'var(--gradient-primary)'
                      : '#f1f5f9',
                    color: isDone || isCurrent ? '#ffffff' : 'var(--text-muted)',
                    border: isCurrent ? '2px solid #ffffff' : isDone ? 'none' : '1px solid var(--border-color)',
                    boxShadow: isCurrent ? '0 0 10px rgba(98, 142, 203, 0.45)' : 'none',
                    transition: 'all 0.2s ease',
                  }}
                >
                  {isDone ? '✓' : idx + 1}
                </div>
                <span
                  style={{
                    marginTop: '0.5rem',
                    fontSize: '0.725rem',
                    fontWeight: isCurrent ? 700 : isDone ? 600 : 500,
                    color: isCurrent ? 'var(--accent-primary)' : isDone ? 'var(--text-primary)' : 'var(--text-muted)',
                    textAlign: 'center',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {stage.label}
                </span>
              </div>

              {idx < STAGES.length - 1 && (
                <div
                  style={{
                    flex: 1,
                    height: 2,
                    background: idx < activeIndex ? 'var(--accent-emerald)' : '#e2e8f0',
                    minWidth: 20,
                    marginTop: -22,
                    zIndex: 1,
                  }}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};
