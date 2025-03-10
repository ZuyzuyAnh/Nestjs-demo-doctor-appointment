import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Req,
  Query,
  ParseIntPipe,
  Patch,
} from '@nestjs/common';
import { AppointmentsService } from './appointments.service';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { TokenPayloadDto } from '../auth/dto/tokenPayload.dto';
import AppointmentStatus from './entities/apoointment-status.enum';
import { AdminOnly } from '../auth/decorator/auth.decorator';

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
    @Query('status') status?: AppointmentStatus,
    @Query('startDate') startDate?: Date,
    @Query('endDate') endDate?: Date,
  ) {
    const payload = request['user'] as TokenPayloadDto;
    return this.appointmentsService.findAll(
      payload,
      page,
      limit,
      status,
      startDate,
      endDate,
    );
  }

  @Patch(':id')
  cancel(@Req() request: Request, @Param('id', ParseIntPipe) id: number) {
    const payload = request['user'] as TokenPayloadDto;
    return this.appointmentsService.cancelAppointment(payload, id);
  }

  @Delete(':id')
  @AdminOnly()
  remove(@Param('id') id: string) {
    return this.appointmentsService.remove(+id);
  }
}
