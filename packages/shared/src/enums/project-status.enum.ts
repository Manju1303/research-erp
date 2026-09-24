/**
 * Project lifecycle statuses (17 official stages from client specification).
 */
export enum ProjectStatus {
  NEW_REQUIREMENT = 'NEW_REQUIREMENT',
  REQUIREMENT_ANALYSIS = 'REQUIREMENT_ANALYSIS',
  TOPIC_FINALIZATION = 'TOPIC_FINALIZATION',
  RESEARCH_IN_PROGRESS = 'RESEARCH_IN_PROGRESS',
  DRAFTING = 'DRAFTING',
  INTERNAL_REVIEW = 'INTERNAL_REVIEW',
  CLIENT_REVIEW = 'CLIENT_REVIEW',
  REVISION = 'REVISION',
  FINAL_MANUSCRIPT = 'FINAL_MANUSCRIPT',
  JOURNAL_SELECTION = 'JOURNAL_SELECTION',
  SUBMISSION_PENDING = 'SUBMISSION_PENDING',
  SUBMITTED = 'SUBMITTED',
  UNDER_REVIEW = 'UNDER_REVIEW',
  REVISION_REQUIRED = 'REVISION_REQUIRED',
  ACCEPTED = 'ACCEPTED',
  PUBLISHED = 'PUBLISHED',
  COMPLETED = 'COMPLETED',
  // Backward compatibility alias
  REQUIREMENT_SUBMITTED = 'NEW_REQUIREMENT',
  TOPIC_FINALIZED = 'TOPIC_FINALIZATION',
  INTERNAL_QC = 'INTERNAL_REVIEW',
  CLIENT_APPROVED = 'FINAL_MANUSCRIPT',
}

export const PROJECT_STATUS_LABELS: Record<string, string> = {
  [ProjectStatus.NEW_REQUIREMENT]: 'New Requirement',
  [ProjectStatus.REQUIREMENT_ANALYSIS]: 'Requirement Analysis',
  [ProjectStatus.TOPIC_FINALIZATION]: 'Topic Finalization',
  [ProjectStatus.RESEARCH_IN_PROGRESS]: 'Research in Progress',
  [ProjectStatus.DRAFTING]: 'Drafting',
  [ProjectStatus.INTERNAL_REVIEW]: 'Internal Review (QC)',
  [ProjectStatus.CLIENT_REVIEW]: 'Client Review',
  [ProjectStatus.REVISION]: 'Revision',
  [ProjectStatus.FINAL_MANUSCRIPT]: 'Final Manuscript',
  [ProjectStatus.JOURNAL_SELECTION]: 'Journal Selection',
  [ProjectStatus.SUBMISSION_PENDING]: 'Submission Pending',
  [ProjectStatus.SUBMITTED]: 'Submitted',
  [ProjectStatus.UNDER_REVIEW]: 'Under Review',
  [ProjectStatus.REVISION_REQUIRED]: 'Revision Required',
  [ProjectStatus.ACCEPTED]: 'Accepted',
  [ProjectStatus.PUBLISHED]: 'Published',
  [ProjectStatus.COMPLETED]: 'Completed',
};
