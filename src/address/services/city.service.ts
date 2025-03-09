import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CustomNotFoundException } from 'src/exception/notfound.exception';
import { City } from '../entities/city.entity';

@Injectable()
export class CityService {
  constructor(
    @InjectRepository(City)
    private readonly cityRepository: Repository<City>,
  ) {}

  async findAll() {
    return await this.cityRepository.find();
  }

  async findOne(id: number) {
    const city = await this.cityRepository.findOne({
      where: { id },
    });

    if (!city) {
      throw new CustomNotFoundException('City', id);
    }

    return city;
  }

  async findWithDistricts(id: number) {
    const city = await this.cityRepository.findOne({
      where: { id },
      relations: ['districts'],
    });

    if (!city) {
      throw new CustomNotFoundException('City', id);
    }

    return city;
  }

  async create(city: City) {
    return await this.cityRepository.save(city);
  }
}
