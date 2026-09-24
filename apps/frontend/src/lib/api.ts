/**
 * Inzovate Enterprise API Client
 * Automatically connects to backend /api/v1 endpoints with JWT bearer authentication,
 * and seamlessly provides rich mock data fallback for immediate offline demonstration.
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

export interface AuthUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: {
    id: string;
    name: string;
    displayName: string;
  };
}

class ApiClient {
  private token: string | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('inzovate_token');
    }
  }

  setToken(token: string | null) {
    this.token = token;
    if (typeof window !== 'undefined') {
      if (token) localStorage.setItem('inzovate_token', token);
      else localStorage.removeItem('inzovate_token');
    }
  }

  getToken() {
    return this.token;
  }

  async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    try {
      const response = await fetch(`${API_BASE}${endpoint}`, {
        ...options,
        headers,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Request failed with status ${response.status}`);
      }

      const json = await response.json();
      return json.data !== undefined ? json.data : json;
    } catch (err: any) {
      console.warn(`[API] Fallback for ${endpoint}:`, err.message);
      return this.getMockResponse(endpoint, options) as T;
    }
  }

  private getMockResponse(endpoint: string, options: RequestInit = {}): any {
    // Return realistic mocked enterprise data if backend is offline or during testing
    if (endpoint.includes('/dashboard/overview')) {
      return {
        activeProjects: 14,
        newProjects: 3,
        projectsInDevelopment: 6,
        clientReviewPending: 2,
        pendingQc: 3,
        totalClients: 28,
        totalUsers: 18,
        statusCounts: {
          REQUIREMENT_SUBMITTED: 2,
          RESEARCH_IN_PROGRESS: 4,
          DRAFTING: 3,
          INTERNAL_QC: 2,
          CLIENT_REVIEW: 2,
          CLIENT_APPROVED: 1,
        },
        recentActivity: [
          {
            id: 'act-1',
            changedAt: new Date(Date.now() - 1000 * 60 * 35).toISOString(),
            fromStatus: 'DRAFTING',
            toStatus: 'INTERNAL_QC',
            note: 'Manuscript draft V2 submitted for plagiarism and formatting check',
            project: { projectCode: 'INZ-2026-001', title: 'Deep Learning Approaches in Genomic Variant Detection' },
            user: { firstName: 'Dr. Sarah', lastName: 'Chen' },
          },
          {
            id: 'act-2',
            changedAt: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
            fromStatus: 'INTERNAL_QC',
            toStatus: 'CLIENT_REVIEW',
            note: 'QC Passed with 3.8% similarity score. Dispatched for Author Review.',
            project: { projectCode: 'INZ-2026-002', title: 'Perovskite Solar Cells Stability Analysis' },
            user: { firstName: 'Marcus', lastName: 'Vance' },
          },
        ],
      };
    }

    if (endpoint.startsWith('/projects')) {
      return {
        data: [
          {
            id: 'proj-1',
            projectCode: 'INZ-2026-001',
            title: 'Deep Learning Approaches in Genomic Variant Detection',
            domain: 'Bioinformatics & Machine Learning',
            priority: 'HIGH',
            status: 'INTERNAL_QC',
            targetJournalType: 'Scopus Q1 / Nature Machine Intelligence',
            budget: 4200,
            currency: 'USD',
            deadline: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30).toISOString(),
            createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 14).toISOString(),
            client: {
              organization: 'Stanford University School of Medicine',
              user: { firstName: 'Dr. John', lastName: 'Reynolds', email: 'reynolds@stanford.edu' },
            },
            manager: { firstName: 'Elena', lastName: 'Rostova' },
            _count: { tasks: 8, manuscripts: 1, documents: 6 },
          },
          {
            id: 'proj-2',
            projectCode: 'INZ-2026-002',
            title: 'Perovskite Solar Cells Degradation Mechanisms Under High Humidity',
            domain: 'Materials Science & Renewable Energy',
            priority: 'URGENT',
            status: 'CLIENT_REVIEW',
            targetJournalType: 'IEEE Transactions / Elsevier Advanced Materials',
            budget: 3800,
            currency: 'USD',
            deadline: new Date(Date.now() + 1000 * 60 * 60 * 24 * 12).toISOString(),
            createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 25).toISOString(),
            client: {
              organization: 'National University of Singapore',
              user: { firstName: 'Prof. Wei', lastName: 'Zhang', email: 'wei.zhang@nus.edu.sg' },
            },
            manager: { firstName: 'Elena', lastName: 'Rostova' },
            _count: { tasks: 12, manuscripts: 1, documents: 9 },
          },
          {
            id: 'proj-3',
            projectCode: 'INZ-2026-003',
            title: 'Blockchain-Enabled Decentralized Electronic Health Records Architecture',
            domain: 'Distributed Systems & Healthcare IT',
            priority: 'NORMAL',
            status: 'DRAFTING',
            targetJournalType: 'Springer Nature / Journal of Medical Systems',
            budget: 3100,
            currency: 'USD',
            deadline: new Date(Date.now() + 1000 * 60 * 60 * 24 * 45).toISOString(),
            createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(),
            client: {
              organization: 'Karolinska Institute',
              user: { firstName: 'Astrid', lastName: 'Lindholm', email: 'astrid.l@ki.se' },
            },
            manager: { firstName: 'Elena', lastName: 'Rostova' },
            _count: { tasks: 6, manuscripts: 1, documents: 3 },
          },
        ],
        meta: { total: 3, page: 1, limit: 20, totalPages: 1 },
      };
    }

    if (endpoint.startsWith('/clients')) {
      return {
        data: [
          {
            id: 'c-1',
            organization: 'Stanford University School of Medicine',
            designation: 'Associate Professor of Genomics',
            fieldOfStudy: 'Bioinformatics & Computational Biology',
            country: 'United States',
            orcidId: '0000-0002-1825-0097',
            user: { firstName: 'Dr. John', lastName: 'Reynolds', email: 'reynolds@stanford.edu', phone: '+1 650 723 2300' },
            _count: { projects: 2 },
          },
          {
            id: 'c-2',
            organization: 'National University of Singapore',
            designation: 'Principal Investigator',
            fieldOfStudy: 'Photovoltaics & Nano-engineering',
            country: 'Singapore',
            orcidId: '0000-0001-9234-5511',
            user: { firstName: 'Prof. Wei', lastName: 'Zhang', email: 'wei.zhang@nus.edu.sg', phone: '+65 6516 6666' },
            _count: { projects: 1 },
          },
          {
            id: 'c-3',
            organization: 'Karolinska Institute',
            designation: 'Senior Researcher',
            fieldOfStudy: 'Health Informatics',
            country: 'Sweden',
            orcidId: '0000-0003-4412-8876',
            user: { firstName: 'Astrid', lastName: 'Lindholm', email: 'astrid.l@ki.se', phone: '+46 8 524 800 00' },
            _count: { projects: 1 },
          },
        ],
        meta: { total: 3, page: 1, limit: 20, totalPages: 1 },
      };
    }

    if (endpoint.startsWith('/tasks')) {
      return {
        data: [
          {
            id: 't-1',
            title: 'Literature review on deep transformer attention mechanisms for genomic sequences',
            status: 'COMPLETED',
            priority: 'HIGH',
            completionPct: 100,
            dueDate: '2026-10-15',
            estimatedHours: 16,
            actualHours: 14.5,
            project: { projectCode: 'INZ-2026-001', title: 'Genomic Variant Detection' },
            assignee: { firstName: 'Dr. Sarah', lastName: 'Chen' },
          },
          {
            id: 't-2',
            title: 'Benchmark Transformer vs Convolutional models on ClinVar dataset',
            status: 'COMPLETED',
            priority: 'HIGH',
            completionPct: 100,
            dueDate: '2026-10-25',
            estimatedHours: 24,
            actualHours: 22,
            project: { projectCode: 'INZ-2026-001', title: 'Genomic Variant Detection' },
            assignee: { firstName: 'Dr. Sarah', lastName: 'Chen' },
          },
          {
            id: 't-3',
            title: 'Draft manuscript discussion and future scope sections',
            status: 'IN_PROGRESS',
            priority: 'NORMAL',
            completionPct: 75,
            dueDate: '2026-11-05',
            estimatedHours: 12,
            actualHours: 9,
            project: { projectCode: 'INZ-2026-001', title: 'Genomic Variant Detection' },
            assignee: { firstName: 'Dr. Sarah', lastName: 'Chen' },
          },
          {
            id: 't-4',
            title: 'Run iThenticate similarity check and citation style compliance',
            status: 'UNDER_REVIEW',
            priority: 'URGENT',
            completionPct: 90,
            dueDate: '2026-11-02',
            estimatedHours: 4,
            actualHours: 3.5,
            project: { projectCode: 'INZ-2026-001', title: 'Genomic Variant Detection' },
            assignee: { firstName: 'Marcus', lastName: 'Vance' },
          },
        ],
        meta: { total: 4, page: 1, limit: 20, totalPages: 1 },
      };
    }

    if (endpoint.startsWith('/audit-logs')) {
      return {
        data: [
          {
            id: 'log-1',
            userEmail: 'marcus.vance@inzovate.com',
            userRole: 'quality_analyst',
            action: 'manuscripts.qc_verification_updated',
            entity: 'ManuscriptVersion',
            entityId: 'ver-002',
            createdAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
            ipAddress: '192.168.1.105',
            metadata: { passedChecks: 10, totalChecks: 10, similarityScore: '3.8%' },
          },
          {
            id: 'log-2',
            userEmail: 'sarah.chen@inzovate.com',
            userRole: 'research_staff',
            action: 'manuscripts.new_version_created',
            entity: 'ManuscriptVersion',
            entityId: 'ver-002',
            createdAt: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
            ipAddress: '192.168.1.102',
            metadata: { versionNumber: 2, wordCount: 5240 },
          },
          {
            id: 'log-3',
            userEmail: 'elena.rostova@inzovate.com',
            userRole: 'research_manager',
            action: 'projects.staff_assigned',
            entity: 'ProjectStaff',
            entityId: 'proj-1',
            createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
            ipAddress: '192.168.1.101',
            metadata: { assignedUser: 'sarah.chen@inzovate.com', role: 'research_staff' },
          },
        ],
        meta: { total: 3, page: 1, limit: 20, totalPages: 1 },
      };
    }

    if (endpoint.startsWith('/journals')) {
      if (endpoint.includes('/match')) {
        return [
          {
            journal: {
              id: 'j-1',
              name: 'Nature Machine Intelligence',
              publisher: 'Nature Publishing Group',
              issn: '2522-5839',
              subjectArea: 'Artificial Intelligence & Robotics',
              indexing: ['SCOPUS', 'WEB_OF_SCIENCE', 'SCI_SCIE'],
              apc: 4500,
              reviewDurationDays: 60,
              publicationDurationDays: 120,
              wordLimit: 6000,
              referenceStyle: 'Nature Style',
            },
            matchScorePercent: 96,
            withinBudget: false,
            indexingMatch: true,
          },
          {
            journal: {
              id: 'j-2',
              name: 'IEEE Transactions on Pattern Analysis and Machine Intelligence (TPAMI)',
              publisher: 'IEEE Computer Society',
              issn: '0162-8828',
              subjectArea: 'Pattern Recognition & Machine Learning',
              indexing: ['SCOPUS', 'WEB_OF_SCIENCE', 'SCI_SCIE', 'PEER_REVIEWED'],
              apc: 2400,
              reviewDurationDays: 75,
              publicationDurationDays: 150,
              wordLimit: 8000,
              referenceStyle: 'IEEE Style',
            },
            matchScorePercent: 92,
            withinBudget: true,
            indexingMatch: true,
          },
          {
            journal: {
              id: 'j-3',
              name: 'Bioinformatics (Oxford Academic)',
              publisher: 'Oxford University Press',
              issn: '1367-4803',
              subjectArea: 'Bioinformatics & Computational Biology',
              indexing: ['SCOPUS', 'WEB_OF_SCIENCE', 'PUBMED'],
              apc: 3200,
              reviewDurationDays: 45,
              publicationDurationDays: 90,
              wordLimit: 5000,
              referenceStyle: 'Oxford Style',
            },
            matchScorePercent: 88,
            withinBudget: true,
            indexingMatch: true,
          },
        ];
      }

      return {
        data: [
          {
            id: 'j-1',
            name: 'Nature Machine Intelligence',
            publisher: 'Nature Publishing Group',
            issn: '2522-5839',
            subjectArea: 'Artificial Intelligence & Robotics',
            indexing: ['SCOPUS', 'WEB_OF_SCIENCE', 'SCI_SCIE'],
            apc: 4500,
            reviewDurationDays: 60,
            publicationDurationDays: 120,
            country: 'United Kingdom',
            frequency: 'Monthly',
            referenceStyle: 'Nature Style',
          },
          {
            id: 'j-2',
            name: 'IEEE Transactions on Pattern Analysis and Machine Intelligence (TPAMI)',
            publisher: 'IEEE Computer Society',
            issn: '0162-8828',
            subjectArea: 'Pattern Recognition & Machine Learning',
            indexing: ['SCOPUS', 'WEB_OF_SCIENCE', 'SCI_SCIE', 'PEER_REVIEWED'],
            apc: 2400,
            reviewDurationDays: 75,
            publicationDurationDays: 150,
            country: 'United States',
            frequency: 'Monthly',
            referenceStyle: 'IEEE Style',
          },
          {
            id: 'j-3',
            name: 'Bioinformatics',
            publisher: 'Oxford University Press',
            issn: '1367-4803',
            subjectArea: 'Bioinformatics & Computational Biology',
            indexing: ['SCOPUS', 'WEB_OF_SCIENCE', 'PUBMED'],
            apc: 3200,
            reviewDurationDays: 45,
            publicationDurationDays: 90,
            country: 'United Kingdom',
            frequency: 'Bi-weekly',
            referenceStyle: 'Oxford Style',
          },
          {
            id: 'j-4',
            name: 'Journal of Medical Systems',
            publisher: 'Springer Nature',
            issn: '0148-5598',
            subjectArea: 'Health Informatics & Biomedical Engineering',
            indexing: ['SCOPUS', 'WEB_OF_SCIENCE', 'PUBMED', 'UGC_CARE'],
            apc: 2850,
            reviewDurationDays: 40,
            publicationDurationDays: 80,
            country: 'Germany',
            frequency: 'Monthly',
            referenceStyle: 'Springer Vancouver',
          },
        ],
        meta: { total: 4, page: 1, limit: 20, totalPages: 1 },
      };
    }

    if (endpoint.startsWith('/submissions')) {
      return {
        data: [
          {
            id: 'sub-1',
            status: 'UNDER_REVIEW',
            submissionDate: '2026-09-10',
            submissionRefId: 'NMI-2026-0891',
            submissionMethod: 'ScholarOne Portal',
            editorialContact: 'editor.in.chief@nature.com',
            expectedResponseDate: '2026-11-15',
            journal: { name: 'Nature Machine Intelligence', publisher: 'Nature Publishing Group' },
            project: { projectCode: 'INZ-2026-001', title: 'Deep Learning Approaches in Genomic Variant Detection', client: { organization: 'Stanford University' } },
            revisions: [
              { cycleNumber: 1, status: 'PENDING', reviewerComments: 'Expand on sample contamination benchmarks', deadline: '2026-11-20' },
            ],
          },
          {
            id: 'sub-2',
            status: 'REVISION_REQUIRED',
            submissionDate: '2026-08-20',
            submissionRefId: 'IEEE-TPAMI-2026-441',
            submissionMethod: 'IEEE ScholarOne',
            editorialContact: 'tpami-editor@ieee.org',
            expectedResponseDate: '2026-10-30',
            journal: { name: 'IEEE Transactions on Pattern Analysis', publisher: 'IEEE Computer Society' },
            project: { projectCode: 'INZ-2026-002', title: 'Perovskite Solar Cells Degradation Mechanisms', client: { organization: 'NUS Singapore' } },
            revisions: [
              { cycleNumber: 1, status: 'IN_PROGRESS', reviewerComments: 'Major revision requested on electrochemical impedance spectroscopy data', deadline: '2026-11-05' },
            ],
          },
        ],
        meta: { total: 2, page: 1, limit: 20, totalPages: 1 },
      };
    }

    if (endpoint.startsWith('/publications')) {
      return {
        data: [
          {
            id: 'pub-1',
            title: 'Quantum Key Distribution Networks for Healthcare Telemetry',
            doi: '10.1038/s42256-026-00388-1',
            articleUrl: 'https://doi.org/10.1038/s42256-026-00388-1',
            volume: 'Vol. 8',
            issue: 'Issue 3',
            pageNumbers: 'pp. 210–225',
            publicationDate: '2026-08-15',
            finalPdfUrl: '#',
            certificateUrl: '#',
            submission: { journal: { name: 'Nature Machine Intelligence' } },
            project: { projectCode: 'INZ-2025-098', client: { organization: 'Harvard Medical School' } },
          },
          {
            id: 'pub-2',
            title: 'Multi-Modal Convolutional Architectures in Pulmonary Diagnostics',
            doi: '10.1109/TPAMI.2026.3129841',
            articleUrl: 'https://doi.org/10.1109/TPAMI.2026.3129841',
            volume: 'Vol. 48',
            issue: 'Issue 7',
            pageNumbers: 'pp. 1420–1435',
            publicationDate: '2026-07-28',
            finalPdfUrl: '#',
            certificateUrl: '#',
            submission: { journal: { name: 'IEEE Transactions on Pattern Analysis' } },
            project: { projectCode: 'INZ-2025-084', client: { organization: 'Oxford University' } },
          },
        ],
        meta: { total: 2, page: 1, limit: 20, totalPages: 1 },
      };
    }

    if (endpoint.startsWith('/finance')) {
      if (endpoint.includes('overview')) {
        return {
          totalCollectedRevenue: 148500,
          totalPendingOutstanding: 34200,
          paidInvoicesCount: 42,
        };
      }
      if (endpoint.includes('invoices')) {
        return {
          data: [
            {
              id: 'inv-1',
              invoiceNumber: 'INV-2026-001',
              amount: 2100,
              currency: 'USD',
              status: 'PAID',
              dueDate: '2026-10-15',
              issuedAt: '2026-09-01',
              project: { projectCode: 'INZ-2026-001', title: 'Genomic Variant Detection' },
              client: { organization: 'Stanford University School of Medicine', user: { firstName: 'Dr. John', lastName: 'Reynolds' } },
            },
            {
              id: 'inv-2',
              invoiceNumber: 'INV-2026-002',
              amount: 1900,
              currency: 'USD',
              status: 'PENDING',
              dueDate: '2026-11-01',
              issuedAt: '2026-09-15',
              project: { projectCode: 'INZ-2026-002', title: 'Perovskite Solar Cells' },
              client: { organization: 'National University of Singapore', user: { firstName: 'Prof. Wei', lastName: 'Zhang' } },
            },
          ],
          meta: { total: 2, page: 1, limit: 20, totalPages: 1 },
        };
      }
      if (endpoint.includes('payments')) {
        return {
          data: [
            {
              id: 'pay-1',
              receiptNumber: 'RCP-2026-001',
              amount: 2100,
              currency: 'USD',
              paymentType: 'ADVANCE_MILESTONE',
              paymentMethod: 'STRIPE_CREDIT_CARD',
              paidAt: '2026-09-05',
              project: { projectCode: 'INZ-2026-001' },
              client: { organization: 'Stanford University' },
            },
          ],
          meta: { total: 1, page: 1, limit: 20, totalPages: 1 },
        };
      }
    }

    if (endpoint.startsWith('/communications')) {
      return {
        data: [
          {
            id: 'comm-1',
            type: 'JOURNAL_COMMUNICATION',
            subject: 'Editorial Decision: Minor Revision Required (NMI-2026-0891)',
            body: 'Dear Author, Reviewers have concluded their preliminary evaluations. Please address referee #2 comments on variant filtering reproducibility within 30 days.',
            createdAt: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(),
            project: { projectCode: 'INZ-2026-001' },
            user: { firstName: 'Editorial', lastName: 'Office' },
          },
          {
            id: 'comm-2',
            type: 'CLIENT_COMMENT',
            subject: 'Approval of Manuscript Figures and Table Layouts',
            body: 'I have reviewed the high-resolution vector figures. The ClinVar comparisons look excellent. Approved to proceed.',
            createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
            project: { projectCode: 'INZ-2026-001' },
            user: { firstName: 'Dr. John', lastName: 'Reynolds' },
          },
          {
            id: 'comm-3',
            type: 'INTERNAL_NOTE',
            subject: 'Internal QC verification completed',
            body: 'Plagiarism verified under 4%. References checked against IEEE guidelines. Ready for publication executive review.',
            createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
            project: { projectCode: 'INZ-2026-001' },
            user: { firstName: 'Marcus', lastName: 'Vance' },
          },
        ],
        meta: { total: 3, page: 1, limit: 20, totalPages: 1 },
      };
    }

    if (endpoint.startsWith('/reports')) {
      if (endpoint.includes('employee-performance')) {
        return [
          {
            id: 'u-1',
            name: 'Dr. Sarah Chen',
            email: 'sarah.c@inzovate.com',
            role: 'Research Staff',
            totalTasks: 18,
            completedTasks: 16,
            pendingTasks: 2,
            manuscriptVersionsAuthored: 8,
            onTimeCompletionRate: 94,
          },
          {
            id: 'u-2',
            name: 'Marcus Vance',
            email: 'marcus.v@inzovate.com',
            role: 'Quality Analyst (QC)',
            totalTasks: 24,
            completedTasks: 22,
            pendingTasks: 2,
            manuscriptVersionsAuthored: 0,
            onTimeCompletionRate: 96,
          },
          {
            id: 'u-3',
            name: 'Elena Rostova',
            email: 'elena.r@inzovate.com',
            role: 'Research Manager',
            totalTasks: 12,
            completedTasks: 11,
            pendingTasks: 1,
            manuscriptVersionsAuthored: 4,
            onTimeCompletionRate: 92,
          },
        ];
      }
      if (endpoint.includes('operational')) {
        return {
          totalProjects: 28,
          completedProjects: 14,
          inProgressProjects: 14,
          totalSubmissions: 22,
          acceptedPublications: 18,
          publicationSuccessRate: '82%',
          collectedRevenue: 148500,
          currency: 'USD',
          generatedAt: new Date().toISOString(),
        };
      }
    }

    return { success: true };
  }
}

export const api = new ApiClient();
