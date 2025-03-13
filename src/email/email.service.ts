import { InjectQueue } from '@nestjs/bullmq';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Queue } from 'bullmq';
import * as nodemailer from 'nodemailer';
import SMTPTransport from 'nodemailer/lib/smtp-transport';

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor(
    private readonly configService: ConfigService,
    @InjectQueue('email') private readonly emailQueue: Queue,
  ) {
    const options: SMTPTransport.Options = {
      host: this.configService.get<string>('EMAIL_HOST') || '',
      port: this.configService.get<number>('EMAIL_PORT') || 587,
      secure: false,
      auth: {
        user: this.configService.get<string>('EMAIL_USER') || '',
        pass: this.configService.get<string>('EMAIL_PASSWORD') || '',
      },
    };

    this.transporter = nodemailer.createTransport(options);
  }

  async sendVerificationEmail(email: string, token: string): Promise<void> {
    if (!this.transporter) {
      throw new Error('Email transporter not initialized');
    }

    await this.transporter.sendMail({
      from:
        this.configService.get<string>('EMAIL_FROM') || 'noreply@example.com',
      to: email,
      subject: 'Verify Your Email Address',
      html: `
        <h1>Email Verification</h1>
        <p>Thank you for registering! Please verify your email by enter the code below:</p>
        <p>${token}</p>
        <p>The code will expire in 24 hours.</p>
      `,
    });
  }

  async sendEmailBackground(email: string, token: string): Promise<void> {
    await this.emailQueue.add(
      'send-verification-email',
      {
        email,
        token,
      },
      {
        attempts: 3,
        backoff: {
          type: 'fixed',
          delay: 5000,
        },
      },
    );
  }
}
