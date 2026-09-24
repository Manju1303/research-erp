import React from 'react';

interface StatusBadgeProps {
  status: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const getBadgeClass = (s: string) => {
    switch (s) {
      case 'REQUIREMENT_SUBMITTED':
      case 'REQUIREMENT_ANALYSIS':
        return 'badge-blue';
      case 'TOPIC_FINALIZED':
      case 'RESEARCH_IN_PROGRESS':
        return 'badge-purple';
      case 'DRAFTING':
        return 'badge-cyan';
      case 'INTERNAL_QC':
      case 'QC_PENDING':
        return 'badge-amber';
      case 'QC_PASSED':
      case 'CLIENT_APPROVED':
      case 'ACCEPTED':
      case 'PUBLISHED':
      case 'COMPLETED':
        return 'badge-emerald';
      case 'QC_FAILED':
      case 'CLIENT_REVISION_REQUESTED':
      case 'CANCELLED':
        return 'badge-rose';
      case 'CLIENT_REVIEW':
      case 'CLIENT_SENT':
      case 'UNDER_REVIEW':
        return 'badge-blue';
      default:
        return 'badge-blue';
    }
  };

  const formatText = (s: string) => {
    return s.replace(/_/g, ' ');
  };

  return (
    <span className={`badge ${getBadgeClass(status)}`}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'currentColor' }} />
      {formatText(status)}
    </span>
  );
};
