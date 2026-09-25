// ============================================================
// Auto-Task Creation Listener
// When a project enters certain statuses, automatically creates
// the standard tasks that every project needs at that stage.
// ============================================================

import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PrismaService } from '../../../database/prisma.service';
import {
  DomainEvents,
  ProjectStatusChangedEvent,
  ProjectCreatedEvent,
} from '../events/domain-events';
import { ProjectStatus } from '@inzovate/shared';

interface TaskTemplate {
  title: string;
  description: string;
  priority: string;
  estimatedHours?: number;
  daysUntilDue?: number;
  assignToRole?: string; // Assign to project staff with this role, or manager
}

/** Standard task templates per project stage */
const STAGE_TASKS: Partial<Record<string, TaskTemplate[]>> = {
  [ProjectStatus.REQUIREMENT_ANALYSIS]: [
    {
      title: 'Review client requirements document',
      description: 'Thoroughly review all client-submitted requirements, research objectives, and constraints.',
      priority: 'HIGH',
      estimatedHours: 4,
      daysUntilDue: 3,
    },
    {
      title: 'Conduct feasibility assessment',
      description: 'Assess research feasibility, check data availability, and identify potential challenges.',
      priority: 'HIGH',
      estimatedHours: 6,
      daysUntilDue: 5,
    },
    {
      title: 'Prepare requirement analysis report',
      description: 'Document findings from analysis and prepare a structured report for topic finalization.',
      priority: 'NORMAL',
      estimatedHours: 3,
      daysUntilDue: 7,
    },
  ],
  [ProjectStatus.TOPIC_FINALIZATION]: [
    {
      title: 'Literature review for topic validation',
      description: 'Perform preliminary literature search to validate the proposed research topic.',
      priority: 'HIGH',
      estimatedHours: 8,
      daysUntilDue: 5,
    },
    {
      title: 'Finalize research topic and methodology',
      description: 'Finalize the exact research topic, methodology approach, and expected outcomes.',
      priority: 'HIGH',
      estimatedHours: 4,
      daysUntilDue: 7,
    },
  ],
  [ProjectStatus.RESEARCH_IN_PROGRESS]: [
    {
      title: 'Conduct primary research',
      description: 'Execute the research plan — data collection, experiments, surveys, or analysis.',
      priority: 'HIGH',
      estimatedHours: 40,
      daysUntilDue: 21,
    },
    {
      title: 'Analyze research data',
      description: 'Process and analyze collected data using appropriate statistical methods.',
      priority: 'HIGH',
      estimatedHours: 16,
      daysUntilDue: 28,
    },
    {
      title: 'Prepare research findings summary',
      description: 'Compile findings for drafting. Include tables, figures, and key observations.',
      priority: 'NORMAL',
      estimatedHours: 8,
      daysUntilDue: 30,
    },
  ],
  [ProjectStatus.DRAFTING]: [
    {
      title: 'Draft manuscript — Introduction & Literature Review',
      description: 'Write the introduction, background, and comprehensive literature review sections.',
      priority: 'HIGH',
      estimatedHours: 12,
      daysUntilDue: 7,
    },
    {
      title: 'Draft manuscript — Methodology & Results',
      description: 'Write the methodology, results, and analysis sections with supporting figures/tables.',
      priority: 'HIGH',
      estimatedHours: 16,
      daysUntilDue: 14,
    },
    {
      title: 'Draft manuscript — Discussion & Conclusion',
      description: 'Write discussion, conclusion, implications, and limitations sections.',
      priority: 'HIGH',
      estimatedHours: 8,
      daysUntilDue: 18,
    },
    {
      title: 'Format references and bibliography',
      description: 'Compile and format all references per target journal requirements.',
      priority: 'NORMAL',
      estimatedHours: 4,
      daysUntilDue: 20,
    },
  ],
  [ProjectStatus.INTERNAL_REVIEW]: [
    {
      title: 'Perform 10-point QC verification',
      description: 'Run the complete 10-point quality checklist: originality, formatting, references, grammar, data accuracy, figure quality, abstract quality, keyword relevance, ethical compliance, and plagiarism check.',
      priority: 'URGENT',
      estimatedHours: 6,
      daysUntilDue: 5,
      assignToRole: 'quality_analyst',
    },
  ],
  [ProjectStatus.REVISION]: [
    {
      title: 'Address revision feedback',
      description: 'Review client/QC feedback and implement required revisions to the manuscript.',
      priority: 'HIGH',
      estimatedHours: 12,
      daysUntilDue: 7,
    },
  ],
  [ProjectStatus.JOURNAL_SELECTION]: [
    {
      title: 'Identify and rank target journals',
      description: 'Use the journal intelligence database to identify suitable journals. Rank by impact factor, acceptance rate, and relevance.',
      priority: 'HIGH',
      estimatedHours: 4,
      daysUntilDue: 5,
      assignToRole: 'publication_executive',
    },
    {
      title: 'Prepare submission checklist',
      description: 'Compile all journal-specific submission requirements: formatting, cover letter, author statements, etc.',
      priority: 'NORMAL',
      estimatedHours: 3,
      daysUntilDue: 7,
      assignToRole: 'publication_executive',
    },
  ],
  [ProjectStatus.REVISION_REQUIRED]: [
    {
      title: 'Review journal revision comments',
      description: 'Analyze reviewer and editor comments. Create a point-by-point response plan.',
      priority: 'URGENT',
      estimatedHours: 4,
      daysUntilDue: 3,
    },
    {
      title: 'Implement journal revisions',
      description: 'Make all required changes to the manuscript as requested by journal reviewers.',
      priority: 'URGENT',
      estimatedHours: 16,
      daysUntilDue: 14,
    },
    {
      title: 'Prepare point-by-point response letter',
      description: 'Draft a detailed response letter addressing each reviewer comment.',
      priority: 'HIGH',
      estimatedHours: 6,
      daysUntilDue: 14,
    },
  ],
};

