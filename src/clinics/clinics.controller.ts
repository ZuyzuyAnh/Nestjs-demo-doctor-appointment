import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
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

  @Get()
  findAll(
    @Query('page', ParseIntPipe) page: number = 1,
    @Query('limit', ParseIntPipe) limit: number = 10,
    @Query('districtId', ParseIntPipe) districtId: number,
    @Query('cityId', ParseIntPipe) cityId?: number,
  ) {
    {
      return this.clinicsService.findAll(page, limit, districtId, cityId);
    }
  }

  @Patch(':id')
  @AdminOnly()
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateClinicDto: CreateClinicDto,
  ) {
    return this.clinicsService.update(id, updateClinicDto);
  }

  @Get(':id')
  @AdminOnly()
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.clinicsService.findOneById(id);
  }

  @Delete(':id')
  @AdminOnly()
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.clinicsService.delete(id);
  }
}
