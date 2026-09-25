// ============================================================
// Notification Dispatch Rules
// Maps domain events → who gets notified and what they see
// ============================================================

import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { PrismaService } from '../../../database/prisma.service';
import { NotificationsService } from '../../notifications/notifications.service';
import {
  DomainEvents,
  ProjectCreatedEvent,
  ProjectStatusChangedEvent,
  ProjectStaffAssignedEvent,
  ProjectDeadlineEvent,
  ProjectStaleEvent,
  TaskCreatedEvent,
  TaskStatusChangedEvent,
  TaskOverdueEvent,
  ManuscriptStatusChangedEvent,
  ManuscriptVersionCreatedEvent,
  SubmissionStatusChangedEvent,
  SubmissionCreatedEvent,
  PublicationCreatedEvent,
  InvoiceCreatedEvent,
  PaymentReceivedEvent,
} from '../events/domain-events';
import { PROJECT_STATUS_LABELS } from '@inzovate/shared';

@Injectable()
export class NotificationDispatcher {
  private readonly logger = new Logger(NotificationDispatcher.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly notifications: NotificationsService,
  ) {}

  // ─── PROJECT EVENTS ──────────────────────────────────────

  @OnEvent(DomainEvents.PROJECT_CREATED)
  async onProjectCreated(event: ProjectCreatedEvent) {
    this.logger.log(`[Event] Project created: ${event.projectCode}`);

    // Notify the assigned manager
    if (event.managerId) {
      await this.notifications.create(
        event.managerId,
        'PROJECT_CREATED',
        'New Project Assigned',
        `Project "${event.title}" (${event.projectCode}) has been created and assigned to you. Priority: ${event.priority}.`,
        { projectId: event.projectId, projectCode: event.projectCode },
      );
    }

    // Notify operations managers
    await this.notifyByRole(
      'operations_manager',
      'PROJECT_CREATED',
      'New Project Created',
      `A new project "${event.title}" (${event.projectCode}) has been created.`,
      { projectId: event.projectId },
      [event.creatorId], // exclude the creator
    );
  }

  @OnEvent(DomainEvents.PROJECT_STATUS_CHANGED)
  async onProjectStatusChanged(event: ProjectStatusChangedEvent) {
    this.logger.log(
      `[Event] Project ${event.projectCode}: ${event.fromStatus} → ${event.toStatus}`,
    );

    const statusLabel =
      PROJECT_STATUS_LABELS[event.toStatus] || event.toStatus;
    const fromLabel =
      PROJECT_STATUS_LABELS[event.fromStatus] || event.fromStatus;

    // Notify the project manager
    if (event.managerId && event.managerId !== event.changedBy) {
      await this.notifications.create(
        event.managerId,
        'PROJECT_STATUS_CHANGED',
        `Project Status Updated`,
        `"${event.title}" (${event.projectCode}) moved from ${fromLabel} to ${statusLabel}.${event.note ? ` Note: ${event.note}` : ''}`,
        { projectId: event.projectId, fromStatus: event.fromStatus, toStatus: event.toStatus },
      );
    }

    // Notify client on key milestones
    const clientVisibleStatuses = [
      'CLIENT_REVIEW', 'FINAL_MANUSCRIPT', 'SUBMITTED',
      'ACCEPTED', 'PUBLISHED', 'COMPLETED', 'ON_HOLD', 'CANCELLED',
    ];
    if (clientVisibleStatuses.includes(event.toStatus)) {
      const clientUser = await this.getClientUser(event.clientId);
      if (clientUser) {
        await this.notifications.create(
          clientUser.id,
          'PROJECT_STATUS_CHANGED',
          `Project Update: ${statusLabel}`,
          `Your project "${event.title}" (${event.projectCode}) has reached the "${statusLabel}" stage.`,
          { projectId: event.projectId, status: event.toStatus },
        );
      }
    }

    // Notify assigned staff on relevant transitions
    const staffNotifyStatuses = [
      'RESEARCH_IN_PROGRESS', 'DRAFTING', 'REVISION',
      'INTERNAL_REVIEW', 'REVISION_REQUIRED',
    ];
    if (staffNotifyStatuses.includes(event.toStatus)) {
      await this.notifyProjectStaff(
        event.projectId,
        'PROJECT_STATUS_CHANGED',
        `Project Ready: ${statusLabel}`,
        `Project "${event.title}" (${event.projectCode}) is now in ${statusLabel}. Please check your assigned tasks.`,
        { projectId: event.projectId },
        [event.changedBy],
      );
    }
  }

