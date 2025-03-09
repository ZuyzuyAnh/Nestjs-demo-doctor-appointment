import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { UserNotFoundException } from './exceptions/userNotFound.exception';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  async create(user: User) {
    return await this.usersRepository.save(user);
  }

  findAll() {
    return this.usersRepository.find();
  }

  async findOneById(id: number) {
    const user = await this.usersRepository.findOneBy({ id: id });
    if (!user) {
      throw new UserNotFoundException(id);
    }

    return user;
  }

  async findByEmailAndPhone(email: string, phoneNumber: string) {
    return await this.usersRepository.find({
      where: [{ email }, { phoneNumber }],
    });
  }
}
