import { Module } from '@nestjs/common';
import { AddressController } from './address.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Address } from './entities/address.entity';
import { City } from './entities/city.entity';
import { District } from './entities/district.entity';
import { AddressService } from './services/address.service';
import { AddressSeederService } from './services/address-seeder.service';
import { DistrictService } from './services/district.service';
import { CityService } from './services/city.service';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [TypeOrmModule.forFeature([Address, City, District]), HttpModule],
  controllers: [AddressController],
  providers: [
    AddressService,
    CityService,
    DistrictService,
    AddressSeederService,
  ],
  exports: [AddressService],
})
export class AddressModule {}