  @OnEvent(DomainEvents.PROJECT_ASSIGNED)
  async onProjectStaffAssigned(event: ProjectStaffAssignedEvent) {
    await this.notifications.create(
      event.userId,
      'PROJECT_ASSIGNED',
      'You Have Been Assigned to a Project',
      `You have been assigned as ${event.role} on project ${event.projectCode}.`,
      { projectId: event.projectId, role: event.role },
    );
  }

  @OnEvent(DomainEvents.PROJECT_DEADLINE_APPROACHING)
  async onDeadlineApproaching(event: ProjectDeadlineEvent) {
    this.logger.warn(
      `[Event] Deadline approaching: ${event.projectCode} — ${event.daysRemaining} days left`,
    );

    const recipients: string[] = [];
    if (event.managerId) recipients.push(event.managerId);

    // Also notify operations managers
    const opsManagers = await this.getUsersByRole('operations_manager');
    recipients.push(...opsManagers.map((u) => u.id));

    const unique = [...new Set(recipients)];
    for (const userId of unique) {
      await this.notifications.create(
        userId,
        'PROJECT_DEADLINE_APPROACHING',
        `Deadline Alert: ${event.daysRemaining} Days Remaining`,
        `Project "${event.title}" (${event.projectCode}) has a deadline approaching on ${event.deadline.toLocaleDateString()}. ${event.daysRemaining} day(s) remaining.`,
        { projectId: event.projectId, deadline: event.deadline, daysRemaining: event.daysRemaining },
      );
    }
  }

  @OnEvent(DomainEvents.PROJECT_STALE)
  async onProjectStale(event: ProjectStaleEvent) {
    this.logger.warn(
      `[Event] Stale project: ${event.projectCode} — no update for ${event.daysSinceUpdate} days`,
    );

    if (event.managerId) {
      await this.notifications.create(
        event.managerId,
        'PROJECT_STALE',
        `Stale Project Alert`,
        `Project "${event.title}" (${event.projectCode}) has not been updated for ${event.daysSinceUpdate} days. Current status: ${PROJECT_STATUS_LABELS[event.status] || event.status}.`,
        { projectId: event.projectId, daysSinceUpdate: event.daysSinceUpdate },
      );
    }

    await this.notifyByRole(
      'operations_manager',
      'PROJECT_STALE',
      `Stale Project: ${event.projectCode}`,
      `"${event.title}" has been inactive for ${event.daysSinceUpdate} days in status "${PROJECT_STATUS_LABELS[event.status] || event.status}".`,
      { projectId: event.projectId },
    );
  }

  // ─── TASK EVENTS ─────────────────────────────────────────

  @OnEvent(DomainEvents.TASK_CREATED)
  async onTaskCreated(event: TaskCreatedEvent) {
    if (event.assigneeId && event.assigneeId !== event.creatorId) {
      await this.notifications.create(
        event.assigneeId,
        'TASK_ASSIGNED',
        'New Task Assigned',
        `You have been assigned a new task: "${event.title}".${event.dueDate ? ` Due: ${new Date(event.dueDate).toLocaleDateString()}.` : ''}`,
        { taskId: event.taskId, projectId: event.projectId },
      );
    }
  }

  @OnEvent(DomainEvents.TASK_STATUS_CHANGED)
  async onTaskStatusChanged(event: TaskStatusChangedEvent) {
    this.logger.log(
      `[Event] Task "${event.title}" status: ${event.fromStatus} → ${event.toStatus}`,
    );

    // Notify the project manager when a task completes
    if (event.toStatus === 'COMPLETED') {
      const project = await this.prisma.project.findUnique({
        where: { id: event.projectId },
        select: { managerId: true, projectCode: true },
      });
      if (project?.managerId && project.managerId !== event.assigneeId) {
        await this.notifications.create(
          project.managerId,
          'TASK_COMPLETED',
          'Task Completed',
          `Task "${event.title}" on project ${project.projectCode} has been completed.`,
          { taskId: event.taskId, projectId: event.projectId },
        );
      }
    }
  }

