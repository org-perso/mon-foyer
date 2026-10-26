import { CanActivate, ExecutionContext, Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { fromNodeHeaders } from 'better-auth/node';
import { AUTH, type Auth } from './auth.js';
import { IS_PUBLIC_KEY, type AuthenticatedRequest } from './decorators.js';

/**
 * Garde globale : chaque requête non marquée @Public() doit porter
 * une session valide, vérifiée côté serveur auprès de Better Auth (base de données).
 */
@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    @Inject(AUTH) private readonly auth: Auth,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const session = await this.auth.api.getSession({ headers: fromNodeHeaders(request.headers) });
    if (!session) {
      throw new UnauthorizedException('Authentification requise.');
    }
    request.user = { id: session.user.id, email: session.user.email, name: session.user.name };
    return true;
  }
}
