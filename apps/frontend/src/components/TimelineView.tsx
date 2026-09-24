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
    <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '2rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
        <h4 style={{ fontSize: '0.925rem', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '0.02em' }}>
          PROJECT PUBLICATION LIFECYCLE
        </h4>
        <span style={{ fontSize: '0.8rem', color: 'var(--accent-cyan)', fontWeight: 600 }}>
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
                      : 'rgba(255, 255, 255, 0.05)',
                    color: isDone || isCurrent ? '#ffffff' : 'var(--text-muted)',
                    border: isCurrent ? '2px solid rgba(255,255,255,0.6)' : '1px solid var(--border-color)',
                    boxShadow: isCurrent ? '0 0 15px rgba(6, 182, 212, 0.6)' : 'none',
                    transition: 'all 0.3s ease',
                  }}
                >
                  {isDone ? '✓' : idx + 1}
                </div>
                <span
                  style={{
                    marginTop: '0.5rem',
                    fontSize: '0.725rem',
                    fontWeight: isCurrent ? 700 : 500,
                    color: isCurrent ? 'var(--accent-cyan)' : isDone ? 'var(--text-primary)' : 'var(--text-muted)',
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
                    background: idx < activeIndex ? 'var(--accent-emerald)' : 'rgba(255, 255, 255, 0.08)',
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
