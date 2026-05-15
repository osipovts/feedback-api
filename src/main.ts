import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import helmet from 'helmet';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(helmet());

  app.enableCors({
    origin: process.env.ALLOWED_ORIGINS?.split(',') || [
      'http://localhost:3000',
    ],
    methods: ['POST'],
  });

  app.setGlobalPrefix('api');

  // enable swagger in dev-mode
  const configService = app.get(ConfigService);
  const nodeEnv = configService.get<string>('NODE_ENV', 'production');
  if (nodeEnv === 'development') {
    const config = new DocumentBuilder()
      .setTitle('Feedback API')
      .setDescription('API for handling user feedback')
      .setVersion('1.0')
      .addTag('Feedback')
      .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document);
  }

  const port = configService.get<string>('PORT', 'production');
  await app.listen(port);
}

bootstrap().catch((e) => console.error(e));
