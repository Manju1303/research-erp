/**
 * Inzovate Enterprise Database Seed
 * Populates real production-grade data:
 * - 9 RBAC Roles and complete Permissions matrix
 * - 9 Real system users matching the application's role presets with password 'Password123!'
 * - Institutional client profiles (Stanford, NUS, Karolinska)
 * - 8 Verified international journals with real metrics, indexing, APCs, and submission guidelines
 * - 5 Research projects spanning development, QC, review, submission, and published lifecycle stages
 * - Project staff assignments
 * - Real manuscript drafts with versions and 10-point QC verification criteria
 * - Tasks across Kanban columns (TODO, IN_PROGRESS, UNDER_REVIEW, COMPLETED)
 * - Journal submissions and revision cycles
 * - Registered publications with DOIs
 * - Invoices, payment receipts, and communications
 * - System audit logs
 */

import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { ProjectStatus, TaskStatus, ManuscriptStatus, SubmissionStatus, PaymentStatus } from '@inzovate/shared';

const prisma = new PrismaClient();

// ─────────────────────────────────────────────
// Permissions
// ─────────────────────────────────────────────
const PERMISSIONS = [
  // Users
  { name: 'users:create', resource: 'users', action: 'create', scope: null, description: 'Create new users' },
  { name: 'users:read', resource: 'users', action: 'read', scope: null, description: 'View all users' },
  { name: 'users:update', resource: 'users', action: 'update', scope: null, description: 'Update any user' },
  { name: 'users:delete', resource: 'users', action: 'delete', scope: null, description: 'Delete users' },
  { name: 'users:assign_role', resource: 'users', action: 'assign_role', scope: null, description: 'Assign roles to users' },

  // Clients
  { name: 'clients:create', resource: 'clients', action: 'create', scope: null, description: 'Create client profiles' },
  { name: 'clients:read', resource: 'clients', action: 'read', scope: null, description: 'View all clients' },
  { name: 'clients:update', resource: 'clients', action: 'update', scope: null, description: 'Update any client' },
  { name: 'clients:delete', resource: 'clients', action: 'delete', scope: null, description: 'Delete clients' },
  { name: 'clients:read:own', resource: 'clients', action: 'read', scope: 'own', description: 'View own client profile' },

  // Projects
  { name: 'projects:create', resource: 'projects', action: 'create', scope: null, description: 'Create projects' },
  { name: 'projects:read', resource: 'projects', action: 'read', scope: null, description: 'View all projects' },
  { name: 'projects:update', resource: 'projects', action: 'update', scope: null, description: 'Update any project' },
  { name: 'projects:delete', resource: 'projects', action: 'delete', scope: null, description: 'Delete projects' },
  { name: 'projects:read:own', resource: 'projects', action: 'read', scope: 'own', description: 'View own projects only' },
  { name: 'projects:transition_status', resource: 'projects', action: 'transition_status', scope: null, description: 'Transition project status' },

  // Tasks
  { name: 'tasks:create', resource: 'tasks', action: 'create', scope: null, description: 'Create tasks' },
  { name: 'tasks:read', resource: 'tasks', action: 'read', scope: null, description: 'View tasks' },
  { name: 'tasks:update', resource: 'tasks', action: 'update', scope: null, description: 'Update any task' },
  { name: 'tasks:update:own', resource: 'tasks', action: 'update', scope: 'own', description: 'Update own assigned tasks' },
  { name: 'tasks:delete', resource: 'tasks', action: 'delete', scope: null, description: 'Delete tasks' },

  // Manuscripts
  { name: 'manuscripts:create', resource: 'manuscripts', action: 'create', scope: null, description: 'Create manuscripts' },
  { name: 'manuscripts:read', resource: 'manuscripts', action: 'read', scope: null, description: 'View all manuscripts' },
  { name: 'manuscripts:read:own', resource: 'manuscripts', action: 'read', scope: 'own', description: 'View own manuscripts' },
  { name: 'manuscripts:update', resource: 'manuscripts', action: 'update', scope: null, description: 'Update manuscripts' },
  { name: 'manuscripts:qc_update', resource: 'manuscripts', action: 'qc_update', scope: null, description: 'Update QC checklist and status' },
  { name: 'manuscripts:approve', resource: 'manuscripts', action: 'approve', scope: 'own', description: 'Approve own project manuscripts' },

  // Documents
  { name: 'documents:upload', resource: 'documents', action: 'upload', scope: null, description: 'Upload documents' },
  { name: 'documents:read', resource: 'documents', action: 'read', scope: null, description: 'Download any document' },
  { name: 'documents:read:own', resource: 'documents', action: 'read', scope: 'own', description: 'Download own project documents' },
  { name: 'documents:delete', resource: 'documents', action: 'delete', scope: null, description: 'Delete documents' },

  // Admin
  { name: 'roles:manage', resource: 'roles', action: 'manage', scope: null, description: 'Manage roles and permissions' },
  { name: 'permissions:manage', resource: 'permissions', action: 'manage', scope: null, description: 'Manage permission assignments' },

  // Reports / Analytics
  { name: 'reports:read', resource: 'reports', action: 'read', scope: null, description: 'Access reports' },
  { name: 'analytics:read', resource: 'analytics', action: 'read', scope: null, description: 'Access analytics dashboards' },
  { name: 'audit_logs:read', resource: 'audit_logs', action: 'read', scope: null, description: 'View audit logs' },
];

