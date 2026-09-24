import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { UserRole, ProjectStatus, ManuscriptStatus, TaskStatus } from '@inzovate/shared';

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async getRoleOverview(userId: string, role: string) {
    if (role === UserRole.CLIENT) {
      return this.getClientOverview(userId);
    }
    if (role === UserRole.RESEARCH_STAFF) {
      return this.getStaffOverview(userId);
    }
    if (role === UserRole.QUALITY_ANALYST) {
      return this.getQualityAnalystOverview();
    }
    return this.getManagementOverview();
  }

  private async getClientOverview(userId: string) {
    const client = await this.prisma.client.findUnique({ where: { userId } });
    if (!client) {
      return { activeProjects: 0, pendingReviews: 0, completedProjects: 0, documentsCount: 0 };
    }

    const [activeProjects, completedProjects, manuscriptsPendingReview, documentsCount] =
      await Promise.all([
        this.prisma.project.count({
          where: {
            clientId: client.id,
            deletedAt: null,
            status: { notIn: [ProjectStatus.COMPLETED, ProjectStatus.CANCELLED] },
          },
        }),
        this.prisma.project.count({
          where: {
            clientId: client.id,
            deletedAt: null,
            status: ProjectStatus.COMPLETED,
          },
        }),
        this.prisma.manuscriptVersion.count({
          where: {
            manuscript: { project: { clientId: client.id } },
            status: ManuscriptStatus.CLIENT_SENT,
          },
        }),
        this.prisma.document.count({
          where: {
            project: { clientId: client.id },
            deletedAt: null,
            accessLevel: { in: ['CLIENT', 'PUBLIC'] },
          },
        }),
      ]);

    const recentProjects = await this.prisma.project.findMany({
      where: { clientId: client.id, deletedAt: null },
      orderBy: { updatedAt: 'desc' },
      take: 5,
      select: {
        id: true,
        projectCode: true,
        title: true,
        status: true,
        priority: true,
        deadline: true,
        updatedAt: true,
      },
    });

    return {
      activeProjects,
      completedProjects,
      pendingReviews: manuscriptsPendingReview,
      documentsCount,
      recentProjects,
    };
  }

  private async getStaffOverview(userId: string) {
    const [assignedProjects, pendingTasks, completedTasks, urgentTasks] = await Promise.all([
      this.prisma.project.count({
        where: {
          deletedAt: null,
          OR: [
            { assignedStaff: { some: { userId } } },
            { tasks: { some: { assigneeId: userId } } },
          ],
        },
      }),
      this.prisma.task.count({
        where: {
          assigneeId: userId,
          deletedAt: null,
          status: { not: TaskStatus.COMPLETED },
        },
      }),
      this.prisma.task.count({
        where: {
          assigneeId: userId,
          deletedAt: null,
          status: TaskStatus.COMPLETED,
        },
      }),
      this.prisma.task.count({
        where: {
          assigneeId: userId,
          deletedAt: null,
          status: { not: TaskStatus.COMPLETED },
          priority: 'URGENT',
        },
      }),
    ]);

    const upcomingTasks = await this.prisma.task.findMany({
      where: {
        assigneeId: userId,
        deletedAt: null,
        status: { not: TaskStatus.COMPLETED },
      },
      orderBy: { dueDate: 'asc' },
      take: 5,
      include: {
        project: { select: { projectCode: true, title: true } },
      },
    });

    return {
      assignedProjects,
      pendingTasks,
      completedTasks,
      urgentTasks,
      upcomingTasks,
    };
  }

  private async getQualityAnalystOverview() {
    const [pendingQc, passedQc, failedQc] = await Promise.all([
      this.prisma.manuscriptVersion.count({
        where: { status: ManuscriptStatus.QC_PENDING },
      }),
      this.prisma.manuscriptVersion.count({
        where: { status: ManuscriptStatus.QC_PASSED },
      }),
      this.prisma.manuscriptVersion.count({
        where: { status: ManuscriptStatus.QC_FAILED },
      }),
    ]);

    const queue = await this.prisma.manuscriptVersion.findMany({
      where: { status: ManuscriptStatus.QC_PENDING },
      orderBy: { updatedAt: 'asc' },
      take: 10,
      include: {
        manuscript: {
          include: {
            project: {
              select: { id: true, projectCode: true, title: true, priority: true },
            },
          },
        },
        author: {
          select: { firstName: true, lastName: true },
        },
      },
    });

    return {
      pendingQc,
      passedQc,
      failedQc,
      queue,
    };
  }

  private async getManagementOverview() {
    const [
      totalProjects,
      activeProjects,
      totalClients,
      totalUsers,
      pendingQc,
      clientReviewPending,
    ] = await Promise.all([
      this.prisma.project.count({ where: { deletedAt: null } }),
      this.prisma.project.count({
        where: {
          deletedAt: null,
          status: { notIn: [ProjectStatus.COMPLETED, ProjectStatus.CANCELLED] },
        },
      }),
      this.prisma.client.count({ where: { deletedAt: null } }),
      this.prisma.user.count({ where: { deletedAt: null } }),
      this.prisma.manuscriptVersion.count({
        where: { status: ManuscriptStatus.QC_PENDING },
      }),
      this.prisma.manuscriptVersion.count({
        where: { status: ManuscriptStatus.CLIENT_SENT },
      }),
    ]);

    // Group projects by status
    const statusGroups = await this.prisma.project.groupBy({
      by: ['status'],
      where: { deletedAt: null },
      _count: { status: true },
    });

    const statusCounts = statusGroups.reduce((acc, curr) => {
      acc[curr.status] = curr._count.status;
      return acc;
    }, {} as Record<string, number>);

    // Recent activity (latest status changes)
    const recentActivity = await this.prisma.projectStatusHistory.findMany({
      orderBy: { changedAt: 'desc' },
      take: 6,
      include: {
        project: { select: { projectCode: true, title: true } },
        user: { select: { firstName: true, lastName: true, email: true } },
      },
    });

    return {
      totalProjects,
      activeProjects,
      totalClients,
      totalUsers,
      pendingQc,
      clientReviewPending,
      statusCounts,
      recentActivity,
    };
  }

  async getAnalytics() {
    const statusDistribution = await this.prisma.project.groupBy({
      by: ['status'],
      where: { deletedAt: null },
      _count: { status: true },
    });

    const priorityDistribution = await this.prisma.project.groupBy({
      by: ['priority'],
      where: { deletedAt: null },
      _count: { priority: true },
    });

    const staffWorkload = await this.prisma.user.findMany({
      where: {
        role: { name: 'research_staff' },
        deletedAt: null,
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        _count: {
          select: {
            assignedTasks: {
              where: { status: { not: TaskStatus.COMPLETED }, deletedAt: null },
            },
          },
        },
      },
      take: 10,
    });

    return {
      statusDistribution: statusDistribution.map((s) => ({
        status: s.status,
        count: s._count.status,
      })),
      priorityDistribution: priorityDistribution.map((p) => ({
        priority: p.priority,
        count: p._count.priority,
      })),
      staffWorkload: staffWorkload.map((w) => ({
        id: w.id,
        name: `${w.firstName} ${w.lastName}`,
        email: w.email,
        activeTasks: w._count.assignedTasks,
      })),
    };
  }
}
