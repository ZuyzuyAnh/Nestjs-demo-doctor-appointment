import { Body, Controller, Post } from '@nestjs/common';
import { ClinicsService } from './clinics.service';
import { AdminOnly } from 'src/auth/decorator/auth.decorator';
import { CreateClinicDto } from './dto/createClinic.dto';

@Controller('clinics')
export class ClinicsController {
  constructor(private readonly clinicsService: ClinicsService) {}

  @Post()
  @AdminOnly()
  create(@Body() createClinicDto: CreateClinicDto) {
    return this.clinicsService.create(createClinicDto);
  }
}