  @OnEvent(DomainEvents.TASK_OVERDUE)
  async onTaskOverdue(event: TaskOverdueEvent) {
    if (event.assigneeId) {
      await this.notifications.create(
        event.assigneeId,
        'TASK_OVERDUE',
        'Task Overdue',
        `Task "${event.title}" is ${event.daysOverdue} day(s) overdue. Please update your progress.`,
        { taskId: event.taskId, projectId: event.projectId, daysOverdue: event.daysOverdue },
      );
    }

    // Also notify project manager
    const project = await this.prisma.project.findUnique({
      where: { id: event.projectId },
      select: { managerId: true, projectCode: true },
    });
    if (project?.managerId) {
      await this.notifications.create(
        project.managerId,
        'TASK_OVERDUE',
        `Overdue Task on ${project.projectCode}`,
        `Task "${event.title}" is ${event.daysOverdue} day(s) overdue.`,
        { taskId: event.taskId, projectId: event.projectId },
      );
    }
  }

  // ─── MANUSCRIPT EVENTS ──────────────────────────────────

  @OnEvent(DomainEvents.MANUSCRIPT_STATUS_CHANGED)
  async onManuscriptStatusChanged(event: ManuscriptStatusChangedEvent) {
    this.logger.log(
      `[Event] Manuscript status: ${event.fromStatus} → ${event.toStatus} (Project: ${event.projectId})`,
    );

    const project = await this.prisma.project.findUnique({
      where: { id: event.projectId },
      select: {
        managerId: true,
        projectCode: true,
        clientId: true,
        client: { select: { userId: true } },
      },
    });
    if (!project) return;

    // QC Failed → notify author + manager
    if (event.toStatus === 'QC_FAILED') {
      await this.notifications.create(
        event.changedBy,
        'MANUSCRIPT_QC_FAILED',
        'Manuscript QC Failed',
        `"${event.title}" did not pass quality check.${event.notes ? ` Feedback: ${event.notes}` : ''} Please revise and resubmit.`,
        { versionId: event.versionId, projectId: event.projectId },
      );

      if (project.managerId && project.managerId !== event.changedBy) {
        await this.notifications.create(
          project.managerId,
          'MANUSCRIPT_QC_FAILED',
          `QC Failed: ${project.projectCode}`,
          `Manuscript "${event.title}" failed QC review.`,
          { versionId: event.versionId, projectId: event.projectId },
        );
      }
    }

    // QC Passed → notify manager
    if (event.toStatus === 'QC_PASSED' && project.managerId) {
      await this.notifications.create(
        project.managerId,
        'MANUSCRIPT_QC_PASSED',
        `QC Passed: ${project.projectCode}`,
        `Manuscript "${event.title}" has passed quality check and is ready for client review.`,
        { versionId: event.versionId, projectId: event.projectId },
      );
    }

    // Client Sent → notify client
    if (event.toStatus === 'CLIENT_SENT' && project.client?.userId) {
      await this.notifications.create(
        project.client.userId,
        'MANUSCRIPT_CLIENT_SENT',
        'Manuscript Ready for Your Review',
        `The manuscript "${event.title}" for project ${project.projectCode} is ready for your review and approval.`,
        { versionId: event.versionId, projectId: event.projectId },
      );
    }

    // Client Approved → notify manager + staff
    if (event.toStatus === 'CLIENT_APPROVED') {
      if (project.managerId) {
        await this.notifications.create(
          project.managerId,
          'MANUSCRIPT_CLIENT_APPROVED',
          `Client Approved: ${project.projectCode}`,
          `The client has approved the manuscript "${event.title}". Ready for journal selection.`,
          { versionId: event.versionId, projectId: event.projectId },
        );
      }
    }

    // Client Revision → notify manager + author
    if (event.toStatus === 'CLIENT_REVISION_REQUESTED') {
      await this.notifyProjectStaff(
        event.projectId,
        'MANUSCRIPT_CLIENT_REVISION',
        `Client Revision Requested: ${project.projectCode}`,
        `The client has requested revisions on manuscript "${event.title}".${event.notes ? ` Feedback: ${event.notes}` : ''}`,
        { versionId: event.versionId, projectId: event.projectId },
      );
    }
  }

