import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EmailVerification } from '../entities/email-verification.entity';
import { randomBytes } from 'crypto';

@Injectable()
export class EmailVerificationRepository {
  constructor(
    @InjectRepository(EmailVerification)
    private emailVerificationRepository: Repository<EmailVerification>,
  ) {}

  async createVerificationToken(userId: number): Promise<string> {
    const token = randomBytes(32).toString('hex');

    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);

    await this.emailVerificationRepository.save({
      token,
      userId,
      expiresAt,
      used: false,
    });

    return token;
  }

  async findByToken(token: string): Promise<EmailVerification | null> {
    return this.emailVerificationRepository.findOne({
      where: { token },
      relations: ['user'],
    });
  }

  async markAsUsed(id: number): Promise<void> {
    await this.emailVerificationRepository.update(id, { used: true });
  }
}
