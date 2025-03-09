import { IsNotEmpty, IsNumber, IsString, MaxLength } from 'class-validator';

export class CreateAddressDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  streetAddress: string;

  @IsNotEmpty()
  @IsNumber()
  districtId: number;
}
