import { SetMetadata } from '@nestjs/common';

export const PERMISSIONS_KEY = 'permissions';
/**
 * Declare required permissions for a route.
 * @example @RequirePermissions('projects:create')
 * @example @RequirePermissions('projects:read', 'tasks:read')
 */
export const RequirePermissions = (...permissions: string[]) =>
  SetMetadata(PERMISSIONS_KEY, permissions);
