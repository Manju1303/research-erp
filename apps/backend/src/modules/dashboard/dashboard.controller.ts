import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { DashboardService } from './dashboard.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { PermissionsGuard } from '../../common/guards/permissions.guard';

@ApiTags('Dashboard')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('overview')
  @ApiOperation({ summary: 'Get role-tailored real-time dashboard overview metrics' })
  getOverview(
    @CurrentUser('id') userId: string,
    @CurrentUser('role') role: { name: string },
  ) {
    return this.dashboardService.getRoleOverview(userId, role.name);
  }

  @Get('analytics')
  @UseGuards(PermissionsGuard)
  @RequirePermissions('analytics:read')
  @ApiOperation({ summary: 'Get enterprise pipeline and workload analytics' })
  getAnalytics() {
    return this.dashboardService.getAnalytics();
  }
}
