import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ManuscriptsService } from './manuscripts.service';
import {
  CreateManuscriptDto,
  CreateManuscriptVersionDto,
  UpdateManuscriptVersionDto,
  UpdateQcChecklistDto,
  TransitionManuscriptStatusDto,
} from './dto/manuscript.dto';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UserRole } from '@inzovate/shared';

@ApiTags('Manuscripts')
@ApiBearerAuth('access-token')
@UseGuards(PermissionsGuard)
@Controller('manuscripts')
export class ManuscriptsController {
  constructor(private readonly manuscriptsService: ManuscriptsService) {}

  @Get('project/:projectId')
  @RequirePermissions('manuscripts:read', 'manuscripts:read:own')
  @ApiOperation({ summary: 'Get manuscript with all versions for a project' })
  findByProject(
    @Param('projectId') projectId: string,
    @CurrentUser('id') userId: string,
    @CurrentUser('role') role: { name: string },
  ) {
    return this.manuscriptsService.findByProjectId(projectId, userId, role.name);
  }

  @Get(':id')
  @RequirePermissions('manuscripts:read', 'manuscripts:read:own')
  @ApiOperation({ summary: 'Get manuscript by ID' })
  findOne(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @CurrentUser('role') role: { name: string },
  ) {
    return this.manuscriptsService.findOne(id, userId, role.name);
  }

  @Get('versions/:versionId')
  @RequirePermissions('manuscripts:read', 'manuscripts:read:own')
  @ApiOperation({ summary: 'Get specific manuscript version details' })
  findVersion(
    @Param('versionId') versionId: string,
    @CurrentUser('id') userId: string,
    @CurrentUser('role') role: { name: string },
  ) {
    return this.manuscriptsService.findVersion(versionId, userId, role.name);
  }

  @Post()
  @RequirePermissions('manuscripts:create')
  @ApiOperation({ summary: 'Create initial manuscript for a project (V1 Draft)' })
  create(
    @Body() dto: CreateManuscriptDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.manuscriptsService.create(dto, userId);
  }

  @Post(':id/versions')
  @RequirePermissions('manuscripts:create')
  @ApiOperation({ summary: 'Create a new manuscript version (e.g. Draft V2, Final V1)' })
  createNewVersion(
    @Param('id') id: string,
    @Body() dto: CreateManuscriptVersionDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.manuscriptsService.createNewVersion(id, dto, userId);
  }

  @Patch('versions/:versionId')
  @RequirePermissions('manuscripts:update')
  @ApiOperation({ summary: 'Update manuscript version content (Draft state only)' })
  updateVersion(
    @Param('versionId') versionId: string,
    @Body() dto: UpdateManuscriptVersionDto,
    @CurrentUser('id') userId: string,
    @CurrentUser('role') role: { name: string },
  ) {
    return this.manuscriptsService.updateVersion(versionId, dto, userId, role.name);
  }

  @Patch('versions/:versionId/qc')
  @RequirePermissions('manuscripts:qc_update')
  @ApiOperation({ summary: 'Quality Analyst checklist verification and approval/rejection' })
  updateQcChecklist(
    @Param('versionId') versionId: string,
    @Body() dto: UpdateQcChecklistDto,
  ) {
    return this.manuscriptsService.updateQcChecklist(versionId, dto);
  }

  @Post('versions/:versionId/plagiarism-scan')
  @RequirePermissions('manuscripts:qc_update', 'manuscripts:read')
  @ApiOperation({ summary: 'Run real-time Turnitin/iThenticate plagiarism & similarity scan' })
  scanPlagiarism(@Param('versionId') versionId: string) {
    return this.manuscriptsService.scanPlagiarism(versionId);
  }

  @Post('versions/:versionId/transition')
  @RequirePermissions('manuscripts:update', 'manuscripts:approve')
  @ApiOperation({ summary: 'Transition manuscript version lifecycle status' })
  transitionStatus(
    @Param('versionId') versionId: string,
    @Body() dto: TransitionManuscriptStatusDto,
    @CurrentUser('id') userId: string,
    @CurrentUser('role') role: { name: string },
  ) {
    return this.manuscriptsService.transitionStatus(versionId, dto, userId, role.name as UserRole);
  }
}
