// ============================================================
// Scheduled Jobs — Cron-based automation
// Runs on a schedule to detect deadlines, stale projects,
// overdue tasks, and overdue invoices.
// ============================================================

import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PrismaService } from '../../../database/prisma.service';
import { DomainEvents } from '../events/domain-events';

@Injectable()
export class AutomationScheduler {
  private readonly logger = new Logger(AutomationScheduler.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  // ─── DEADLINE ALERTS — runs daily at 8:00 AM ──────────

  @Cron(CronExpression.EVERY_DAY_AT_8AM, { name: 'deadline-alerts' })
  async checkProjectDeadlines() {
    this.logger.log('[Scheduler] Checking project deadlines...');

    const terminalStatuses = ['COMPLETED', 'CANCELLED', 'PUBLISHED'];
    const now = new Date();
    const warningThresholds = [1, 3, 7]; // Alert at 1, 3, and 7 days before deadline

    for (const daysOut of warningThresholds) {
      const targetDate = new Date(now.getTime() + daysOut * 24 * 60 * 60 * 1000);
      const startOfDay = new Date(targetDate);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(targetDate);
      endOfDay.setHours(23, 59, 59, 999);

      const projects = await this.prisma.project.findMany({
        where: {
          deadline: {
            gte: startOfDay,
            lte: endOfDay,
          },
          status: { notIn: terminalStatuses },
          deletedAt: null,
        },
        select: {
          id: true,
          projectCode: true,
          title: true,
          deadline: true,
          managerId: true,
          clientId: true,
        },
      });

      for (const project of projects) {
        this.eventEmitter.emit(DomainEvents.PROJECT_DEADLINE_APPROACHING, {
          projectId: project.id,
          projectCode: project.projectCode,
          title: project.title,
          deadline: project.deadline,
          daysRemaining: daysOut,
          managerId: project.managerId,
          clientId: project.clientId,
        });
      }

      if (projects.length > 0) {
        this.logger.log(
          `[Scheduler] Found ${projects.length} projects with deadline in ${daysOut} day(s)`,
        );
      }
    }

    // Also check already past-deadline projects
    const overdueProjects = await this.prisma.project.findMany({
      where: {
        deadline: { lt: now },
        status: { notIn: terminalStatuses },
        deletedAt: null,
      },
      select: {
        id: true,
        projectCode: true,
        title: true,
        deadline: true,
        managerId: true,
        clientId: true,
      },
    });

    for (const project of overdueProjects) {
      const daysOverdue = Math.floor(
        (now.getTime() - project.deadline!.getTime()) / (24 * 60 * 60 * 1000),
      );
      // Only re-alert weekly after the deadline passes
      if (daysOverdue === 1 || daysOverdue % 7 === 0) {
        this.eventEmitter.emit(DomainEvents.PROJECT_DEADLINE_APPROACHING, {
          projectId: project.id,
          projectCode: project.projectCode,
          title: project.title,
          deadline: project.deadline,
          daysRemaining: -daysOverdue,
          managerId: project.managerId,
          clientId: project.clientId,
        });
      }
    }
  }

  // ─── STALE PROJECT DETECTION — runs daily at 9:00 AM ──

  @Cron(CronExpression.EVERY_DAY_AT_9AM, { name: 'stale-project-detection' })
  async checkStaleProjects() {
    this.logger.log('[Scheduler] Checking for stale projects...');

    const terminalStatuses = ['COMPLETED', 'CANCELLED', 'PUBLISHED', 'ON_HOLD'];
    const staleThresholdDays = 7;
    const staleDate = new Date(
      Date.now() - staleThresholdDays * 24 * 60 * 60 * 1000,
    );

    const staleProjects = await this.prisma.project.findMany({
      where: {
        updatedAt: { lt: staleDate },
        status: { notIn: terminalStatuses },
        deletedAt: null,
      },
      select: {
        id: true,
        projectCode: true,
        title: true,
        status: true,
        updatedAt: true,
        managerId: true,
      },
    });

    for (const project of staleProjects) {
      const daysSinceUpdate = Math.floor(
        (Date.now() - project.updatedAt.getTime()) / (24 * 60 * 60 * 1000),
      );

      // Only emit weekly (at 7, 14, 21 days etc.) to avoid notification fatigue
      if (daysSinceUpdate % 7 === 0 || daysSinceUpdate === staleThresholdDays) {
        this.eventEmitter.emit(DomainEvents.PROJECT_STALE, {
          projectId: project.id,
          projectCode: project.projectCode,
          title: project.title,
          status: project.status,
          lastUpdatedAt: project.updatedAt,
          daysSinceUpdate,
          managerId: project.managerId,
        });
      }
    }

    if (staleProjects.length > 0) {
      this.logger.log(
        `[Scheduler] Found ${staleProjects.length} stale projects (>${staleThresholdDays} days without update)`,
      );
    }
  }

  // ─── OVERDUE TASK DETECTION — runs daily at 8:30 AM ───

  @Cron('30 8 * * *', { name: 'overdue-task-detection' })
  async checkOverdueTasks() {
    this.logger.log('[Scheduler] Checking for overdue tasks...');

    const now = new Date();
    const overdueTasks = await this.prisma.task.findMany({
      where: {
        dueDate: { lt: now },
        status: { notIn: ['COMPLETED', 'CANCELLED'] },
        deletedAt: null,
      },
      select: {
        id: true,
        title: true,
        dueDate: true,
        assigneeId: true,
        projectId: true,
      },
    });

    for (const task of overdueTasks) {
      const daysOverdue = Math.floor(
        (now.getTime() - task.dueDate!.getTime()) / (24 * 60 * 60 * 1000),
      );

      // Alert on day 1, then weekly
      if (daysOverdue === 1 || daysOverdue % 7 === 0) {
        this.eventEmitter.emit(DomainEvents.TASK_OVERDUE, {
          taskId: task.id,
          projectId: task.projectId,
          title: task.title,
          dueDate: task.dueDate,
          assigneeId: task.assigneeId,
          daysOverdue,
        });
      }
    }

    if (overdueTasks.length > 0) {
      this.logger.log(
        `[Scheduler] Found ${overdueTasks.length} overdue tasks`,
      );
    }
  }

  // ─── OVERDUE INVOICE DETECTION — runs daily at 10:00 AM ──

  @Cron(CronExpression.EVERY_DAY_AT_10AM, { name: 'overdue-invoice-detection' })
  async checkOverdueInvoices() {
    this.logger.log('[Scheduler] Checking for overdue invoices...');

    const now = new Date();
    const overdueInvoices = await this.prisma.invoice.findMany({
      where: {
        dueDate: { lt: now },
        status: { in: ['PENDING', 'SENT'] },
      },
      select: {
        id: true,
        invoiceNumber: true,
        projectId: true,
        clientId: true,
        amount: true,
        currency: true,
        dueDate: true,
      },
    });

    for (const invoice of overdueInvoices) {
      const daysOverdue = Math.floor(
        (now.getTime() - invoice.dueDate!.getTime()) / (24 * 60 * 60 * 1000),
      );

      // Alert on day 1, 7, 14, 30
      if ([1, 7, 14, 30].includes(daysOverdue)) {
        this.eventEmitter.emit(DomainEvents.INVOICE_OVERDUE, {
          invoiceId: invoice.id,
          invoiceNumber: invoice.invoiceNumber,
          projectId: invoice.projectId,
          clientId: invoice.clientId,
          amount: Number(invoice.amount),
          currency: invoice.currency,
          dueDate: invoice.dueDate,
          daysOverdue,
        });
      }
    }

    if (overdueInvoices.length > 0) {
      this.logger.log(
        `[Scheduler] Found ${overdueInvoices.length} overdue invoices`,
      );
    }
  }
}
