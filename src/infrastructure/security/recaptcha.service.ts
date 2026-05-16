import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class RecaptchaService {
  private readonly logger = new Logger(RecaptchaService.name);
  private readonly recaptchaSecretKey: string;
  private readonly recaptchaVerifyUrl =
    'https://www.google.com/recaptcha/api/siteverify';

  constructor(private readonly configService: ConfigService) {
    this.recaptchaSecretKey =
      this.configService.get<string>('security.recaptcha.secretKey') || '';
  }

  async verifyToken(token: string): Promise<boolean> {
    if (!token) {
      this.logger.warn('No reCAPTCHA token provided');
      return false;
    }

    if (!this.recaptchaSecretKey) {
      this.logger.warn('reCAPTCHA secret key not configured');
      return true; // В режиме разработки разрешаем без проверки
    }

    try {
      const params = new URLSearchParams({
        secret: this.recaptchaSecretKey,
        response: token,
      });

      const response = await fetch(`${this.recaptchaVerifyUrl}?${params}`, {
        method: 'POST',
      });

      const data = (await response.json()) as {
        success: boolean;
        score?: number;
      };

      if (!data.success) {
        this.logger.warn('reCAPTCHA verification failed');
        return false;
      }

      // Для reCAPTCHA v3 можно использовать score
      const minScore = process.env.NODE_ENV === 'production' ? 0.5 : 0.1;
      if (data.score && data.score < minScore) {
        this.logger.warn(`reCAPTCHA score too low: ${data.score}`);
        return false;
      }

      this.logger.log(
        `reCAPTCHA verified successfully with score: ${data.score}`,
      );
      return true;
    } catch (error) {
      this.logger.error('Error verifying reCAPTCHA token', error);
      return false;
    }
  }
}
