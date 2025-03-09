import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Doctor } from './entities/doctor.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { CustomNotFoundException } from '../exception/not_found.exception';
import { UsersService } from '../users/users.service';
import { Role } from '../users/entities/role.enum';
import { FromUserToDoctorException } from '../exception/from_user_to_doctor.exception';
import { ToDoctorDto } from './dto/to-doctor.dto';
import { PaginationResponseDto } from '../utils/pagination.response.dto';
import { UpdateDoctorDto } from './dto/update-doctor.dto';

@Injectable()
export class DoctorsService {
  private readonly entityName = 'Doctor';

  constructor(
    @InjectRepository(Doctor)
    private readonly doctorRepository: Repository<Doctor>,
    private readonly userService: UsersService,
  ) {}

  async fromUserToDoctor(userId: number, toDoctorDto: ToDoctorDto) {
    const user = await this.userService.findOneById(userId);

    const existingDoctor = await this.doctorRepository.findOneBy({
      user: user,
    });

    if (existingDoctor) {
      throw new FromUserToDoctorException(userId);
    }

    const doctor = this.doctorRepository.create({
      ...toDoctorDto,
      user,
    });

    return await this.doctorRepository.save(doctor);
  }

  async findAll(
    page: number,
    limit: number,
    specializationId?: number,
    clinicId?: number,
  ) {
    const queryBuilder = this.doctorRepository
      .createQueryBuilder('doctors')
      .leftJoinAndSelect('doctors.specialization', 'specialization')
      .leftJoinAndSelect('doctors.clinic', 'clinic')
      .skip((page - 1) * limit)
      .take(limit);

    if (specializationId) {
      queryBuilder.andWhere('specialization.id = :specializationId', {
        specializationId,
      });
    }

    if (clinicId) {
      queryBuilder.andWhere('clinic.id = :clinicId', { clinicId });
    }

    const [result, total] = await queryBuilder.getManyAndCount();

    return new PaginationResponseDto(page, limit, result, total);
  }

  async findOneById(id: number) {
    const doctor = await this.doctorRepository.findOneBy({ id });

    if (!doctor) {
      throw new CustomNotFoundException(this.entityName, id);
    }

    return doctor;
  }

  async updateDoctor(id: number, updateDoctorDto: UpdateDoctorDto) {
    const doctor = await this.doctorRepository.findOneBy({ id });

    if (!doctor) {
      throw new CustomNotFoundException(this.entityName, id);
    }

    Object.assign(doctor, updateDoctorDto);

    return await this.doctorRepository.save(doctor);
  }

  async deleteDoctor(id: number) {
    const doctor = await this.doctorRepository.findOneBy({ id });

    if (!doctor) {
      throw new CustomNotFoundException(this.entityName, id);
    }

    return await this.doctorRepository.remove(doctor);
  }
}
