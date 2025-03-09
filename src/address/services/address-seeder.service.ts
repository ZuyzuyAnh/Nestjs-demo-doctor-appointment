import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { CityService } from './city.service';
import { DistrictService } from './district.service';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { City } from '../entities/city.entity';
import { DataSource } from 'typeorm';
import { District } from '../entities/district.entity';
import { CityResponseDto } from '../dto/city-response.dto';
import { DistrictResponseDto } from '../dto/district-response.dto';

@Injectable()
export class AddressSeederService implements OnApplicationBootstrap {
  constructor(
    private readonly cityService: CityService,
    private readonly districtService: DistrictService,
    private readonly httpService: HttpService,
    private readonly datasource: DataSource,
  ) {}

  async onApplicationBootstrap() {
    await this.seedCitiesAndDistricts();
  }

  private async seedCitiesAndDistricts() {
    try {
      const cities = await this.cityService.findAll();

      if (cities.length > 0) {
        return;
      }

      const cityResponse = await firstValueFrom(
        this.httpService.get<CityResponseDto[]>(
          'https://provinces.open-api.vn/api/p/',
        ),
      );

      const districtResponse = await firstValueFrom(
        this.httpService.get<DistrictResponseDto[]>(
          'https://provinces.open-api.vn/api/d/',
        ),
      );

      await this.datasource.transaction(async (manager) => {
        const cities: City[] = cityResponse.data.map(
          (city) =>
            new City({
              name: city.name,
              code: city.code,
            }),
        );

        const savedCities = await manager.save(City, cities);

        const cityMap = new Map<string, City>();
        savedCities.forEach((city) => cityMap.set(city.code, city));

        const districts: District[] = districtResponse.data
          .filter(
            (district) =>
              district.province_code && cityMap.has(district.province_code),
          )
          .map(
            (district) =>
              new District({
                name: district.name,
                code: district.code,
                city: cityMap.get(district.province_code),
              }),
          );

        const batchSize = 500;
        for (let i = 0; i < districts.length; i += batchSize) {
          const batch = districts.slice(i, i + batchSize);
          await manager.save(District, batch);
        }
      });
    } catch {
      Logger.error('Failed to seed cities and districts');
    }
  }
}
