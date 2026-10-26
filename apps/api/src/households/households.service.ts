import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { EnvironmentVariables } from '../config/env.validation.js';
import { HouseholdMembersService } from '../household-members/household-members.service.js';
import { PrismaService } from '../prisma/prisma.service.js';
import type { CreateHouseholdDto } from './dto/create-household.dto.js';

const householdSelect = {
  id: true,
  name: true,
  photoKey: true,
  currency: true,
  timezone: true,
  createdAt: true,
} as const;

@Injectable()
export class HouseholdsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly members: HouseholdMembersService,
    private readonly config: ConfigService<EnvironmentVariables, true>,
  ) {}

  /** Crée le foyer et inscrit son créateur comme OWNER, de façon atomique. */
  create(userId: string, dto: CreateHouseholdDto) {
    return this.prisma.household.create({
      data: {
        name: dto.name,
        currency: dto.currency ?? this.config.get('DEFAULT_CURRENCY', { infer: true }),
        timezone: dto.timezone ?? this.config.get('APP_TIMEZONE', { infer: true }),
        createdById: userId,
        members: { create: { userId, role: 'OWNER' } },
      },
      select: householdSelect,
    });
  }

  listForUser(userId: string) {
    return this.prisma.household.findMany({
      where: { members: { some: { userId } } },
      select: { ...householdSelect, members: { where: { userId }, select: { role: true } } },
      orderBy: { createdAt: 'asc' },
    });
  }

  async findOne(userId: string, householdId: string) {
    await this.members.requireMembership(userId, householdId);
    return this.prisma.household.findUniqueOrThrow({
      where: { id: householdId },
      select: householdSelect,
    });
  }
}
