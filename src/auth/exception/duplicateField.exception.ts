import { ConflictException } from '@nestjs/common';

export class DuplicateFieldException extends ConflictException {
  constructor(field: string, value: string) {
    super(`User with ${field} "${value}" already exists`);
  }
}
