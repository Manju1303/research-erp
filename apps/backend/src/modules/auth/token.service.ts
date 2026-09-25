import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class TokenService {
  constructor(
    private jwtService: JwtService,
    private config: ConfigService,
    private prisma: PrismaService,
  ) {}

  async generateAccessToken(user: { id: string; email: string; role: { name: string } }) {
    return this.jwtService.signAsync(
      {
        sub: user.id,
        email: user.email,
        role: user.role.name,
      },
      {
        secret: this.config.get<string>('jwt.accessSecret'),
        expiresIn: this.config.get<string>('jwt.accessExpiresIn'),
      },
    );
  }

  async generateRefreshToken(user: { id: string }) {
    return this.jwtService.signAsync(
      { sub: user.id },
      {
        secret: this.config.get<string>('jwt.refreshSecret'),
        expiresIn: this.config.get<string>('jwt.refreshExpiresIn'),
      },
    );
  }

  async storeRefreshToken(
    userId: string,
    rawToken: string,
    ipAddress?: string,
    userAgent?: string,
  ) {
    const tokenHash = await bcrypt.hash(rawToken, 10);
    const expiresAt = new Date(
      Date.now() + (this.config.get<number>('jwt.refreshExpiresInMs') ?? 604800000),
    );

    return this.prisma.refreshToken.create({
      data: { userId, tokenHash, expiresAt, ipAddress, userAgent },
    });
  }

  async verifyRefreshToken(token: string): Promise<{ sub: string }> {
    try {
      return await this.jwtService.verifyAsync<{ sub: string }>(token, {
        secret: this.config.get<string>('jwt.refreshSecret'),
      });
    } catch {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
  }

  async findTokenWithReuseDetection(userId: string, rawToken: string) {
    const allTokens = await this.prisma.refreshToken.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    for (const token of allTokens) {
      const isMatch = await bcrypt.compare(rawToken, token.tokenHash);
      if (isMatch) {
        if (token.revokedAt !== null) {
          return { status: 'REUSED' as const, token };
        }
        if (token.expiresAt <= new Date()) {
          return { status: 'EXPIRED' as const, token };
        }
        return { status: 'VALID' as const, token };
      }
    }

    return { status: 'NOT_FOUND' as const, token: null };
  }

  async findAndValidateRefreshToken(userId: string, rawToken: string) {
    const result = await this.findTokenWithReuseDetection(userId, rawToken);
    return result.status === 'VALID' ? result.token : null;
  }

  async revokeRefreshToken(tokenId: string) {
    return this.prisma.refreshToken.update({
      where: { id: tokenId },
      data: { revokedAt: new Date() },
    });
  }

  async revokeAllUserTokens(userId: string) {
    return this.prisma.refreshToken.updateMany({
      where: { userId, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }
}
