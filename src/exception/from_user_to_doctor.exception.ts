import { HttpException, HttpStatus } from '@nestjs/common';

export class FromUserToDoctorException extends HttpException {
  constructor(userId: number) {
    super(`User with ID ${userId} is already a doctor`, HttpStatus.BAD_REQUEST);
  }
}
