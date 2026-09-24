import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { ApiErrorResponse } from '@inzovate/shared';

/**
 * Global exception filter — transforms all errors to standardized ApiErrorResponse.
 * Handles Prisma-specific errors for better messages.
 */
@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let errors: Record<string, string[]> | undefined;

    if (exception instanceof HttpException) {
      statusCode = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
      } else if (typeof exceptionResponse === 'object') {
        const resp = exceptionResponse as Record<string, unknown>;
        message = (resp.message as string) ?? message;
        // class-validator validation errors come as an array
        if (Array.isArray(resp.message)) {
          message = 'Validation failed';
          errors = this.formatValidationErrors(resp.message as string[]);
        }
      }
    } else if (this.isPrismaError(exception)) {
      const { statusCode: s, message: m } = this.handlePrismaError(exception as any);
      statusCode = s;
      message = m;
    } else if (exception instanceof Error) {
      message = exception.message;
      this.logger.error(exception.message, exception.stack);
    }

    const errorResponse: ApiErrorResponse = {
      success: false,
      message,
      statusCode,
      errors,
      timestamp: new Date().toISOString(),
      path: request.url,
    };

    response.status(statusCode).json(errorResponse);
  }

  private isPrismaError(exception: unknown): boolean {
    return (
      typeof exception === 'object' &&
      exception !== null &&
      'code' in exception &&
      typeof (exception as any).code === 'string' &&
      (exception as any).code.startsWith('P')
    );
  }

  private handlePrismaError(exception: { code: string; meta?: Record<string, unknown> }): {
    statusCode: number;
    message: string;
  } {
    switch (exception.code) {
      case 'P2002':
        return { statusCode: 409, message: `Duplicate value for: ${exception.meta?.target}` };
      case 'P2025':
        return { statusCode: 404, message: 'Record not found' };
      case 'P2003':
        return { statusCode: 400, message: 'Related record not found' };
      default:
        this.logger.error(`Unhandled Prisma error: ${exception.code}`);
        return { statusCode: 500, message: 'Database error' };
    }
  }

  private formatValidationErrors(messages: string[]): Record<string, string[]> {
    // Attempt to group by field (class-validator messages often start with "fieldName ")
    const grouped: Record<string, string[]> = {};
    for (const msg of messages) {
      const parts = msg.split(' ');
      const field = parts[0];
      if (!grouped[field]) grouped[field] = [];
      grouped[field].push(msg);
    }
    return grouped;
  }
}
