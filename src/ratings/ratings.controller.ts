import {
  Controller,
  Post,
  Body,
  Param,
  Get,
  Req,
  ParseIntPipe,
} from '@nestjs/common';
import { RatingsService } from './ratings.service';
import { CreateRatingDto } from './dto/create-rating.dto';
import { Request } from 'express';
import { TokenPayloadDto } from '../auth/dto/tokenPayload.dto';

@Controller('ratings')
export class RatingsController {
  constructor(private readonly ratingsService: RatingsService) {}

  @Post(':doctorId')
  create(
    @Req() request: Request,
    @Param('doctorId', ParseIntPipe) doctorId: number,
    @Body() createRatingDto: CreateRatingDto,
  ) {
    const payload = request['user'] as TokenPayloadDto;
    return this.ratingsService.create(payload.id, doctorId, createRatingDto);
  }

  @Get('doctor/:doctorId')
  findAllByDoctor(@Param('doctorId', ParseIntPipe) doctorId: number) {
    return this.ratingsService.findAllByDoctor(doctorId);
  }
}