  @OnEvent(DomainEvents.MANUSCRIPT_VERSION_CREATED)
  async onManuscriptVersionCreated(event: ManuscriptVersionCreatedEvent) {
    const project = await this.prisma.project.findUnique({
      where: { id: event.projectId },
      select: { managerId: true, projectCode: true },
    });
    if (project?.managerId && project.managerId !== event.authorId) {
      await this.notifications.create(
        project.managerId,
        'MANUSCRIPT_VERSION_CREATED',
        `New Manuscript Version: ${project.projectCode}`,
        `Version ${event.versionNumber} of the manuscript has been created.`,
        { manuscriptId: event.manuscriptId, versionId: event.versionId },
      );
    }
  }

  // ─── SUBMISSION EVENTS ──────────────────────────────────

  @OnEvent(DomainEvents.SUBMISSION_CREATED)
  async onSubmissionCreated(event: SubmissionCreatedEvent) {
    const project = await this.prisma.project.findUnique({
      where: { id: event.projectId },
      select: { managerId: true, projectCode: true, clientId: true, client: { select: { userId: true } } },
    });
    if (!project) return;

    // Notify manager
    if (project.managerId) {
      await this.notifications.create(
        project.managerId,
        'SUBMISSION_CREATED',
        `Submission Created: ${project.projectCode}`,
        `Manuscript for project ${project.projectCode} has been submitted to ${event.journalName}.`,
        { submissionId: event.submissionId, projectId: event.projectId },
      );
    }

    // Notify client
    if (project.client?.userId) {
      await this.notifications.create(
        project.client.userId,
        'SUBMISSION_CREATED',
        'Your Manuscript Has Been Submitted',
        `Your manuscript for project ${project.projectCode} has been submitted to ${event.journalName} for review.`,
        { submissionId: event.submissionId, projectId: event.projectId },
      );
    }
  }

  @OnEvent(DomainEvents.SUBMISSION_STATUS_CHANGED)
  async onSubmissionStatusChanged(event: SubmissionStatusChangedEvent) {
    this.logger.log(
      `[Event] Submission status: ${event.fromStatus} → ${event.toStatus} (${event.projectCode})`,
    );

    const project = await this.prisma.project.findUnique({
      where: { id: event.projectId },
      select: { managerId: true, clientId: true, client: { select: { userId: true } } },
    });
    if (!project) return;

    // Notify manager for all submission status changes
    if (project.managerId) {
      await this.notifications.create(
        project.managerId,
        'SUBMISSION_STATUS_CHANGED',
        `Submission Update: ${event.projectCode}`,
        `The submission to ${event.journalName} for project ${event.projectCode} is now "${event.toStatus}".`,
        { submissionId: event.submissionId, projectId: event.projectId, status: event.toStatus },
      );
    }

    // Key statuses the client should know about
    const clientVisibleSubmissionStatuses = ['ACCEPTED', 'REJECTED', 'PUBLISHED', 'REVISION_REQUIRED'];
    if (clientVisibleSubmissionStatuses.includes(event.toStatus) && project.client?.userId) {
      const statusMessages: Record<string, string> = {
        ACCEPTED: `Great news! Your manuscript submitted to ${event.journalName} has been accepted for publication.`,
        REJECTED: `We regret to inform you that the submission to ${event.journalName} was not accepted. Your project manager will discuss next steps with you.`,
        PUBLISHED: `Your manuscript has been published in ${event.journalName}. Congratulations!`,
        REVISION_REQUIRED: `The journal ${event.journalName} has requested revisions to your manuscript. Our team is working on the required changes.`,
      };

      await this.notifications.create(
        project.client.userId,
        'SUBMISSION_STATUS_CHANGED',
        `Submission Update: ${event.toStatus === 'ACCEPTED' ? 'Accepted!' : event.toStatus}`,
        statusMessages[event.toStatus] || `Submission status updated to ${event.toStatus}.`,
        { submissionId: event.submissionId, projectId: event.projectId },
      );
    }
  }

  // ─── PUBLICATION EVENTS ─────────────────────────────────

