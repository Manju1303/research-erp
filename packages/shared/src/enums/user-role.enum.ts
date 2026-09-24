/**
 * Canonical role slugs — stored in DB, never as integers.
 * These are seeded once; new custom roles can be added via admin UI.
 */
export enum UserRole {
  SUPER_ADMIN = 'super_admin',
  OPERATIONS_MANAGER = 'operations_manager',
  RESEARCH_MANAGER = 'research_manager',
  RESEARCH_STAFF = 'research_staff',
  QUALITY_ANALYST = 'quality_analyst',
  PUBLICATION_EXECUTIVE = 'publication_executive',
  CLIENT = 'client',
  FINANCE = 'finance',
  MANAGEMENT = 'management',
}
