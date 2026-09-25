import { Reflector } from '@nestjs/core';
import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { PermissionsGuard } from './permissions.guard';
import { UserRole } from '@inzovate/shared';

describe('PermissionsGuard RBAC Security QA Tests', () => {
  let guard: PermissionsGuard;
  let reflector: Reflector;
  let prisma: any;

  beforeEach(() => {
    reflector = new Reflector();
    prisma = {
      role: {
        findUnique: jest.fn(),
      },
    };
    guard = new PermissionsGuard(reflector, prisma);
  });

  function createMockContext(user: any, requiredPermissions?: string[]): ExecutionContext {
    jest.spyOn(reflector, 'getAllAndMerge').mockReturnValue(requiredPermissions || []);

    return {
      getHandler: jest.fn(),
      getClass: jest.fn(),
      switchToHttp: () => ({
        getRequest: () => ({ user }),
      }),
    } as unknown as ExecutionContext;
  }

  it('permits Super Admin full access regardless of specific permissions', async () => {
    const context = createMockContext(
      {
        id: 'admin-id',
        roleId: 'admin-role-id',
        role: { name: UserRole.SUPER_ADMIN, rolePermissions: [] },
      },
      ['finance:refund', 'projects:delete'],
    );

    const result = await guard.canActivate(context);
    expect(result).toBe(true);
  });

  it('permits user when they possess the exact required permission', async () => {
    prisma.role.findUnique.mockResolvedValue({
      id: 'qa-role-id',
      rolePermissions: [{ permission: { name: 'manuscripts:qc_update' } }],
    });

    const context = createMockContext(
      {
        id: 'user-id',
        roleId: 'qa-role-id',
        role: {
          name: UserRole.QUALITY_ANALYST,
        },
      },
      ['manuscripts:qc_update'],
    );

    const result = await guard.canActivate(context);
    expect(result).toBe(true);
  });

  it('rejects user with 403 ForbiddenException when missing required permissions', async () => {
    prisma.role.findUnique.mockResolvedValue({
      id: 'client-role-id',
      rolePermissions: [{ permission: { name: 'projects:read:own' } }],
    });

    const context = createMockContext(
      {
        id: 'user-id',
        roleId: 'client-role-id',
        role: {
          name: UserRole.CLIENT,
        },
      },
      ['finance:create_invoice'],
    );

    await expect(guard.canActivate(context)).rejects.toThrow(ForbiddenException);
  });
});
