import { Controller, Get, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { PrismaService } from '../../database/prisma.service';

@ApiTags('Health & Reliability')
@Controller('health')
export class HealthController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Liveness probe — checks if HTTP server is responsive' })
  checkLiveness() {
    return {
      status: 'ok',
      service: 'scriptara-backend',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    };
  }

  @Get('ready')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Readiness probe — verifies database connectivity and state' })
  async checkReadiness() {
    let dbStatus = 'healthy';
    try {
      await this.prisma.$queryRaw`SELECT 1`;
    } catch (e: any) {
      dbStatus = `unhealthy: ${e.message}`;
    }

    const memoryUsage = process.memoryUsage();

    return {
      status: dbStatus === 'healthy' ? 'ready' : 'degraded',
      service: 'scriptara-backend',
      version: '1.0.0',
      database: dbStatus,
      memory: {
        rssMb: Math.round(memoryUsage.rss / 1024 / 1024),
        heapUsedMb: Math.round(memoryUsage.heapUsed / 1024 / 1024),
      },
      timestamp: new Date().toISOString(),
    };
  }
}
