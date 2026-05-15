import { Injectable, Logger } from '@nestjs/common';
import { TelegramService } from '../../infrastructure/telegram/telegram-service';
import {
  CreateFeedbackData,
  feedbackFactory,
} from '../factories/create-feedback.factory';

@Injectable()
export class CreateFeedbackUseCase {
  private readonly logger: Logger = new Logger(CreateFeedbackUseCase.name);

  constructor(private readonly telegramService: TelegramService) {}

  async execute(data: CreateFeedbackData): Promise<void> {
    this.logger.debug(
      `Sending message from ${data.name.substring(0, 10)} <${data.contact.substring(0, 10)}>: ${data.message.substring(0, 50)}...`,
    );

    const feedbackEntity = feedbackFactory(data);

    return this.telegramService.sendMessage(feedbackEntity);
  }
}
