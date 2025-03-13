import { Logger } from '@nestjs/common';
import { EmailService } from './email.service';
import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';

@Processor('email')
export class EmailProcessor extends WorkerHost {
  private readonly logger = new Logger(EmailProcessor.name);

  constructor(private readonly emailService: EmailService) {
    super();
  }

  async process(job: Job<any, any, string>) {
    const { email, token } = job.data;

    try {
      await this.emailService.sendVerificationEmail(email, token);
      return { success: true, email: email };
    } catch (error) {
      this.logger.error(`Failed to send email to ${email}`, error);
      throw error;
    }
  }
}
