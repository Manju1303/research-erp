import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateJournalDto, UpdateJournalDto, MatchJournalsDto } from './dto/journal.dto';
import {
  PaginationDto,
  toPrismaOrderAndPagination,
  buildPaginationMeta,
} from '../../common/dto/pagination.dto';

@Injectable()
export class JournalsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(
    query: PaginationDto & {
      search?: string;
      subjectArea?: string;
      indexing?: string;
      maxApc?: number;
    },
  ) {
    const { skip, take, orderBy } = toPrismaOrderAndPagination(query);
    const where: any = {};

    if (query.search) {
      where.OR = [
        { name: { contains: query.search, mode: 'insensitive' } },
        { publisher: { contains: query.search, mode: 'insensitive' } },
        { issn: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    if (query.subjectArea) {
      where.subjectArea = { contains: query.subjectArea, mode: 'insensitive' };
    }

    if (query.indexing) {
      where.indexing = { has: query.indexing };
    }

    if (query.maxApc) {
      where.apc = { lte: query.maxApc };
    }

    const [data, total] = await Promise.all([
      this.prisma.journal.findMany({
        where,
        skip,
        take,
        orderBy,
      }),
      this.prisma.journal.count({ where }),
    ]);

    return {
      data,
      meta: buildPaginationMeta(total, query.page ?? 1, query.limit ?? 20),
    };
  }

  async findOne(id: string) {
    const journal = await this.prisma.journal.findUnique({
      where: { id },
      include: {
        submissions: {
          select: {
            id: true,
            status: true,
            project: { select: { projectCode: true, title: true } },
          },
        },
      },
    });
    if (!journal) throw new NotFoundException('Journal not found');
    return journal;
  }

  async create(dto: CreateJournalDto) {
    return this.prisma.journal.create({
      data: {
        ...dto,
        indexing: dto.indexing || [],
      },
    });
  }

  async update(id: string, dto: UpdateJournalDto) {
    const journal = await this.prisma.journal.findUnique({ where: { id } });
    if (!journal) throw new NotFoundException('Journal not found');

    return this.prisma.journal.update({
      where: { id },
      data: dto,
    });
  }

  async matchJournals(dto: MatchJournalsDto) {
    const allJournals = await this.prisma.journal.findMany({
      where: { isVerified: true },
    });

    const scored = allJournals.map((j) => {
      let score = 50; // base score
      const domainLower = dto.domain.toLowerCase();
      const subjectLower = j.subjectArea.toLowerCase();

      // Subject Area match
      if (domainLower.includes(subjectLower) || subjectLower.includes(domainLower)) {
        score += 25;
      }

      // Indexing match
      if (dto.targetIndexing && j.indexing.includes(dto.targetIndexing)) {
        score += 15;
      }

      // Budget check
      if (dto.budget && j.apc) {
        if (Number(j.apc) <= dto.budget) score += 10;
        else score -= 15;
      }

      return {
        journal: j,
        matchScorePercent: Math.min(Math.max(score, 10), 98),
        withinBudget: !dto.budget || !j.apc || Number(j.apc) <= dto.budget,
        indexingMatch: !dto.targetIndexing || j.indexing.includes(dto.targetIndexing),
      };
    });

    scored.sort((a, b) => b.matchScorePercent - a.matchScorePercent);
    return scored.slice(0, 8);
  }
}
