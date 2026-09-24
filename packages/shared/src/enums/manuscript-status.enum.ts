export enum ManuscriptStatus {
  DRAFT = 'DRAFT',
  QC_PENDING = 'QC_PENDING',
  QC_PASSED = 'QC_PASSED',
  QC_FAILED = 'QC_FAILED',
  CLIENT_SENT = 'CLIENT_SENT',
  CLIENT_APPROVED = 'CLIENT_APPROVED',
  CLIENT_REVISION_REQUESTED = 'CLIENT_REVISION_REQUESTED',
  SUBMISSION_READY = 'SUBMISSION_READY',
}

export const MANUSCRIPT_STATUS_LABELS: Record<ManuscriptStatus, string> = {
  [ManuscriptStatus.DRAFT]: 'Draft',
  [ManuscriptStatus.QC_PENDING]: 'QC Pending',
  [ManuscriptStatus.QC_PASSED]: 'QC Passed',
  [ManuscriptStatus.QC_FAILED]: 'QC Failed — Revision Required',
  [ManuscriptStatus.CLIENT_SENT]: 'Sent to Client',
  [ManuscriptStatus.CLIENT_APPROVED]: 'Client Approved',
  [ManuscriptStatus.CLIENT_REVISION_REQUESTED]: 'Revision Requested by Client',
  [ManuscriptStatus.SUBMISSION_READY]: 'Submission Ready',
};
