import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Rating } from './entities/rating.entity';
import { CreateRatingDto } from './dto/create-rating.dto';
import { User } from '../users/entities/user.entity';
import { Doctor } from '../doctors/entities/doctor.entity';
import { CustomNotFoundException } from '../exception/not_found.exception';

@Injectable()
export class RatingsService {
  constructor(
    @InjectRepository(Rating)
    private readonly ratingRepository: Repository<Rating>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Doctor)
    private readonly doctorRepository: Repository<Doctor>,
  ) {}

  async create(
    userId: number,
    doctorId: number,
    createRatingDto: CreateRatingDto,
  ) {
    const user = await this.userRepository.findOneBy({ id: userId });
    if (!user) {
      throw new CustomNotFoundException('User', userId);
    }

    const doctor = await this.doctorRepository.findOneBy({ id: doctorId });
    if (!doctor) {
      throw new CustomNotFoundException('Doctor', doctorId);
    }

    const rating = this.ratingRepository.create({
      ...createRatingDto,
      user,
      doctor,
    });

    return await this.ratingRepository.save(rating);
  }

  async findAllByDoctor(doctorId: number) {
    return await this.ratingRepository.find({
      where: { doctor: { id: doctorId } },
      relations: ['user'],
    });
  }
}
