import { Type } from 'class-transformer';
import { IsNotEmpty, IsOptional, ValidateNested } from 'class-validator';
import { CreateAddressDto } from 'src/address/dto/createAddress.dto';

export class CreateClinicDto {
  @IsNotEmpty()
  name: string;

  @IsNotEmpty()
  @IsOptional()
  @ValidateNested()
  @Type(() => CreateAddressDto)
  address: CreateAddressDto;

  @IsNotEmpty()
  phone: string;

  @IsNotEmpty()
  email: string;
}
