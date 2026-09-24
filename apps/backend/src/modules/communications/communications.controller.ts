import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { CommunicationsService } from './communications.service';
import { CreateCommunicationDto } from './dto/communication.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Communications')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@Controller('communications')
export class CommunicationsController {
  constructor(private readonly communicationsService: CommunicationsService) {}

  @Get()
  @ApiOperation({ summary: 'List centralized project communications (scoped by role)' })
  @ApiQuery({ name: 'projectId', required: false })
  @ApiQuery({ name: 'clientId', required: false })
  @ApiQuery({ name: 'type', required: false })
  findAll(
    @Query()
    query: PaginationDto & {
      projectId?: string;
      clientId?: string;
      type?: string;
    },
    @CurrentUser('id') userId: string,
    @CurrentUser('role') role: { name: string },
  ) {
    return this.communicationsService.findAll(query, userId, role.name);
  }

  @Post()
  @ApiOperation({ summary: 'Log a new communication record or client comment' })
  create(
    @Body() dto: CreateCommunicationDto,
    @CurrentUser('id') userId: string,
    @CurrentUser('role') role: { name: string },
  ) {
    return this.communicationsService.create(dto, userId, role.name);
  }
}
