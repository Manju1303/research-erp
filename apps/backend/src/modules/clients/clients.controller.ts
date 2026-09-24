import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { ClientsService } from './clients.service';
import { CreateClientDto, UpdateClientDto } from './dto/client.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Clients')
@ApiBearerAuth('access-token')
@UseGuards(PermissionsGuard)
@Controller('clients')
export class ClientsController {
  constructor(private readonly clientsService: ClientsService) {}

  @Get()
  @RequirePermissions('clients:read')
  @ApiOperation({ summary: 'List all clients (paginated)' })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'country', required: false })
  findAll(
    @Query() query: PaginationDto & { search?: string; country?: string },
    @CurrentUser('role') role: { name: string },
  ) {
    return this.clientsService.findAll(query, role.name);
  }

  @Get('me')
  @RequirePermissions('clients:read:own')
  @ApiOperation({ summary: 'Get current logged-in client profile' })
  findMyProfile(@CurrentUser('id') userId: string) {
    return this.clientsService.findByUserId(userId);
  }

  @Get(':id')
  @RequirePermissions('clients:read', 'clients:read:own')
  @ApiOperation({ summary: 'Get client details by ID' })
  findOne(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @CurrentUser('role') role: { name: string },
  ) {
    return this.clientsService.findOne(id, userId, role.name);
  }

  @Post()
  @RequirePermissions('clients:create')
  @ApiOperation({ summary: 'Register a new client' })
  create(@Body() dto: CreateClientDto) {
    return this.clientsService.create(dto);
  }

  @Patch(':id')
  @RequirePermissions('clients:update', 'clients:read:own')
  @ApiOperation({ summary: 'Update client profile' })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateClientDto,
    @CurrentUser('id') userId: string,
    @CurrentUser('role') role: { name: string },
  ) {
    return this.clientsService.update(id, dto, userId, role.name);
  }

  @Delete(':id')
  @RequirePermissions('clients:delete')
  @ApiOperation({ summary: 'Soft delete client profile' })
  remove(@Param('id') id: string) {
    return this.clientsService.softDelete(id);
  }
}
