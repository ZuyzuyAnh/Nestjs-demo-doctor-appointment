import { PartialType } from '@nestjs/mapped-types';
import { CreateClinicDto } from './createClinic.dto';

export class UpdateClinicDto extends PartialType(CreateClinicDto) {}
