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
import { PublicationsService } from './publications.service';
import { CreatePublicationDto, UpdatePublicationDto } from './dto/publication.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@ApiTags('Publications')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@Controller('publications')
export class PublicationsController {
  constructor(private readonly publicationsService: PublicationsService) {}

  @Get()
  @ApiOperation({ summary: 'List published articles with DOIs and volume metadata' })
  @ApiQuery({ name: 'search', required: false })
  findAll(
    @Query() query: PaginationDto & { search?: string },
  ) {
    return this.publicationsService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get published paper metadata and certificate URLs' })
  findOne(@Param('id') id: string) {
    return this.publicationsService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Record final publication with DOI and published PDF' })
  create(@Body() dto: CreatePublicationDto) {
    return this.publicationsService.create(dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update publication volume, issue, or DOI' })
  update(@Param('id') id: string, @Body() dto: UpdatePublicationDto) {
    return this.publicationsService.update(id, dto);
  }
}
