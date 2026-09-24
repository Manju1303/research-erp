export enum SubmissionStatus {
  NOT_SUBMITTED = 'NOT_SUBMITTED',
  SUBMISSION_PREPARATION = 'SUBMISSION_PREPARATION',
  SUBMITTED = 'SUBMITTED',
  EDITORIAL_CHECK = 'EDITORIAL_CHECK',
  UNDER_REVIEW = 'UNDER_REVIEW',
  REVISION_REQUIRED = 'REVISION_REQUIRED',
  ACCEPTED = 'ACCEPTED',
  REJECTED = 'REJECTED',
  WITHDRAWN = 'WITHDRAWN',
  PUBLISHED = 'PUBLISHED',
}

export const SUBMISSION_STATUS_LABELS: Record<SubmissionStatus, string> = {
  [SubmissionStatus.NOT_SUBMITTED]: 'Not Submitted',
  [SubmissionStatus.SUBMISSION_PREPARATION]: 'Submission Preparation',
  [SubmissionStatus.SUBMITTED]: 'Submitted',
  [SubmissionStatus.EDITORIAL_CHECK]: 'Editorial Check',
  [SubmissionStatus.UNDER_REVIEW]: 'Under Review',
  [SubmissionStatus.REVISION_REQUIRED]: 'Revision Required',
  [SubmissionStatus.ACCEPTED]: 'Accepted',
  [SubmissionStatus.REJECTED]: 'Rejected',
  [SubmissionStatus.WITHDRAWN]: 'Withdrawn',
  [SubmissionStatus.PUBLISHED]: 'Published',
};
