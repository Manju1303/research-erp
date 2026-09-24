import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Request } from 'express';
import { PrismaService } from '../../database/prisma.service';

interface AuditContext {
  userId?: string;
  userEmail?: string;
  userRole?: string;
  action: string;
  entity: string;
  entityId?: string;
  ipAddress?: string;
  userAgent?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Audit interceptor — records every mutating HTTP request to the audit_logs table.
 * Only fires on POST/PUT/PATCH/DELETE methods; GET requests are not audited here
 * (use specific service-level audit calls for sensitive reads).
 */
@Injectable()
export class AuditInterceptor implements NestInterceptor {
  private readonly logger = new Logger(AuditInterceptor.name);
  private readonly MUTATING_METHODS = ['POST', 'PUT', 'PATCH', 'DELETE'];

  constructor(private readonly prisma: PrismaService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest<Request>();

    if (!this.MUTATING_METHODS.includes(request.method)) {
      return next.handle();
    }

    const user = (request as any).user;
    const startedAt = Date.now();

    return next.handle().pipe(
      tap({
        next: async () => {
          try {
            const auditCtx = this.buildAuditContext(request, user);
            await this.prisma.auditLog.create({ data: auditCtx });
          } catch (err) {
            // Audit failure must NEVER break the main request
            this.logger.error('Failed to write audit log', err);
          }
        },
        error: async (err) => {
          try {
            const auditCtx = this.buildAuditContext(request, user);
            await this.prisma.auditLog.create({
              data: {
                ...auditCtx,
                metadata: {
                  ...(auditCtx.metadata ?? {}),
                  error: err?.message,
                  statusCode: err?.status ?? 500,
                  durationMs: Date.now() - startedAt,
                },
              },
            });
          } catch (auditErr) {
            this.logger.error('Failed to write error audit log', auditErr);
          }
        },
      }),
    );
  }

  private buildAuditContext(request: Request, user: any): AuditContext {
    // Derive entity/action from URL structure: /api/v1/{entity}/{id?}
    const pathParts = request.path.replace(/^\/api\/v1\//, '').split('/');
    const entity = pathParts[0] ?? 'unknown';
    const entityId = pathParts[1] ?? undefined;

    const methodActionMap: Record<string, string> = {
      POST: 'created',
      PUT: 'updated',
      PATCH: 'patched',
      DELETE: 'deleted',
    };

    return {
      userId: user?.id,
      userEmail: user?.email,
      userRole: user?.role?.name,
      action: `${entity}.${methodActionMap[request.method] ?? request.method.toLowerCase()}`,
      entity,
      entityId,
      ipAddress: request.ip,
      userAgent: request.headers['user-agent'],
      metadata: {
        method: request.method,
        path: request.path,
        body: this.sanitizeBody(request.body),
      },
    };
  }

  /** Strip sensitive fields from body before storing in audit log */
  private sanitizeBody(body: Record<string, unknown> = {}): Record<string, unknown> {
    const REDACTED_FIELDS = ['password', 'passwordHash', 'token', 'secret', 'refreshToken'];
    const sanitized = { ...body };
    for (const field of REDACTED_FIELDS) {
      if (field in sanitized) sanitized[field] = '[REDACTED]';
    }
    return sanitized;
  }
}
