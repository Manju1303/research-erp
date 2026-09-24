import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreatePublicationDto, UpdatePublicationDto } from './dto/publication.dto';
import {
  PaginationDto,
  toPrismaOrderAndPagination,
  buildPaginationMeta,
} from '../../common/dto/pagination.dto';

@Injectable()
export class PublicationsService {
  constructor(private readonly prisma: PrismaService) {}

  private readonly PUB_INCLUDE = {
    project: {
      select: {
        id: true,
        projectCode: true,
        title: true,
        client: {
          select: {
            organization: true,
            user: { select: { firstName: true, lastName: true, email: true } },
          },
        },
      },
    },
    submission: {
      include: {
        journal: true,
      },
    },
  };

  async findAll(query: PaginationDto & { search?: string }) {
    const { skip, take, orderBy } = toPrismaOrderAndPagination(query);
    const where: any = {};

    if (query.search) {
      where.OR = [
        { title: { contains: query.search, mode: 'insensitive' } },
        { doi: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    const [data, total] = await Promise.all([
      this.prisma.publication.findMany({
        where,
        skip,
        take,
        orderBy: { publicationDate: 'desc' },
        include: this.PUB_INCLUDE,
      }),
      this.prisma.publication.count({ where }),
    ]);

    return {
      data,
      meta: buildPaginationMeta(total, query.page ?? 1, query.limit ?? 20),
    };
  }

  async findOne(id: string) {
    const pub = await this.prisma.publication.findUnique({
      where: { id },
      include: this.PUB_INCLUDE,
    });
    if (!pub) throw new NotFoundException('Publication record not found');
    return pub;
  }

  async create(dto: CreatePublicationDto) {
    return this.prisma.publication.create({
      data: {
        submissionId: dto.submissionId,
        projectId: dto.projectId,
        title: dto.title,
        doi: dto.doi,
        articleUrl: dto.articleUrl,
        volume: dto.volume,
        issue: dto.issue,
        pageNumbers: dto.pageNumbers,
        publicationDate: dto.publicationDate ? new Date(dto.publicationDate) : new Date(),
        finalPdfUrl: dto.finalPdfUrl,
        certificateUrl: dto.certificateUrl,
      },
      include: this.PUB_INCLUDE,
    });
  }

  async update(id: string, dto: UpdatePublicationDto) {
    const pub = await this.prisma.publication.findUnique({ where: { id } });
    if (!pub) throw new NotFoundException('Publication record not found');

    const updateData: any = { ...dto };
    if (dto.publicationDate) updateData.publicationDate = new Date(dto.publicationDate);

    return this.prisma.publication.update({
      where: { id },
      data: updateData,
      include: this.PUB_INCLUDE,
    });
  }
}
