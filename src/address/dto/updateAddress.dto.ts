import {} from 'class-transformer';
import { IsOptional, IsString } from 'class-validator';

export class UpdateAddressDto {
  @IsOptional()
  @IsString()
  streetAddress?: string;

  @IsOptional()
  districtId?: number;
}
