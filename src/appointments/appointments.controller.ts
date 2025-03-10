import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Req,
  Query,
  ParseIntPipe,
} from '@nestjs/common';
import { AppointmentsService } from './appointments.service';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';
import { TokenPayloadDto } from '../auth/dto/tokenPayload.dto';

@Controller('appointments')
export class AppointmentsController {
  constructor(private readonly appointmentsService: AppointmentsService) {}

  @Post()
  create(
    @Req() request: Request,
    @Body() createAppointmentDto: CreateAppointmentDto,
  ) {
    const payload = request['user'] as TokenPayloadDto;
    return this.appointmentsService.create(payload, createAppointmentDto);
  }

  @Get()
  findAll(
    @Req() request: Request,
    @Query('page', ParseIntPipe) page: number = 1,
    @Query('limit', ParseIntPipe) limit: number = 10,
  ) {
    const payload = request['user'] as TokenPayloadDto;
    return this.appointmentsService.findAll(payload, page, limit);
  }

  @Get(':id')
  findOne(@Req() request: Request, @Param('id') id: string) {
    const payload = request['user'] as TokenPayloadDto;
    return this.appointmentsService.findOne(payload, +id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.appointmentsService.remove(+id);
  }
}
