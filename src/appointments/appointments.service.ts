import {
  BadRequestException,
  ConflictException,
  Injectable,
} from '@nestjs/common';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Appointment } from './entities/appointment.entity';
import { Between, DataSource, QueryRunner, Repository } from 'typeorm';
import { Doctor } from '../doctors/entities/doctor.entity';
import { User } from '../users/entities/user.entity';
import { CustomNotFoundException } from '../exception/not_found.exception';
import { TokenPayloadDto } from '../auth/dto/tokenPayload.dto';
import { Role } from '../users/entities/role.enum';
import { PaginationResponseDto } from '../utils/pagination.response.dto';

@Injectable()
export class AppointmentsService {
  constructor(
    @InjectRepository(Appointment)
    private readonly appointmentRepository: Repository<Appointment>,
    private readonly dataSource: DataSource,
  ) {}

  async create(
    payload: TokenPayloadDto,
    createAppointmentDto: CreateAppointmentDto,
  ) {
    let retries = 3;

    while (retries > 0) {
      const queryRunner = this.dataSource.createQueryRunner();
      await queryRunner.connect();
      await queryRunner.startTransaction();

      try {
        await this.validateWorkingHours(
          createAppointmentDto.appointmentDate,
          createAppointmentDto.doctorId,
          queryRunner,
        );

        await this.checkForConflictAppointments(
          createAppointmentDto.appointmentDate,
          createAppointmentDto.doctorId,
          queryRunner,
        );

        const appointment = new Appointment();
        appointment.user = { id: payload.id } as User;
        appointment.doctor = { id: createAppointmentDto.doctorId } as Doctor;
        appointment.appointmentDateTime = createAppointmentDto.appointmentDate;
        appointment.note = createAppointmentDto.note;

        const savedAppointment = await queryRunner.manager.save(appointment);
        await queryRunner.commitTransaction();

        return savedAppointment;
      } catch (error) {
        await queryRunner.rollbackTransaction();

        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        if (error.name === 'OptimisticLockVersionMismatchError') {
          retries--;
          if (retries === 0) {
            throw new ConflictException(
              'Could not book appointment due to concurrent modifications. Please try again.',
            );
          }
          await new Promise((resolve) =>
            setTimeout(resolve, 100 + Math.random() * 100),
          );
        } else {
          throw error;
        }
      } finally {
        await queryRunner.release();
      }
    }
  }

  async findAll(
    payload: TokenPayloadDto,
    page: number = 1,
    limit: number = 10,
  ) {
    let result: Appointment[];
    let total: number;

    if (payload.role.includes(Role.Doctor)) {
      [result, total] = await this.appointmentRepository.findAndCount({
        where: { doctor: { user: { id: payload.id } } },
        skip: (page - 1) * limit,
        take: limit,
      });
    } else {
      [result, total] = await this.appointmentRepository.findAndCount({
        where: { user: { id: payload.id } },
        skip: (page - 1) * limit,
        take: limit,
      });
    }

    return new PaginationResponseDto(page, limit, result, total);
  }

  async findOne(payload: TokenPayloadDto, id: number) {
    let apponintment: Appointment | null = null;

    if (payload.role.includes(Role.Doctor)) {
      apponintment = await this.appointmentRepository.findOneBy({
        id: id,
        doctor: { user: { id: payload.id } },
      });
    } else {
      apponintment = await this.appointmentRepository.findOneBy({
        id: id,
        user: { id: payload.id },
      });
    }

    if (!apponintment) {
      throw new CustomNotFoundException('Appointment', id);
    }

    return apponintment;
  }

  async remove(id: number) {
    const appointment = await this.appointmentRepository.findOneBy({ id });

    if (!appointment) {
      throw new CustomNotFoundException('Appointment', id);
    }
    return this.appointmentRepository.remove(appointment);
  }

  private async checkForConflictAppointments(
    startTime: Date,
    doctorId: number,
    queryRunner: QueryRunner,
  ) {
    const oneHourBefore = new Date(startTime.getTime() - 60 * 60 * 1000);
    const oneHourAfter = new Date(startTime.getTime() + 60 * 60 * 1000);

    const conflictingAppointments = await queryRunner.manager.find(
      Appointment,
      {
        where: {
          doctor: { id: doctorId },
          appointmentDateTime: Between(oneHourBefore, oneHourAfter),
        },
      },
    );

    if (conflictingAppointments.length > 0) {
      throw new BadRequestException(
        'The doctor has another appointment within one hour of the requested time',
      );
    }
  }

  private async validateWorkingHours(
    startTime: Date,
    doctorId: number,
    queryRunner: QueryRunner,
  ) {
    const startHour = startTime.getHours();

    const doctor = await queryRunner.manager.findOneBy(Doctor, {
      id: doctorId,
    });

    if (!doctor) {
      throw new CustomNotFoundException('Doctor', doctorId);
    }

    const startWorkingHour = doctor.getStartTime();
    const endWorkingHour = doctor.getEndTime();

    if (startHour < startWorkingHour || startHour >= endWorkingHour) {
      throw new BadRequestException(
        `The doctor is not available at the requested time. Working hours are from ${startWorkingHour} to ${endWorkingHour}`,
      );
    }
  }
}
