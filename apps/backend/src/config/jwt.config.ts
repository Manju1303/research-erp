import { registerAs } from '@nestjs/config';

export const jwtConfig = registerAs('jwt', () => ({
  accessSecret: process.env.JWT_ACCESS_SECRET ?? 'CHANGE_ME_IN_PRODUCTION_ACCESS',
  refreshSecret: process.env.JWT_REFRESH_SECRET ?? 'CHANGE_ME_IN_PRODUCTION_REFRESH',
  accessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN ?? '15m',
  refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN ?? '7d',
  refreshExpiresInMs: 7 * 24 * 60 * 60 * 1000, // 7 days in ms
}));
