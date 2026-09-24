/**
 * Permission strings follow the pattern: resource:action[:scope]
 * These are stored in the `permissions` table and checked at the API layer.
 * The guard resolves them via DB — no hardcoded if/else chains.
 */
export enum Permission {
  // Users
  USERS_CREATE = 'users:create',
  USERS_READ = 'users:read',
  USERS_UPDATE = 'users:update',
  USERS_DELETE = 'users:delete',
  USERS_ASSIGN_ROLE = 'users:assign_role',

  // Clients
  CLIENTS_CREATE = 'clients:create',
  CLIENTS_READ = 'clients:read',
  CLIENTS_UPDATE = 'clients:update',
  CLIENTS_DELETE = 'clients:delete',
  CLIENTS_READ_OWN = 'clients:read:own',

  // Projects
  PROJECTS_CREATE = 'projects:create',
  PROJECTS_READ = 'projects:read',
  PROJECTS_UPDATE = 'projects:update',
  PROJECTS_DELETE = 'projects:delete',
  PROJECTS_READ_OWN = 'projects:read:own',
  PROJECTS_TRANSITION_STATUS = 'projects:transition_status',

  // Tasks
  TASKS_CREATE = 'tasks:create',
  TASKS_READ = 'tasks:read',
  TASKS_UPDATE = 'tasks:update',
  TASKS_UPDATE_OWN = 'tasks:update:own',
  TASKS_DELETE = 'tasks:delete',

  // Manuscripts
  MANUSCRIPTS_CREATE = 'manuscripts:create',
  MANUSCRIPTS_READ = 'manuscripts:read',
  MANUSCRIPTS_READ_OWN = 'manuscripts:read:own',
  MANUSCRIPTS_UPDATE = 'manuscripts:update',
  MANUSCRIPTS_QC_UPDATE = 'manuscripts:qc_update',
  MANUSCRIPTS_APPROVE = 'manuscripts:approve',

  // Documents
  DOCUMENTS_UPLOAD = 'documents:upload',
  DOCUMENTS_READ = 'documents:read',
  DOCUMENTS_READ_OWN = 'documents:read:own',
  DOCUMENTS_DELETE = 'documents:delete',

  // Roles & Permissions (admin)
  ROLES_MANAGE = 'roles:manage',
  PERMISSIONS_MANAGE = 'permissions:manage',

  // Reports
  REPORTS_READ = 'reports:read',

  // Audit Logs
  AUDIT_LOGS_READ = 'audit_logs:read',

  // Analytics
  ANALYTICS_READ = 'analytics:read',
}
