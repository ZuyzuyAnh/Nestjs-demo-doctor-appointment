import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import { SignInDto } from './dto/signIn.dto';
import { JwtService } from '@nestjs/jwt';
import { TokenPayloadDto } from './dto/tokenPayload.dto';
import * as bcrypt from 'bcrypt';
import { RegisterDTO } from './dto/register.dto';
import { User } from 'src/users/entities/user.entity';
import { DuplicateFieldException } from './exception/duplicateField.exception';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
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

    const tokenPayload = new TokenPayloadDto(user.id, user.roles);
    const token = await this.createJWT(tokenPayload);

    return { token };
  }

  async register(registerDto: RegisterDTO) {
    const existingUsers = await this.usersService.findByEmailAndPhone(
      registerDto.email,
      registerDto.phoneNumber,
    );

    if (existingUsers.length > 0) {
      const existingUser = existingUsers[0];

      if (existingUser.email === registerDto.email) {
        throw new DuplicateFieldException('Email', registerDto.email);
      }

      if (existingUser.phoneNumber === registerDto.phoneNumber) {
        throw new DuplicateFieldException(
          'Phone number',
          registerDto.phoneNumber,
        );
      }
    }

    const passwordHash = await this.hashPassword(registerDto.password);

    const user = await this.usersService.create(
      new User({ ...registerDto, password: passwordHash }),
    );

    return user;
  }

  private async createJWT(tokenPayload: TokenPayloadDto) {
    const payload = { ...tokenPayload };
    return await this.jwtService.signAsync(payload);
  }

  private async hashPassword(password: string) {
    return bcrypt.hash(password, 10);
  }

  private async comparePasswords(newPassword: string, passwordHash: string) {
    return bcrypt.compare(newPassword, passwordHash);
  }
}
