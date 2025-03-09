import { Role } from 'src/users/entities/role.enum';

export class TokenPayloadDto {
  id: number;
  role: Role[];

  constructor(id: number, role: Role[]) {
    this.id = id;
    this.role = role;
  }
}
