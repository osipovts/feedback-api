import {
  Injectable,
  Logger,
  ForbiddenException,
  InternalServerErrorException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RecaptchaVerifyOptions } from './types/recaptcha-verify.types';
import { RecaptchaVerifyResponse } from './types/recaptcha-response.types';

@Injectable()
export class RecaptchaService {
  private readonly logger = new Logger(RecaptchaService.name);
  private readonly verifyUrl =
    'https://www.google.com/recaptcha/api/siteverify';

  constructor(private readonly configService: ConfigService) {}

  private getSecret(version: 'v2' | 'v3'): string {
    const key =
      version === 'v2'
        ? 'security.recaptcha.v2.secretKey'
        : 'security.recaptcha.v3.secretKey';

    const secret = this.configService.get<string>(key);

    if (!secret) {
      throw new InternalServerErrorException(`${key} is not configured`);
    }

    return secret;
  }

  async verify(
    token: string,
    options: RecaptchaVerifyOptions,
  ): Promise<RecaptchaVerifyResponse> {
    if (!token) {
      throw new ForbiddenException('reCAPTCHA token missing');
    }

    const secret = this.getSecret(options.version);

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
      this.logger.error(`Google reCAPTCHA API returned ${response.status}`);
      throw new ForbiddenException('reCAPTCHA verification failed');
    }

    const data = (await response.json()) as RecaptchaVerifyResponse;

    if (!data.success) {
      this.logger.warn(
        `reCAPTCHA rejected by Google: ${(data['error-codes'] ?? []).join(', ')}`,
      );
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
      this.logger.warn(`Unexpected reCAPTCHA hostname: ${data.hostname}`);
      throw new ForbiddenException('Invalid reCAPTCHA hostname');
    }

    if (options.version === 'v3') {
      if (
        options.expectedAction &&
        data.action &&
        data.action !== options.expectedAction
      ) {
        this.logger.warn(`Unexpected reCAPTCHA action: ${data.action}`);
        throw new ForbiddenException('Invalid reCAPTCHA action');
      }

      const minScore =
        options.minScore ??
        this.configService.get<number>('security.recaptcha.minScore') ??
        0.5;

      if (typeof data.score === 'number' && data.score < minScore) {
        this.logger.warn(`Low reCAPTCHA score: ${data.score}`);
        throw new ForbiddenException('Suspicious activity detected');
      }
    }

    this.logger.debug(
      `reCAPTCHA OK version=${options.version} score=${data.score ?? 'n/a'} hostname=${data.hostname ?? 'n/a'} action=${data.action ?? 'n/a'}`,
    );

    return data;
  }
}
