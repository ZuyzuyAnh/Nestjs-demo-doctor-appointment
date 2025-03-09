import { IsNotEmpty, Length } from 'class-validator';

export class CreateSpecializationDto {
  @IsNotEmpty()
  @Length(3, 50)
  name: string;

  description: string;
}
