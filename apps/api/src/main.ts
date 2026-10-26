import { Logger, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { toNodeHandler } from 'better-auth/node';
import type { NextFunction, Request, Response } from 'express';
import helmet from 'helmet';
import { AppModule } from './app.module.js';
import { AUTH, type Auth } from './auth/auth.js';
import type { EnvironmentVariables } from './config/env.validation.js';

async function bootstrap() {
  // bodyParser désactivé : Better Auth doit lire le corps brut de ses requêtes
  const app = await NestFactory.create<NestExpressApplication>(AppModule, { bodyParser: false });
  const config = app.get<ConfigService<EnvironmentVariables, true>>(ConfigService);

  app.set('trust proxy', 'loopback'); // le frontend Next.js fait office de proxy local
  app.use(helmet());
  app.enableCors({ origin: config.get('WEB_ORIGIN', { infer: true }), credentials: true });

  // Routes d'authentification gérées par Better Auth : /api/auth/*
  const authHandler = toNodeHandler(app.get<Auth>(AUTH));
  app.use((req: Request, res: Response, next: NextFunction) =>
    req.path.startsWith('/api/auth/') ? authHandler(req, res) : next(),
  );

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