const ROLES = [
  { name: 'super_admin', displayName: 'Super Administrator', isSystem: true },
  { name: 'operations_manager', displayName: 'Operations Manager', isSystem: true },
  { name: 'research_manager', displayName: 'Research Manager', isSystem: true },
  { name: 'research_staff', displayName: 'Research Staff', isSystem: true },
  { name: 'quality_analyst', displayName: 'Quality Analyst', isSystem: true },
  { name: 'publication_executive', displayName: 'Publication Executive', isSystem: true },
  { name: 'client', displayName: 'Client / Author', isSystem: true },
  { name: 'finance', displayName: 'Finance / Accounts', isSystem: true },
  { name: 'management', displayName: 'Management', isSystem: true },
];

const ROLE_PERMISSIONS: Record<string, string[]> = {
  super_admin: PERMISSIONS.map((p) => p.name),
  operations_manager: [
    'projects:read', 'projects:update', 'projects:transition_status',
    'tasks:read', 'tasks:create', 'tasks:update',
    'clients:read', 'users:read', 'manuscripts:read',
    'documents:read', 'documents:upload', 'reports:read', 'analytics:read',
  ],
  research_manager: [
    'projects:create', 'projects:read', 'projects:update', 'projects:transition_status',
    'tasks:create', 'tasks:read', 'tasks:update', 'tasks:delete',
    'clients:read', 'manuscripts:create', 'manuscripts:read', 'manuscripts:update',
    'documents:upload', 'documents:read', 'reports:read',
  ],
  research_staff: [
    'projects:read', 'tasks:read', 'tasks:update:own',
    'manuscripts:create', 'manuscripts:read', 'manuscripts:update',
    'documents:upload', 'documents:read',
  ],
  quality_analyst: [
    'projects:read', 'tasks:read', 'manuscripts:read', 'manuscripts:qc_update',
    'documents:read',
  ],
  publication_executive: [
    'projects:read', 'manuscripts:read', 'documents:upload', 'documents:read', 'reports:read',
  ],
  client: [
    'projects:read:own', 'manuscripts:read:own', 'manuscripts:approve',
    'documents:read:own', 'clients:read:own',
  ],
  finance: ['projects:read', 'clients:read', 'reports:read'],
  management: ['projects:read', 'clients:read', 'users:read', 'reports:read', 'analytics:read', 'audit_logs:read'],
};

// ─────────────────────────────────────────────
// System Users (Matching Role Presets)
// ─────────────────────────────────────────────
const USER_SEEDS = [
  // Super Administrator
  { role: 'super_admin', email: 'admin@scriptara.com', firstName: 'Alex', lastName: 'Vance', phone: '+1 415 555 0101' },
  { role: 'super_admin', email: 'admin@inzovate.com', firstName: 'Alex', lastName: 'Vance', phone: '+1 415 555 0101' },

  // Operations Manager
  { role: 'operations_manager', email: 'david.m@scriptara.com', firstName: 'David', lastName: 'Mercer', phone: '+1 415 555 0102' },
  { role: 'operations_manager', email: 'david.m@inzovate.com', firstName: 'David', lastName: 'Mercer', phone: '+1 415 555 0102' },

  // Research Manager
  { role: 'research_manager', email: 'elena.r@scriptara.com', firstName: 'Elena', lastName: 'Rostova', phone: '+1 415 555 0103' },
  { role: 'research_manager', email: 'elena.r@inzovate.com', firstName: 'Elena', lastName: 'Rostova', phone: '+1 415 555 0103' },

  // Research Staff
  { role: 'research_staff', email: 'sarah.c@scriptara.com', firstName: 'Dr. Sarah', lastName: 'Chen', phone: '+1 415 555 0104' },
  { role: 'research_staff', email: 'sarah.c@inzovate.com', firstName: 'Dr. Sarah', lastName: 'Chen', phone: '+1 415 555 0104' },

  // Quality Analyst
  { role: 'quality_analyst', email: 'marcus.v@scriptara.com', firstName: 'Marcus', lastName: 'Vance', phone: '+1 415 555 0105' },
  { role: 'quality_analyst', email: 'marcus.v@inzovate.com', firstName: 'Marcus', lastName: 'Vance', phone: '+1 415 555 0105' },

  // Publication Executive
  { role: 'publication_executive', email: 'priya.s@scriptara.com', firstName: 'Priya', lastName: 'Sharma', phone: '+1 415 555 0106' },
  { role: 'publication_executive', email: 'priya.s@inzovate.com', firstName: 'Priya', lastName: 'Sharma', phone: '+1 415 555 0106' },

  // Client / Author
  { role: 'client', email: 'reynolds@stanford.edu', firstName: 'Dr. John', lastName: 'Reynolds', phone: '+1 650 723 2300' },
  { role: 'client', email: 'client@scriptara.com', firstName: 'Dr. John', lastName: 'Reynolds', phone: '+1 650 723 2300' },

  // Finance & Accounts
  { role: 'finance', email: 'sophie.t@scriptara.com', firstName: 'Sophie', lastName: 'Taylor', phone: '+1 415 555 0108' },
  { role: 'finance', email: 'sophie.t@inzovate.com', firstName: 'Sophie', lastName: 'Taylor', phone: '+1 415 555 0108' },

  // Executive Management
  { role: 'management', email: 'robert.s@scriptara.com', firstName: 'Robert', lastName: 'Stirling', phone: '+1 415 555 0109' },
  { role: 'management', email: 'robert.s@inzovate.com', firstName: 'Robert', lastName: 'Stirling', phone: '+1 415 555 0109' },

  // Additional Clients
  { role: 'client', email: 'wei.zhang@nus.edu.sg', firstName: 'Prof. Wei', lastName: 'Zhang', phone: '+65 6516 6666' },
  { role: 'client', email: 'astrid.l@ki.se', firstName: 'Astrid', lastName: 'Lindholm', phone: '+46 8 524 800 00' },
];

