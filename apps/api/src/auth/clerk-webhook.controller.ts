import {
  BadRequestException,
  Controller,
  HttpCode,
  Logger,
  Post,
  Req,
  type RawBodyRequest,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { verifyWebhook } from '@clerk/backend/webhooks';
import type { Request } from 'express';
import { toWebRequest } from '../common/web-request.js';
import type { EnvironmentVariables } from '../config/env.validation.js';
import { UserSyncService } from '../users/user-sync.service.js';
import { Public } from './decorators.js';

/**
 * Synchronisation des utilisateurs Clerk → base locale.
 * Public (pas de session), mais chaque appel est authentifié par sa signature
 * Standard Webhooks (svix) calculée sur le corps brut.
 */
@Public()
@Controller('webhooks/clerk')
export class ClerkWebhookController {
  private readonly logger = new Logger(ClerkWebhookController.name);
  private readonly signingSecret: string;

  constructor(
    private readonly users: UserSyncService,
    config: ConfigService<EnvironmentVariables, true>,
  ) {
    this.signingSecret = config.get('CLERK_WEBHOOK_SIGNING_SECRET', { infer: true });
  }

  @Post()
  @HttpCode(200)
  async handle(@Req() req: RawBodyRequest<Request>): Promise<{ received: true }> {
    if (!req.rawBody) {
      throw new BadRequestException('Corps de requête manquant.');
    }
    let event: Awaited<ReturnType<typeof verifyWebhook>>;
    try {
      event = await verifyWebhook(toWebRequest(req, req.rawBody), {
        signingSecret: this.signingSecret,
      });
    } catch {
      throw new BadRequestException('Signature de webhook invalide.');
    }

    switch (event.type) {
      case 'user.created':
      case 'user.updated':
        await this.users.upsertFromClerk(event.data);
        break;
      case 'user.deleted':
        if (event.data.id) await this.users.removeFromClerk(event.data.id);
        break;
      default:
        this.logger.debug(`Événement ignoré : ${event.type}`);
    }
    return { received: true };
  }
}
