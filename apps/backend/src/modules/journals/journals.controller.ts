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
import { JournalsService } from './journals.service';
import { CreateJournalDto, UpdateJournalDto, MatchJournalsDto } from './dto/journal.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@ApiTags('Journals')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@Controller('journals')
export class JournalsController {
  constructor(private readonly journalsService: JournalsService) {}

  @Get()
  @ApiOperation({ summary: 'List and filter journals from intelligence database' })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'subjectArea', required: false })
  @ApiQuery({ name: 'indexing', required: false })
  @ApiQuery({ name: 'maxApc', required: false })
  findAll(
    @Query()
    query: PaginationDto & {
      search?: string;
      subjectArea?: string;
      indexing?: string;
      maxApc?: number;
    },
  ) {
    return this.journalsService.findAll(query);
  }

  @Post('match')
  @ApiOperation({ summary: 'Intelligent journal recommendation & matching algorithm' })
  matchJournals(@Body() dto: MatchJournalsDto) {
    return this.journalsService.matchJournals(dto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get journal details and submission track record' })
  findOne(@Param('id') id: string) {
    return this.journalsService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Add a new verified journal to intelligence database' })
  create(@Body() dto: CreateJournalDto) {
    return this.journalsService.create(dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update journal classification, APC, or submission guidelines' })
  update(@Param('id') id: string, @Body() dto: UpdateJournalDto) {
    return this.journalsService.update(id, dto);
  }
}