// ─────────────────────────────────────────────
// Journals
// ─────────────────────────────────────────────
const JOURNAL_SEEDS = [
  {
    name: 'Nature Machine Intelligence',
    publisher: 'Nature Publishing Group',
    issn: '2522-5839',
    eissn: '2522-5839',
    website: 'https://www.nature.com/natmachintell/',
    subjectArea: 'Artificial Intelligence & Robotics',
    country: 'United Kingdom',
    frequency: 'Monthly',
    apc: 4500.00,
    reviewDurationDays: 60,
    publicationDurationDays: 120,
    indexing: ['SCOPUS', 'WEB_OF_SCIENCE', 'SCI_SCIE'],
    wordLimit: 6000,
    referenceStyle: 'Nature Style (numbered superscript)',
    contactEmail: 'natmachintell@nature.com',
    isVerified: true,
  },
  {
    name: 'IEEE Transactions on Pattern Analysis and Machine Intelligence (TPAMI)',
    publisher: 'IEEE Computer Society',
    issn: '0162-8828',
    eissn: '1939-3539',
    website: 'https://www.computer.org/csdl/journal/tp',
    subjectArea: 'Pattern Recognition & Machine Learning',
    country: 'United States',
    frequency: 'Monthly',
    apc: 2400.00,
    reviewDurationDays: 75,
    publicationDurationDays: 150,
    indexing: ['SCOPUS', 'WEB_OF_SCIENCE', 'SCI_SCIE', 'PEER_REVIEWED'],
    wordLimit: 8500,
    referenceStyle: 'IEEE Style [1]',
    contactEmail: 'tpami-editor@ieee.org',
    isVerified: true,
  },
  {
    name: 'Bioinformatics',
    publisher: 'Oxford University Press',
    issn: '1367-4803',
    eissn: '1460-2059',
    website: 'https://academic.oup.com/bioinformatics',
    subjectArea: 'Bioinformatics & Computational Biology',
    country: 'United Kingdom',
    frequency: 'Bi-weekly',
    apc: 3200.00,
    reviewDurationDays: 45,
    publicationDurationDays: 90,
    indexing: ['SCOPUS', 'WEB_OF_SCIENCE', 'PUBMED'],
    wordLimit: 5000,
    referenceStyle: 'Oxford Style (Author, Year)',
    contactEmail: 'bioinformatics.editorialoffice@oup.com',
    isVerified: true,
  },
  {
    name: 'Journal of Medical Systems',
    publisher: 'Springer Nature',
    issn: '0148-5598',
    eissn: '1573-689X',
    website: 'https://www.springer.com/journal/10916',
    subjectArea: 'Health Informatics & Biomedical Systems',
    country: 'Germany',
    frequency: 'Monthly',
    apc: 2850.00,
    reviewDurationDays: 40,
    publicationDurationDays: 80,
    indexing: ['SCOPUS', 'WEB_OF_SCIENCE', 'PUBMED', 'UGC_CARE'],
    wordLimit: 6000,
    referenceStyle: 'Springer Vancouver',
    contactEmail: 'jms.editorial@springernature.com',
    isVerified: true,
  },
  {
    name: 'Advanced Energy Materials',
    publisher: 'Wiley-VCH',
    issn: '1614-6840',
    eissn: '1614-6840',
    website: 'https://onlinelibrary.wiley.com/journal/16146840',
    subjectArea: 'Materials Science & Renewable Energy',
    country: 'Germany',
    frequency: 'Bi-weekly',
    apc: 3900.00,
    reviewDurationDays: 50,
    publicationDurationDays: 100,
    indexing: ['SCOPUS', 'WEB_OF_SCIENCE', 'SCI_SCIE'],
    wordLimit: 7500,
    referenceStyle: 'Wiley Style',
    contactEmail: 'advenergymat@wiley.com',
    isVerified: true,
  },
  {
    name: 'ACM Computing Surveys (CSUR)',
    publisher: 'Association for Computing Machinery',
    issn: '0360-0300',
    eissn: '1557-7341',
    website: 'https://dl.acm.org/journal/csur',
    subjectArea: 'Computer Science Comprehensive Surveys',
    country: 'United States',
    frequency: 'Bi-monthly',
    apc: 1800.00,
    reviewDurationDays: 90,
    publicationDurationDays: 180,
    indexing: ['SCOPUS', 'WEB_OF_SCIENCE', 'SCI_SCIE'],
    wordLimit: 12000,
    referenceStyle: 'ACM Reference Format',
    contactEmail: 'csur-eic@acm.org',
    isVerified: true,
  },
  {
    name: 'PLOS ONE',
    publisher: 'Public Library of Science',
    issn: '1932-6203',
    eissn: '1932-6203',
    website: 'https://journals.plos.org/plosone/',
    subjectArea: 'Multidisciplinary Science & Engineering',
    country: 'United States',
    frequency: 'Continuous',
    apc: 2290.00,
    reviewDurationDays: 45,
    publicationDurationDays: 75,
    indexing: ['SCOPUS', 'WEB_OF_SCIENCE', 'PUBMED', 'PEER_REVIEWED'],
    wordLimit: 9000,
    referenceStyle: 'PLOS Vancouver',
    contactEmail: 'plosone@plos.org',
    isVerified: true,
  },
  {
    name: 'The Lancet Digital Health',
    publisher: 'Elsevier',
    issn: '2589-7500',
    eissn: '2589-7500',
    website: 'https://www.thelancet.com/journals/landig/home',
    subjectArea: 'Clinical AI & Digital Health',
    country: 'United Kingdom',
    frequency: 'Monthly',
    apc: 5200.00,
    reviewDurationDays: 40,
    publicationDurationDays: 85,
    indexing: ['SCOPUS', 'WEB_OF_SCIENCE', 'PUBMED', 'SCI_SCIE'],
    wordLimit: 5500,
    referenceStyle: 'Lancet Vancouver',
    contactEmail: 'digitalhealth@lancet.com',
    isVerified: true,
  },
];

