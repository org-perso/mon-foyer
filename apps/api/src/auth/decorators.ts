import { createParamDecorator, ExecutionContext, SetMetadata } from '@nestjs/common';
import type { Request } from 'express';

export const IS_PUBLIC_KEY = 'isPublic';
/** Marque une route comme accessible sans session. Tout le reste est protégé par défaut. */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);

export interface AuthenticatedUser {
  id: string;
  email: string;
  name: string;
}

export type AuthenticatedRequest = Request & { user: AuthenticatedUser };

/** Utilisateur authentifié, résolu par AuthGuard à partir de la session serveur. */
export const CurrentUser = createParamDecorator(
  (_: unknown, ctx: ExecutionContext): AuthenticatedUser =>
    ctx.switchToHttp().getRequest<AuthenticatedRequest>().user,
);
