import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER, APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { AuthModule } from './auth/auth.module.js';
import { CategoriesModule } from './categories/categories.module.js';
import { AllExceptionsFilter } from './common/filters/http-exception.filter.js';
import { validateEnv } from './config/env.validation.js';
import { HealthModule } from './health/health.module.js';
import { HouseholdMembersModule } from './household-members/household-members.module.js';
import { HouseholdsModule } from './households/households.module.js';
import { InvitationsModule } from './invitations/invitations.module.js';
import { PrismaModule } from './prisma/prisma.module.js';
import { ReportsModule } from './reports/reports.module.js';
import { TransactionsModule } from './transactions/transactions.module.js';
import { UsersModule } from './users/users.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      // Lancée depuis apps/api : le .env unique est à la racine du monorepo
      envFilePath: ['../../.env', '.env'],
      validate: validateEnv,
    }),
    ThrottlerModule.forRoot([{ name: 'default', ttl: 60_000, limit: 120 }]),
    PrismaModule,
    AuthModule,
    UsersModule,
    HouseholdsModule,
    HouseholdMembersModule,
    InvitationsModule,
    CategoriesModule,
    TransactionsModule,
    ReportsModule,
    HealthModule,
  ],
  providers: [
    // Ordre : limitation de débit, puis authentification (AuthGuard enregistré dans AuthModule)
    { provide: APP_GUARD, useClass: ThrottlerGuard },
    { provide: APP_FILTER, useClass: AllExceptionsFilter },
  ],
})
export class AppModule {}
