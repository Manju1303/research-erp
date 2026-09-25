import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { ClientsModule } from './modules/clients/clients.module';
import { ProjectsModule } from './modules/projects/projects.module';
import { TasksModule } from './modules/tasks/tasks.module';
import { ManuscriptsModule } from './modules/manuscripts/manuscripts.module';
import { DocumentsModule } from './modules/documents/documents.module';
import { StorageModule } from './storage/storage.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { AuditModule } from './modules/audit/audit.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { JournalsModule } from './modules/journals/journals.module';
import { SubmissionsModule } from './modules/submissions/submissions.module';
import { PublicationsModule } from './modules/publications/publications.module';
import { FinanceModule } from './modules/finance/finance.module';
import { CommunicationsModule } from './modules/communications/communications.module';
import { ReportsModule } from './modules/reports/reports.module';
import { HealthModule } from './modules/health/health.module';
import { AuditInterceptor } from './common/interceptors/audit.interceptor';
import { appConfig } from './config/app.config';
import { jwtConfig } from './config/jwt.config';
import { databaseConfig } from './config/database.config';
import { redisConfig } from './config/redis.config';

@Module({
  imports: [
    // Config — loaded before everything else
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig, jwtConfig, databaseConfig, redisConfig],
      envFilePath: ['.env.local', '.env'],
    }),

    // Rate limiting — global throttle guard applied below
    ThrottlerModule.forRoot([
      { name: 'short',  ttl: 1000,  limit: 10  },  // 10 req/sec
      { name: 'medium', ttl: 10000, limit: 50  },  // 50 req/10s
      { name: 'long',   ttl: 60000, limit: 200 },  // 200 req/min
    ]),

    // Core
    DatabaseModule,
    StorageModule,

    // Feature modules
    AuthModule,
    UsersModule,
    ClientsModule,
    ProjectsModule,
    TasksModule,
    ManuscriptsModule,
    DocumentsModule,
    NotificationsModule,
    AuditModule,
    DashboardModule,
    JournalsModule,
    SubmissionsModule,
    PublicationsModule,
    FinanceModule,
    CommunicationsModule,
    ReportsModule,
    HealthModule,
  ],
  providers: [
    // Apply rate limiting globally
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    // Audit all mutating requests
    {
      provide: APP_INTERCEPTOR,
      useClass: AuditInterceptor,
    },
  ],
})
export class AppModule {}
