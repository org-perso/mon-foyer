import { Logger, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import type { NestExpressApplication } from '@nestjs/platform-express';
import helmet from 'helmet';
import { AppModule } from './app.module.js';
import type { EnvironmentVariables } from './config/env.validation.js';

async function bootstrap() {
  // rawBody : nécessaire à la vérification de signature des webhooks Clerk
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    bodyParser: false,
    rawBody: true,
  });
  const config = app.get<ConfigService<EnvironmentVariables, true>>(ConfigService);

  app.set('trust proxy', 'loopback'); // le frontend Next.js fait office de proxy local
  app.use(helmet());
  app.enableCors({ origin: config.get('WEB_ORIGIN', { infer: true }), credentials: true });

  app.useBodyParser('json', { limit: '100kb' });
  app.setGlobalPrefix('api');
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // supprime les champs non déclarés dans les DTO
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  app.enableShutdownHooks();

  const port = config.get('API_PORT', { infer: true });
  await app.listen(port);
  Logger.log(`API démarrée sur http://localhost:${port}/api`, 'Bootstrap');
}
await bootstrap();
