import { PartialType } from '@nestjs/mapped-types';
import { ToDoctorDto } from './to-doctor.dto';

export class UpdateDoctorDto extends PartialType(ToDoctorDto) {}
