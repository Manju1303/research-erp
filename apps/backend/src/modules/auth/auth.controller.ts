import {
  Controller,
  Post,
  Body,
  UseGuards,
  Req,
  Get,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Throttle } from '@nestjs/throttler';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { Request } from 'express';
import { AuthService } from './auth.service';
import { LoginDto, RefreshTokenDto, LogoutDto, RegisterDto } from './dto';
import { Public } from '../../common/decorators/public.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard('local'))
  @Throttle({ short: { limit: 5, ttl: 60000 } }) // 5 login attempts/min
  @ApiOperation({ summary: 'Login with email and password' })
  @ApiResponse({ status: 200, description: 'Returns access + refresh tokens' })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  async login(@Req() req: Request, @Body() _dto: LoginDto) {
    const user = (req as any).user;
    return this.authService.login(user, req.ip, req.headers['user-agent']);
  }

  @Public()
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @Throttle({ short: { limit: 3, ttl: 60000 } }) // 3 registrations/min
  @ApiOperation({ summary: 'Register a new client account' })
  @ApiResponse({ status: 201, description: 'Client account created' })
  @ApiResponse({ status: 409, description: 'Email already in use' })
  async register(@Body() dto: RegisterDto) {
    return this.authService.registerClient(dto);
  }

  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Refresh access token using refresh token' })
  async refresh(@Body() dto: RefreshTokenDto, @Req() req: Request) {
    return this.authService.refresh(dto.refreshToken, req.ip, req.headers['user-agent']);
  }

  @Public()
  @Post('mfa/enable')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Complete MFA enrollment with 6-digit verification code' })
  @ApiResponse({ status: 200, description: 'MFA enabled and session authenticated' })
  async enableMfa(
    @Body() dto: { setupToken: string; code: string },
    @Req() req: Request,
  ) {
    return this.authService.enableMfa(dto.setupToken, dto.code, req.ip, req.headers['user-agent']);
  }

  @Public()
  @Post('mfa/verify')
  @HttpCode(HttpStatus.OK)
  @Throttle({ short: { limit: 5, ttl: 60000 } })
  @ApiOperation({ summary: 'Verify MFA challenge during high-privilege login' })
  @ApiResponse({ status: 200, description: 'MFA verified and session authenticated' })
  async verifyMfa(
    @Body() dto: { mfaChallengeToken: string; code: string },
    @Req() req: Request,
  ) {
    return this.authService.verifyMfa(dto.mfaChallengeToken, dto.code, req.ip, req.headers['user-agent']);
  }

  @Post('change-password')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Change or reset account password' })
  async changePassword(
    @CurrentUser('id') userId: string,
    @Body() dto: { currentPassword: string; newPassword: string },
  ) {
    return this.authService.changePassword(userId, dto.currentPassword, dto.newPassword);
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Revoke refresh token and logout' })
  async logout(
    @CurrentUser('id') userId: string,
    @Body() dto: LogoutDto,
  ) {
    return this.authService.logout(userId, dto.refreshToken);
  }

  @Get('me')
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Get current authenticated user profile' })
  async me(@CurrentUser() user: any) {
    return user;
  }
}
