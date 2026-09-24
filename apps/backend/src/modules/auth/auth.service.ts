import {
  Injectable,
  UnauthorizedException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../database/prisma.service';
import { TokenService } from './token.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private tokenService: TokenService,
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
   * Issues access + refresh token pair.
   * Stores hashed refresh token in DB for revocation support.
   */
  async login(user: any, ipAddress?: string, userAgent?: string) {
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
      user: this.sanitizeUser(user),
    };
  }

  /**
   * Refreshes an access token using a valid refresh token.
   */
  async refresh(refreshToken: string, ipAddress?: string, userAgent?: string) {
    const payload = await this.tokenService.verifyRefreshToken(refreshToken);

    const storedToken = await this.tokenService.findAndValidateRefreshToken(
      payload.sub,
      refreshToken,
    );

    if (!storedToken) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    // Rotate: revoke old, issue new pair
    await this.tokenService.revokeRefreshToken(storedToken.id);

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
