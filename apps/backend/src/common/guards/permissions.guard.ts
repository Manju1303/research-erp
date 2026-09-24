import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PrismaService } from '../../database/prisma.service';
import { PERMISSIONS_KEY } from '../decorators/permissions.decorator';

/**
 * Permission-based guard.
 * Checks if the authenticated user's role has all required permissions
 * by querying the role_permissions table — no hardcoded role checks.
 *
 * Usage: @RequirePermissions('projects:create', 'projects:read')
 */
@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredPermissions = this.reflector.getAllAndMerge<string[]>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true; // No permissions required — still authenticated via JwtAuthGuard
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('No authenticated user');
    }

    // Super admin bypasses all permission checks
    if (user.role?.name === 'super_admin') return true;

    // Fetch role's permissions from DB
    const roleWithPerms = await this.prisma.role.findUnique({
      where: { id: user.roleId },
      include: {
        rolePermissions: {
          include: { permission: true },
        },
      },
    });

    const userPermissions = new Set(
      roleWithPerms?.rolePermissions.map((rp) => rp.permission.name) ?? [],
    );

    const hasAll = requiredPermissions.every((perm) => userPermissions.has(perm));

    if (!hasAll) {
      const missing = requiredPermissions.filter((p) => !userPermissions.has(p));
      throw new ForbiddenException(
        `Insufficient permissions. Missing: ${missing.join(', ')}`,
      );
    }

    return true;
  }
}
