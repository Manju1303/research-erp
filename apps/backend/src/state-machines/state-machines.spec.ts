import {
  ProjectStatus,
  UserRole,
  ManuscriptStatus,
  TaskStatus,
  isValidProjectTransition,
  getAllowedTransitions,
  isValidManuscriptTransition,
  isValidTaskTransition,
} from '@inzovate/shared';

describe('State Machines QA & Boundary Testing', () => {
  describe('Project State Machine', () => {
    it('allows valid forward transitions by authorized roles', () => {
      expect(
        isValidProjectTransition(
          ProjectStatus.REQUIREMENT_SUBMITTED,
          ProjectStatus.REQUIREMENT_ANALYSIS,
          UserRole.OPERATIONS_MANAGER,
        ),
      ).toBe(true);

      expect(
        isValidProjectTransition(
          ProjectStatus.DRAFTING,
          ProjectStatus.INTERNAL_QC,
          UserRole.RESEARCH_STAFF,
        ),
      ).toBe(true);

      expect(
        isValidProjectTransition(
          ProjectStatus.INTERNAL_QC,
          ProjectStatus.CLIENT_REVIEW,
          UserRole.QUALITY_ANALYST,
        ),
      ).toBe(true);
    });

    it('rejects unauthorized roles from triggering transitions', () => {
      // Client cannot transition project from DRAFTING to INTERNAL_QC
      expect(
        isValidProjectTransition(
          ProjectStatus.DRAFTING,
          ProjectStatus.INTERNAL_QC,
          UserRole.CLIENT,
        ),
      ).toBe(false);

      // Research staff cannot approve QC (only Quality Analyst or Super Admin)
      expect(
        isValidProjectTransition(
          ProjectStatus.INTERNAL_QC,
          ProjectStatus.CLIENT_REVIEW,
          UserRole.RESEARCH_STAFF,
        ),
      ).toBe(false);
    });

    it('rejects illegal status skipping (e.g. REQUIREMENT_SUBMITTED -> PUBLISHED)', () => {
      expect(
        isValidProjectTransition(
          ProjectStatus.REQUIREMENT_SUBMITTED,
          ProjectStatus.PUBLISHED,
          UserRole.SUPER_ADMIN,
        ),
      ).toBe(false);

      expect(
        isValidProjectTransition(
          ProjectStatus.DRAFTING,
          ProjectStatus.PUBLISHED,
          UserRole.SUPER_ADMIN,
        ),
      ).toBe(false);
    });

    it('supports QC failure transition back to DRAFTING with note requirement', () => {
      expect(
        isValidProjectTransition(
          ProjectStatus.INTERNAL_QC,
          ProjectStatus.DRAFTING,
          UserRole.QUALITY_ANALYST,
        ),
      ).toBe(true);
    });

    it('allows authorized hold and cancel transitions from active states', () => {
      expect(
        isValidProjectTransition(
          ProjectStatus.RESEARCH_IN_PROGRESS,
          ProjectStatus.ON_HOLD,
          UserRole.OPERATIONS_MANAGER,
        ),
      ).toBe(true);

      expect(
        isValidProjectTransition(
          ProjectStatus.RESEARCH_IN_PROGRESS,
          ProjectStatus.CANCELLED,
          UserRole.SUPER_ADMIN,
        ),
      ).toBe(true);
    });

    it('returns correct allowed next statuses list', () => {
      const allowed = getAllowedTransitions(
        ProjectStatus.REQUIREMENT_SUBMITTED,
        UserRole.OPERATIONS_MANAGER,
      );
      expect(allowed).toContain(ProjectStatus.REQUIREMENT_ANALYSIS);
      expect(allowed).toContain(ProjectStatus.ON_HOLD);
      expect(allowed).toContain(ProjectStatus.CANCELLED);
      expect(allowed).not.toContain(ProjectStatus.PUBLISHED);
    });
  });

  describe('Manuscript State Machine', () => {
    it('allows valid manuscript progression: DRAFT -> QC_PENDING -> QC_PASSED', () => {
      expect(
        isValidManuscriptTransition(
          ManuscriptStatus.DRAFT,
          ManuscriptStatus.QC_PENDING,
          UserRole.RESEARCH_STAFF,
        ),
      ).toBe(true);

      expect(
        isValidManuscriptTransition(
          ManuscriptStatus.QC_PENDING,
          ManuscriptStatus.QC_PASSED,
          UserRole.QUALITY_ANALYST,
        ),
      ).toBe(true);
    });

    it('handles QC failure transition to QC_FAILED', () => {
      expect(
        isValidManuscriptTransition(
          ManuscriptStatus.QC_PENDING,
          ManuscriptStatus.QC_FAILED,
          UserRole.QUALITY_ANALYST,
        ),
      ).toBe(true);
    });

    it('locks approved manuscript against rogue editing', () => {
      expect(
        isValidManuscriptTransition(
          ManuscriptStatus.CLIENT_APPROVED,
          ManuscriptStatus.DRAFT,
          UserRole.CLIENT,
        ),
      ).toBe(false);
    });
  });

  describe('Task State Machine', () => {
    it('allows standard Kanban transitions: TODO -> IN_PROGRESS -> UNDER_REVIEW -> COMPLETED', () => {
      expect(
        isValidTaskTransition(
          TaskStatus.TODO,
          TaskStatus.IN_PROGRESS,
          UserRole.RESEARCH_STAFF,
        ),
      ).toBe(true);

      expect(
        isValidTaskTransition(
          TaskStatus.IN_PROGRESS,
          TaskStatus.UNDER_REVIEW,
          UserRole.RESEARCH_STAFF,
        ),
      ).toBe(true);

      expect(
        isValidTaskTransition(
          TaskStatus.UNDER_REVIEW,
          TaskStatus.COMPLETED,
          UserRole.RESEARCH_MANAGER,
        ),
      ).toBe(true);
    });
  });
});
