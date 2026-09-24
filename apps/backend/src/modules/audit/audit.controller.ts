import {
  Controller,
  Get,
  Query,
  Param,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { AuditService } from './audit.service';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { PermissionsGuard } from '../../common/guards/permissions.guard';

@ApiTags('Audit Logs')
@ApiBearerAuth('access-token')
@UseGuards(PermissionsGuard)
@Controller('audit-logs')
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  @Get()
  @RequirePermissions('audit_logs:read')
  @ApiOperation({ summary: 'View immutable system audit logs' })
  @ApiQuery({ name: 'entity', required: false })
  @ApiQuery({ name: 'userId', required: false })
  @ApiQuery({ name: 'action', required: false })
  findAll(
    @Query()
    query: PaginationDto & {
      entity?: string;
      userId?: string;
      action?: string;
    },
  ) {
    return this.auditService.findAll(query);
  }

  @Get('entity/:entity/:entityId')
  @RequirePermissions('audit_logs:read')
  @ApiOperation({ summary: 'Get audit logs for a specific entity ID' })
  findByEntity(
    @Param('entity') entity: string,
    @Param('entityId') entityId: string,
  ) {
    return this.auditService.findByEntity(entity, entityId);
  }
}
