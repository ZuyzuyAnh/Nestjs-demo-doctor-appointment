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
import { RoleAdminRequiredException } from '../exception/admin_require.exception';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest<Request>();

    if (this.isPublicRoute(context)) {
      return true;
    }

    const token = this.extractTokenFromHeader(request);
    if (!token) {
      throw new UnauthorizedException('Unauthorized');
    }

    const payload = await this.verifyToken(token);
    request['user'] = payload;

    if (this.isAdminRoute(context) && !this.isAdmin(payload)) {
      throw new RoleAdminRequiredException();
    }

    return true;
  }

  private isPublicRoute(context: ExecutionContext): boolean {
    return this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }

  private async verifyToken(token: string): Promise<TokenPayloadDto> {
    try {
      return await this.jwtService.verifyAsync(token, {
        secret: process.env.JWT_SECRET,
      });
    } catch {
      throw new UnauthorizedException('Unauthorized');
    }
  }

  private isAdminRoute(context: ExecutionContext): boolean {
    return this.reflector.getAllAndOverride<boolean>(IS_ADMIN_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
  }

  private isAdmin(payload: TokenPayloadDto): boolean {
    const userRoles = payload.role || [];
    return userRoles.includes(Role.Admin);
  }
}
