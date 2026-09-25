import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { TokenService } from './token.service';
import { PrismaService } from '../../database/prisma.service';

describe('TokenService & RFC 6819 Token Rotation QA Tests', () => {
  let service: TokenService;
  let prisma: any;

  beforeEach(async () => {
    prisma = {
      refreshToken: {
        create: jest.fn(),
        findMany: jest.fn(),
        update: jest.fn(),
        updateMany: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TokenService,
        {
          provide: JwtService,
          useValue: {
            signAsync: jest.fn().mockResolvedValue('jwt.test.token'),
            verifyAsync: jest.fn().mockResolvedValue({ sub: 'user-uuid-1' }),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              if (key === 'jwt.accessSecret') return 'test-access-secret';
              if (key === 'jwt.refreshSecret') return 'test-refresh-secret';
              return null;
            }),
          },
        },
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<TokenService>(TokenService);
  });

  it('validates a fresh, active refresh token (status: VALID)', async () => {
    const rawToken = 'valid-refresh-token-xyz';
    const hash = await bcrypt.hash(rawToken, 10);

    prisma.refreshToken.findMany.mockResolvedValue([
      {
        id: 'token-1',
        tokenHash: hash,
        revokedAt: null,
        expiresAt: new Date(Date.now() + 100000),
      },
    ]);

    const result = await service.findTokenWithReuseDetection('user-uuid-1', rawToken);
    expect(result.status).toBe('VALID');
    expect(result.token?.id).toBe('token-1');
  });

  it('detects replay attack when a previously revoked token is re-submitted (status: REUSED)', async () => {
    const rawToken = 'stolen-already-revoked-token';
    const hash = await bcrypt.hash(rawToken, 10);

    prisma.refreshToken.findMany.mockResolvedValue([
      {
        id: 'token-old-revoked',
        tokenHash: hash,
        revokedAt: new Date(Date.now() - 5000), // already revoked earlier
        expiresAt: new Date(Date.now() + 100000),
      },
    ]);

    const result = await service.findTokenWithReuseDetection('user-uuid-1', rawToken);
    expect(result.status).toBe('REUSED');
    expect(result.token?.id).toBe('token-old-revoked');
  });

  it('revokes all active sessions for a user family upon breach detection', async () => {
    prisma.refreshToken.updateMany.mockResolvedValue({ count: 4 });

    await service.revokeAllUserTokens('user-uuid-1');
    expect(prisma.refreshToken.updateMany).toHaveBeenCalledWith({
      where: { userId: 'user-uuid-1', revokedAt: null },
      data: { revokedAt: expect.any(Date) },
    });
  });
});
