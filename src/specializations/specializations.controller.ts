import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  Query,
} from '@nestjs/common';
import { SpecializationsService } from './specializations.service';
import { CreateSpecializationDto } from './dto/create-specialization.dto';
import { UpdateSpecializationDto } from './dto/update-specialization.dto';
import { AdminOnly } from '../auth/decorator/auth.decorator';

@Controller('specializations')
export class SpecializationsController {
  constructor(
    private readonly specializationsService: SpecializationsService,
  ) {}

  @Post()
  @AdminOnly()
  create(@Body() createSpecializationDto: CreateSpecializationDto) {
    return this.specializationsService.create(createSpecializationDto);
  }

  @Get()
  @AdminOnly()
  findAll(
    @Query('page', ParseIntPipe) page: number = 1,
    @Query('limit', ParseIntPipe) limit: number = 10,
  ) {
    return this.specializationsService.findAll(page, limit);
  }

  @Get(':id')
  @AdminOnly()
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.specializationsService.findOne(id);
  }

  @Patch(':id')
  @AdminOnly()
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateSpecializationDto: UpdateSpecializationDto,
  ) {
    return this.specializationsService.update(id, updateSpecializationDto);
  }

  @Delete(':id')
  @AdminOnly()
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.specializationsService.remove(id);
  }
}
