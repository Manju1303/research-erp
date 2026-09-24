import { ProjectStatus } from '../enums/project-status.enum';
import { UserRole } from '../enums/user-role.enum';

/**
 * State machine definition for Project status transitions.
 * Each entry maps a current status to the statuses it can transition to,
 * along with which roles can trigger that transition.
 *
 * This config is the single source of truth. The backend validates every
 * transition attempt against this before persisting to the DB.
 */
export interface StatusTransition<T extends string> {
  from: T;
  to: T;
  allowedRoles: UserRole[];
  requiresNote?: boolean; // if true, the request body must include a transition note
}

export const PROJECT_TRANSITIONS: StatusTransition<ProjectStatus>[] = [
  {
    from: ProjectStatus.REQUIREMENT_SUBMITTED,
    to: ProjectStatus.REQUIREMENT_ANALYSIS,
    allowedRoles: [UserRole.SUPER_ADMIN, UserRole.OPERATIONS_MANAGER, UserRole.RESEARCH_MANAGER],
  },
  {
    from: ProjectStatus.REQUIREMENT_ANALYSIS,
    to: ProjectStatus.TOPIC_FINALIZED,
    allowedRoles: [UserRole.SUPER_ADMIN, UserRole.OPERATIONS_MANAGER, UserRole.RESEARCH_MANAGER],
  },
  {
    from: ProjectStatus.TOPIC_FINALIZED,
    to: ProjectStatus.RESEARCH_IN_PROGRESS,
    allowedRoles: [UserRole.SUPER_ADMIN, UserRole.RESEARCH_MANAGER],
  },
  {
    from: ProjectStatus.RESEARCH_IN_PROGRESS,
    to: ProjectStatus.DRAFTING,
    allowedRoles: [UserRole.SUPER_ADMIN, UserRole.RESEARCH_MANAGER, UserRole.RESEARCH_STAFF],
  },
  {
    from: ProjectStatus.DRAFTING,
    to: ProjectStatus.INTERNAL_QC,
    allowedRoles: [UserRole.SUPER_ADMIN, UserRole.RESEARCH_MANAGER, UserRole.RESEARCH_STAFF],
  },
  {
    from: ProjectStatus.INTERNAL_QC,
    to: ProjectStatus.CLIENT_REVIEW,
    allowedRoles: [UserRole.SUPER_ADMIN, UserRole.QUALITY_ANALYST, UserRole.RESEARCH_MANAGER],
  },
  {
    from: ProjectStatus.INTERNAL_QC,
    to: ProjectStatus.DRAFTING, // QC failed → back to drafting
    allowedRoles: [UserRole.SUPER_ADMIN, UserRole.QUALITY_ANALYST],
    requiresNote: true,
  },
  {
    from: ProjectStatus.CLIENT_REVIEW,
    to: ProjectStatus.CLIENT_APPROVED,
    allowedRoles: [UserRole.SUPER_ADMIN, UserRole.CLIENT, UserRole.OPERATIONS_MANAGER],
  },
  {
    from: ProjectStatus.CLIENT_REVIEW,
    to: ProjectStatus.DRAFTING, // Client requests revision
    allowedRoles: [UserRole.SUPER_ADMIN, UserRole.CLIENT, UserRole.OPERATIONS_MANAGER],
    requiresNote: true,
  },
  // Phase 2 transitions (present for reference; guarded by feature flag server-side)
  {
    from: ProjectStatus.CLIENT_APPROVED,
    to: ProjectStatus.JOURNAL_MATCHING,
    allowedRoles: [UserRole.SUPER_ADMIN, UserRole.PUBLICATION_EXECUTIVE, UserRole.OPERATIONS_MANAGER],
  },
  // Universal transitions (any non-terminal status → ON_HOLD or CANCELLED)
  ...(
    [
      ProjectStatus.REQUIREMENT_SUBMITTED,
      ProjectStatus.REQUIREMENT_ANALYSIS,
      ProjectStatus.TOPIC_FINALIZED,
      ProjectStatus.RESEARCH_IN_PROGRESS,
      ProjectStatus.DRAFTING,
      ProjectStatus.INTERNAL_QC,
      ProjectStatus.CLIENT_REVIEW,
    ] as ProjectStatus[]
  ).flatMap((from) => [
    {
      from,
      to: ProjectStatus.ON_HOLD,
      allowedRoles: [UserRole.SUPER_ADMIN, UserRole.OPERATIONS_MANAGER],
      requiresNote: true,
    } as StatusTransition<ProjectStatus>,
    {
      from,
      to: ProjectStatus.CANCELLED,
      allowedRoles: [UserRole.SUPER_ADMIN, UserRole.OPERATIONS_MANAGER],
      requiresNote: true,
    } as StatusTransition<ProjectStatus>,
  ]),
  // Resume from ON_HOLD
  {
    from: ProjectStatus.ON_HOLD,
    to: ProjectStatus.RESEARCH_IN_PROGRESS,
    allowedRoles: [UserRole.SUPER_ADMIN, UserRole.OPERATIONS_MANAGER],
  },
];

/**
 * Lookup helper: returns allowed next statuses for a given current status + role.
 */
export function getAllowedTransitions(
  currentStatus: ProjectStatus,
  role: UserRole,
): ProjectStatus[] {
  return PROJECT_TRANSITIONS.filter(
    (t) => t.from === currentStatus && t.allowedRoles.includes(role),
  ).map((t) => t.to);
}

/**
 * Validates whether a specific transition is permitted.
 */
export function isValidProjectTransition(
  from: ProjectStatus,
  to: ProjectStatus,
  role: UserRole,
): boolean {
  return PROJECT_TRANSITIONS.some(
    (t) => t.from === from && t.to === to && t.allowedRoles.includes(role),
  );
}
