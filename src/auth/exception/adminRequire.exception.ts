import { UnauthorizedException } from '@nestjs/common';

export class RoleAdminRequiredException extends UnauthorizedException {
  constructor() {
    super('Admin role required');
  }
}
