import { Injectable } from '@nestjs/common';
import { CreateSpecializationDto } from './dto/create-specialization.dto';
import { UpdateSpecializationDto } from './dto/update-specialization.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Specialization } from './entities/specialization.entity';
import { Repository } from 'typeorm';
import { DuplicateFieldException } from '../exception/duplicateField.exception';
import { PaginationResponseDto } from '../utils/pagination.response.dto';
import { CustomNotFoundException } from '../exception/notfound.exception';

@Injectable()
export class SpecializationsService {
  private readonly entityName = 'Specialization';

  constructor(
    @InjectRepository(Specialization)
    private readonly specializationRepository: Repository<Specialization>,
  ) {}

  async create(createSpecializationDto: CreateSpecializationDto) {
    const existingSpecialization =
      await this.specializationRepository.findOneBy({
        name: createSpecializationDto.name,
      });

    if (existingSpecialization) {
      throw new DuplicateFieldException(
        this.entityName,
        'name',
        existingSpecialization.name,
      );
    }

    const specialization = this.specializationRepository.create(
      createSpecializationDto,
    );

    return await this.specializationRepository.save(specialization);
  }

  async findAll(page: number, limit: number) {
    const [result, total] = await this.specializationRepository.findAndCount({
      skip: (page - 1) * limit,
      take: limit,
    });

    return new PaginationResponseDto(page, limit, result, total);
  }

  async findOne(id: number) {
    const specialization = await this.specializationRepository.findOneBy({
      id,
    });

    if (!specialization) {
      throw new CustomNotFoundException(this.entityName, id);
    }

    return specialization;
  }

  async update(id: number, updateSpecializationDto: UpdateSpecializationDto) {
    const specialization = await this.specializationRepository.findOneBy({
      id,
    });

    if (!specialization) {
      throw new CustomNotFoundException(this.entityName, id);
    }

    return await this.specializationRepository.save({
      ...specialization,
      ...updateSpecializationDto,
    });
  }

  async remove(id: number) {
    const specialization = await this.specializationRepository.findOneBy({
      id,
    });

    if (!specialization) {
      throw new CustomNotFoundException(this.entityName, id);
    }

    await this.specializationRepository.delete(id);
  }
}
