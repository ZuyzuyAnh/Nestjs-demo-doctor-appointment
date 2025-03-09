import { NotFoundException } from '@nestjs/common';

export class CustomNotFoundException extends NotFoundException {
  constructor(entity: string, id: number) {
    super(`${entity} with ID ${id} not found`);
  }
}
