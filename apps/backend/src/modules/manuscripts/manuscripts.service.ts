import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import {
  CreateManuscriptDto,
  CreateManuscriptVersionDto,
  UpdateManuscriptVersionDto,
  UpdateQcChecklistDto,
  TransitionManuscriptStatusDto,
} from './dto/manuscript.dto';
import {
  UserRole,
  ManuscriptStatus,
  isValidManuscriptTransition,
} from '@inzovate/shared';
import { DomainEvents } from '../automation/events/domain-events';
import { PlagiarismService } from './plagiarism/plagiarism.service';

@Injectable()
export class ManuscriptsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly eventEmitter: EventEmitter2,
    private readonly plagiarismService: PlagiarismService,
  ) {}

  private readonly VERSION_INCLUDE = {
    author: {
      select: { id: true, firstName: true, lastName: true, email: true },
    },
    documents: {
      where: { deletedAt: null },
      select: {
        id: true,
        filename: true,
        mimeType: true,
        sizeBytes: true,
        category: true,
        createdAt: true,
      },
    },
  };

  async findByProjectId(projectId: string, userId: string, role: string) {
    const project = await this.prisma.project.findFirst({
      where: { id: projectId, deletedAt: null },
      include: { client: true },
    });
    if (!project) throw new NotFoundException('Project not found');

    if (role === UserRole.CLIENT && project.client.userId !== userId) {
      throw new ForbiddenException('Access denied to this project manuscript');
    }

    return this.prisma.manuscript.findUnique({
      where: { projectId },
      include: {
        versions: {
          orderBy: { versionNumber: 'desc' },
          include: this.VERSION_INCLUDE,
        },
      },
    });
  }

  async findOne(id: string, userId: string, role: string) {
    const manuscript = await this.prisma.manuscript.findUnique({
      where: { id },
      include: {
        project: {
          include: { client: true },
        },
        versions: {
          orderBy: { versionNumber: 'desc' },
          include: this.VERSION_INCLUDE,
        },
      },
    });

    if (!manuscript) throw new NotFoundException('Manuscript not found');

    if (role === UserRole.CLIENT && manuscript.project.client.userId !== userId) {
      throw new ForbiddenException('Access denied to this manuscript');
    }

    return manuscript;
  }

  async findVersion(versionId: string, userId: string, role: string) {
    const version = await this.prisma.manuscriptVersion.findUnique({
      where: { id: versionId },
      include: {
        ...this.VERSION_INCLUDE,
        manuscript: {
          include: {
            project: {
              include: { client: true },
            },
          },
        },
      },
    });

    if (!version) throw new NotFoundException('Manuscript version not found');

    if (role === UserRole.CLIENT && version.manuscript.project.client.userId !== userId) {
      throw new ForbiddenException('Access denied to this manuscript version');
    }

    return version;
  }

  async create(dto: CreateManuscriptDto, authorId: string) {
    const project = await this.prisma.project.findFirst({
      where: { id: dto.projectId, deletedAt: null },
    });
    if (!project) throw new NotFoundException('Project not found');

    const existing = await this.prisma.manuscript.findUnique({
      where: { projectId: dto.projectId },
    });
    if (existing) {
      throw new BadRequestException('A manuscript already exists for this project. Create a new version instead.');
    }

    const wordCount = dto.content ? dto.content.trim().split(/\s+/).length : 0;

    const result = await this.prisma.$transaction(async (tx) => {
      const manuscript = await tx.manuscript.create({
        data: {
          projectId: dto.projectId,
          title: dto.title,
          abstract: dto.abstract,
          keywords: dto.keywords || [],
        },
      });

      const version = await tx.manuscriptVersion.create({
        data: {
          manuscriptId: manuscript.id,
          versionNumber: 1,
          title: dto.title,
          abstract: dto.abstract,
          content: dto.content,
          wordCount,
          status: ManuscriptStatus.DRAFT,
          changeNotes: dto.changeNotes || 'Initial manuscript creation (Draft V1)',
          isLatest: true,
          authorId,
        },
        include: this.VERSION_INCLUDE,
      });

      return { ...manuscript, versions: [version] };
    });

    // Emit domain event
    this.eventEmitter.emit(DomainEvents.MANUSCRIPT_CREATED, {
      manuscriptId: result.id,
      projectId: dto.projectId,
      title: dto.title,
      authorId,
    });

    return result;
  }

  async createNewVersion(manuscriptId: string, dto: CreateManuscriptVersionDto, authorId: string) {
    const manuscript = await this.prisma.manuscript.findUnique({
      where: { id: manuscriptId },
      include: { versions: { orderBy: { versionNumber: 'desc' }, take: 1 } },
    });
    if (!manuscript) throw new NotFoundException('Manuscript not found');

    const latestVer = manuscript.versions[0];
    const nextVerNumber = latestVer ? latestVer.versionNumber + 1 : 1;
    const wordCount = dto.wordCount || (dto.content ? dto.content.trim().split(/\s+/).length : 0);

    const newVer = await this.prisma.$transaction(async (tx) => {
      // Mark all previous versions as not latest
      await tx.manuscriptVersion.updateMany({
        where: { manuscriptId },
        data: { isLatest: false },
      });

      const newVersion = await tx.manuscriptVersion.create({
        data: {
          manuscriptId,
          versionNumber: nextVerNumber,
          title: dto.title,
          abstract: dto.abstract ?? latestVer?.abstract,
          content: dto.content ?? latestVer?.content,
          wordCount,
          status: ManuscriptStatus.DRAFT,
          changeNotes: dto.changeNotes,
          isLatest: true,
          authorId,
        },
        include: this.VERSION_INCLUDE,
      });

      // Also update manuscript top-level title
      await tx.manuscript.update({
        where: { id: manuscriptId },
        data: { title: dto.title },
      });

      return newVersion;
    });

    // Emit domain event
    this.eventEmitter.emit(DomainEvents.MANUSCRIPT_VERSION_CREATED, {
      manuscriptId,
      versionId: newVer.id,
      projectId: manuscript.projectId,
      versionNumber: nextVerNumber,
      authorId,
    });

    return newVer;
  }

  async updateVersion(versionId: string, dto: UpdateManuscriptVersionDto, userId: string, role: string) {
    const version = await this.prisma.manuscriptVersion.findUnique({
      where: { id: versionId },
    });
    if (!version) throw new NotFoundException('Manuscript version not found');

    if (version.status !== ManuscriptStatus.DRAFT && role !== UserRole.SUPER_ADMIN) {
      throw new BadRequestException('Only DRAFT versions can be modified directly. Create a new version for major revisions.');
    }

    const wordCount = dto.wordCount || (dto.content ? dto.content.trim().split(/\s+/).length : version.wordCount);

    return this.prisma.manuscriptVersion.update({
      where: { id: versionId },
      data: {
        ...dto,
        wordCount,
      },
      include: this.VERSION_INCLUDE,
    });
  }

  async scanPlagiarism(versionId: string) {
    const version = await this.prisma.manuscriptVersion.findUnique({
      where: { id: versionId },
      include: { manuscript: true },
    });
    if (!version) throw new NotFoundException('Manuscript version not found');

    const scanResult = await this.plagiarismService.scanManuscript({
      manuscriptId: version.id,
      title: version.title,
      abstract: version.abstract || '',
      wordCount: version.wordCount ?? undefined,
    });

    const currentChecklist = (version.qcChecklist as Record<string, any>) || {};
    const updatedChecklist = {
      ...currentChecklist,
      plagiarismVerification: scanResult.passedThreshold,
      similarityScorePercent: scanResult.similarityScorePercent,
      plagiarismScanId: scanResult.scanId,
      plagiarismReportUrl: scanResult.reportUrl,
      plagiarismProvider: scanResult.provider,
      plagiarismScannedAt: scanResult.scannedAt,
      plagiarismMatchedSources: scanResult.matchedSources,
    };

    const updated = await this.prisma.manuscriptVersion.update({
      where: { id: versionId },
      data: {
        qcChecklist: updatedChecklist,
        qcNotes: `${version.qcNotes || ''}\n[Automated Plagiarism Check via ${scanResult.provider}]: Similarity ${scanResult.similarityScorePercent}% (Threshold: ${scanResult.thresholdMaxPercent}%). Status: ${scanResult.passedThreshold ? 'PASSED' : 'FLAGGED'}`.trim(),
      },
      include: this.VERSION_INCLUDE,
    });

    return {
      scanResult,
      manuscriptVersion: updated,
    };
  }

  async updateQcChecklist(versionId: string, dto: UpdateQcChecklistDto) {
    const version = await this.prisma.manuscriptVersion.findUnique({
      where: { id: versionId },
    });
    if (!version) throw new NotFoundException('Manuscript version not found');

    let finalChecklist = { ...dto.qcChecklist };

    // Auto-populate / verify Item 8 (plagiarism verification) if not verified by scan
    if (finalChecklist.similarityScorePercent === undefined || !finalChecklist.plagiarismReportUrl) {
      const scanResult = await this.plagiarismService.scanManuscript({
        manuscriptId: version.id,
        title: version.title,
        abstract: version.abstract || '',
        wordCount: version.wordCount ?? undefined,
      });

      finalChecklist = {
        ...finalChecklist,
        plagiarismVerification: scanResult.passedThreshold,
        similarityScorePercent: scanResult.similarityScorePercent,
        plagiarismScanId: scanResult.scanId,
        plagiarismReportUrl: scanResult.reportUrl,
        plagiarismProvider: scanResult.provider,
        plagiarismScannedAt: scanResult.scannedAt,
      };
    }

    return this.prisma.manuscriptVersion.update({
      where: { id: versionId },
      data: {
        qcChecklist: finalChecklist,
        status: dto.status,
        qcNotes: dto.qcNotes,
      },
      include: this.VERSION_INCLUDE,
    });
  }

  async transitionStatus(
    versionId: string,
    dto: TransitionManuscriptStatusDto,
    userId: string,
    role: UserRole,
  ) {
    const version = await this.prisma.manuscriptVersion.findUnique({
      where: { id: versionId },
      include: {
        manuscript: {
          include: { project: { include: { client: true } } },
        },
      },
    });
    if (!version) throw new NotFoundException('Manuscript version not found');

    if (role === UserRole.CLIENT) {
      if (version.manuscript.project.client.userId !== userId) {
        throw new ForbiddenException('You cannot review this manuscript');
      }
    }

    const currentStatus = version.status as ManuscriptStatus;
    const targetStatus = dto.status;

    if (!isValidManuscriptTransition(currentStatus, targetStatus, role) && role !== UserRole.SUPER_ADMIN) {
      throw new BadRequestException(
        `Transition from ${currentStatus} to ${targetStatus} is not allowed for role ${role}`,
      );
    }

    const updated = await this.prisma.manuscriptVersion.update({
      where: { id: versionId },
      data: {
        status: targetStatus,
        changeNotes: dto.notes ? `${version.changeNotes || ''}\n[Status Change]: ${dto.notes}` : version.changeNotes,
      },
      include: this.VERSION_INCLUDE,
    });

    // Emit domain event
    this.eventEmitter.emit(DomainEvents.MANUSCRIPT_STATUS_CHANGED, {
      versionId,
      manuscriptId: version.manuscriptId,
      projectId: version.manuscript.projectId,
      title: version.title,
      fromStatus: currentStatus,
      toStatus: targetStatus,
      changedBy: userId,
      notes: dto.notes,
    });

    return updated;
  }
}
