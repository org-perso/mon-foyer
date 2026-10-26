import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { UsersModule } from '../users/users.module.js';
import { AuthGuard } from './auth.guard.js';
import { ClerkModule } from './clerk.module.js';
import { ClerkWebhookController } from './clerk-webhook.controller.js';

@Module({
  imports: [ClerkModule, UsersModule],
  controllers: [ClerkWebhookController],
  providers: [{ provide: APP_GUARD, useClass: AuthGuard }],
})
export class AuthModule {}
