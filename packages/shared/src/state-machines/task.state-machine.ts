import { TaskStatus } from '../enums/task-status.enum';
import { UserRole } from '../enums/user-role.enum';
import { StatusTransition } from './project.state-machine';

export const TASK_TRANSITIONS: StatusTransition<TaskStatus>[] = [
  {
    from: TaskStatus.TODO,
    to: TaskStatus.IN_PROGRESS,
    allowedRoles: [
      UserRole.SUPER_ADMIN,
      UserRole.RESEARCH_MANAGER,
      UserRole.RESEARCH_STAFF,
      UserRole.QUALITY_ANALYST,
      UserRole.PUBLICATION_EXECUTIVE,
    ],
  },
  {
    from: TaskStatus.IN_PROGRESS,
    to: TaskStatus.UNDER_REVIEW,
    allowedRoles: [
      UserRole.SUPER_ADMIN,
      UserRole.RESEARCH_MANAGER,
      UserRole.RESEARCH_STAFF,
      UserRole.QUALITY_ANALYST,
    ],
  },
  {
    from: TaskStatus.IN_PROGRESS,
    to: TaskStatus.BLOCKED,
    allowedRoles: [
      UserRole.SUPER_ADMIN,
      UserRole.RESEARCH_MANAGER,
      UserRole.RESEARCH_STAFF,
    ],
    requiresNote: true,
  },
  {
    from: TaskStatus.UNDER_REVIEW,
    to: TaskStatus.COMPLETED,
    allowedRoles: [
      UserRole.SUPER_ADMIN,
      UserRole.RESEARCH_MANAGER,
      UserRole.OPERATIONS_MANAGER,
    ],
  },
  {
    from: TaskStatus.UNDER_REVIEW,
    to: TaskStatus.IN_PROGRESS, // review failed
    allowedRoles: [
      UserRole.SUPER_ADMIN,
      UserRole.RESEARCH_MANAGER,
    ],
    requiresNote: true,
  },
  {
    from: TaskStatus.BLOCKED,
    to: TaskStatus.IN_PROGRESS,
    allowedRoles: [
      UserRole.SUPER_ADMIN,
      UserRole.RESEARCH_MANAGER,
      UserRole.OPERATIONS_MANAGER,
    ],
  },
];

export function isValidTaskTransition(
  from: TaskStatus,
  to: TaskStatus,
  role: UserRole,
): boolean {
  return TASK_TRANSITIONS.some(
    (t) => t.from === from && t.to === to && t.allowedRoles.includes(role),
  );
}
