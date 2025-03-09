import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CustomNotFoundException } from 'src/exception/notfound.exception';
import { District } from '../entities/district.entity';

@Injectable()
export class DistrictService {
  constructor(
    @InjectRepository(District)
    private districtRepository: Repository<District>,
  ) {}

  async findAll() {
    return this.districtRepository.find({
      relations: ['city'],
    });
  }

  async findOne(id: number) {
    const district = await this.districtRepository.findOne({
      where: { id },
      relations: ['city'],
    });

    if (!district) {
      throw new CustomNotFoundException('District', id);
    }

    return district;
  }

  async findByCity(cityId: number) {
    return this.districtRepository.find({
      where: { city: { id: cityId } },
      relations: ['city'],
    });
  }
}
