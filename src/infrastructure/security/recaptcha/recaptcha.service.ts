import { Injectable, Logger, ForbiddenException } from '@nestjs/common';

import { ConfigService } from '@nestjs/config';

import { RecaptchaVerifyResponse } from './types/recaptcha-response.types';

@Injectable()
export class RecaptchaService {
  private readonly logger = new Logger(RecaptchaService.name);

  private readonly verifyUrl =
    'https://www.google.com/recaptcha/api/siteverify';

  constructor(private readonly configService: ConfigService) {}

  async verify(token: string, expectedAction?: string): Promise<void> {
    if (!token) {
      throw new ForbiddenException('reCAPTCHA token missing');
    }

    const secret = this.configService.get<string>(
      'security.recaptcha.secretKey',
    );

    if (!secret) {
      throw new Error('RECAPTCHA_SECRET_KEY not configured');
    }

    const params = new URLSearchParams({
      secret,
      response: token,
    });

    const response = await fetch(this.verifyUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
    });

    if (!response.ok) {
      this.logger.error(`Google API returned ${response.status}`);

      throw new ForbiddenException('reCAPTCHA verification failed');
    }

    const data = (await response.json()) as RecaptchaVerifyResponse;

    if (!data.success) {
      this.logger.warn({
        errors: data['error-codes'],
      });

      throw new ForbiddenException('Invalid reCAPTCHA');
    }

    const expectedHostname = this.configService.get<string>(
      'security.recaptcha.hostname',
    );

    if (
      expectedHostname &&
      data.hostname &&
      data.hostname !== expectedHostname
    ) {
      this.logger.warn(`Unexpected hostname: ${data.hostname}`);

      throw new ForbiddenException('Invalid reCAPTCHA hostname');
    }

    if (expectedAction && data.action && data.action !== expectedAction) {
      this.logger.warn(`Unexpected action: ${data.action}`);

      throw new ForbiddenException('Invalid reCAPTCHA action');
    }

    const minScore =
      this.configService.get<number>('security.recaptcha.minScore') ?? 0.5;

    if (data.score !== undefined && data.score < minScore) {
      this.logger.warn(`Low score: ${data.score}`);

      throw new ForbiddenException('Suspicious activity detected');
    }

    this.logger.debug(`reCAPTCHA OK score=${data.score}`);
  }
}
