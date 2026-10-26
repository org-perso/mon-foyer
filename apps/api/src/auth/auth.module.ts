import { Global, Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import type { EnvironmentVariables } from '../config/env.validation.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { AUTH, createAuth } from './auth.js';
import { AuthGuard } from './auth.guard.js';

@Global()
@Module({
  providers: [
    {
      provide: AUTH,
      inject: [PrismaService, ConfigService],
      useFactory: (prisma: PrismaService, config: ConfigService<EnvironmentVariables, true>) =>
        createAuth(prisma, {
          secret: config.get('BETTER_AUTH_SECRET', { infer: true }),
          baseURL: config.get('BETTER_AUTH_URL', { infer: true }),
          trustedOrigins: [config.get('WEB_ORIGIN', { infer: true })],
          defaultCurrency: config.get('DEFAULT_CURRENCY', { infer: true }),
          isProduction: config.get('NODE_ENV', { infer: true }) === 'production',
        }),
    },
    { provide: APP_GUARD, useClass: AuthGuard },
  ],
  exports: [AUTH],
})
export class AuthModule {}
