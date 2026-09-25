// ============================================================
// Status Cascade Listener
// Automatically advances project/entity statuses when
// downstream conditions are met (all tasks done, QC passed, etc.)
// ============================================================

import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PrismaService } from '../../../database/prisma.service';
import {
  DomainEvents,
  TaskStatusChangedEvent,
  ManuscriptStatusChangedEvent,
  SubmissionStatusChangedEvent,
  AllTasksCompletedEvent,
} from '../events/domain-events';
import { ProjectStatus, ManuscriptStatus, SubmissionStatus } from '@inzovate/shared';

@Injectable()
export class StatusCascadeListener {
  private readonly logger = new Logger(StatusCascadeListener.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  // ─── RULE: All project tasks completed → auto-advance project ──

  @OnEvent(DomainEvents.TASK_STATUS_CHANGED)
  async onTaskCompleted(event: TaskStatusChangedEvent) {
    if (event.toStatus !== 'COMPLETED') return;

    // Check if ALL tasks for this project are now completed
    const pendingTasks = await this.prisma.task.count({
      where: {
        projectId: event.projectId,
        deletedAt: null,
        status: { not: 'COMPLETED' },
      },
    });

    if (pendingTasks === 0) {
      const totalTasks = await this.prisma.task.count({
        where: { projectId: event.projectId, deletedAt: null },
      });

      if (totalTasks > 0) {
        const project = await this.prisma.project.findUnique({
          where: { id: event.projectId },
          select: { id: true, projectCode: true, status: true },
        });

        if (project) {
          this.logger.log(
            `[Cascade] All ${totalTasks} tasks completed for ${project.projectCode} — emitting ALL_TASKS_COMPLETED`,
          );

          this.eventEmitter.emit(DomainEvents.TASK_ALL_COMPLETED, {
            projectId: event.projectId,
            projectCode: project.projectCode,
            totalTasks,
            completedBy: event.assigneeId || 'system',
          } as AllTasksCompletedEvent);
        }
      }
    }
  }

  @OnEvent(DomainEvents.TASK_ALL_COMPLETED)
  async onAllTasksCompleted(event: AllTasksCompletedEvent) {
    const project = await this.prisma.project.findUnique({
      where: { id: event.projectId },
      select: {
        id: true,
        status: true,
        projectCode: true,
        title: true,
        managerId: true,
        clientId: true,
      },
    });
    if (!project) return;

    // Auto-advance logic based on current status
    const autoAdvanceMap: Record<string, string> = {
      [ProjectStatus.RESEARCH_IN_PROGRESS]: ProjectStatus.DRAFTING,
      [ProjectStatus.DRAFTING]: ProjectStatus.INTERNAL_REVIEW,
      [ProjectStatus.REVISION]: ProjectStatus.INTERNAL_REVIEW,
    };

    const nextStatus = autoAdvanceMap[project.status];
    if (nextStatus) {
      this.logger.log(
        `[Cascade] Auto-advancing ${project.projectCode}: ${project.status} → ${nextStatus}`,
      );

      await this.prisma.$transaction(async (tx) => {
        await tx.project.update({
          where: { id: project.id },
          data: { status: nextStatus },
        });

        await tx.projectStatusHistory.create({
          data: {
            projectId: project.id,
            fromStatus: project.status,
            toStatus: nextStatus,
            note: `Auto-advanced: all ${event.totalTasks} assigned tasks completed.`,
            changedBy: event.completedBy,
          },
        });
      });

      this.eventEmitter.emit(DomainEvents.PROJECT_STATUS_CHANGED, {
        projectId: project.id,
        projectCode: project.projectCode,
        title: project.title,
        fromStatus: project.status,
        toStatus: nextStatus,
        changedBy: event.completedBy,
        note: `Auto-advanced: all ${event.totalTasks} tasks completed.`,
        clientId: project.clientId,
        managerId: project.managerId,
      });
    }
  }

  // ─── RULE: Manuscript QC Passed → advance project to CLIENT_REVIEW ──

  @OnEvent(DomainEvents.MANUSCRIPT_STATUS_CHANGED)
  async onManuscriptStatusChanged(event: ManuscriptStatusChangedEvent) {
    const project = await this.prisma.project.findUnique({
      where: { id: event.projectId },
      select: {
        id: true,
        status: true,
        projectCode: true,
        title: true,
        managerId: true,
        clientId: true,
      },
    });
    if (!project) return;

    // QC Passed + project in INTERNAL_REVIEW → advance to CLIENT_REVIEW
    if (
      event.toStatus === ManuscriptStatus.QC_PASSED &&
      project.status === ProjectStatus.INTERNAL_REVIEW
    ) {
      this.logger.log(
        `[Cascade] Manuscript QC passed for ${project.projectCode} — advancing to CLIENT_REVIEW`,
      );

      await this.advanceProject(
        project,
        ProjectStatus.CLIENT_REVIEW,
        `Manuscript passed QC verification — ready for client review.`,
        event.changedBy,
      );
    }

    // Client Sent → project to CLIENT_REVIEW (if not already)
    if (
      event.toStatus === ManuscriptStatus.CLIENT_SENT &&
      project.status === ProjectStatus.INTERNAL_REVIEW
    ) {
      await this.advanceProject(
        project,
        ProjectStatus.CLIENT_REVIEW,
        `Manuscript sent to client for review.`,
        event.changedBy,
      );
    }

    // Client Approved → project to FINAL_MANUSCRIPT
    if (
      event.toStatus === ManuscriptStatus.CLIENT_APPROVED &&
      project.status === ProjectStatus.CLIENT_REVIEW
    ) {
      this.logger.log(
        `[Cascade] Client approved manuscript for ${project.projectCode} — advancing to FINAL_MANUSCRIPT`,
      );

      await this.advanceProject(
        project,
        ProjectStatus.FINAL_MANUSCRIPT,
        `Client approved the manuscript. Ready for journal selection.`,
        event.changedBy,
      );
    }

    // Client Revision Requested → project back to REVISION
    if (
      event.toStatus === ManuscriptStatus.CLIENT_REVISION_REQUESTED &&
      project.status === ProjectStatus.CLIENT_REVIEW
    ) {
      await this.advanceProject(
        project,
        ProjectStatus.REVISION,
        `Client requested manuscript revisions.${event.notes ? ` Notes: ${event.notes}` : ''}`,
        event.changedBy,
      );
    }

    // QC Failed → project back to DRAFTING
    if (
      event.toStatus === ManuscriptStatus.QC_FAILED &&
      project.status === ProjectStatus.INTERNAL_REVIEW
    ) {
      await this.advanceProject(
        project,
        ProjectStatus.DRAFTING,
        `Manuscript failed QC — returned to drafting.${event.notes ? ` Notes: ${event.notes}` : ''}`,
        event.changedBy,
      );
    }

    // Submission Ready → project to JOURNAL_SELECTION
    if (
      event.toStatus === ManuscriptStatus.SUBMISSION_READY &&
      project.status === ProjectStatus.FINAL_MANUSCRIPT
    ) {
      await this.advanceProject(
        project,
        ProjectStatus.JOURNAL_SELECTION,
        `Manuscript marked as submission-ready — proceed to journal selection.`,
        event.changedBy,
      );
    }
  }

  // ─── RULE: Submission status → advance project status ──

  @OnEvent(DomainEvents.SUBMISSION_STATUS_CHANGED)
  async onSubmissionStatusChanged(event: SubmissionStatusChangedEvent) {
    const project = await this.prisma.project.findUnique({
      where: { id: event.projectId },
      select: {
        id: true,
        status: true,
        projectCode: true,
        title: true,
        managerId: true,
        clientId: true,
      },
    });
    if (!project) return;

    const cascadeMap: Record<string, { projectStatus: string; note: string }> = {
      [SubmissionStatus.SUBMITTED]: {
        projectStatus: ProjectStatus.SUBMITTED,
        note: `Manuscript submitted to ${event.journalName}.`,
      },
      [SubmissionStatus.UNDER_REVIEW]: {
        projectStatus: ProjectStatus.UNDER_REVIEW,
        note: `Submission is under review at ${event.journalName}.`,
      },
      [SubmissionStatus.REVISION_REQUIRED]: {
        projectStatus: ProjectStatus.REVISION_REQUIRED,
        note: `${event.journalName} has requested revisions.`,
      },
      [SubmissionStatus.ACCEPTED]: {
        projectStatus: ProjectStatus.ACCEPTED,
        note: `Manuscript accepted by ${event.journalName}!`,
      },
      [SubmissionStatus.PUBLISHED]: {
        projectStatus: ProjectStatus.PUBLISHED,
        note: `Published in ${event.journalName}.`,
      },
    };

    const cascade = cascadeMap[event.toStatus];
    if (cascade && project.status !== cascade.projectStatus) {
      this.logger.log(
        `[Cascade] Submission ${event.toStatus} → advancing project ${project.projectCode} to ${cascade.projectStatus}`,
      );

      await this.advanceProject(
        project,
        cascade.projectStatus,
        cascade.note,
        'system',
      );
    }

    // On rejection, project stays at current status — manager decides next step
    if (event.toStatus === SubmissionStatus.REJECTED) {
      this.logger.log(
        `[Cascade] Submission rejected for ${project.projectCode} — project status unchanged, manager notified`,
      );
    }
  }

  // ─── RULE: Publication created → advance project to COMPLETED ──

  @OnEvent(DomainEvents.PUBLICATION_CREATED)
  async onPublicationCreated(event: { projectId: string; projectCode: string }) {
    const project = await this.prisma.project.findUnique({
      where: { id: event.projectId },
      select: {
        id: true,
        status: true,
        projectCode: true,
        title: true,
        managerId: true,
        clientId: true,
      },
    });
    if (!project) return;

    if (project.status === ProjectStatus.PUBLISHED || project.status === ProjectStatus.ACCEPTED) {
      await this.advanceProject(
        project,
        ProjectStatus.COMPLETED,
        `Publication recorded. Project lifecycle complete.`,
        'system',
      );
    }
  }

  // ─── HELPER ──────────────────────────────────────────────

  private async advanceProject(
    project: { id: string; status: string; projectCode: string; title: string; managerId?: string | null; clientId: string },
    nextStatus: string,
    note: string,
    changedBy: string,
  ) {
    await this.prisma.$transaction(async (tx) => {
      await tx.project.update({
        where: { id: project.id },
        data: { status: nextStatus },
      });

      await tx.projectStatusHistory.create({
        data: {
          projectId: project.id,
          fromStatus: project.status,
          toStatus: nextStatus,
          note: `[Auto] ${note}`,
          changedBy,
        },
      });
    });

    this.eventEmitter.emit(DomainEvents.PROJECT_STATUS_CHANGED, {
      projectId: project.id,
      projectCode: project.projectCode,
      title: project.title,
      fromStatus: project.status,
      toStatus: nextStatus,
      changedBy,
      note: `[Auto] ${note}`,
      clientId: project.clientId,
      managerId: project.managerId,
    });
  }
}
