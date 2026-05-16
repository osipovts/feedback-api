import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const logger = new Logger('bootstrap');

  app.use(helmet());
  app.use(cookieParser());

  app.setGlobalPrefix('api');

  // enable swagger in dev-mode
  const shouldStartSwagger = !configService.get<boolean>('isProduction');
  if (shouldStartSwagger) {
    const config = new DocumentBuilder()
      .setTitle('Feedback API')
      .setDescription('API for handling user feedback')
      .setVersion('1.0')
      .addTag('Feedback')
      .addApiKey({ type: 'apiKey', in: 'header', name: 'x-csrf-token' }, 'csrf')
      .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document, {
      swaggerOptions: {
        withCredentials: true,
      },
      customJs: '/swagger-csrf.js',
    });
  }

  // enable CORS
  const allowedOrigins =
    configService.get<string[]>('security.corsAllowedOrigins') ?? [];
  app.enableCors({
    origin: allowedOrigins,
    methods: ['POST'],
    credentials: true,
  });

  // listen http
  const port = configService.get<string>('PORT', 'production');
  await app.listen(port);
  const url = await app.getUrl();

  // log
  logger.log(`Running on: ${url}`);
  logger.log(`Allowed origins: ${allowedOrigins?.join(', ')}`);
  logger.log(`Env: ${configService.get<string>('NODE_ENV', 'production')}`);
  logger.log(`Is prod: ${configService.get<boolean>('isProduction')}`);

  if (shouldStartSwagger) {
    logger.log(`Swagger: ${url}/api/docs`);
  }
}

bootstrap().catch((e) => console.error(e));
