// ============================================================
// Domain Events — Single source of truth for all ERP events
// Pattern: entity.action → condition check → reaction(s)
// ============================================================

// ─── Event Name Constants ────────────────────────────────────

export const DomainEvents = {
  // Project lifecycle
  PROJECT_CREATED: 'project.created',
  PROJECT_STATUS_CHANGED: 'project.status.changed',
  PROJECT_ASSIGNED: 'project.staff.assigned',
  PROJECT_DEADLINE_APPROACHING: 'project.deadline.approaching',
  PROJECT_STALE: 'project.stale',

  // Task lifecycle
  TASK_CREATED: 'task.created',
  TASK_STATUS_CHANGED: 'task.status.changed',
  TASK_ASSIGNED: 'task.assigned',
  TASK_OVERDUE: 'task.overdue',
  TASK_ALL_COMPLETED: 'task.all.completed',

  // Manuscript lifecycle
  MANUSCRIPT_CREATED: 'manuscript.created',
  MANUSCRIPT_VERSION_CREATED: 'manuscript.version.created',
  MANUSCRIPT_STATUS_CHANGED: 'manuscript.status.changed',
  MANUSCRIPT_QC_PASSED: 'manuscript.qc.passed',
  MANUSCRIPT_QC_FAILED: 'manuscript.qc.failed',
  MANUSCRIPT_CLIENT_APPROVED: 'manuscript.client.approved',
  MANUSCRIPT_CLIENT_REVISION: 'manuscript.client.revision',

  // Submission lifecycle
  SUBMISSION_CREATED: 'submission.created',
  SUBMISSION_STATUS_CHANGED: 'submission.status.changed',
  SUBMISSION_ACCEPTED: 'submission.accepted',
  SUBMISSION_REJECTED: 'submission.rejected',
  SUBMISSION_REVISION_REQUIRED: 'submission.revision.required',

  // Publication
  PUBLICATION_CREATED: 'publication.created',

  // Finance
  INVOICE_CREATED: 'invoice.created',
  INVOICE_OVERDUE: 'invoice.overdue',
  PAYMENT_RECEIVED: 'payment.received',

  // Communication
  COMMUNICATION_SENT: 'communication.sent',
} as const;

export type DomainEventName = (typeof DomainEvents)[keyof typeof DomainEvents];

// ─── Event Payload Interfaces ────────────────────────────────

export interface ProjectCreatedEvent {
  projectId: string;
  projectCode: string;
  title: string;
  clientId: string;
  creatorId: string;
  managerId?: string;
  priority: string;
}

export interface ProjectStatusChangedEvent {
  projectId: string;
  projectCode: string;
  title: string;
  fromStatus: string;
  toStatus: string;
  changedBy: string;
  note?: string;
  clientId: string;
  managerId?: string;
}

export interface ProjectStaffAssignedEvent {
  projectId: string;
  projectCode: string;
  userId: string;
  role: string;
  assignedBy: string;
}

export interface ProjectDeadlineEvent {
  projectId: string;
  projectCode: string;
  title: string;
  deadline: Date;
  daysRemaining: number;
  managerId?: string;
  clientId: string;
}

export interface ProjectStaleEvent {
  projectId: string;
  projectCode: string;
  title: string;
  status: string;
  lastUpdatedAt: Date;
  daysSinceUpdate: number;
  managerId?: string;
}

export interface TaskCreatedEvent {
  taskId: string;
  projectId: string;
  title: string;
  assigneeId?: string;
  creatorId: string;
  dueDate?: Date;
}

export interface TaskStatusChangedEvent {
  taskId: string;
  projectId: string;
  title: string;
  fromStatus: string;
  toStatus: string;
  assigneeId?: string;
  completionPct: number;
}

export interface TaskAssignedEvent {
  taskId: string;
  projectId: string;
  title: string;
  assigneeId: string;
  assignedBy: string;
}

export interface TaskOverdueEvent {
  taskId: string;
  projectId: string;
  title: string;
  dueDate: Date;
  assigneeId?: string;
  daysOverdue: number;
}

export interface AllTasksCompletedEvent {
  projectId: string;
  projectCode: string;
  totalTasks: number;
  completedBy: string;
}

export interface ManuscriptCreatedEvent {
  manuscriptId: string;
  projectId: string;
  title: string;
  authorId: string;
}

export interface ManuscriptVersionCreatedEvent {
  manuscriptId: string;
  versionId: string;
  projectId: string;
  versionNumber: number;
  authorId: string;
}

export interface ManuscriptStatusChangedEvent {
  versionId: string;
  manuscriptId: string;
  projectId: string;
  title: string;
  fromStatus: string;
  toStatus: string;
  changedBy: string;
  notes?: string;
}

export interface SubmissionCreatedEvent {
  submissionId: string;
  projectId: string;
  journalId: string;
  journalName: string;
  manuscriptVersionId?: string;
}

export interface SubmissionStatusChangedEvent {
  submissionId: string;
  projectId: string;
  projectCode: string;
  fromStatus: string;
  toStatus: string;
  journalName: string;
}

export interface PublicationCreatedEvent {
  publicationId: string;
  projectId: string;
  projectCode: string;
  title: string;
  doi?: string;
  journalName: string;
}

export interface InvoiceCreatedEvent {
  invoiceId: string;
  invoiceNumber: string;
  projectId: string;
  clientId: string;
  amount: number;
  currency: string;
  dueDate?: Date;
}

export interface PaymentReceivedEvent {
  paymentId: string;
  invoiceId?: string;
  projectId: string;
  clientId: string;
  amount: number;
}
