import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import type { HouseholdMember, HouseholdRole } from '../generated/prisma/client.js';
import { PrismaService } from '../prisma/prisma.service.js';

export const MANAGER_ROLES: readonly HouseholdRole[] = ['OWNER', 'ADMIN'];

@Injectable()
export class HouseholdMembersService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Point de contrôle unique des accès à un foyer.
   * Un non-membre reçoit 404 (et non 403) pour ne pas révéler l'existence du foyer.
   */
  async requireMembership(
    userId: string,
    householdId: string,
    allowedRoles?: readonly HouseholdRole[],
  ): Promise<HouseholdMember> {
    const membership = await this.prisma.householdMember.findUnique({
      where: { householdId_userId: { householdId, userId } },
    });
    if (!membership) {
      throw new NotFoundException('Foyer introuvable.');
    }
    if (allowedRoles && !allowedRoles.includes(membership.role)) {
      throw new ForbiddenException('Droits insuffisants dans ce foyer.');
    }
    return membership;
  }

  async householdIdsOf(userId: string): Promise<string[]> {
    const rows = await this.prisma.householdMember.findMany({
      where: { userId },
      select: { householdId: true },
    });
    return rows.map((r) => r.householdId);
  }

  async listMembers(userId: string, householdId: string) {
    await this.requireMembership(userId, householdId);
    return this.prisma.householdMember.findMany({
      where: { householdId },
      select: {
        id: true,
        role: true,
        displayName: true,
        joinedAt: true,
        user: { select: { id: true, name: true, image: true } },
      },
      orderBy: { joinedAt: 'asc' },
    });
  }
}