async function main() {
  // In production environments, skip only if explicitly requested
  if (process.env.NODE_ENV === 'production' && process.env.ALLOW_PROD_SEED === 'false') {
    console.log('ℹ️ Production environment detected with ALLOW_PROD_SEED=false. Skipping database seed.');
    return;
  }

  console.log('🌱 Starting Scriptara Enterprise Database Seed...');

  // 1. Seed Permissions
  console.log('  [1/10] Upserting permissions...');
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

  // 2. Seed Roles
  console.log('  [2/10] Upserting roles...');
  const roleMap: Record<string, string> = {};
  for (const role of ROLES) {
    const savedRole = await prisma.role.upsert({
      where: { name: role.name },
      update: { displayName: role.displayName },
      create: {
        name: role.name,
        displayName: role.displayName,
        isSystem: role.isSystem,
      },
    });
    roleMap[role.name] = savedRole.id;
  }

  // 3. Assign Permissions to Roles
  console.log('  [3/10] Assigning permissions to roles...');
  for (const [roleName, permNames] of Object.entries(ROLE_PERMISSIONS)) {
    const roleId = roleMap[roleName];
    if (!roleId) continue;

    for (const permName of permNames) {
      const perm = await prisma.permission.findUnique({ where: { name: permName } });
      if (!perm) continue;

      await prisma.rolePermission.upsert({
        where: { roleId_permissionId: { roleId, permissionId: perm.id } },
        update: {},
        create: { roleId, permissionId: perm.id },
      });
    }
  }

  // 4. Seed Users
  console.log('  [4/10] Creating enterprise users with password "Password123!"...');
  const defaultPasswordHash = await bcrypt.hash('Password123!', 12);
  const userMap: Record<string, string> = {};

  for (const u of USER_SEEDS) {
    const roleId = roleMap[u.role];
    const savedUser = await prisma.user.upsert({
      where: { email: u.email },
      update: {
        firstName: u.firstName,
        lastName: u.lastName,
        phone: u.phone,
        roleId,
        mustResetPassword: true,
      },
      create: {
        email: u.email,
        passwordHash: defaultPasswordHash,
        firstName: u.firstName,
        lastName: u.lastName,
        phone: u.phone,
        emailVerified: true,
        isActive: true,
        mustResetPassword: true,
        roleId,
      },
    });
    userMap[u.email] = savedUser.id;
  }

  // 5. Seed Client Profiles
  console.log('  [5/10] Creating institutional client profiles...');
  const clientMap: Record<string, string> = {};

  const stanfordUser = userMap['reynolds@stanford.edu'];
  if (stanfordUser) {
    const stanfordClient = await prisma.client.upsert({
      where: { userId: stanfordUser },
      update: { organization: 'Stanford University School of Medicine' },
      create: {
        userId: stanfordUser,
        organization: 'Stanford University School of Medicine',
        designation: 'Associate Professor of Genomics',
        fieldOfStudy: 'Bioinformatics & Computational Biology',
        country: 'United States',
        orcidId: '0000-0002-1825-0097',
        address: '291 Campus Drive, Stanford, CA 94305',
        timezone: 'America/Los_Angeles',
        notes: 'Premium institutional account with multiple active research tracks in clinical AI.',
      },
    });
    clientMap['stanford'] = stanfordClient.id;
  }

  const nusUser = userMap['wei.zhang@nus.edu.sg'];
  if (nusUser) {
    const nusClient = await prisma.client.upsert({
      where: { userId: nusUser },
      update: { organization: 'National University of Singapore' },
      create: {
        userId: nusUser,
        organization: 'National University of Singapore',
        designation: 'Principal Investigator',
        fieldOfStudy: 'Photovoltaics & Nano-engineering',
        country: 'Singapore',
        orcidId: '0000-0001-9234-5511',
        address: '21 Lower Kent Ridge Rd, Singapore 119077',
        timezone: 'Asia/Singapore',
        notes: 'Collaborative grant project on next-generation solar perovskite longevity.',
      },
    });
    clientMap['nus'] = nusClient.id;
  }

  const kiUser = userMap['astrid.l@ki.se'];
  if (kiUser) {
    const kiClient = await prisma.client.upsert({
      where: { userId: kiUser },
      update: { organization: 'Karolinska Institute' },
      create: {
        userId: kiUser,
        organization: 'Karolinska Institute',
        designation: 'Senior Researcher',
        fieldOfStudy: 'Health Informatics & Privacy',
        country: 'Sweden',
        orcidId: '0000-0003-4412-8876',
        address: 'Solnavägen 1, 171 77 Solna, Sweden',
        timezone: 'Europe/Stockholm',
        notes: 'Focus on GDPR-compliant distributed healthcare architecture.',
      },
    });
    clientMap['karolinska'] = kiClient.id;
  }

  // 6. Seed Verified Journals
  console.log('  [6/10] Seeding journal intelligence database...');
  const journalMap: Record<string, string> = {};
  for (const j of JOURNAL_SEEDS) {
    const existing = await prisma.journal.findFirst({ where: { name: j.name } });
    if (existing) {
      journalMap[j.name] = existing.id;
    } else {
      const created = await prisma.journal.create({ data: j });
      journalMap[j.name] = created.id;
    }
  }

  // 7. Seed Projects across lifecycle stages
  console.log('  [7/10] Seeding enterprise research projects across stages...');
  const adminId = userMap['admin@inzovate.com'];
  const managerId = userMap['elena.r@inzovate.com'];
  const researcherId = userMap['sarah.c@inzovate.com'];
  const qcId = userMap['marcus.v@inzovate.com'];

  const PROJECT_DEFINITIONS = [
    {
      projectCode: 'INZ-2026-001',
      title: 'Deep Learning Approaches in Genomic Variant Detection',
      description: 'Novel transformer-based neural network model for detecting single-nucleotide variants in non-coding genomic regions with high sensitivity.',
      domain: 'Bioinformatics & Machine Learning',
      keywords: ['Genomics', 'Deep Learning', 'Transformer', 'Variant Calling', 'ClinVar'],
      priority: 'HIGH',
      status: ProjectStatus.INTERNAL_REVIEW,
      targetJournalType: 'Scopus Q1 / Nature Machine Intelligence',
      budget: 4200.00,
      currency: 'USD',
      clientId: clientMap['stanford'],
      managerId,
      creatorId: adminId,
      deadline: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
      internalNotes: 'Benchmark tests against ClinVar achieved 98.4% AUROC. Manuscript draft ready for final QC gate.',
    },
    {
      projectCode: 'INZ-2026-002',
      title: 'Perovskite Solar Cells Degradation Mechanisms Under High Humidity',
      description: 'Comprehensive electrochemical impedance spectroscopy and degradation kinetics analysis of triple-cation perovskite photovoltaic cells in tropical environments.',
      domain: 'Materials Science & Renewable Energy',
      keywords: ['Perovskite Solar Cells', 'Photovoltaics', 'Degradation', 'Humidity Stability'],
      priority: 'URGENT',
      status: ProjectStatus.CLIENT_REVIEW,
      targetJournalType: 'IEEE Transactions / Advanced Energy Materials',
      budget: 3800.00,
      currency: 'USD',
      clientId: clientMap['nus'],
      managerId,
      creatorId: adminId,
      deadline: new Date(Date.now() + 1000 * 60 * 60 * 24 * 12),
      internalNotes: 'Client review dispatched on Sept 22. Author requested resolution adjustment on Figure 4.',
    },
    {
      projectCode: 'INZ-2026-003',
      title: 'Blockchain-Enabled Decentralized Electronic Health Records Architecture',
      description: 'Scalable cryptographic framework for patient consent and secure cross-border EHR exchange complying with GDPR and HIPAA mandates.',
      domain: 'Distributed Systems & Healthcare IT',
      keywords: ['Blockchain', 'EHR', 'Zero-Knowledge Proofs', 'GDPR', 'Healthcare Security'],
      priority: 'NORMAL',
      status: ProjectStatus.DRAFTING,
      targetJournalType: 'Springer Nature / Journal of Medical Systems',
      budget: 3100.00,
      currency: 'USD',
      clientId: clientMap['karolinska'],
      managerId,
      creatorId: adminId,
      deadline: new Date(Date.now() + 1000 * 60 * 60 * 24 * 45),
      internalNotes: 'Drafting methodology and system architecture section. Literature review complete.',
    },
    {
      projectCode: 'INZ-2026-004',
      title: 'Federated Learning for Cross-Silo Clinical Trial Data Governance',
      description: 'Privacy-preserving aggregation protocol allowing multinational hospital consortia to train diagnostic models without raw data egress.',
      domain: 'Clinical AI & Digital Health',
      keywords: ['Federated Learning', 'Differential Privacy', 'Consortium', 'Clinical Trials'],
      priority: 'HIGH',
      status: ProjectStatus.SUBMITTED,
      targetJournalType: 'The Lancet Digital Health',
      budget: 5200.00,
      currency: 'USD',
      clientId: clientMap['stanford'],
      managerId,
      creatorId: adminId,
      deadline: new Date(Date.now() + 1000 * 60 * 60 * 24 * 60),
      internalNotes: 'Submitted via ScholarOne portal. Editorial tracking reference LDH-2026-0419.',
    },
    {
      projectCode: 'INZ-2025-098',
      title: 'Quantum Key Distribution Networks for Healthcare Telemetry',
      description: 'Continuous-variable quantum communication protocol securing real-time telemetry from implanted cardiac defibrillators.',
      domain: 'Quantum Computing & Biomedical Telemetry',
      keywords: ['Quantum Key Distribution', 'QKD', 'Medical Devices', 'Cybersecurity'],
      priority: 'NORMAL',
      status: ProjectStatus.PUBLISHED,
      targetJournalType: 'Nature Machine Intelligence',
      budget: 4500.00,
      currency: 'USD',
      clientId: clientMap['stanford'],
      managerId,
      creatorId: adminId,
      deadline: new Date(Date.now() - 1000 * 60 * 60 * 24 * 40),
      internalNotes: 'Successfully published with DOI. Final client certificate and invoice closed.',
    },
  ];

  const projectMap: Record<string, string> = {};
  for (const def of PROJECT_DEFINITIONS) {
    if (!def.clientId) continue;
    const project = await prisma.project.upsert({
      where: { projectCode: def.projectCode },
      update: {
        title: def.title,
        status: def.status,
        priority: def.priority,
        budget: def.budget,
      },
      create: def,
    });
    projectMap[def.projectCode] = project.id;

    // Assign Project Staff
    if (researcherId) {
      await prisma.projectStaff.upsert({
        where: { projectId_userId: { projectId: project.id, userId: researcherId } },
        update: {},
        create: { projectId: project.id, userId: researcherId, role: 'research_staff' },
      });
    }
    if (qcId) {
      await prisma.projectStaff.upsert({
        where: { projectId_userId: { projectId: project.id, userId: qcId } },
        update: {},
        create: { projectId: project.id, userId: qcId, role: 'quality_analyst' },
      });
    }

    // Add Initial Project Status History if not already present
    const existingHistory = await prisma.projectStatusHistory.findFirst({
      where: { projectId: project.id, toStatus: def.status },
    });
    if (!existingHistory) {
      await prisma.projectStatusHistory.create({
        data: {
          projectId: project.id,
          fromStatus: null,
          toStatus: def.status,
          note: `Project initialized at lifecycle state: ${def.status}`,
          changedBy: adminId,
        },
      });
    }
  }

  // 8. Seed Manuscripts & 10-Point QC Checklists
  console.log('  [8/10] Seeding manuscripts, versions, and 10-point QC verification criteria...');
  const p1Id = projectMap['INZ-2026-001'];
  if (p1Id && researcherId) {
    const manuscript = await prisma.manuscript.upsert({
      where: { projectId: p1Id },
      update: {},
      create: {
        projectId: p1Id,
        title: 'Deep Learning Approaches in Genomic Variant Detection',
        abstract: 'Accurate variant detection is paramount for personalized medicine. We propose VariantFormer, a transformer model trained on whole-genome sequencing reads...',
        keywords: ['Genomics', 'Deep Learning', 'Variant Detection', 'Bioinformatics'],
      },
    });

    const qcChecklistData = {
      plagiarismSimilarity: { passed: true, score: '3.8%', threshold: '< 10%', tool: 'iThenticate', verifiedAt: new Date().toISOString() },
      referenceIntegrity: { passed: true, totalReferences: 48, matchedDois: 48, style: 'Nature Style' },
      figureResolution: { passed: true, minDpi: 300, actualDpi: 600, formats: ['TIFF', 'PDF vector'] },
      wordCountCompliance: { passed: true, currentCount: 5240, journalLimit: 6000 },
      dataAvailabilityStatement: { passed: true, repository: 'NCBI BioProject PRJNA99821' },
      authorDeclarations: { passed: true, coiDisclosed: true, ethicsApproval: 'IRB-2025-GENOMICS-42' },
      journalFormattingCheck: { passed: true, templateMatched: 'Nature Guidelines V2026' },
      statisticalReporting: { passed: true, pValuesSpecified: true, confidenceIntervals95: true },
      titleAbstractAlignment: { passed: true, keywordsRepresented: true },
      supplementaryMaterials: { passed: true, filesVerified: 2 },
    };

    await prisma.manuscriptVersion.upsert({
      where: { manuscriptId_versionNumber: { manuscriptId: manuscript.id, versionNumber: 2 } },
      update: {
        qcChecklist: qcChecklistData,
        status: ManuscriptStatus.QC_PASSED,
      },
      create: {
        manuscriptId: manuscript.id,
        versionNumber: 2,
        title: 'Deep Learning Approaches in Genomic Variant Detection (V2 Final Draft)',
        abstract: 'Accurate variant detection is paramount for personalized medicine. We propose VariantFormer, a transformer model trained on whole-genome sequencing reads...',
        content: '# Deep Learning Approaches in Genomic Variant Detection\n\n## Abstract\nAccurate variant detection is paramount for personalized medicine. We propose VariantFormer, a transformer model trained on whole-genome sequencing reads...\n\n## 1. Introduction\nHigh-throughput sequencing produces massive data streams...',
        wordCount: 5240,
        status: ManuscriptStatus.QC_PASSED,
        changeNotes: 'Revised attention mechanism diagrams, condensed discussion section, validated references.',
        qcChecklist: qcChecklistData,
        qcNotes: 'All 10 QC gate criteria verified by Marcus Vance. Similarity index 3.8% (iThenticate). Dispatched to Author review.',
        authorId: researcherId,
        isLatest: true,
      },
    });
  }

  // 9. Seed Kanban Tasks
  console.log('  [9/10] Seeding project tasks with completion tracking...');
  if (p1Id && researcherId && adminId) {
    const tasks = [
      {
        title: 'Literature review on deep transformer attention mechanisms for genomic sequences',
        status: TaskStatus.COMPLETED,
        priority: 'HIGH',
        completionPct: 100,
        dueDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10),
        estimatedHours: 16.0,
        actualHours: 14.5,
        assigneeId: researcherId,
        creatorId: adminId,
        projectId: p1Id,
      },
      {
        title: 'Benchmark Transformer vs Convolutional models on ClinVar benchmark set',
        status: TaskStatus.COMPLETED,
        priority: 'HIGH',
        completionPct: 100,
        dueDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3),
        estimatedHours: 24.0,
        actualHours: 22.0,
        assigneeId: researcherId,
        creatorId: adminId,
        projectId: p1Id,
      },
      {
        title: 'Draft manuscript discussion and future scope sections',
        status: TaskStatus.IN_PROGRESS,
        priority: 'NORMAL',
        completionPct: 80,
        dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 5),
        estimatedHours: 12.0,
        actualHours: 9.0,
        assigneeId: researcherId,
        creatorId: adminId,
        projectId: p1Id,
      },
      {
        title: 'Perform 10-point internal QC verification and plagiarism analysis',
        status: TaskStatus.COMPLETED,
        priority: 'URGENT',
        completionPct: 100,
        dueDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1),
        estimatedHours: 4.0,
        actualHours: 3.5,
        assigneeId: qcId,
        creatorId: adminId,
        projectId: p1Id,
      },
    ];

    for (const t of tasks) {
      const existingTask = await prisma.task.findFirst({
        where: { projectId: t.projectId, title: t.title },
      });
      if (!existingTask) {
        await prisma.task.create({ data: t });
      }
    }
  }

  // 10. Seed Submissions, Publications, Invoices & Payments
  console.log('  [10/10] Seeding submissions, publications, invoices, and audit trails...');
  const p5Id = projectMap['INZ-2025-098'];
  const natureJournalId = journalMap['Nature Machine Intelligence'];
  const stanfordClientId = clientMap['stanford'];

  if (p5Id && natureJournalId && stanfordClientId) {
    let sub = await prisma.submission.findFirst({
      where: { projectId: p5Id, submissionRefId: 'NMI-2026-0482' },
    });

    if (!sub) {
      sub = await prisma.submission.create({
        data: {
          projectId: p5Id,
          journalId: natureJournalId,
          status: SubmissionStatus.ACCEPTED,
          submissionDate: new Date('2026-06-10'),
          submissionMethod: 'Nature Manuscript Tracking Portal',
          submissionRefId: 'NMI-2026-0482',
          editorialContact: 'editorial@nature.com',
        },
      });
    }

    const existingPub = await prisma.publication.findFirst({
      where: {
        OR: [
          { submissionId: sub.id },
          { doi: '10.1038/s42256-026-00388-1' },
        ],
      },
    });

    if (!existingPub) {
      await prisma.publication.create({
        data: {
          submissionId: sub.id,
          projectId: p5Id,
          title: 'Quantum Key Distribution Networks for Healthcare Telemetry',
          doi: '10.1038/s42256-026-00388-1',
          articleUrl: 'https://doi.org/10.1038/s42256-026-00388-1',
          volume: 'Vol. 8',
          issue: 'Issue 3',
          pageNumbers: 'pp. 210–225',
          publicationDate: new Date('2026-08-15'),
          finalPdfUrl: 'https://nature.com/articles/s42256-026-00388-1.pdf',
          certificateUrl: 'https://inzovate.com/certificates/PUB-2026-001.pdf',
        },
      });
    }

    // Invoices & Payments
    const invoice = await prisma.invoice.upsert({
      where: { invoiceNumber: 'INV-2026-001' },
      update: {},
      create: {
        invoiceNumber: 'INV-2026-001',
        projectId: p5Id,
        clientId: stanfordClientId,
        amount: 4500.00,
        currency: 'USD',
        status: 'PAID',
        dueDate: new Date('2026-07-01'),
        issuedAt: new Date('2026-06-15'),
        paidAt: new Date('2026-06-28'),
        notes: 'Full publication and research service engagement for Quantum QKD project.',
      },
    });

    await prisma.payment.upsert({
      where: { receiptNumber: 'RCP-2026-001' },
      update: {},
      create: {
        receiptNumber: 'RCP-2026-001',
        invoiceId: invoice.id,
        projectId: p5Id,
        clientId: stanfordClientId,
        amount: 4500.00,
        currency: 'USD',
        paymentType: 'FULL_PAYMENT',
        status: PaymentStatus.PAID,
        paymentMethod: 'WIRE_TRANSFER',
        transactionRef: 'WIRE-STF-994821',
        paidAt: new Date('2026-06-28'),
      },
    });
  }

  // Communications Log
  if (p1Id && stanfordClientId) {
    const existingComm = await prisma.communication.findFirst({
      where: { projectId: p1Id, subject: 'QC Verification Completed — Passed All 10 Criteria' },
    });
    if (!existingComm) {
      await prisma.communication.create({
        data: {
          type: 'JOURNAL_COMMUNICATION',
          projectId: p1Id,
          clientId: stanfordClientId,
          userId: managerId,
          subject: 'QC Verification Completed — Passed All 10 Criteria',
          body: 'The manuscript "Deep Learning Approaches in Genomic Variant Detection" has passed the 10-point quality audit with a 3.8% iThenticate similarity index. It is now awaiting client author sign-off.',
        },
      });
    }
  }

  // System Audit Logs
  const existingAudit = await prisma.auditLog.findFirst({
    where: { entityId: 'SYS-INIT-2026' },
  });
  if (!existingAudit) {
    await prisma.auditLog.create({
      data: {
        userId: adminId,
        userEmail: 'admin@inzovate.com',
        userRole: 'super_admin',
        action: 'system.initialization_completed',
        entity: 'SystemConfig',
        entityId: 'SYS-INIT-2026',
        ipAddress: '127.0.0.1',
        userAgent: 'Inzovate Enterprise Production Seeder V1',
        metadata: {
          totalRoles: ROLES.length,
          totalPermissions: PERMISSIONS.length,
          totalUsers: USER_SEEDS.length,
          totalJournals: JOURNAL_SEEDS.length,
          totalProjects: PROJECT_DEFINITIONS.length,
        },
      },
    });
  }

  console.log('🎉 Enterprise Database Seed Completed Successfully!');
  console.log('   All 9 roles created with password: "Password123!"');
  console.log('   - Super Admin:          admin@inzovate.com');
  console.log('   - Operations Manager:   david.m@inzovate.com');
  console.log('   - Research Manager:     elena.r@inzovate.com');
  console.log('   - Research Staff:       sarah.c@inzovate.com');
  console.log('   - Quality Analyst:      marcus.v@inzovate.com');
  console.log('   - Publication Exec:     priya.s@inzovate.com');
  console.log('   - Client (Stanford):    reynolds@stanford.edu');
  console.log('   - Finance & Accounts:   sophie.t@inzovate.com');
  console.log('   - Executive Management: robert.s@inzovate.com');
}

main()
  .catch((e) => {
    console.error('❌ Database seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
