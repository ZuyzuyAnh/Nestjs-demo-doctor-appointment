import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Request,
  Get,
  Query,
  BadRequestException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignInDto } from './dto/signIn.dto';
import { Public } from './decorator/auth.decorator';
import { RegisterDtO } from './dto/register.dto';
import { RefreshTokenDto } from './dto/refreshToken.dto';
import { TokenPayloadDto } from './dto/tokenPayload.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @HttpCode(HttpStatus.OK)
  @Post('login')
  @Public()
  signIn(@Body() signInDto: SignInDto) {
    return this.authService.signIn(signInDto);
  }

  @Post('register')
  @Public()
  register(@Body() registerDto: RegisterDtO) {
    return this.authService.register(registerDto);
  }

  @Post('refresh-token')
  @Public()
  refreshToken(@Body() refreshTokenDto: RefreshTokenDto) {
    return this.authService.refreshToken(refreshTokenDto);
  }

  @Post('logout')
  async logout(@Request() req: Request) {
    const payload = req['user'] as TokenPayloadDto;
    await this.authService.logout(payload.id);
    return { message: 'Logged out successfully' };
  }

  @Get('verify-email')
  @Public()
  async verifyEmail(@Query('token') token: string) {
    const verified = await this.authService.verifyEmail(token);

    if (!verified) {
      throw new BadRequestException('Invalid or expired verification token');
    }

    return { message: 'Email verified successfully. You can now log in.' };
  }
}
