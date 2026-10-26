import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import type { PrismaClient } from '../generated/prisma/client.js';

export interface AuthOptions {
  secret: string;
  baseURL: string;
  trustedOrigins: string[];
  defaultCurrency: string;
  isProduction: boolean;
}

/**
 * Instance Better Auth : sessions stockées en base, cookie httpOnly,
 * mots de passe hachés par la bibliothèque (pas d'authentification maison).
 */
export function createAuth(prisma: PrismaClient, options: AuthOptions) {
  return betterAuth({
    database: prismaAdapter(prisma, { provider: 'postgresql' }),
    secret: options.secret,
    baseURL: options.baseURL,
    basePath: '/api/auth',
    trustedOrigins: options.trustedOrigins,
    emailAndPassword: {
      enabled: true,
      minPasswordLength: 10,
      maxPasswordLength: 128,
    },
    user: {
      additionalFields: {
        defaultCurrency: {
          type: 'string',
          required: false,
          input: false, // non modifiable lors de l'inscription
          defaultValue: options.defaultCurrency,
        },
      },
    },
    session: {
      expiresIn: 60 * 60 * 24 * 30, // 30 jours
      updateAge: 60 * 60 * 24, // renouvelée au plus une fois par jour
    },
    rateLimit: {
      enabled: true,
      window: 60,
      max: 30,
      customRules: {
        '/sign-in/email': { window: 60, max: 5 },
        '/sign-up/email': { window: 60, max: 3 },
      },
    },
    advanced: {
      useSecureCookies: options.isProduction,
      ipAddress: { ipAddressHeaders: ['x-forwarded-for'] },
    },
  });
}

export type Auth = ReturnType<typeof createAuth>;
export const AUTH = Symbol('AUTH');
