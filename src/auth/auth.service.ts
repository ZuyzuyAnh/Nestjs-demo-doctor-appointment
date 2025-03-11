import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import { SignInDto } from './dto/signIn.dto';
import { JwtService } from '@nestjs/jwt';
import { TokenPayloadDto } from './dto/tokenPayload.dto';
import * as bcrypt from 'bcrypt';
import { RegisterDtO } from './dto/register.dto';
import { User } from 'src/users/entities/user.entity';
import { DuplicateFieldException } from '../exception/duplicate_field.exception';
import { ConfigService } from '@nestjs/config';
import { RefreshTokenDto } from './dto/refreshToken.dto';
import { RefreshTokenRepository } from './repositories/refresh-token.repository';
import { RefreshToken } from './entities/refresh-token.entity';
import { EmailVerificationRepository } from './repositories/email-verification.repository';
import { EmailService } from 'src/email/email.service';

@Injectable()
export class AuthService {
  private readonly entityName = 'User';

  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly refreshTokenRepository: RefreshTokenRepository,
    private readonly emailVerificationRepository: EmailVerificationRepository,
    private readonly emailService: EmailService,
  ) {}

  async signIn(signInDto: SignInDto) {
    const { email, password } = signInDto;

    const users = await this.usersService.findByEmailAndPhone(email, '');
    if (users.length === 0) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const user = users[0];

    const isPasswordMatch = await this.comparePasswords(
      password,
      user.password,
    );
    if (!isPasswordMatch) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const accessToken = await this.createAccessToken(
      new TokenPayloadDto(user.id, user.roles),
    );
    const refreshToken = await this.createRefreshToken(
      new TokenPayloadDto(user.id, user.roles),
    );

    const expiresIn =
      this.configService.get<string>('JWT_REFRESH_EXPIRATION_TIME') || '7d';
    const expiresAt = new Date();
    expiresAt.setTime(expiresAt.getTime() + parseInt(expiresIn) * 1000);

    await this.refreshTokenRepository.create({
      token: refreshToken,
      userId: user.id,
      expiresAt,
      revoked: false,
    } as RefreshToken);

    return { accessToken, refreshToken };
  }

  async register(registerDto: RegisterDtO) {
    const existingUsers = await this.usersService.findByEmailAndPhone(
      registerDto.email,
      registerDto.phoneNumber,
    );

    if (existingUsers.length > 0) {
      const existingUser = existingUsers[0];

      if (existingUser.email === registerDto.email) {
        throw new DuplicateFieldException(
          this.entityName,
          'Email',
          registerDto.email,
        );
      }

      if (existingUser.phoneNumber === registerDto.phoneNumber) {
        throw new DuplicateFieldException(
          this.entityName,
          'Phone number',
          registerDto.phoneNumber,
        );
      }
    }

    const passwordHash = await this.hashPassword(registerDto.password);

    const user = await this.usersService.create(
      new User({
        ...registerDto,
        password: passwordHash,
        isActive: false,
      }),
    );

    const verificationToken = await this.createEmailVerificationToken(user.id);

    await this.emailService.sendVerificationEmail(
      user.email,
      verificationToken,
    );

    return user;
  }

  private async createEmailVerificationToken(userId: number) {
    const verificationToken =
      await this.emailVerificationRepository.createVerificationToken(userId);

    return verificationToken;
  }

  private async createJWT(
    tokenPayload: TokenPayloadDto,
    type: 'access' | 'refresh',
  ) {
    const payload = { ...tokenPayload };

    const secret =
      type === 'access'
        ? this.configService.get<string>('JWT_ACCESS_SECRET') ||
          'default_access_secret'
        : this.configService.get<string>('JWT_REFRESH_SECRET') ||
          'default_refresh_secret';

    const expiresIn =
      type === 'access'
        ? this.configService.get<string>('JWT_EXPIRATION_TIME') || '15m'
        : this.configService.get<string>('JWT_REFRESH_EXPIRATION_TIME') || '7d';

    return await this.jwtService.signAsync(payload, { secret, expiresIn });
  }

  private async hashPassword(password: string) {
    return bcrypt.hash(password, 10);
  }

  private async comparePasswords(newPassword: string, passwordHash: string) {
    return bcrypt.compare(newPassword, passwordHash);
  }

  async createAccessToken(tokenPayload: TokenPayloadDto) {
    return await this.createJWT(tokenPayload, 'access');
  }

  async createRefreshToken(tokenPayload: TokenPayloadDto) {
    return await this.createJWT(tokenPayload, 'refresh');
  }

  private async verifyRefreshToken(
    refreshToken: string,
  ): Promise<TokenPayloadDto> {
    const payload =
      await this.jwtService.verifyAsync<TokenPayloadDto>(refreshToken);
    return payload;
  }

  async refreshToken(refreshTokenDto: RefreshTokenDto) {
    try {
      const { refreshToken } = refreshTokenDto;

      const storedToken =
        await this.refreshTokenRepository.findByToken(refreshToken);
      if (
        !storedToken ||
        storedToken.revoked ||
        storedToken.expiresAt < new Date()
      ) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      const payload = await this.verifyRefreshToken(refreshToken);

      const newAccessToken = await this.createAccessToken(
        new TokenPayloadDto(payload.id, payload.role),
      );

      await this.refreshTokenRepository.revokeToken(storedToken.id);

      const newRefreshToken = await this.createRefreshToken(
        new TokenPayloadDto(payload.id, payload.role),
      );

      const expiresIn =
        this.configService.get<string>('JWT_REFRESH_EXPIRATION_TIME') || '7d';
      const expiresAt = new Date();
      expiresAt.setTime(expiresAt.getTime() + parseInt(expiresIn) * 1000);

      await this.refreshTokenRepository.create({
        token: newRefreshToken,
        userId: payload.id,
        expiresAt,
        revoked: false,
      } as RefreshToken);

      return {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
      };
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async logout(userId: number): Promise<void> {
    await this.refreshTokenRepository.deleteByUserId(userId);
  }

  async verifyEmail(token: string): Promise<boolean> {
    const verification =
      await this.emailVerificationRepository.findByToken(token);

    if (
      !verification ||
      verification.used ||
      verification.expiresAt < new Date()
    ) {
      return false;
    }

    await this.emailVerificationRepository.markAsUsed(verification.id);

    await this.usersService.activateUser(verification.userId);

    return true;
  }
}
