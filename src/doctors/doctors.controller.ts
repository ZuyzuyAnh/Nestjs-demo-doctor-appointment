import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  Patch,
  Delete,
  ParseIntPipe,
} from '@nestjs/common';
import { DoctorsService } from './doctors.service';
import { ToDoctorDto } from './dto/to-doctor.dto';
import { UpdateDoctorDto } from './dto/update-doctor.dto';

@Controller('doctors')
export class DoctorsController {
  constructor(private readonly doctorsService: DoctorsService) {}

  @Post('to-doctor/:userId')
  create(
    @Param('userId', ParseIntPipe) userId: number,
    @Body() toDoctorDto: ToDoctorDto,
  ) {
    return this.doctorsService.fromUserToDoctor(userId, toDoctorDto);
  }

  @Get()
  findAll(
    @Query('page', ParseIntPipe) page: number,
    @Query('limit', ParseIntPipe) limit: number,
    @Query('specializationId') specializationId?: number,
    @Query('clinicId') clinicId?: number,
  ) {
    return this.doctorsService.findAll(page, limit, specializationId, clinicId);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.doctorsService.findOneById(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDoctorDto: UpdateDoctorDto,
  ) {
    return this.doctorsService.updateDoctor(id, updateDoctorDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.doctorsService.deleteDoctor(id);
  }
}
