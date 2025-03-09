import { ConflictException } from '@nestjs/common';

export class DuplicateFieldException extends ConflictException {
  constructor(entity: string, field: string, value: string) {
    super(`${entity} with ${field} "${value}" already exists`);
  }
}
