import type { UserJSON } from '@clerk/backend';
import {
  ConflictException,
  Inject,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { CLERK_CLIENT, type ClerkClient } from '../auth/clerk.provider.js';
import { Prisma, type User } from '../generated/prisma/client.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { profileFromApi, profileFromWebhook, type ClerkProfile } from './clerk-profile.js';

/**
 * Copie locale des utilisateurs Clerk.
 * - Webhooks user.created / user.updated / user.deleted (source principale).
 * - Création à la volée à la première requête authentifiée, si le webhook
 *   n'est pas encore arrivé (ou pas configuré en local).
 */
@Injectable()
export class UserSyncService {
  private readonly logger = new Logger(UserSyncService.name);

  constructor(
    private readonly prisma: PrismaService,
    @Inject(CLERK_CLIENT) private readonly clerk: ClerkClient,
  ) {}

  async ensureUser(clerkUserId: string): Promise<User> {
    const existing = await this.prisma.user.findUnique({ where: { id: clerkUserId } });
    if (existing) return existing;

    const profile = profileFromApi(await this.clerk.users.getUser(clerkUserId));
    if (!profile) {
      throw new UnauthorizedException('Compte sans adresse e-mail.');
    }
    return this.upsert(profile);
  }

  async upsertFromClerk(data: UserJSON): Promise<void> {
    const profile = profileFromWebhook(data);
    if (!profile) {
      this.logger.warn(`Utilisateur Clerk ${data.id} sans e-mail : ignoré`);
      return;
    }
    await this.upsert(profile);
  }

  /**
   * Suppression du compte local. Si l'utilisateur a saisi des transactions communes
   * (onDelete: Restrict), la suppression est refusée et journalisée : ces données
   * appartiennent aussi au foyer et nécessitent un traitement explicite.
   */
  async removeFromClerk(clerkUserId: string): Promise<void> {
    try {
      await this.prisma.user.delete({ where: { id: clerkUserId } });
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2025') return;
      if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2003') {
        this.logger.warn(`Utilisateur ${clerkUserId} supprimé dans Clerk mais conservé : saisies communes`);
        return;
      }
      throw e;
    }
  }

  private async upsert(profile: ClerkProfile): Promise<User> {
    const data = { email: profile.email, name: profile.name, imageUrl: profile.imageUrl };
    try {
      return await this.prisma.user.upsert({
        where: { id: profile.id },
        create: { id: profile.id, ...data },
        update: data,
      });
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
        throw new ConflictException('Cette adresse e-mail est déjà associée à un autre compte.');
      }
      throw e;
    }
  }
}
