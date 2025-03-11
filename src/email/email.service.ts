import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import nodemailer, { Transporter } from 'nodemailer';
import SMTPTransport from 'nodemailer/lib/smtp-transport';

@Injectable()
export class EmailService {
  private transporter: Transporter;

  constructor(private readonly configService: ConfigService) {
    const options: SMTPTransport.Options = {
      host: this.configService.get<string>('EMAIL_HOST') || '',
      port: this.configService.get<number>('EMAIL_PORT') || 587,
      secure: this.configService.get<boolean>('EMAIL_SECURE') || false,
      auth: {
        user: this.configService.get<string>('EMAIL_USER') || '',
        pass: this.configService.get<string>('EMAIL_PASSWORD') || '',
      },
    };

    this.transporter = nodemailer.createTransport(options);
  }

  async sendVerificationEmail(email: string, token: string): Promise<void> {
    const appUrl =
      this.configService.get<string>('APP_URL') || 'http://localhost:3000';
    const verificationUrl = `${appUrl}/auth/verify-email?token=${token}`;

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
        <p>Thank you for registering! Please verify your email address by clicking the link below:</p>
        <a href="${verificationUrl}">Verify Email</a>
        <p>This link will expire in 24 hours.</p>
      `,
    });
  }
}
