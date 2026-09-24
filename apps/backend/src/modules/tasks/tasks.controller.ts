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
import { TasksService } from './tasks.service';
import { CreateTaskDto, UpdateTaskDto, UpdateTaskProgressDto } from './dto/task.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Tasks')
@ApiBearerAuth('access-token')
@UseGuards(PermissionsGuard)
@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Get()
  @RequirePermissions('tasks:read')
  @ApiOperation({ summary: 'List tasks (scoped by user role and filters)' })
  @ApiQuery({ name: 'projectId', required: false })
  @ApiQuery({ name: 'assigneeId', required: false })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'priority', required: false })
  findAll(
    @Query()
    query: PaginationDto & {
      projectId?: string;
      assigneeId?: string;
      status?: string;
      priority?: string;
    },
    @CurrentUser('id') userId: string,
    @CurrentUser('role') role: { name: string },
  ) {
    return this.tasksService.findAll(query, userId, role.name);
  }

  @Get(':id')
  @RequirePermissions('tasks:read')
  @ApiOperation({ summary: 'Get task details' })
  findOne(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @CurrentUser('role') role: { name: string },
  ) {
    return this.tasksService.findOne(id, userId, role.name);
  }

  @Post()
  @RequirePermissions('tasks:create')
  @ApiOperation({ summary: 'Create a new task under a project' })
  create(
    @Body() dto: CreateTaskDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.tasksService.create(dto, userId);
  }

  @Patch(':id')
  @RequirePermissions('tasks:update', 'tasks:update:own')
  @ApiOperation({ summary: 'Update task details' })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateTaskDto,
    @CurrentUser('id') userId: string,
    @CurrentUser('role') role: { name: string },
  ) {
    return this.tasksService.update(id, dto, userId, role.name);
  }

  @Patch(':id/progress')
  @RequirePermissions('tasks:update', 'tasks:update:own')
  @ApiOperation({ summary: 'Update task progress / completion percentage' })
  updateProgress(
    @Param('id') id: string,
    @Body() dto: UpdateTaskProgressDto,
    @CurrentUser('id') userId: string,
    @CurrentUser('role') role: { name: string },
  ) {
    return this.tasksService.updateProgress(id, dto, userId, role.name);
  }

  @Delete(':id')
  @RequirePermissions('tasks:delete')
  @ApiOperation({ summary: 'Soft-delete a task' })
  remove(@Param('id') id: string) {
    return this.tasksService.softDelete(id);
  }
}
