import { Injectable } from '@nestjs/common';
import { HouseholdMembersService } from '../household-members/household-members.service.js';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class CategoriesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly members: HouseholdMembersService,
  ) {}

  /** Catégories du foyer (après contrôle d'appartenance) ou catégories personnelles. */
  async list(userId: string, householdId?: string, type?: 'EXPENSE' | 'INCOME') {
    if (householdId) {
      await this.members.requireMembership(userId, householdId);
    }
    return this.prisma.category.findMany({
      where: {
        ...(householdId ? { householdId } : { ownerId: userId }),
        ...(type && { type }),
        archivedAt: null,
      },
      select: { id: true, name: true, type: true, icon: true, color: true },
      orderBy: { name: 'asc' },
    });
  }
}
