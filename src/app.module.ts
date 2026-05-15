import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { APP_PIPE } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { FeedbackController } from './infrastructure/controllers/feedback.controller';
import { HealthController } from './infrastructure/controllers/health.controller';
import { TelegramService } from './infrastructure/telegram/telegram-service';
import { CreateFeedbackUseCase } from './application/use-cases/create-feedback.use-case';
import configuration from './config/configuration';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        throttlers: [
          {
            ttl: config.get<number>('security.throttleTtl') ?? 60,
            limit: config.get<number>('security.throttleLimit') ?? 10,
          },
        ],
      }),
    }),
  ],
  controllers: [FeedbackController, HealthController],
  providers: [
    TelegramService,
    CreateFeedbackUseCase,
    {
      provide: APP_PIPE,
      useFactory: () =>
        new ValidationPipe({
          transform: true,
          whitelist: true,
          forbidNonWhitelisted: true,
        }),
    },
  ],
})
export class AppModule {}
