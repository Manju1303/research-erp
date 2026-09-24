import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateTaskDto, UpdateTaskDto, UpdateTaskProgressDto } from './dto/task.dto';
import {
  PaginationDto,
  toPrismaOrderAndPagination,
  buildPaginationMeta,
} from '../../common/dto/pagination.dto';
import { UserRole, TaskStatus } from '@inzovate/shared';

@Injectable()
export class TasksService {
  constructor(private readonly prisma: PrismaService) {}

  private readonly TASK_INCLUDE = {
    assignee: {
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
      },
    },
    creator: {
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
      },
    },
    project: {
      select: {
        id: true,
        projectCode: true,
        title: true,
        status: true,
        clientId: true,
      },
    },
  };

  async findAll(
    query: PaginationDto & {
      projectId?: string;
      assigneeId?: string;
      status?: string;
      priority?: string;
    },
    userId: string,
    role: string,
  ) {
    const { skip, take, orderBy } = toPrismaOrderAndPagination(query);
    const where: any = { deletedAt: null };

    if (role === UserRole.CLIENT) {
      const client = await this.prisma.client.findUnique({ where: { userId } });
      if (!client) return { data: [], meta: buildPaginationMeta(0, 1, 20) };
      where.project = { clientId: client.id };
    } else if (role === UserRole.RESEARCH_STAFF) {
      where.assigneeId = userId;
    }

    if (query.projectId) where.projectId = query.projectId;
    if (query.assigneeId && role !== UserRole.RESEARCH_STAFF) where.assigneeId = query.assigneeId;
    if (query.status) where.status = query.status;
    if (query.priority) where.priority = query.priority;

    const [data, total] = await Promise.all([
      this.prisma.task.findMany({
        where,
        skip,
        take,
        orderBy,
        include: this.TASK_INCLUDE,
      }),
      this.prisma.task.count({ where }),
    ]);

    return {
      data,
      meta: buildPaginationMeta(total, query.page ?? 1, query.limit ?? 20),
    };
  }

  async findOne(id: string, userId: string, role: string) {
    const task = await this.prisma.task.findFirst({
      where: { id, deletedAt: null },
      include: this.TASK_INCLUDE,
    });

    if (!task) throw new NotFoundException('Task not found');

    if (role === UserRole.CLIENT) {
      const client = await this.prisma.client.findUnique({ where: { userId } });
      if (!client || task.project.clientId !== client.id) {
        throw new ForbiddenException('Access denied');
      }
    } else if (role === UserRole.RESEARCH_STAFF && task.assigneeId !== userId) {
      throw new ForbiddenException('Access denied to this task');
    }

    return task;
  }

  async create(dto: CreateTaskDto, creatorId: string) {
    const project = await this.prisma.project.findFirst({
      where: { id: dto.projectId, deletedAt: null },
    });
    if (!project) throw new NotFoundException('Project not found');

    return this.prisma.task.create({
      data: {
        projectId: dto.projectId,
        title: dto.title,
        description: dto.description,
        priority: dto.priority || 'NORMAL',
        dueDate: dto.dueDate ? new Date(dto.dueDate) : null,
        estimatedHours: dto.estimatedHours,
        assigneeId: dto.assigneeId,
        creatorId,
      },
      include: this.TASK_INCLUDE,
    });
  }

  async update(id: string, dto: UpdateTaskDto, userId: string, role: string) {
    const task = await this.prisma.task.findFirst({
      where: { id, deletedAt: null },
    });
    if (!task) throw new NotFoundException('Task not found');

    if (role === UserRole.RESEARCH_STAFF && task.assigneeId !== userId) {
      throw new ForbiddenException('You can only update your own assigned tasks');
    }

    const updateData: any = { ...dto };
    if (dto.dueDate) updateData.dueDate = new Date(dto.dueDate);
    if (dto.status === TaskStatus.COMPLETED && !task.completedAt) {
      updateData.completedAt = new Date();
      updateData.completionPct = 100;
    }

    return this.prisma.task.update({
      where: { id },
      data: updateData,
      include: this.TASK_INCLUDE,
    });
  }

  async updateProgress(id: string, dto: UpdateTaskProgressDto, userId: string, role: string) {
    const task = await this.prisma.task.findFirst({
      where: { id, deletedAt: null },
    });
    if (!task) throw new NotFoundException('Task not found');

    if (role === UserRole.RESEARCH_STAFF && task.assigneeId !== userId) {
      throw new ForbiddenException('You can only update progress on your assigned tasks');
    }

    const completedAt = dto.status === TaskStatus.COMPLETED ? new Date() : null;

    return this.prisma.task.update({
      where: { id },
      data: {
        status: dto.status,
        completionPct: dto.completionPct,
        actualHours: dto.actualHours,
        completedAt,
      },
      include: this.TASK_INCLUDE,
    });
  }

  async softDelete(id: string) {
    const task = await this.prisma.task.findFirst({
      where: { id, deletedAt: null },
    });
    if (!task) throw new NotFoundException('Task not found');

    return this.prisma.task.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
}
