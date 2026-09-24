import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../database/prisma.service';
import { CreateClientDto, UpdateClientDto } from './dto/client.dto';
import {
  PaginationDto,
  toPrismaOrderAndPagination,
  buildPaginationMeta,
} from '../../common/dto/pagination.dto';

@Injectable()
export class ClientsService {
  constructor(private readonly prisma: PrismaService) {}

  private readonly CLIENT_INCLUDE = {
    user: {
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        avatarUrl: true,
        isActive: true,
        lastLoginAt: true,
        createdAt: true,
      },
    },
    _count: {
      select: { projects: true },
    },
  };

  async findAll(query: PaginationDto & { search?: string; country?: string }, userRole?: string) {
    const { skip, take, orderBy } = toPrismaOrderAndPagination(query);
    const where: any = { deletedAt: null };

    if (query.search) {
      where.OR = [
        { organization: { contains: query.search, mode: 'insensitive' } },
        { fieldOfStudy: { contains: query.search, mode: 'insensitive' } },
        { user: { firstName: { contains: query.search, mode: 'insensitive' } } },
        { user: { lastName: { contains: query.search, mode: 'insensitive' } } },
        { user: { email: { contains: query.search, mode: 'insensitive' } } },
      ];
    }

    if (query.country) {
      where.country = query.country;
    }

    const [data, total] = await Promise.all([
      this.prisma.client.findMany({
        where,
        skip,
        take,
        orderBy,
        include: this.CLIENT_INCLUDE,
      }),
      this.prisma.client.count({ where }),
    ]);

    // Omit internal notes if client is querying
    const sanitized = data.map((c) => {
      if (userRole === 'client') {
        const { notes: _, ...rest } = c;
        return rest;
      }
      return c;
    });

    return {
      data: sanitized,
      meta: buildPaginationMeta(total, query.page ?? 1, query.limit ?? 20),
    };
  }

  async findOne(id: string, currentUserId?: string, userRole?: string) {
    const client = await this.prisma.client.findFirst({
      where: { id, deletedAt: null },
      include: {
        ...this.CLIENT_INCLUDE,
        projects: {
          where: { deletedAt: null },
          select: {
            id: true,
            projectCode: true,
            title: true,
            status: true,
            priority: true,
            deadline: true,
            createdAt: true,
          },
        },
      },
    });

    if (!client) {
      throw new NotFoundException('Client not found');
    }

    if (userRole === 'client' && client.userId !== currentUserId) {
      throw new ForbiddenException('You are not authorized to view this client profile');
    }

    if (userRole === 'client') {
      const { notes: _, ...rest } = client;
      return rest;
    }

    return client;
  }

  async findByUserId(userId: string) {
    const client = await this.prisma.client.findUnique({
      where: { userId },
      include: this.CLIENT_INCLUDE,
    });
    if (!client) {
      throw new NotFoundException('Client profile not found for this user');
    }
    return client;
  }

  async create(dto: CreateClientDto) {
    const emailLower = dto.email.toLowerCase();
    const existingUser = await this.prisma.user.findUnique({
      where: { email: emailLower },
      include: { clientProfile: true },
    });

    if (existingUser?.clientProfile) {
      throw new ConflictException('A client profile already exists for this email');
    }

    let clientRole = await this.prisma.role.findUnique({ where: { name: 'client' } });
    if (!clientRole) {
      clientRole = await this.prisma.role.create({
        data: {
          name: 'client',
          displayName: 'Client / Author',
          isSystem: true,
        },
      });
    }

    return this.prisma.$transaction(async (tx) => {
      let user = existingUser;
      if (!user) {
        const rawPassword = dto.temporaryPassword || 'Welcome@Inzovate123!';
        const passwordHash = await bcrypt.hash(rawPassword, 12);
        user = await tx.user.create({
          data: {
            email: emailLower,
            passwordHash,
            firstName: dto.firstName,
            lastName: dto.lastName,
            phone: dto.phone,
            orcidId: dto.orcidId,
            roleId: clientRole!.id,
          },
          include: { role: true } as any,
        });
      }

      return tx.client.create({
        data: {
          userId: user.id,
          organization: dto.organization,
          designation: dto.designation,
          fieldOfStudy: dto.fieldOfStudy,
          orcidId: dto.orcidId,
          country: dto.country,
          timezone: dto.timezone,
          notes: dto.notes,
        },
        include: this.CLIENT_INCLUDE,
      });
    });
  }

  async update(id: string, dto: UpdateClientDto, currentUserId?: string, userRole?: string) {
    const client = await this.prisma.client.findFirst({
      where: { id, deletedAt: null },
    });

    if (!client) {
      throw new NotFoundException('Client not found');
    }

    if (userRole === 'client' && client.userId !== currentUserId) {
      throw new ForbiddenException('You cannot modify another client profile');
    }

    return this.prisma.$transaction(async (tx) => {
      if (dto.firstName || dto.lastName || dto.phone || dto.orcidId) {
        await tx.user.update({
          where: { id: client.userId },
          data: {
            firstName: dto.firstName,
            lastName: dto.lastName,
            phone: dto.phone,
            orcidId: dto.orcidId,
          },
        });
      }

      // Clients cannot edit internal notes
      const updateData: any = {
        organization: dto.organization,
        designation: dto.designation,
        fieldOfStudy: dto.fieldOfStudy,
        orcidId: dto.orcidId,
        country: dto.country,
        timezone: dto.timezone,
      };

      if (userRole !== 'client' && dto.notes !== undefined) {
        updateData.notes = dto.notes;
      }

      return tx.client.update({
        where: { id },
        data: updateData,
        include: this.CLIENT_INCLUDE,
      });
    });
  }

  async softDelete(id: string) {
    const client = await this.prisma.client.findFirst({
      where: { id, deletedAt: null },
    });
    if (!client) throw new NotFoundException('Client not found');

    return this.prisma.client.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
}
