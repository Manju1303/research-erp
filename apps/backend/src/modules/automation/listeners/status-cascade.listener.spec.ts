import { Test, TestingModule } from '@nestjs/testing';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { StatusCascadeListener } from './status-cascade.listener';
import { PrismaService } from '../../../database/prisma.service';
import { ProjectStatus, ManuscriptStatus } from '@inzovate/shared';

describe('StatusCascadeListener QA & Automation Cascade Tests', () => {
  let listener: StatusCascadeListener;
  let prisma: any;
  let eventEmitter: any;

  beforeEach(async () => {
    prisma = {
      $transaction: jest.fn(async (cb: any) => cb(prisma)),
      task: {
        count: jest.fn(),
      },
      project: {
        findUnique: jest.fn(),
        update: jest.fn(),
      },
      projectStatusHistory: {
        create: jest.fn(),
      },
      payment: {
        findMany: jest.fn(),
      },
      invoice: {
        findMany: jest.fn(),
      },
    };

    eventEmitter = {
      emit: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StatusCascadeListener,
        { provide: PrismaService, useValue: prisma },
        { provide: EventEmitter2, useValue: eventEmitter },
      ],
    }).compile();

    listener = module.get<StatusCascadeListener>(StatusCascadeListener);
  });

  it('cascades QC_PASSED manuscript event to advance project to CLIENT_REVIEW', async () => {
    prisma.project.findUnique.mockResolvedValue({
      id: 'proj-1',
      code: 'INZ-2026-001',
      title: 'Quantum Key Distribution in Satellite Mesh',
      status: ProjectStatus.INTERNAL_QC,
      clientId: 'client-1',
    });

    await listener.onManuscriptStatusChanged({
      versionId: 'v-1',
      manuscriptId: 'm-1',
      projectId: 'proj-1',
      title: 'Quantum Key Distribution',
      fromStatus: ManuscriptStatus.QC_PENDING,
      toStatus: ManuscriptStatus.QC_PASSED,
      changedBy: 'qa-analyst-id',
      notes: 'All 10 checklist points verified',
    });

    expect(prisma.project.update).toHaveBeenCalledWith({
      where: { id: 'proj-1' },
      data: { status: ProjectStatus.CLIENT_REVIEW },
    });
  });

  it('cascades QC_FAILED manuscript event to auto-revert project to DRAFTING', async () => {
    prisma.project.findUnique.mockResolvedValue({
      id: 'proj-1',
      code: 'INZ-2026-001',
      title: 'Quantum Key Distribution in Satellite Mesh',
      status: ProjectStatus.INTERNAL_QC,
      clientId: 'client-1',
    });

    await listener.onManuscriptStatusChanged({
      versionId: 'v-1',
      manuscriptId: 'm-1',
      projectId: 'proj-1',
      title: 'Quantum Key Distribution',
      fromStatus: ManuscriptStatus.QC_PENDING,
      toStatus: ManuscriptStatus.QC_FAILED,
      changedBy: 'qa-analyst-id',
      notes: 'Plagiarism similarity exceeded threshold',
    });

    expect(prisma.project.update).toHaveBeenCalledWith({
      where: { id: 'proj-1' },
      data: { status: ProjectStatus.DRAFTING },
    });
  });

  it('emits TASK_ALL_COMPLETED when all tasks reach 100% completion', async () => {
    prisma.task.count
      .mockResolvedValueOnce(0) // pendingTasks = 0
      .mockResolvedValueOnce(5); // totalTasks = 5

    prisma.project.findUnique.mockResolvedValue({
      id: 'proj-1',
      projectCode: 'INZ-2026-001',
      status: ProjectStatus.DRAFTING,
    });

    await listener.onTaskCompleted({
      taskId: 'task-5',
      projectId: 'proj-1',
      title: 'Final Draft Polish',
      fromStatus: 'UNDER_REVIEW',
      toStatus: 'COMPLETED',
      completionPct: 100,
    });

    expect(eventEmitter.emit).toHaveBeenCalledWith(
      'task.all.completed',
      expect.objectContaining({
        projectId: 'proj-1',
        projectCode: 'INZ-2026-001',
        totalTasks: 5,
      }),
    );
  });

  it('auto-advances project from DRAFTING to INTERNAL_QC upon onAllTasksCompleted', async () => {
    prisma.project.findUnique.mockResolvedValue({
      id: 'proj-1',
      projectCode: 'INZ-2026-001',
      title: 'Quantum Key Distribution in Satellite Mesh',
      status: ProjectStatus.DRAFTING,
      clientId: 'client-1',
    });

    await listener.onAllTasksCompleted({
      projectId: 'proj-1',
      projectCode: 'INZ-2026-001',
      totalTasks: 5,
      completedBy: 'staff-1',
    });

    expect(prisma.project.update).toHaveBeenCalledWith({
      where: { id: 'proj-1' },
      data: { status: ProjectStatus.INTERNAL_QC },
    });
  });

  it('does NOT advance project if any task remains pending/incomplete', async () => {
    prisma.task.count.mockResolvedValueOnce(1); // 1 pending task remaining

    await listener.onTaskCompleted({
      taskId: 'task-4',
      projectId: 'proj-1',
      title: 'Methodology Review',
      fromStatus: 'IN_PROGRESS',
      toStatus: 'COMPLETED',
      completionPct: 100,
    });

    expect(prisma.project.update).not.toHaveBeenCalled();
  });
});
