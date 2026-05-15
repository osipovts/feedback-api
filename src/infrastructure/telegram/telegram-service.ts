import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import TelegramBot from 'node-telegram-bot-api';
import { FeedbackEntity } from '../../domain/entities/feedback.entity';

@Injectable()
export class TelegramService implements OnModuleInit {
  private bot!: TelegramBot;
  private chatId!: string;
  private readonly logger: Logger = new Logger(TelegramService.name);

  constructor(private readonly configService: ConfigService) {}

  onModuleInit() {
    this.initBot();
  }

  async sendMessage({ name, contact, message }: FeedbackEntity): Promise<void> {
    const { chatId } = this;
    const text = this.composeMessage(name, contact, message);

    try {
      await this.bot.sendMessage(chatId, text);
    } catch (error) {
      this.logger.error('Failed to send message to Telegram:', String(error));
      throw new Error('Failed to send message to Telegram');
    }
  }

  private initBot() {
    const botToken = this.configService.get<string>('telegram.botToken');
    const chatId = this.configService.get<string>('telegram.chatId');

    if (!botToken || !chatId) {
      throw new Error('Telegram bot token and/or chat id are not configured');
    }

    this.chatId = chatId;
    this.bot = new TelegramBot(botToken);

    this.logger.log(`Telegram bot is ready`);
  }

  private composeMessage(
    name: string,
    contact: string,
    message: string,
  ): string {
    return `
📝 Новое сообщение!

👤 Имя: ${name}
📧 Контакт: ${contact}
💬 Сообщение: ${message}
`;
  }
}
