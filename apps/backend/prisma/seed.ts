/**
 * Database seed — creates system roles, permissions, and a default super admin.
 * Run with: npm run db:seed
 *
 * This seed is idempotent: re-running it will not duplicate data.
 */
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

// ─────────────────────────────────────────────
// Permission definitions
// ─────────────────────────────────────────────

const PERMISSIONS = [
  // Users
  { name: 'users:create',       resource: 'users',       action: 'create',       scope: null,  description: 'Create new users' },
  { name: 'users:read',         resource: 'users',       action: 'read',         scope: null,  description: 'View all users' },
  { name: 'users:update',       resource: 'users',       action: 'update',       scope: null,  description: 'Update any user' },
  { name: 'users:delete',       resource: 'users',       action: 'delete',       scope: null,  description: 'Delete users' },
  { name: 'users:assign_role',  resource: 'users',       action: 'assign_role',  scope: null,  description: 'Assign roles to users' },

  // Clients
  { name: 'clients:create',     resource: 'clients',     action: 'create',       scope: null,  description: 'Create client profiles' },
  { name: 'clients:read',       resource: 'clients',     action: 'read',         scope: null,  description: 'View all clients' },
  { name: 'clients:update',     resource: 'clients',     action: 'update',       scope: null,  description: 'Update any client' },
  { name: 'clients:delete',     resource: 'clients',     action: 'delete',       scope: null,  description: 'Delete clients' },
  { name: 'clients:read:own',   resource: 'clients',     action: 'read',         scope: 'own', description: 'View own client profile' },

  // Projects
  { name: 'projects:create',    resource: 'projects',    action: 'create',       scope: null,  description: 'Create projects' },
  { name: 'projects:read',      resource: 'projects',    action: 'read',         scope: null,  description: 'View all projects' },
  { name: 'projects:update',    resource: 'projects',    action: 'update',       scope: null,  description: 'Update any project' },
  { name: 'projects:delete',    resource: 'projects',    action: 'delete',       scope: null,  description: 'Delete projects' },
  { name: 'projects:read:own',  resource: 'projects',    action: 'read',         scope: 'own', description: 'View own projects only' },
  { name: 'projects:transition_status', resource: 'projects', action: 'transition_status', scope: null, description: 'Transition project status' },

  // Tasks
  { name: 'tasks:create',       resource: 'tasks',       action: 'create',       scope: null,  description: 'Create tasks' },
  { name: 'tasks:read',         resource: 'tasks',       action: 'read',         scope: null,  description: 'View tasks' },
  { name: 'tasks:update',       resource: 'tasks',       action: 'update',       scope: null,  description: 'Update any task' },
  { name: 'tasks:update:own',   resource: 'tasks',       action: 'update',       scope: 'own', description: 'Update own assigned tasks' },
  { name: 'tasks:delete',       resource: 'tasks',       action: 'delete',       scope: null,  description: 'Delete tasks' },

  // Manuscripts
  { name: 'manuscripts:create',    resource: 'manuscripts', action: 'create',       scope: null,  description: 'Create manuscripts' },
  { name: 'manuscripts:read',      resource: 'manuscripts', action: 'read',         scope: null,  description: 'View all manuscripts' },
  { name: 'manuscripts:read:own',  resource: 'manuscripts', action: 'read',         scope: 'own', description: 'View own manuscripts' },
  { name: 'manuscripts:update',    resource: 'manuscripts', action: 'update',       scope: null,  description: 'Update manuscripts' },
  { name: 'manuscripts:qc_update', resource: 'manuscripts', action: 'qc_update',    scope: null,  description: 'Update QC checklist and status' },
  { name: 'manuscripts:approve',   resource: 'manuscripts', action: 'approve',      scope: 'own', description: 'Approve own project manuscripts' },

  // Documents
  { name: 'documents:upload',      resource: 'documents',   action: 'upload',       scope: null,  description: 'Upload documents' },
  { name: 'documents:read',        resource: 'documents',   action: 'read',         scope: null,  description: 'Download any document' },
  { name: 'documents:read:own',    resource: 'documents',   action: 'read',         scope: 'own', description: 'Download own project documents' },
  { name: 'documents:delete',      resource: 'documents',   action: 'delete',       scope: null,  description: 'Delete documents' },

  // Admin
  { name: 'roles:manage',          resource: 'roles',       action: 'manage',       scope: null,  description: 'Manage roles and permissions' },
  { name: 'permissions:manage',    resource: 'permissions', action: 'manage',       scope: null,  description: 'Manage permission assignments' },

  // Reports / Analytics
  { name: 'reports:read',          resource: 'reports',     action: 'read',         scope: null,  description: 'Access reports' },
  { name: 'analytics:read',        resource: 'analytics',   action: 'read',         scope: null,  description: 'Access analytics dashboards' },
  { name: 'audit_logs:read',       resource: 'audit_logs',  action: 'read',         scope: null,  description: 'View audit logs' },
];

