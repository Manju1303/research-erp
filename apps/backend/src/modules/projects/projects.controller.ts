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
import { ProjectsService } from './projects.service';
import {
  CreateProjectDto,
  UpdateProjectDto,
  TransitionProjectStatusDto,
  AssignStaffDto,
} from './dto/project.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UserRole } from '@inzovate/shared';

@ApiTags('Projects')
@ApiBearerAuth('access-token')
@UseGuards(PermissionsGuard)
@Controller('projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Get()
  @RequirePermissions('projects:read', 'projects:read:own')
  @ApiOperation({ summary: 'List projects (scoped to user role)' })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'priority', required: false })
  @ApiQuery({ name: 'clientId', required: false })
  findAll(
    @Query()
    query: PaginationDto & {
      search?: string;
      status?: string;
      priority?: string;
      clientId?: string;
    },
    @CurrentUser('id') userId: string,
    @CurrentUser('role') role: { name: string },
  ) {
    return this.projectsService.findAll(query, userId, role.name);
  }

  @Get(':id')
  @RequirePermissions('projects:read', 'projects:read:own')
  @ApiOperation({ summary: 'Get full project details' })
  findOne(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @CurrentUser('role') role: { name: string },
  ) {
    return this.projectsService.findOne(id, userId, role.name);
  }

  @Post()
  @RequirePermissions('projects:create')
  @ApiOperation({ summary: 'Create a new research project' })
  create(
    @Body() dto: CreateProjectDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.projectsService.create(dto, userId);
  }

  @Patch(':id')
  @RequirePermissions('projects:update')
  @ApiOperation({ summary: 'Update project details' })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateProjectDto,
    @CurrentUser('role') role: { name: string },
  ) {
    return this.projectsService.update(id, dto, role.name);
  }

  @Post(':id/transition')
  @RequirePermissions('projects:transition_status', 'projects:update')
  @ApiOperation({ summary: 'Transition project lifecycle status via State Machine' })
  transition(
    @Param('id') id: string,
    @Body() dto: TransitionProjectStatusDto,
    @CurrentUser('id') userId: string,
    @CurrentUser('role') role: { name: string },
  ) {
    return this.projectsService.transitionStatus(id, dto, userId, role.name as UserRole);
  }

  @Post(':id/staff')
  @RequirePermissions('projects:update')
  @ApiOperation({ summary: 'Assign staff member to project' })
  assignStaff(
    @Param('id') id: string,
    @Body() dto: AssignStaffDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.projectsService.assignStaff(id, dto, userId);
  }

  @Delete(':id/staff/:userId')
  @RequirePermissions('projects:update')
  @ApiOperation({ summary: 'Remove staff assignment from project' })
  removeStaff(
    @Param('id') id: string,
    @Param('userId') targetUserId: string,
  ) {
    return this.projectsService.removeStaff(id, targetUserId);
  }

  @Delete(':id')
  @RequirePermissions('projects:delete')
  @ApiOperation({ summary: 'Soft-delete project' })
  remove(@Param('id') id: string) {
    return this.projectsService.softDelete(id);
  }
}
