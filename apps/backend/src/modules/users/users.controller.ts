import {
  Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { CreateUserDto, UpdateUserDto, AssignRoleDto, ToggleUserStatusDto } from './dto/user.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Users')
@ApiBearerAuth('access-token')
@UseGuards(PermissionsGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @RequirePermissions('users:read')
  @ApiOperation({ summary: 'List all users (paginated)' })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'roleId', required: false })
  findAll(@Query() query: PaginationDto & { search?: string; roleId?: string }) {
    return this.usersService.findAll(query);
  }

  @Get('roles')
  @RequirePermissions('users:read')
  @ApiOperation({ summary: 'List all roles with permissions' })
  findAllRoles() {
    return this.usersService.findAllRoles();
  }

  @Get(':id')
  @RequirePermissions('users:read')
  @ApiOperation({ summary: 'Get user by ID' })
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Post()
  @RequirePermissions('users:create')
  @ApiOperation({ summary: 'Create a new staff user' })
  create(@Body() dto: CreateUserDto) {
    return this.usersService.create(dto);
  }

  @Patch(':id')
  @RequirePermissions('users:update')
  @ApiOperation({ summary: 'Update user profile' })
  update(@Param('id') id: string, @Body() dto: UpdateUserDto) {
    return this.usersService.update(id, dto);
  }

  @Patch(':id/role')
  @RequirePermissions('users:assign_role')
  @ApiOperation({ summary: 'Assign role to user' })
  assignRole(
    @Param('id') id: string,
    @Body() dto: AssignRoleDto,
    @CurrentUser('role') role: { name: string },
  ) {
    return this.usersService.assignRole(id, dto, role.name);
  }

  @Patch(':id/status')
  @RequirePermissions('users:update')
  @ApiOperation({ summary: 'Activate or deactivate user' })
  toggleStatus(@Param('id') id: string, @Body() dto: ToggleUserStatusDto) {
    return this.usersService.toggleStatus(id, dto.isActive);
  }

  @Delete(':id')
  @RequirePermissions('users:delete')
  @ApiOperation({ summary: 'Soft-delete user' })
  remove(@Param('id') id: string) {
    return this.usersService.softDelete(id);
  }
}
