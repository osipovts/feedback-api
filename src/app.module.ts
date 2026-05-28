import { Logger, MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { APP_PIPE } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { FeedbackController } from './infrastructure/controllers/feedback.controller';
import { HealthController } from './infrastructure/controllers/health.controller';
import { TelegramService } from './infrastructure/telegram/telegram-service';
import { CreateFeedbackUseCase } from './application/use-cases/create-feedback.use-case';
import configuration from './config/configuration';
import { CsrfMiddleware } from './infrastructure/security/csrf/csrf.middleware';
import { CsrfController } from './infrastructure/controllers/csrf.controller';
import { join } from 'node:path';
import { ServeStaticModule } from '@nestjs/serve-static';
import { CsrfService } from './infrastructure/security/csrf/csrf.service';
import { RecaptchaModule } from './infrastructure/security/recaptcha/recaptcha.module';

@Module({
  imports: [
    // server static js for swagger csrf script
    ServeStaticModule.forRoot({
      rootPath: join(process.cwd(), 'public'),
    }),
    // config
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    // throttle
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        throttlers: [
          {
            ttl: config.get<number>('security.throttleTtl') ?? 60,
            limit: config.get<number>('security.throttleLimit') ?? 3,
          },
        ],
      }),
    }),
    // recaptcha
    RecaptchaModule,
  ],
  controllers: [FeedbackController, HealthController, CsrfController],
  providers: [
    {
      provide: APP_PIPE,
      useFactory: () =>
        new ValidationPipe({
          transform: true,
          whitelist: true,
          forbidNonWhitelisted: true,
        }),
    },
    TelegramService,
    CsrfService,
    CreateFeedbackUseCase,
    Logger,
  ],
})
export class AppModule {
  // public configure(consumer: MiddlewareConsumer): void {
  //  consumer.apply(CsrfMiddleware).forRoutes(FeedbackController);
  //}
}
