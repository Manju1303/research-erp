import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { StorageService } from '../../storage/storage.service';
import { UploadDocumentDto, DocumentAccessLevel } from './dto/document.dto';
import { UserRole } from '@inzovate/shared';

@Injectable()
export class DocumentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storageService: StorageService,
  ) {}

  private sanitizeDocument(doc: any) {
    return {
      ...doc,
      sizeBytes: Number(doc.sizeBytes),
    };
  }

  async findByProject(projectId: string, userId: string, role: string) {
    const project = await this.prisma.project.findFirst({
      where: { id: projectId, deletedAt: null },
      include: { client: true },
    });
    if (!project) throw new NotFoundException('Project not found');

    const where: any = {
      projectId,
      deletedAt: null,
    };

    if (role === UserRole.CLIENT) {
      if (project.client.userId !== userId) {
        throw new ForbiddenException('Access denied to project documents');
      }
      where.accessLevel = { in: [DocumentAccessLevel.CLIENT, DocumentAccessLevel.PUBLIC] };
    }

    const docs = await this.prisma.document.findMany({
      where,
      include: {
        uploadedBy: {
          select: { id: true, firstName: true, lastName: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return docs.map((d) => this.sanitizeDocument(d));
  }

  async findOne(id: string, userId: string, role: string) {
    const doc = await this.prisma.document.findFirst({
      where: { id, deletedAt: null },
      include: {
        project: { include: { client: true } },
        uploadedBy: { select: { id: true, firstName: true, lastName: true } },
      },
    });

    if (!doc) throw new NotFoundException('Document not found');

    if (role === UserRole.CLIENT) {
      if (
        (doc.project && doc.project.client.userId !== userId) ||
        doc.accessLevel === DocumentAccessLevel.INTERNAL
      ) {
        throw new ForbiddenException('Access denied to this document');
      }
    }

    return this.sanitizeDocument(doc);
  }

  async upload(
    file: Express.Multer.File,
    dto: UploadDocumentDto,
    uploadedById: string,
  ) {
    const saved = await this.storageService.saveFile({
      fieldname: file.fieldname,
      originalname: file.originalname,
      encoding: file.encoding,
      mimetype: file.mimetype,
      size: file.size,
      buffer: file.buffer,
    });

    const doc = await this.prisma.document.create({
      data: {
        filename: saved.filename,
        storagePath: saved.storagePath,
        mimeType: saved.mimeType,
        sizeBytes: BigInt(saved.sizeBytes),
        category: dto.category || 'MANUSCRIPT',
        accessLevel: dto.accessLevel || DocumentAccessLevel.INTERNAL,
        description: dto.description,
        projectId: dto.projectId,
        manuscriptVersionId: dto.manuscriptVersionId,
        uploadedById,
      },
      include: {
        uploadedBy: { select: { id: true, firstName: true, lastName: true } },
      },
    });

    return this.sanitizeDocument(doc);
  }

  async getDownloadStream(id: string, userId: string, role: string) {
    const doc = await this.findOne(id, userId, role);
    const stream = await this.storageService.getFileStream(doc.storagePath);
    return {
      stream,
      filename: doc.filename,
      mimeType: doc.mimeType,
    };
  }

  async softDelete(id: string) {
    const doc = await this.prisma.document.findFirst({
      where: { id, deletedAt: null },
    });
    if (!doc) throw new NotFoundException('Document not found');

    await this.prisma.document.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
    return { success: true };
  }
}