// ─────────────────────────────────────────────
// Role → Permission mappings
// ─────────────────────────────────────────────

const ROLE_PERMISSIONS: Record<string, string[]> = {
  super_admin: PERMISSIONS.map((p) => p.name), // all permissions

  operations_manager: [
    'projects:read', 'projects:update', 'projects:transition_status',
    'tasks:read', 'tasks:create', 'tasks:update',
    'clients:read',
    'users:read',
    'manuscripts:read',
    'documents:read', 'documents:upload',
    'reports:read', 'analytics:read',
  ],

  research_manager: [
    'projects:create', 'projects:read', 'projects:update', 'projects:transition_status',
    'tasks:create', 'tasks:read', 'tasks:update', 'tasks:delete',
    'clients:read',
    'manuscripts:create', 'manuscripts:read', 'manuscripts:update',
    'documents:upload', 'documents:read',
    'reports:read',
  ],

  research_staff: [
    'projects:read',
    'tasks:read', 'tasks:update:own',
    'manuscripts:create', 'manuscripts:read', 'manuscripts:update',
    'documents:upload', 'documents:read',
  ],

  quality_analyst: [
    'projects:read',
    'tasks:read',
    'manuscripts:read', 'manuscripts:qc_update',
    'documents:read',
  ],

  publication_executive: [
    'projects:read',
    'manuscripts:read',
    'documents:upload', 'documents:read',
    'reports:read',
  ],

  client: [
    'projects:read:own',
    'manuscripts:read:own', 'manuscripts:approve',
    'documents:read:own',
    'clients:read:own',
  ],

  finance: [
    'projects:read',
    'clients:read',
    'reports:read',
  ],

  management: [
    'projects:read',
    'clients:read',
    'users:read',
    'reports:read', 'analytics:read',
    'audit_logs:read',
  ],
};

const ROLES = [
  { name: 'super_admin',         displayName: 'Super Administrator',    isSystem: true },
  { name: 'operations_manager',  displayName: 'Operations Manager',     isSystem: true },
  { name: 'research_manager',    displayName: 'Research Manager',       isSystem: true },
  { name: 'research_staff',      displayName: 'Research Staff',         isSystem: true },
  { name: 'quality_analyst',     displayName: 'Quality Analyst',        isSystem: true },
  { name: 'publication_executive', displayName: 'Publication Executive', isSystem: true },
  { name: 'client',              displayName: 'Client / Author',        isSystem: true },
  { name: 'finance',             displayName: 'Finance / Accounts',     isSystem: true },
  { name: 'management',          displayName: 'Management',             isSystem: true },
];

async function main() {
  console.log('🌱 Starting database seed...');

  // 1. Upsert permissions
  console.log('  Creating permissions...');
  for (const perm of PERMISSIONS) {
    await prisma.permission.upsert({
      where: { name: perm.name },
      update: { description: perm.description },
      create: {
        name: perm.name,
        resource: perm.resource,
        action: perm.action,
        scope: perm.scope ?? undefined,
        description: perm.description,
      },
    });
  }

  // 2. Upsert roles
  console.log('  Creating roles...');
  for (const role of ROLES) {
    await prisma.role.upsert({
      where: { name: role.name },
      update: { displayName: role.displayName },
      create: {
        name: role.name,
        displayName: role.displayName,
        isSystem: role.isSystem,
      },
    });
  }

  // 3. Assign permissions to roles
  console.log('  Assigning permissions to roles...');
  for (const [roleName, permNames] of Object.entries(ROLE_PERMISSIONS)) {
    const role = await prisma.role.findUnique({ where: { name: roleName } });
    if (!role) continue;

    for (const permName of permNames) {
      const perm = await prisma.permission.findUnique({ where: { name: permName } });
      if (!perm) {
        console.warn(`  ⚠ Permission not found: ${permName}`);
        continue;
      }
      await prisma.rolePermission.upsert({
        where: { roleId_permissionId: { roleId: role.id, permissionId: perm.id } },
        update: {},
        create: { roleId: role.id, permissionId: perm.id },
      });
    }
  }

  // 4. Create default super admin user
  console.log('  Creating default super admin...');
  const superAdminRole = await prisma.role.findUnique({ where: { name: 'super_admin' } });
  if (!superAdminRole) throw new Error('Super admin role not found after seeding');

  const adminEmail = process.env.SEED_ADMIN_EMAIL ?? 'admin@inzovate.local';
  const adminPassword = process.env.SEED_ADMIN_PASSWORD ?? 'Admin@12345';
  const passwordHash = await bcrypt.hash(adminPassword, 12);

  await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      passwordHash,
      firstName: 'System',
      lastName: 'Administrator',
      emailVerified: true,
      isActive: true,
      roleId: superAdminRole.id,
    },
  });

  console.log('✅ Seed complete.');
  console.log(`   Admin email: ${adminEmail}`);
  console.log(`   Admin password: ${adminPassword}`);
  console.log('   ⚠ Change the admin password immediately on first login!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
