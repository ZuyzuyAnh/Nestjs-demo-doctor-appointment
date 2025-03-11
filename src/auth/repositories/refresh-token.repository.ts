import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RefreshToken } from '../entities/refresh-token.entity';

@Injectable()
export class RefreshTokenRepository {
  constructor(
    @InjectRepository(RefreshToken)
    private refreshTokenRepository: Repository<RefreshToken>,
  ) {}

  async create(refreshToken: RefreshToken): Promise<RefreshToken> {
    return this.refreshTokenRepository.save(refreshToken);
  }

  async findByToken(token: string): Promise<RefreshToken | null> {
    return this.refreshTokenRepository.findOne({ where: { token } });
  }

  async revokeToken(id: number): Promise<void> {
    await this.refreshTokenRepository.update(id, { revoked: true });
  }

  async deleteByUserId(userId: number): Promise<void> {
    await this.refreshTokenRepository.delete({ userId });
  }
}
