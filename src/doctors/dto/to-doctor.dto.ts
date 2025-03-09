import { IsNotEmpty, Length } from 'class-validator';

export class ToDoctorDto {
  @IsNotEmpty()
  @Length(3, 50)
  workingHours: string;

  @Length(0, 255)
  biography: string;
}
