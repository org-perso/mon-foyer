import { createClerkClient, type ClerkClient } from '@clerk/backend';
import type { Provider } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { EnvironmentVariables } from '../config/env.validation.js';

export const CLERK_CLIENT = Symbol('CLERK_CLIENT');
export type { ClerkClient };

export const clerkClientProvider: Provider = {
  provide: CLERK_CLIENT,
  inject: [ConfigService],
  useFactory: (config: ConfigService<EnvironmentVariables, true>): ClerkClient =>
    createClerkClient({
      secretKey: config.get('CLERK_SECRET_KEY', { infer: true }),
      publishableKey: config.get('CLERK_PUBLISHABLE_KEY', { infer: true }),
    }),
};
