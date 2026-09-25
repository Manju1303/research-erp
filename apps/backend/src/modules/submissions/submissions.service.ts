import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { CreateSubmissionDto, UpdateSubmissionStatusDto } from './dto/submission.dto';
import {
  PaginationDto,
  toPrismaOrderAndPagination,
  buildPaginationMeta,
} from '../../common/dto/pagination.dto';
import { SubmissionStatus, ManuscriptStatus } from '@inzovate/shared';
import { DomainEvents } from '../automation/events/domain-events';

@Injectable()
export class SubmissionsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  private readonly SUBMISSION_INCLUDE = {
    project: {
      select: {
        id: true,
        projectCode: true,
        title: true,
        status: true,
        client: {
          select: {
            organization: true,
            user: { select: { firstName: true, lastName: true, email: true } },
          },
        },
      },
    },
    journal: true,
    manuscriptVersion: {
      select: {
        id: true,
        versionNumber: true,
        title: true,
        status: true,
      },
    },
    revisions: {
      orderBy: { cycleNumber: 'desc' as const },
    },
    publication: true,
  };

  async findAll(query: PaginationDto & { status?: string; projectId?: string; journalId?: string }) {
    const { skip, take, orderBy } = toPrismaOrderAndPagination(query);
    const where: any = {};

    if (query.status) where.status = query.status;
    if (query.projectId) where.projectId = query.projectId;
    if (query.journalId) where.journalId = query.journalId;

    const [data, total] = await Promise.all([
      this.prisma.submission.findMany({
        where,
        skip,
        take,
        orderBy,
        include: this.SUBMISSION_INCLUDE,
      }),
      this.prisma.submission.count({ where }),
    ]);

    return {
      data,
      meta: buildPaginationMeta(total, query.page ?? 1, query.limit ?? 20),
    };
  }

  async findOne(id: string) {
    const submission = await this.prisma.submission.findUnique({
      where: { id },
      include: this.SUBMISSION_INCLUDE,
    });
    if (!submission) throw new NotFoundException('Submission record not found');
    return submission;
  }

  async create(dto: CreateSubmissionDto) {
    // QC Gate: verify manuscript has passed internal QC
    if (dto.manuscriptVersionId) {
      const version = await this.prisma.manuscriptVersion.findUnique({
        where: { id: dto.manuscriptVersionId },
      });
      if (version && version.status !== ManuscriptStatus.QC_PASSED && version.status !== ManuscriptStatus.CLIENT_APPROVED) {
        throw new BadRequestException(
          'QC Verification Gate: Manuscript must have status QC_PASSED or CLIENT_APPROVED before submission to an external journal.',
        );
      }
    }

    const submission = await this.prisma.submission.create({
      data: {
        projectId: dto.projectId,
        journalId: dto.journalId,
        manuscriptVersionId: dto.manuscriptVersionId,
        status: SubmissionStatus.SUBMITTED,
        submissionDate: dto.submissionDate ? new Date(dto.submissionDate) : new Date(),
        submissionMethod: dto.submissionMethod,
        submissionAccount: dto.submissionAccount,
        submissionRefId: dto.submissionRefId,
        editorialContact: dto.editorialContact,
        expectedResponseDate: dto.expectedResponseDate ? new Date(dto.expectedResponseDate) : null,
      },
      include: this.SUBMISSION_INCLUDE,
    });

    // Emit domain event
    this.eventEmitter.emit(DomainEvents.SUBMISSION_CREATED, {
      submissionId: submission.id,
      projectId: dto.projectId,
      journalId: dto.journalId,
      journalName: submission.journal?.name || 'Unknown Journal',
      manuscriptVersionId: dto.manuscriptVersionId,
    });

    return submission;
  }

  async updateStatus(id: string, dto: UpdateSubmissionStatusDto) {
    const submission = await this.prisma.submission.findUnique({ where: { id } });
    if (!submission) throw new NotFoundException('Submission not found');

    const updateData: any = {
      status: dto.status,
    };
    if (dto.submissionRefId) updateData.submissionRefId = dto.submissionRefId;

    const updated = await this.prisma.submission.update({
      where: { id },
      data: updateData,
      include: this.SUBMISSION_INCLUDE,
    });

    // Emit domain event
    const project = await this.prisma.project.findUnique({
      where: { id: submission.projectId },
      select: { projectCode: true },
    });

    this.eventEmitter.emit(DomainEvents.SUBMISSION_STATUS_CHANGED, {
      submissionId: id,
      projectId: submission.projectId,
      projectCode: project?.projectCode || '',
      fromStatus: submission.status,
      toStatus: dto.status,
      journalName: updated.journal?.name || 'Unknown Journal',
    });

    return updated;
  }
}
