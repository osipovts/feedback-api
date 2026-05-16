import { Injectable, Logger } from '@nestjs/common';
import { TelegramService } from '../../infrastructure/telegram/telegram-service';
import { RecaptchaService } from '../../infrastructure/security/recaptcha.service';
import {
  CreateFeedbackData,
  feedbackFactory,
} from '../factories/create-feedback.factory';

@Injectable()
export class CreateFeedbackUseCase {
  private readonly logger: Logger = new Logger(CreateFeedbackUseCase.name);

  constructor(
    private readonly telegramService: TelegramService,
    private readonly recaptchaService: RecaptchaService,
  ) {}

  async execute(data: CreateFeedbackData): Promise<void> {
    // Проверка reCAPTCHA токена если он предоставлен
    if (data.recaptchaToken) {
      const isValid = await this.recaptchaService.verifyToken(
        data.recaptchaToken,
      );
      if (!isValid) {
        throw new Error('Invalid reCAPTCHA token');
      }
    }

    this.logger.debug(
      `Sending message from ${data.name.substring(0, 10)} <${data.contact.substring(0, 10)}>: ${data.message.substring(0, 50)}...`,
    );

    const feedbackEntity = feedbackFactory(data);

    return this.telegramService.sendMessage(feedbackEntity);
  }
}
