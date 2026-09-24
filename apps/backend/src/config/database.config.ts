import { registerAs } from '@nestjs/config';

export const databaseConfig = registerAs('database', () => ({
  url: process.env.DATABASE_URL ?? 'postgresql://inzovate:inzovate_dev_pass@localhost:5432/inzovate_db',
}));
