import { NestFactory } from '@nestjs/core';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import * as cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log', 'debug'],
  });

  const config = app.get(ConfigService);
  const port = config.get<number>('PORT', 3001);
  const frontendUrl = config.get<string>('FRONTEND_URL', 'http://localhost:3000');

  // Security
  app.use(helmet());
  app.use(cookieParser());

  const isProduction = config.get<string>('NODE_ENV') === 'production';
  const frontendUrlConfig = config.get<string>('FRONTEND_URL', 'http://localhost:3000');
  const configuredOrigins = frontendUrlConfig
    .split(',')
    .map((u) => u.trim())
    .filter((u) => Boolean(u) && (!isProduction || u !== '*'));

  app.enableCors({
    origin: (origin, callback) => {
      // Allow requests with no origin (curl, mobile, server-to-server)
      if (!origin) return callback(null, true);

      if (isProduction) {
        // STRICT PRODUCTION CORS: exact match against explicit allowlist only.
        // No wildcards, no arbitrary preview domains, no localhost.
        if (configuredOrigins.includes(origin)) {
          return callback(null, true);
        }
        return callback(
          new Error(`Production CORS policy violation: Origin '${origin}' is not in the explicit allowlist.`),
          false,
        );
      }

      // DEVELOPMENT CORS: allow configured origins and local development hosts
      const isDevAllowed =
        configuredOrigins.includes('*') ||
        configuredOrigins.includes(origin) ||
        origin.startsWith('http://localhost:') ||
        origin.startsWith('http://127.0.0.1:');

      if (isDevAllowed) {
        return callback(null, true);
      }
      return callback(new Error(`Development CORS violation: Origin '${origin}' not permitted`), false);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'X-Requested-With'],
  });

  // API versioning
  app.setGlobalPrefix('api');
  app.enableVersioning({ type: VersioningType.URI, defaultVersion: '1' });

  // Global validation pipe — strict DTO enforcement
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,           // strip unknown fields
      forbidNonWhitelisted: true,
      transform: true,           // auto-transform types (e.g., string → number)
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  // Global exception filter — standardized error responses
  app.useGlobalFilters(new GlobalExceptionFilter());

  // Global response transform — wraps every response in ApiResponse envelope
  app.useGlobalInterceptors(new TransformInterceptor());

  // Swagger Documentation
  const enableSwagger = config.get('ENABLE_SWAGGER', 'true') === 'true';
  if (config.get('NODE_ENV') !== 'production' || enableSwagger) {
    const swaggerConfig = new DocumentBuilder()
      .setTitle('Scriptara ERP API')
      .setDescription('Scriptara Research Publication Management ERP — Enterprise API')
      .setVersion('1.0')
      .addBearerAuth({ type: 'http', scheme: 'bearer', bearerFormat: 'JWT' }, 'access-token')
      .build();
    const document = SwaggerModule.createDocument(app, swaggerConfig);
    SwaggerModule.setup('api/docs', app, document, {
      swaggerOptions: { persistAuthorization: true },
    });
    console.log(`📚 Swagger UI enabled: http://localhost:${port}/api/docs`);
  }

  await app.listen(port);
  console.log(`🚀 Backend running on http://localhost:${port}/api/v1`);
}

bootstrap();
