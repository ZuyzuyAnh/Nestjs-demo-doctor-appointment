/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { IS_ADMIN_KEY, IS_PUBLIC_KEY } from './decorator/auth.decorator';
import { Reflector } from '@nestjs/core';
import { Role } from 'src/users/entities/role.enum';
import { TokenPayloadDto } from './dto/tokenPayload.dto';
import { RoleAdminRequiredException } from './exception/adminRequire.exception';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext) {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest<Request>();
    const token = this.extractTokenFromHeader(request);

    if (!token) {
      throw new UnauthorizedException('Unauthorized');
    }

    try {
      const payload: TokenPayloadDto = await this.jwtService.verifyAsync(
        token,
        {
          secret: process.env.JWT_SECRET,
        },
      );

      request['user'] = payload;

      const isAdminRequired = this.reflector.getAllAndOverride<boolean>(
        IS_ADMIN_KEY,
        [context.getHandler(), context.getClass()],
      );

      if (isAdminRequired) {
        const userRoles = payload.role || [];
        const isAdmin = userRoles.includes(Role.Admin);

        if (!isAdmin) {
          throw new RoleAdminRequiredException();
        }
      }
    } catch {
      throw new UnauthorizedException('Unauthorized');
    }

    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
