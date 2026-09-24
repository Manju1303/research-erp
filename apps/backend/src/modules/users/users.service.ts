import {
  Injectable, NotFoundException, ConflictException, ForbiddenException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../database/prisma.service';
import { CreateUserDto, UpdateUserDto, AssignRoleDto } from './dto/user.dto';
import {
  PaginationDto, toPrismaOrderAndPagination, buildPaginationMeta,
} from '../../common/dto/pagination.dto';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  private readonly USER_INCLUDE = {
    role: {
      include: { rolePermissions: { include: { permission: true } } },
    },
  };

  async findAll(query: PaginationDto & { search?: string; roleId?: string }) {
    const { skip, take, orderBy } = toPrismaOrderAndPagination(query);
    const where: any = { deletedAt: null };
    if (query.search) {
      where.OR = [
        { email: { contains: query.search, mode: 'insensitive' } },
        { firstName: { contains: query.search, mode: 'insensitive' } },
        { lastName: { contains: query.search, mode: 'insensitive' } },
      ];
    }
    if (query.roleId) where.roleId = query.roleId;

    const [rawUsers, total] = await Promise.all([
      this.prisma.user.findMany({
        where, skip, take, orderBy,
        include: this.USER_INCLUDE,
      }),
      this.prisma.user.count({ where }),
    ]);

    const data = rawUsers.map(({ passwordHash, ...u }) => u);
    return { data, meta: buildPaginationMeta(total, query.page ?? 1, query.limit ?? 20) };
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findFirst({
      where: { id, deletedAt: null },
      include: this.USER_INCLUDE,
    });
    if (!user) throw new NotFoundException('User not found');
    const { passwordHash: _, ...safe } = user;
    return safe;
  }

  async create(dto: CreateUserDto) {
    const existing = await this.prisma.user.findUnique({ where: { email: dto.email.toLowerCase() } });
    if (existing) throw new ConflictException('Email already registered');

    const role = await this.prisma.role.findUnique({ where: { id: dto.roleId } });
    if (!role) throw new NotFoundException('Role not found');

    const passwordHash = await bcrypt.hash(dto.password, 12);
    const user = await this.prisma.user.create({
      data: {
        email: dto.email.toLowerCase(),
        passwordHash,
        firstName: dto.firstName,
        lastName: dto.lastName,
        phone: dto.phone,
        roleId: dto.roleId,
      },
      include: this.USER_INCLUDE,
    });
    const { passwordHash: _, ...safe } = user;
    return safe;
  }

  async update(id: string, dto: UpdateUserDto) {
    await this.findOne(id); // ensures exists
    const data: any = { ...dto };
    if (dto.password) {
      data.passwordHash = await bcrypt.hash(dto.password, 12);
      delete data.password;
    }
    if (dto.email) data.email = dto.email.toLowerCase();
    const user = await this.prisma.user.update({
      where: { id }, data, include: this.USER_INCLUDE,
    });
    const { passwordHash: _, ...safe } = user;
    return safe;
  }

  async assignRole(id: string, dto: AssignRoleDto, requestingUserRole: string) {
    // Only super_admin can assign super_admin role
    const targetRole = await this.prisma.role.findUnique({ where: { id: dto.roleId } });
    if (!targetRole) throw new NotFoundException('Role not found');
    if (targetRole.name === 'super_admin' && requestingUserRole !== 'super_admin') {
      throw new ForbiddenException('Only super admins can assign the super admin role');
    }
    return this.update(id, { roleId: dto.roleId } as any);
  }

  async toggleStatus(id: string, isActive: boolean) {
    await this.findOne(id);
    const user = await this.prisma.user.update({
      where: { id }, data: { isActive }, include: this.USER_INCLUDE,
    });
    const { passwordHash: _, ...safe } = user;
    return safe;
  }

  async softDelete(id: string) {
    await this.findOne(id);
    return this.prisma.user.update({
      where: { id }, data: { deletedAt: new Date(), isActive: false },
    });
  }

  async findAllRoles() {
    return this.prisma.role.findMany({
      include: { rolePermissions: { include: { permission: true } } },
      orderBy: { displayName: 'asc' },
    });
  }
}
