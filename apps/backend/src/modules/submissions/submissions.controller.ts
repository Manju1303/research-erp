import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { SubmissionsService } from './submissions.service';
import { CreateSubmissionDto, UpdateSubmissionStatusDto } from './dto/submission.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@ApiTags('Submissions')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@Controller('submissions')
export class SubmissionsController {
  constructor(private readonly submissionsService: SubmissionsService) {}

  @Get()
  @ApiOperation({ summary: 'List and filter journal submissions across projects' })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'projectId', required: false })
  @ApiQuery({ name: 'journalId', required: false })
  findAll(
    @Query()
    query: PaginationDto & {
      status?: string;
      projectId?: string;
      journalId?: string;
    },
  ) {
    return this.submissionsService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get submission details, editorial comments, and revision cycles' })
  findOne(@Param('id') id: string) {
    return this.submissionsService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Dispatch manuscript submission to an external journal (QC-gated)' })
  create(@Body() dto: CreateSubmissionDto) {
    return this.submissionsService.create(dto);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Update editorial review status (e.g. Under Review, Revision Required, Accepted)' })
  updateStatus(@Param('id') id: string, @Body() dto: UpdateSubmissionStatusDto) {
    return this.submissionsService.updateStatus(id, dto);
  }
}
