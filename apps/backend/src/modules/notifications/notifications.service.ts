import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import {
  PaginationDto,
  toPrismaOrderAndPagination,
  buildPaginationMeta,
} from '../../common/dto/pagination.dto';

@Injectable()
export class NotificationsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAllForUser(userId: string, query: PaginationDto & { unreadOnly?: boolean }) {
    const { skip, take, orderBy } = toPrismaOrderAndPagination(query, 'createdAt');
    const where: any = { userId };
    if (query.unreadOnly) where.isRead = false;

    const [data, total, unreadCount] = await Promise.all([
      this.prisma.notification.findMany({
        where,
        skip,
        take,
        orderBy: orderBy ?? { createdAt: 'desc' },
      }),
      this.prisma.notification.count({ where }),
      this.prisma.notification.count({ where: { userId, isRead: false } }),
    ]);

    return {
      data,
      unreadCount,
      meta: buildPaginationMeta(total, query.page ?? 1, query.limit ?? 20),
    };
  }

  async markAsRead(id: string, userId: string) {
    const notification = await this.prisma.notification.findFirst({
      where: { id, userId },
    });
    if (!notification) throw new NotFoundException('Notification not found');

    return this.prisma.notification.update({
      where: { id },
      data: { isRead: true, readAt: new Date() },
    });
  }

  async markAllAsRead(userId: string) {
    return this.prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true, readAt: new Date() },
    });
  }

  async create(userId: string, type: string, title: string, body: string, metadata?: any) {
    return this.prisma.notification.create({
      data: {
        userId,
        type,
        title,
        body,
        metadata,
      },
    });
  }
}
