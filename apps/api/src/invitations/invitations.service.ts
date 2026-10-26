import { ConflictException, GoneException, Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { EnvironmentVariables } from '../config/env.validation.js';
import {
  HouseholdMembersService,
  MANAGER_ROLES,
} from '../household-members/household-members.service.js';
import { PrismaService } from '../prisma/prisma.service.js';
import type { AuthenticatedUser } from '../auth/decorators.js';
import type { CreateInvitationDto } from './dto/invitation.dto.js';
import { generateInvitationToken, hashInvitationToken } from './invitation-token.js';

@Injectable()
export class InvitationsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly members: HouseholdMembersService,
    private readonly config: ConfigService<EnvironmentVariables, true>,
  ) {}

  /** Seuls OWNER et ADMIN peuvent inviter. Le token brut n'est renvoyé qu'ici. */
  async create(userId: string, householdId: string, dto: CreateInvitationDto) {
    await this.members.requireMembership(userId, householdId, MANAGER_ROLES);
    const { token, tokenHash } = generateInvitationToken();
    const ttlHours = this.config.get('INVITATION_TTL_HOURS', { infer: true });
    const invitation = await this.prisma.invitation.create({
      data: {
        householdId,
        invitedById: userId,
        email: dto.email ?? null,
        role: dto.role ?? 'MEMBER',
        tokenHash,
        expiresAt: new Date(Date.now() + ttlHours * 3600_000),
      },
      select: { id: true, email: true, role: true, expiresAt: true },
    });
    return { ...invitation, token };
  }

  /**
   * Accepte une invitation : vérifie validité, expiration et destinataire,
   * puis rattache l'utilisateur au foyer. Usage unique, opération atomique.
   */
  async accept(user: AuthenticatedUser, token: string) {
    const tokenHash = hashInvitationToken(token);
    return this.prisma.$transaction(async (tx) => {
      const invitation = await tx.invitation.findUnique({ where: { tokenHash } });
      // Message identique quel que soit le motif, pour ne rien révéler
      if (!invitation || invitation.status !== 'PENDING') {
        throw new NotFoundException('Invitation invalide.');
      }
      if (invitation.email && invitation.email !== user.email.toLowerCase()) {
        throw new NotFoundException('Invitation invalide.');
      }
      if (invitation.expiresAt.getTime() <= Date.now()) {
        await tx.invitation.update({ where: { id: invitation.id }, data: { status: 'EXPIRED' } });
        throw new GoneException('Invitation expirée.');
      }
      const existing = await tx.householdMember.findUnique({
        where: { householdId_userId: { householdId: invitation.householdId, userId: user.id } },
      });
      if (existing) {
        throw new ConflictException('Vous êtes déjà membre de ce foyer.');
      }
      // Passage PENDING → ACCEPTED conditionnel : empêche une double utilisation concurrente
      const { count } = await tx.invitation.updateMany({
        where: { id: invitation.id, status: 'PENDING' },
        data: { status: 'ACCEPTED', acceptedById: user.id, acceptedAt: new Date() },
      });
      if (count !== 1) {
        throw new NotFoundException('Invitation invalide.');
      }
      await tx.householdMember.create({
        data: { householdId: invitation.householdId, userId: user.id, role: invitation.role },
      });
      return { householdId: invitation.householdId };
    });
  }
}
