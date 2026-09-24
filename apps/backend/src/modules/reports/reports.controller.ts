import {
  Controller,
  Get,
  Query,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { Response } from 'express';
import { ReportsService } from './reports.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { PermissionsGuard } from '../../common/guards/permissions.guard';

@ApiTags('Reports')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('operational')
  @RequirePermissions('reports:read')
  @ApiOperation({ summary: 'Get overall executive operational report' })
  getOperationalReport() {
    return this.reportsService.getOperationalReport();
  }

  @Get('employee-performance')
  @RequirePermissions('reports:read')
  @ApiOperation({ summary: 'Get employee performance scorecards & workload metrics' })
  getEmployeePerformance() {
    return this.reportsService.getEmployeePerformance();
  }

  @Get('export')
  @RequirePermissions('reports:read')
  @ApiOperation({ summary: 'Export operational data as CSV file' })
  @ApiQuery({ name: 'type', enum: ['projects', 'employees', 'publications'] })
  async exportCsv(
    @Query('type') type: 'projects' | 'employees' | 'publications',
    @Res() res: Response,
  ) {
    const csvContent = await this.reportsService.exportCsvReport(type || 'projects');
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="inzovate_report_${type || 'projects'}.csv"`);
    res.send(csvContent);
  }
}