  @OnEvent(DomainEvents.PUBLICATION_CREATED)
  async onPublicationCreated(event: PublicationCreatedEvent) {
    // Notify all relevant stakeholders about publication
    const project = await this.prisma.project.findUnique({
      where: { id: event.projectId },
      select: { managerId: true, clientId: true, client: { select: { userId: true } } },
    });
    if (!project) return;

    // Notify manager
    if (project.managerId) {
      await this.notifications.create(
        project.managerId,
        'PUBLICATION_CREATED',
        `Published: ${event.projectCode}`,
        `"${event.title}" has been published in ${event.journalName}.${event.doi ? ` DOI: ${event.doi}` : ''}`,
        { publicationId: event.publicationId, projectId: event.projectId },
      );
    }

    // Notify client
    if (project.client?.userId) {
      await this.notifications.create(
        project.client.userId,
        'PUBLICATION_CREATED',
        'Your Research Has Been Published!',
        `Congratulations! "${event.title}" has been published in ${event.journalName}.${event.doi ? ` DOI: ${event.doi}` : ''}`,
        { publicationId: event.publicationId, projectId: event.projectId },
      );
    }

    // Notify operations managers
    await this.notifyByRole(
      'operations_manager',
      'PUBLICATION_CREATED',
      `New Publication: ${event.projectCode}`,
      `"${event.title}" published in ${event.journalName}.`,
      { publicationId: event.publicationId, projectId: event.projectId },
    );
  }

  // ─── FINANCE EVENTS ─────────────────────────────────────

  @OnEvent(DomainEvents.INVOICE_CREATED)
  async onInvoiceCreated(event: InvoiceCreatedEvent) {
    // Notify client
    const client = await this.prisma.client.findUnique({
      where: { id: event.clientId },
      select: { userId: true },
    });
    if (client) {
      await this.notifications.create(
        client.userId,
        'INVOICE_CREATED',
        'New Invoice Generated',
        `Invoice ${event.invoiceNumber} for ${event.currency} ${event.amount} has been generated.${event.dueDate ? ` Due: ${new Date(event.dueDate).toLocaleDateString()}.` : ''}`,
        { invoiceId: event.invoiceId, projectId: event.projectId },
      );
    }

    // Notify finance team
    await this.notifyByRole(
      'finance',
      'INVOICE_CREATED',
      `Invoice Created: ${event.invoiceNumber}`,
      `Invoice ${event.invoiceNumber} for ${event.currency} ${event.amount} has been created.`,
      { invoiceId: event.invoiceId },
    );
  }

  @OnEvent(DomainEvents.PAYMENT_RECEIVED)
  async onPaymentReceived(event: PaymentReceivedEvent) {
    await this.notifyByRole(
      'finance',
      'PAYMENT_RECEIVED',
      'Payment Received',
      `Payment of ${event.amount} received for project.`,
      { paymentId: event.paymentId, projectId: event.projectId },
    );
  }

  // ─── HELPERS ─────────────────────────────────────────────

  private async getClientUser(clientId: string) {
    const client = await this.prisma.client.findUnique({
      where: { id: clientId },
      select: { userId: true, user: { select: { id: true } } },
    });
    return client?.user ?? null;
  }

  private async getUsersByRole(roleName: string) {
    return this.prisma.user.findMany({
      where: {
        role: { name: roleName },
        isActive: true,
        deletedAt: null,
      },
      select: { id: true },
    });
  }

  private async notifyByRole(
    roleName: string,
    type: string,
    title: string,
    body: string,
    metadata?: any,
    excludeUserIds: string[] = [],
  ) {
    const users = await this.getUsersByRole(roleName);
    for (const user of users) {
      if (!excludeUserIds.includes(user.id)) {
        await this.notifications.create(user.id, type, title, body, metadata);
      }
    }
  }

  private async notifyProjectStaff(
    projectId: string,
    type: string,
    title: string,
    body: string,
    metadata?: any,
    excludeUserIds: string[] = [],
  ) {
    const staff = await this.prisma.projectStaff.findMany({
      where: { projectId },
      select: { userId: true },
    });
    for (const s of staff) {
      if (!excludeUserIds.includes(s.userId)) {
        await this.notifications.create(s.userId, type, title, body, metadata);
      }
    }
  }
}
