import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import {
  CreateProjectDto,
  UpdateProjectDto,
  TransitionProjectStatusDto,
  AssignStaffDto,
} from './dto/project.dto';
import {
  PaginationDto,
  toPrismaOrderAndPagination,
  buildPaginationMeta,
} from '../../common/dto/pagination.dto';
import {
  ProjectStatus,
  UserRole,
  isValidProjectTransition,
} from '@inzovate/shared';
import { DomainEvents } from '../automation/events/domain-events';

@Injectable()
export class ProjectsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  private readonly PROJECT_LIST_INCLUDE = {
    client: {
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            phone: true,
          },
        },
      },
    },
    manager: {
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
      },
    },
    assignedStaff: {
      include: {
        project: false,
      },
    },
    _count: {
      select: {
        tasks: true,
        manuscripts: true,
        documents: true,
      },
    },
  };

  private async generateProjectCode(): Promise<string> {
    const year = new Date().getFullYear();
    const count = await this.prisma.project.count();
    const padded = String(count + 1).padStart(4, '0');
    return `INZ-${year}-${padded}`;
  }

  async findAll(
    query: PaginationDto & {
      search?: string;
      status?: string;
      priority?: string;
      clientId?: string;
    },
    userId: string,
    role: string,
  ) {
    const { skip, take, orderBy } = toPrismaOrderAndPagination(query);
    const where: any = { deletedAt: null };

    // Scoping by role
    if (role === UserRole.CLIENT) {
      const client = await this.prisma.client.findUnique({ where: { userId } });
      if (!client) return { data: [], meta: buildPaginationMeta(0, 1, 20) };
      where.clientId = client.id;
    } else if (role === UserRole.RESEARCH_STAFF) {
      where.OR = [
        { assignedStaff: { some: { userId } } },
        { tasks: { some: { assigneeId: userId } } },
      ];
    } else if (role === UserRole.RESEARCH_MANAGER) {
      // Research manager can view all or filtered
      if (query.clientId) where.clientId = query.clientId;
    }

    if (query.search) {
      where.AND = [
        ...(where.AND || []),
        {
          OR: [
            { title: { contains: query.search, mode: 'insensitive' } },
            { projectCode: { contains: query.search, mode: 'insensitive' } },
            { domain: { contains: query.search, mode: 'insensitive' } },
          ],
        },
      ];
    }

    if (query.status) where.status = query.status;
    if (query.priority) where.priority = query.priority;
    if (query.clientId && role !== UserRole.CLIENT) where.clientId = query.clientId;

    const [data, total] = await Promise.all([
      this.prisma.project.findMany({
        where,
        skip,
        take,
        orderBy,
        include: this.PROJECT_LIST_INCLUDE,
      }),
      this.prisma.project.count({ where }),
    ]);

    const sanitized = data.map((p) => {
      if (role === UserRole.CLIENT) {
        const { internalNotes: _, ...rest } = p;
        return rest;
      }
      return p;
    });

    return {
      data: sanitized,
      meta: buildPaginationMeta(total, query.page ?? 1, query.limit ?? 20),
    };
  }

  async findOne(id: string, userId: string, role: string) {
    const project = await this.prisma.project.findFirst({
      where: { id, deletedAt: null },
      include: {
        ...this.PROJECT_LIST_INCLUDE,
        creator: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
        tasks: {
          where: { deletedAt: null },
          include: {
            assignee: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
        manuscripts: {
          include: {
            versions: {
              orderBy: { versionNumber: 'desc' },
              include: {
                author: {
                  select: { id: true, firstName: true, lastName: true },
                },
              },
            },
          },
        },
        statusHistory: {
          include: {
            user: {
              select: { id: true, firstName: true, lastName: true, email: true },
            },
          },
          orderBy: { changedAt: 'desc' },
        },
        documents: {
          where: { deletedAt: null },
          include: {
            uploadedBy: {
              select: { id: true, firstName: true, lastName: true },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!project) throw new NotFoundException('Project not found');

    if (role === UserRole.CLIENT) {
      const client = await this.prisma.client.findUnique({ where: { userId } });
      if (!client || project.clientId !== client.id) {
        throw new ForbiddenException('You do not have access to this project');
      }
      const { internalNotes: _, ...rest } = project;
      return rest;
    }

    return project;
  }

  async create(dto: CreateProjectDto, creatorId: string) {
    const client = await this.prisma.client.findFirst({
      where: { id: dto.clientId, deletedAt: null },
    });
    if (!client) throw new NotFoundException('Client not found');

    const projectCode = await this.generateProjectCode();

    const result = await this.prisma.$transaction(async (tx) => {
      const project = await tx.project.create({
        data: {
          projectCode,
          title: dto.title,
          description: dto.description,
          domain: dto.domain,
          keywords: dto.keywords || [],
          priority: dto.priority || 'NORMAL',
          deadline: dto.deadline ? new Date(dto.deadline) : null,
          targetJournalType: dto.targetJournalType,
          budget: dto.budget,
          currency: dto.currency || 'USD',
          internalNotes: dto.internalNotes,
          clientId: dto.clientId,
          managerId: dto.managerId,
          creatorId,
          status: ProjectStatus.REQUIREMENT_SUBMITTED,
        },
        include: this.PROJECT_LIST_INCLUDE,
      });

      // Record initial status
      await tx.projectStatusHistory.create({
        data: {
          projectId: project.id,
          toStatus: ProjectStatus.REQUIREMENT_SUBMITTED,
          note: 'Project created and requirement submitted',
          changedBy: creatorId,
        },
      });

      return project;
    });

    // Emit domain event (outside transaction — fire-and-forget)
    this.eventEmitter.emit(DomainEvents.PROJECT_CREATED, {
      projectId: result.id,
      projectCode: result.projectCode,
      title: dto.title,
      clientId: dto.clientId,
      creatorId,
      managerId: dto.managerId,
      priority: dto.priority || 'NORMAL',
    });

    return result;
  }

  async update(id: string, dto: UpdateProjectDto, role: string) {
    const project = await this.prisma.project.findFirst({
      where: { id, deletedAt: null },
    });
    if (!project) throw new NotFoundException('Project not found');

    const updateData: any = { ...dto };
    if (dto.deadline) updateData.deadline = new Date(dto.deadline);

    if (role === UserRole.CLIENT) {
      delete updateData.internalNotes;
      delete updateData.managerId;
      delete updateData.priority;
    }

    return this.prisma.project.update({
      where: { id },
      data: updateData,
      include: this.PROJECT_LIST_INCLUDE,
    });
  }

  async transitionStatus(
    id: string,
    dto: TransitionProjectStatusDto,
    userId: string,
    userRole: UserRole,
  ) {
    const project = await this.prisma.project.findFirst({
      where: { id, deletedAt: null },
    });
    if (!project) throw new NotFoundException('Project not found');

    const currentStatus = project.status as ProjectStatus;
    const targetStatus = dto.status;

    // Check transition validity
    const allowed = isValidProjectTransition(currentStatus, targetStatus, userRole);
    if (!allowed && userRole !== UserRole.SUPER_ADMIN) {
      throw new BadRequestException(
        `Transition from ${currentStatus} to ${targetStatus} is not permitted for role ${userRole}`,
      );
    }

    const result = await this.prisma.$transaction(async (tx) => {
      const updated = await tx.project.update({
        where: { id },
        data: { status: targetStatus },
        include: this.PROJECT_LIST_INCLUDE,
      });

      await tx.projectStatusHistory.create({
        data: {
          projectId: id,
          fromStatus: currentStatus,
          toStatus: targetStatus,
          note: dto.note,
          changedBy: userId,
        },
      });

      return updated;
    });

    // Emit domain event
    this.eventEmitter.emit(DomainEvents.PROJECT_STATUS_CHANGED, {
      projectId: id,
      projectCode: project.projectCode,
      title: project.title,
      fromStatus: currentStatus,
      toStatus: targetStatus,
      changedBy: userId,
      note: dto.note,
      clientId: project.clientId,
      managerId: project.managerId,
    });

    return result;
  }

  async assignStaff(projectId: string, dto: AssignStaffDto, assignedBy: string) {
    const project = await this.prisma.project.findFirst({
      where: { id: projectId, deletedAt: null },
    });
    if (!project) throw new NotFoundException('Project not found');

    const user = await this.prisma.user.findFirst({
      where: { id: dto.userId, deletedAt: null },
    });
    if (!user) throw new NotFoundException('Staff user not found');

    const result = await this.prisma.projectStaff.upsert({
      where: {
        projectId_userId: {
          projectId,
          userId: dto.userId,
        },
      },
      update: {
        role: dto.role,
        assignedBy,
      },
      create: {
        projectId,
        userId: dto.userId,
        role: dto.role,
        assignedBy,
      },
    });

    // Emit domain event
    this.eventEmitter.emit(DomainEvents.PROJECT_ASSIGNED, {
      projectId,
      projectCode: project.projectCode,
      userId: dto.userId,
      role: dto.role,
      assignedBy,
    });

    return result;
  }

  async removeStaff(projectId: string, userId: string) {
    return this.prisma.projectStaff.delete({
      where: {
        projectId_userId: {
          projectId,
          userId,
        },
      },
    });
  }

  async softDelete(id: string) {
    const project = await this.prisma.project.findFirst({
      where: { id, deletedAt: null },
    });
    if (!project) throw new NotFoundException('Project not found');

    return this.prisma.project.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
}
