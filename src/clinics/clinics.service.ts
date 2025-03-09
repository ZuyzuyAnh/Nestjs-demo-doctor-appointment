import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Clinic } from './entities/clinic.entity';
import { CreateClinicDto } from './dto/createClinic.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { CustomNotFoundException } from 'src/exception/notfound.exception';
import { UpdateClinicDto } from './dto/updateCLinic.dto';
import { AddressService } from '../address/services/address.service';

@Injectable()
export class ClinicsService {
  constructor(
    @InjectRepository(Clinic)
    private readonly clinicsRepository: Repository<Clinic>,
    private readonly addressService: AddressService,
  ) {}

  async create(createClinicDto: CreateClinicDto) {
    const clinic = this.clinicsRepository.create({
      ...createClinicDto,
      address: createClinicDto.address
        ? { ...createClinicDto.address }
        : undefined,
    });

    return await this.clinicsRepository.save(clinic);
  }

  async findAll() {
    return this.clinicsRepository.find({
      relations: ['address'],
    });
  }

  async findOneById(id: number) {
    return this.clinicsRepository.findOne({
      where: { id },
      relations: ['address'],
    });
  }

  async update(id: number, updateClinicDto: UpdateClinicDto) {
    const clinic = await this.clinicsRepository.findOne({
      where: { id },
      relations: ['address'],
    });

    if (!clinic) {
      throw new CustomNotFoundException('Clinic', id);
    }

    Object.assign(clinic, updateClinicDto);

    if (updateClinicDto.address && clinic.address) {
      const addressId = clinic.address.id;
      await this.addressService.update(addressId, updateClinicDto.address);
    }

    return await this.clinicsRepository.save(clinic);
  }

  async delete(id: number) {
    const clinic = await this.clinicsRepository.findOne({
      where: { id },
    });

    if (!clinic) {
      throw new CustomNotFoundException('Clinic', id);
    }

    return await this.clinicsRepository.remove(clinic);
  }
}
