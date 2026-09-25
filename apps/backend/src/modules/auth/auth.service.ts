import {
  Injectable,
  UnauthorizedException,
  ForbiddenException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../database/prisma.service';
import { TokenService } from './token.service';
import { LoginDto, RegisterDto } from './dto';
import { generateTotpSecret, generateTotpUri, verifyTotpToken } from './mfa/totp.util';

export const MFA_MANDATORY_ROLES = [
  'super_admin',
  'finance',
  'operations_manager',
  'research_manager',
];

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private tokenService: TokenService,
    private jwtService: JwtService,
    private config: ConfigService,
  ) {}

  /**
   * Validates user credentials (used by LocalStrategy).
   * Returns the user without passwordHash.
   */
  async validateUser(email: string, password: string) {
    const user = await this.prisma.user.findFirst({
      where: { email: email.toLowerCase(), deletedAt: null },
      include: {
        role: {
          include: {
            rolePermissions: { include: { permission: true } },
          },
        },
      },
    });

    if (!user) throw new UnauthorizedException('Invalid credentials');
    if (!user.isActive) throw new ForbiddenException('Account is deactivated');

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) throw new UnauthorizedException('Invalid credentials');

    // Update last login
    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    const { passwordHash: _, ...safeUser } = user;
    return safeUser;
  }

  /**
   * Issues access + refresh token pair or challenges for MFA if role requires it.
   * Stores hashed refresh token in DB for revocation support.
   */
  async login(user: any, ipAddress?: string, userAgent?: string) {
    const roleName = user.role?.name;
    const isMfaMandatory = MFA_MANDATORY_ROLES.includes(roleName);

    // If role requires MFA and it has not been verified in this session
    if (isMfaMandatory && !user.mfaVerifiedSession) {
      if (!user.mfaEnabled) {
        // First-time MFA setup
        const secret = generateTotpSecret();
        await this.prisma.user.update({
          where: { id: user.id },
          data: { mfaSecret: secret },
        });

        const setupToken = await this.jwtService.signAsync(
          { sub: user.id, type: 'mfa_setup' },
          { secret: this.config.get<string>('jwt.accessSecret'), expiresIn: '15m' },
        );

        return {
          mfaSetupRequired: true,
          setupToken,
          secret,
          qrUri: generateTotpUri(secret, user.email),
          message: 'Multi-Factor Authentication (MFA) is mandatory for high-privilege roles. Please configure an authenticator app.',
          user: this.sanitizeUser(user),
        };
      } else {
        // MFA challenge required
        const mfaChallengeToken = await this.jwtService.signAsync(
          { sub: user.id, type: 'mfa_challenge' },
          { secret: this.config.get<string>('jwt.accessSecret'), expiresIn: '5m' },
        );

        return {
          mfaRequired: true,
          mfaChallengeToken,
          message: 'MFA challenge: enter 6-digit TOTP code from your authenticator app.',
          user: this.sanitizeUser(user),
        };
      }
    }

    const [accessToken, refreshToken] = await Promise.all([
      this.tokenService.generateAccessToken(user),
      this.tokenService.generateRefreshToken(user),
    ]);

    await this.tokenService.storeRefreshToken(
      user.id,
      refreshToken,
      ipAddress,
      userAgent,
    );

    return {
      accessToken,
      refreshToken,
      mustResetPassword: user.mustResetPassword || false,
      user: this.sanitizeUser(user),
    };
  }

  async enableMfa(setupToken: string, code: string, ipAddress?: string, userAgent?: string) {
    let payload: any;
    try {
      payload = await this.jwtService.verifyAsync(setupToken, {
        secret: this.config.get<string>('jwt.accessSecret'),
      });
    } catch {
      throw new UnauthorizedException('Invalid or expired MFA setup token');
    }

    if (payload.type !== 'mfa_setup') {
      throw new UnauthorizedException('Invalid token type');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      include: { role: { include: { rolePermissions: { include: { permission: true } } } } },
    });

    if (!user || !user.mfaSecret) {
      throw new UnauthorizedException('MFA setup not initialized for user');
    }

    const isValid = verifyTotpToken(code, user.mfaSecret);
    if (!isValid) {
      throw new UnauthorizedException('Invalid 6-digit verification code. Please check your authenticator.');
    }

    await this.prisma.user.update({
      where: { id: user.id },
      data: { mfaEnabled: true },
    });

    const safeUser = { ...user, mfaVerifiedSession: true };
    return this.login(safeUser, ipAddress, userAgent);
  }

  async verifyMfa(mfaChallengeToken: string, code: string, ipAddress?: string, userAgent?: string) {
    let payload: any;
    try {
      payload = await this.jwtService.verifyAsync(mfaChallengeToken, {
        secret: this.config.get<string>('jwt.accessSecret'),
      });
    } catch {
      throw new UnauthorizedException('Invalid or expired MFA challenge token');
    }

    if (payload.type !== 'mfa_challenge') {
      throw new UnauthorizedException('Invalid token type');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      include: { role: { include: { rolePermissions: { include: { permission: true } } } } },
    });

    if (!user || !user.mfaSecret || !user.mfaEnabled) {
      throw new UnauthorizedException('MFA not configured for user');
    }

    const isValid = verifyTotpToken(code, user.mfaSecret);
    if (!isValid) {
      throw new UnauthorizedException('Invalid 6-digit MFA verification code');
    }

    const safeUser = { ...user, mfaVerifiedSession: true };
    return this.login(safeUser, ipAddress, userAgent);
  }

  async changePassword(userId: string, currentPassword: string, newPassword: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    const isMatch = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isMatch) throw new UnauthorizedException('Current password does not match');

    const newHash = await bcrypt.hash(newPassword, 12);
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        passwordHash: newHash,
        mustResetPassword: false,
      },
    });

    // Invalidate all tokens so that old sessions terminate immediately
    await this.tokenService.revokeAllUserTokens(userId);

    return { message: 'Password changed successfully. Please log in with your new password.' };
  }

  /**
   * Refreshes an access token using a valid refresh token.
   * Enforces RFC 6819 Token Rotation with Reuse Detection.
   * If an old, revoked token is re-submitted, the entire session family is revoked immediately.
   */
  async refresh(refreshToken: string, ipAddress?: string, userAgent?: string) {
    const payload = await this.tokenService.verifyRefreshToken(refreshToken);

    const result = await this.tokenService.findTokenWithReuseDetection(
      payload.sub,
      refreshToken,
    );

    if (result.status === 'REUSED') {
      // SECURITY COMPROMISE: Attempt to reuse an already-revoked refresh token.
      // Revoke all tokens for this user immediately (session family revocation).
      await this.tokenService.revokeAllUserTokens(payload.sub);

      // Record high-severity security audit log
      try {
        await this.prisma.auditLog.create({
          data: {
            userId: payload.sub,
            action: 'security.refresh_token_reuse_detected',
            entity: 'RefreshToken',
            entityId: result.token?.id || 'unknown',
            ipAddress: ipAddress || 'unknown',
            userAgent: userAgent || 'unknown',
            metadata: {
              severity: 'CRITICAL',
              message: 'Token reuse detected; all user sessions have been terminated.',
            },
          },
        });
      } catch (err) {
        // Continue even if audit fails
      }

      throw new UnauthorizedException(
        'Security alert: refresh token reuse detected. All sessions have been revoked.',
      );
    }

    if (result.status !== 'VALID' || !result.token) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    // Rotate: Revoke the used token immediately
    await this.tokenService.revokeRefreshToken(result.token.id);

    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      include: { role: { include: { rolePermissions: { include: { permission: true } } } } },
    });

    if (!user || !user.isActive || user.deletedAt) {
      throw new UnauthorizedException('User account is no longer active');
    }

    const { passwordHash: _, ...safeUser } = user;
    return this.login(safeUser, ipAddress, userAgent);
  }

  /**
   * Revokes a refresh token (logout).
   */
  async logout(userId: string, refreshToken: string) {
    const token = await this.tokenService.findAndValidateRefreshToken(userId, refreshToken);
    if (token) {
      await this.tokenService.revokeRefreshToken(token.id);
    }
    return { message: 'Logged out successfully' };
  }

  /**
   * Registers a new client user account.
   * Staff accounts are created by admins via the users module.
   */
  async registerClient(dto: RegisterDto) {
    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
    });
    if (existing) throw new ConflictException('An account with this email already exists');

    const clientRole = await this.prisma.role.findUnique({ where: { name: 'client' } });
    if (!clientRole) throw new Error('Client role not found — ensure the database is seeded');

    const passwordHash = await bcrypt.hash(dto.password, 12);

    const user = await this.prisma.user.create({
      data: {
        email: dto.email.toLowerCase(),
        passwordHash,
        firstName: dto.firstName,
        lastName: dto.lastName,
        phone: dto.phone,
        roleId: clientRole.id,
        clientProfile: {
          create: {
            organization: dto.organization,
            fieldOfStudy: dto.fieldOfStudy,
          },
        },
      },
      include: { role: true },
    });

    const { passwordHash: _, ...safeUser } = user;
    return safeUser;
  }

  private sanitizeUser(user: any) {
    const { passwordHash: _, ...safe } = user;
    return safe;
  }
}
