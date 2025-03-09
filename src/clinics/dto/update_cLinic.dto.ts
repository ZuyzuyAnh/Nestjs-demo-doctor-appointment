import { PartialType } from '@nestjs/mapped-types';
import { CreateClinicDto } from './create_clinic.dto';

export class Update_cLinicDto extends PartialType(CreateClinicDto) {}
