import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Reflector } from '@nestjs/core';
import { toWebRequest } from '../common/web-request.js';
import type { EnvironmentVariables } from '../config/env.validation.js';
import { UserSyncService } from '../users/user-sync.service.js';
import { CLERK_CLIENT, type ClerkClient } from './clerk.provider.js';
import { IS_PUBLIC_KEY, type AuthenticatedRequest } from './decorators.js';

/**
 * Garde globale : chaque requête non marquée @Public() doit porter un jeton
 * de session Clerk valide (en-tête Authorization: Bearer, ou cookie __session
 * pour les appels même-origine via le proxy Next.js).
 * La signature, l'expiration et l'origine (authorizedParties) sont vérifiées.
 */
@Injectable()
export class AuthGuard implements CanActivate {
  private readonly authorizedParties: string[];

  constructor(
    private readonly reflector: Reflector,
    @Inject(CLERK_CLIENT) private readonly clerk: ClerkClient,
    private readonly users: UserSyncService,
    config: ConfigService<EnvironmentVariables, true>,
  ) {
    this.authorizedParties = [config.get('WEB_ORIGIN', { infer: true })];
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const state = await this.clerk.authenticateRequest(toWebRequest(request), {
      authorizedParties: this.authorizedParties,
      acceptsToken: 'session_token',
    });
    const userId = state.isAuthenticated ? state.toAuth().userId : null;
    if (!userId) {
      throw new UnauthorizedException('Authentification requise.');
    }

    const user = await this.users.ensureUser(userId);
    request.user = { id: user.id, email: user.email, name: user.name };
    return true;
  }
}
