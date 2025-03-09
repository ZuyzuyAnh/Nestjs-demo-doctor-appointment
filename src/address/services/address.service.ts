import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { CustomNotFoundException } from 'src/exception/notfound.exception';
import { Address } from '../entities/address.entity';
import { District } from '../entities/district.entity';
import { CreateAddressDto } from '../dto/createAddress.dto';
import { UpdateAddressDto } from '../dto/updateAddress.dto';

@Injectable()
export class AddressService {
  constructor(
    @InjectRepository(Address)
    private readonly addressRepository: Repository<Address>,

    @InjectRepository(District)
    private readonly districtRepository: Repository<District>,
  ) {}

  async create(createAddressDto: CreateAddressDto) {
    const address = this.addressRepository.create(createAddressDto);
    return await this.addressRepository.save(address);
  }

  async getByClinic(clinicId: number) {
    return this.addressRepository.find({
      where: { clinic: { id: clinicId } },
    });
  }

  async update(id: number, updateAddressDto: UpdateAddressDto) {
    const address = await this.addressRepository.findOne({
      where: { id },
    });

    if (!address) {
      throw new CustomNotFoundException('Address', id);
    }

    if (updateAddressDto.districtId) {
      const district = await this.districtRepository.findOneBy({
        id: updateAddressDto.districtId,
      });

      if (!district) {
        throw new CustomNotFoundException(
          'District',
          updateAddressDto.districtId,
        );
      }

      address.district = district;

      delete updateAddressDto.districtId;
    }

    Object.assign(address, updateAddressDto);

    return await this.addressRepository.save(address);
  }
}
