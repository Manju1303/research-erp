import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { TaskStatus, ProjectStatus } from '@inzovate/shared';

@Injectable()
export class ReportsService {
  constructor(private readonly prisma: PrismaService) {}

  async getEmployeePerformance() {
    const staffMembers = await this.prisma.user.findMany({
      where: {
        role: { name: { in: ['research_staff', 'research_manager', 'quality_analyst'] } },
        deletedAt: null,
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        role: { select: { displayName: true } },
        assignedTasks: {
          select: {
            id: true,
            status: true,
            completionPct: true,
            dueDate: true,
            completedAt: true,
          },
        },
        _count: {
          select: {
            manuscriptVersions: true,
            managedProjects: true,
          },
        },
      },
    });

    return staffMembers.map((staff) => {
      const totalTasks = staff.assignedTasks.length;
      const completedTasks = staff.assignedTasks.filter((t) => t.status === TaskStatus.COMPLETED).length;
      const onTimeTasks = staff.assignedTasks.filter(
        (t) => t.completedAt && t.dueDate && new Date(t.completedAt) <= new Date(t.dueDate),
      ).length;

      const onTimeRate = completedTasks > 0 ? Math.round((onTimeTasks / completedTasks) * 100) : 100;

      return {
        id: staff.id,
        name: `${staff.firstName} ${staff.lastName}`,
        email: staff.email,
        role: staff.role.displayName,
        totalTasks,
        completedTasks,
        pendingTasks: totalTasks - completedTasks,
        manuscriptVersionsAuthored: staff._count.manuscriptVersions,
        onTimeCompletionRate: onTimeRate,
      };
    });
  }

  async getOperationalReport() {
    const [
      totalProjects,
      completedProjects,
      totalSubmissions,
      acceptedPublications,
      totalRevenue,
    ] = await Promise.all([
      this.prisma.project.count({ where: { deletedAt: null } }),
      this.prisma.project.count({ where: { status: ProjectStatus.COMPLETED } }),
      this.prisma.submission.count(),
      this.prisma.publication.count(),
      this.prisma.payment.aggregate({ _sum: { amount: true }, where: { status: 'PAID' } }),
    ]);

    return {
      totalProjects,
      completedProjects,
      inProgressProjects: totalProjects - completedProjects,
      totalSubmissions,
      acceptedPublications,
      publicationSuccessRate:
        totalSubmissions > 0 ? `${Math.round((acceptedPublications / totalSubmissions) * 100)}%` : '100%',
      collectedRevenue: totalRevenue._sum.amount || 0,
      currency: 'USD',
      generatedAt: new Date().toISOString(),
    };
  }

  async exportCsvReport(type: 'projects' | 'employees' | 'publications') {
    if (type === 'employees') {
      const data = await this.getEmployeePerformance();
      const headers = 'ID,Name,Email,Role,TotalTasks,CompletedTasks,PendingTasks,OnTimeRate\n';
      const rows = data.map(
        (d) => `${d.id},"${d.name}",${d.email},"${d.role}",${d.totalTasks},${d.completedTasks},${d.pendingTasks},${d.onTimeCompletionRate}%\n`,
      );
      return headers + rows.join('');
    }

    if (type === 'publications') {
      const pubs = await this.prisma.publication.findMany({
        include: { project: true, submission: { include: { journal: true } } },
      });
      const headers = 'ProjectCode,Title,Journal,DOI,PublicationDate\n';
      const rows = pubs.map(
        (p) => `"${p.project.projectCode}","${p.title}","${p.submission?.journal?.name || ''}","${p.doi || ''}","${p.publicationDate?.toISOString() || ''}"\n`,
      );
      return headers + rows.join('');
    }

    // Default: projects
    const projects = await this.prisma.project.findMany({
      where: { deletedAt: null },
      include: { client: { include: { user: true } } },
    });
    const headers = 'ProjectCode,Title,Domain,Status,Priority,Client,Budget\n';
    const rows = projects.map(
      (p) => `"${p.projectCode}","${p.title}","${p.domain}","${p.status}","${p.priority}","${p.client.user.firstName} ${p.client.user.lastName}",${p.budget || 0}\n`,
    );
    return headers + rows.join('');
  }
}