@Injectable()
export class AutoTaskCreationListener {
  private readonly logger = new Logger(AutoTaskCreationListener.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  @OnEvent(DomainEvents.PROJECT_STATUS_CHANGED)
  async onProjectStatusChanged(event: ProjectStatusChangedEvent) {
    const templates = STAGE_TASKS[event.toStatus];
    if (!templates || templates.length === 0) return;

    this.logger.log(
      `[AutoTask] Creating ${templates.length} tasks for ${event.projectCode} entering ${event.toStatus}`,
    );

    const project = await this.prisma.project.findUnique({
      where: { id: event.projectId },
      select: {
        id: true,
        managerId: true,
        assignedStaff: { select: { userId: true, role: true } },
      },
    });
    if (!project) return;

    // Use a system user ID or the project manager as the creator
    const creatorId = event.changedBy;

    for (const template of templates) {
      // Determine assignee based on template role
      let assigneeId: string | null = null;
      if (template.assignToRole) {
        const staffMember = project.assignedStaff.find(
          (s) => s.role === template.assignToRole,
        );
        assigneeId = staffMember?.userId ?? project.managerId ?? null;
      } else {
        assigneeId = project.managerId ?? null;
      }

      const dueDate = template.daysUntilDue
        ? new Date(Date.now() + template.daysUntilDue * 24 * 60 * 60 * 1000)
        : null;

      // Check for duplicate tasks (same title, same project, not deleted)
      const existing = await this.prisma.task.findFirst({
        where: {
          projectId: event.projectId,
          title: template.title,
          deletedAt: null,
          status: { not: 'COMPLETED' },
        },
      });

      if (existing) {
        this.logger.debug(
          `[AutoTask] Skipping duplicate task: "${template.title}" already exists for project ${event.projectCode}`,
        );
        continue;
      }

      const task = await this.prisma.task.create({
        data: {
          projectId: event.projectId,
          title: template.title,
          description: template.description,
          priority: template.priority,
          estimatedHours: template.estimatedHours,
          dueDate,
          assigneeId,
          creatorId,
        },
      });

      // Emit task created event for notifications
      this.eventEmitter.emit(DomainEvents.TASK_CREATED, {
        taskId: task.id,
        projectId: event.projectId,
        title: template.title,
        assigneeId,
        creatorId,
        dueDate,
      });
    }
  }

  @OnEvent(DomainEvents.PROJECT_CREATED)
  async onProjectCreated(event: ProjectCreatedEvent) {
    // Create initial intake tasks for new projects
    const initialTasks: TaskTemplate[] = [
      {
        title: 'Acknowledge client requirement and confirm scope',
        description: 'Review the submitted requirement, acknowledge receipt, and confirm the project scope with the client.',
        priority: 'HIGH',
        estimatedHours: 2,
        daysUntilDue: 2,
      },
      {
        title: 'Assign research team members',
        description: 'Review available staff and assign appropriate team members to this project.',
        priority: 'HIGH',
        estimatedHours: 1,
        daysUntilDue: 3,
      },
    ];

    const creatorId = event.creatorId;
    const assigneeId = event.managerId ?? event.creatorId;

    for (const template of initialTasks) {
      const dueDate = template.daysUntilDue
        ? new Date(Date.now() + template.daysUntilDue * 24 * 60 * 60 * 1000)
        : null;

      const task = await this.prisma.task.create({
        data: {
          projectId: event.projectId,
          title: template.title,
          description: template.description,
          priority: template.priority,
          estimatedHours: template.estimatedHours,
          dueDate,
          assigneeId,
          creatorId,
        },
      });

      this.eventEmitter.emit(DomainEvents.TASK_CREATED, {
        taskId: task.id,
        projectId: event.projectId,
        title: template.title,
        assigneeId,
        creatorId,
        dueDate,
      });
    }

    this.logger.log(
      `[AutoTask] Created ${initialTasks.length} initial tasks for new project ${event.projectCode}`,
    );
  }
}
