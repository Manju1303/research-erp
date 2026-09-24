import { ManuscriptStatus } from '../enums/manuscript-status.enum';
import { UserRole } from '../enums/user-role.enum';
import { StatusTransition } from './project.state-machine';

export const MANUSCRIPT_TRANSITIONS: StatusTransition<ManuscriptStatus>[] = [
  {
    from: ManuscriptStatus.DRAFT,
    to: ManuscriptStatus.QC_PENDING,
    allowedRoles: [UserRole.SUPER_ADMIN, UserRole.RESEARCH_MANAGER, UserRole.RESEARCH_STAFF],
  },
  {
    from: ManuscriptStatus.QC_PENDING,
    to: ManuscriptStatus.QC_PASSED,
    allowedRoles: [UserRole.SUPER_ADMIN, UserRole.QUALITY_ANALYST],
  },
  {
    from: ManuscriptStatus.QC_PENDING,
    to: ManuscriptStatus.QC_FAILED,
    allowedRoles: [UserRole.SUPER_ADMIN, UserRole.QUALITY_ANALYST],
    requiresNote: true,
  },
  {
    from: ManuscriptStatus.QC_FAILED,
    to: ManuscriptStatus.DRAFT,
    allowedRoles: [UserRole.SUPER_ADMIN, UserRole.RESEARCH_MANAGER, UserRole.RESEARCH_STAFF],
  },
  {
    from: ManuscriptStatus.QC_PASSED,
    to: ManuscriptStatus.CLIENT_SENT,
    allowedRoles: [UserRole.SUPER_ADMIN, UserRole.RESEARCH_MANAGER, UserRole.OPERATIONS_MANAGER],
  },
  {
    from: ManuscriptStatus.CLIENT_SENT,
    to: ManuscriptStatus.CLIENT_APPROVED,
    allowedRoles: [UserRole.SUPER_ADMIN, UserRole.CLIENT, UserRole.OPERATIONS_MANAGER],
  },
  {
    from: ManuscriptStatus.CLIENT_SENT,
    to: ManuscriptStatus.CLIENT_REVISION_REQUESTED,
    allowedRoles: [UserRole.SUPER_ADMIN, UserRole.CLIENT, UserRole.OPERATIONS_MANAGER],
    requiresNote: true,
  },
  {
    from: ManuscriptStatus.CLIENT_REVISION_REQUESTED,
    to: ManuscriptStatus.DRAFT,
    allowedRoles: [UserRole.SUPER_ADMIN, UserRole.RESEARCH_MANAGER, UserRole.RESEARCH_STAFF],
  },
  {
    from: ManuscriptStatus.CLIENT_APPROVED,
    to: ManuscriptStatus.SUBMISSION_READY,
    allowedRoles: [UserRole.SUPER_ADMIN, UserRole.PUBLICATION_EXECUTIVE, UserRole.RESEARCH_MANAGER],
  },
];

export function isValidManuscriptTransition(
  from: ManuscriptStatus,
  to: ManuscriptStatus,
  role: UserRole,
): boolean {
  return MANUSCRIPT_TRANSITIONS.some(
    (t) => t.from === from && t.to === to && t.allowedRoles.includes(role),
  );
}
