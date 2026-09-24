import { Injectable, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateCommunicationDto } from './dto/communication.dto';
import {
  PaginationDto,
  toPrismaOrderAndPagination,
  buildPaginationMeta,
} from '../../common/dto/pagination.dto';
import { CommunicationType, UserRole } from '@inzovate/shared';

@Injectable()
export class CommunicationsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(
    query: PaginationDto & {
      projectId?: string;
      clientId?: string;
      type?: string;
    },
    userId: string,
    role: string,
  ) {
    const { skip, take, orderBy } = toPrismaOrderAndPagination(query);
    const where: any = {};

    if (query.projectId) where.projectId = query.projectId;
    if (query.clientId) where.clientId = query.clientId;
    if (query.type) where.type = query.type;

    // Security: clients must never see internal staff notes or confidential journal communications
    if (role === UserRole.CLIENT) {
      where.type = {
        in: [
          CommunicationType.CLIENT_COMMENT,
          CommunicationType.EMAIL,
          CommunicationType.REVISION_COMMUNICATION,
          CommunicationType.PAYMENT_COMMUNICATION,
        ],
      };
      where.client = { userId };
    }

    const [data, total] = await Promise.all([
      this.prisma.communication.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { firstName: true, lastName: true, email: true } },
          client: { select: { organization: true } },
          project: { select: { projectCode: true, title: true } },
        },
      }),
      this.prisma.communication.count({ where }),
    ]);

    return {
      data,
      meta: buildPaginationMeta(total, query.page ?? 1, query.limit ?? 20),
    };
  }

  async create(dto: CreateCommunicationDto, userId: string, role: string) {
    // Clients cannot create INTERNAL_NOTE or JOURNAL_COMMUNICATION
    if (
      role === UserRole.CLIENT &&
      (dto.type === CommunicationType.INTERNAL_NOTE || dto.type === CommunicationType.JOURNAL_COMMUNICATION)
    ) {
      throw new ForbiddenException('Clients are not permitted to log internal system notes');
    }

    return this.prisma.communication.create({
      data: {
        type: dto.type,
        projectId: dto.projectId,
        clientId: dto.clientId,
        userId,
        subject: dto.subject,
        body: dto.body,
        attachments: dto.attachments || [],
      },
      include: {
        user: { select: { firstName: true, lastName: true, email: true } },
      },
    });
  }
}
