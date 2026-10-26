import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { assertValidImage } from '../common/files/image-validation.js';
import type { EnvironmentVariables } from '../config/env.validation.js';
import {
  HouseholdMembersService,
  MANAGER_ROLES,
} from '../household-members/household-members.service.js';
import { CloudinaryService } from '../media/cloudinary.service.js';
import { PrismaService } from '../prisma/prisma.service.js';
import type { CreateHouseholdDto } from './dto/create-household.dto.js';

const householdSelect = {
  id: true,
  name: true,
  photoPublicId: true,
  photoVersion: true,
  currency: true,
  timezone: true,
  createdAt: true,
} as const;

interface HouseholdRow {
  id: string;
  name: string;
  photoPublicId: string | null;
  photoVersion: number | null;
  currency: string;
  timezone: string;
  createdAt: Date;
}

@Injectable()
export class HouseholdsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly members: HouseholdMembersService,
    private readonly cloudinary: CloudinaryService,
    private readonly config: ConfigService<EnvironmentVariables, true>,
  ) {}

  /** Crée le foyer et inscrit son créateur comme OWNER, de façon atomique. */
  async create(userId: string, dto: CreateHouseholdDto) {
    const household = await this.prisma.household.create({
      data: {
        name: dto.name,
        currency: dto.currency ?? this.config.get('DEFAULT_CURRENCY', { infer: true }),
        timezone: dto.timezone ?? this.config.get('APP_TIMEZONE', { infer: true }),
        createdById: userId,
        members: { create: { userId, role: 'OWNER' } },
      },
      select: householdSelect,
    });
    return { ...this.toResponse(household), myRole: 'OWNER' as const };
  }

  async listForUser(userId: string) {
    const rows = await this.prisma.household.findMany({
      where: { members: { some: { userId } } },
      select: { ...householdSelect, members: { where: { userId }, select: { role: true } } },
      orderBy: { createdAt: 'asc' },
    });
    return rows.map(({ members, ...h }) => ({ ...this.toResponse(h), myRole: members[0]?.role }));
  }

  async findOne(userId: string, householdId: string) {
    const membership = await this.members.requireMembership(userId, householdId);
    const household = await this.prisma.household.findUniqueOrThrow({
      where: { id: householdId },
      select: householdSelect,
    });
    return { ...this.toResponse(household), myRole: membership.role };
  }

  /** Remplace la photo du foyer. Réservé aux propriétaires et administrateurs. */
  async setPhoto(userId: string, householdId: string, file: Buffer) {
    await this.members.requireMembership(userId, householdId, MANAGER_ROLES);
    const { mime } = await assertValidImage(file);
    const stored = await this.cloudinary.upload(`households/${householdId}/photo`, file, mime);
    const household = await this.prisma.household.update({
      where: { id: householdId },
      data: { photoPublicId: stored.publicId, photoVersion: stored.version },
      select: householdSelect,
    });
    return this.toResponse(household);
  }

  async removePhoto(userId: string, householdId: string) {
    await this.members.requireMembership(userId, householdId, MANAGER_ROLES);
    const current = await this.prisma.household.findUniqueOrThrow({
      where: { id: householdId },
      select: { photoPublicId: true },
    });
    const household = await this.prisma.household.update({
      where: { id: householdId },
      data: { photoPublicId: null, photoVersion: null },
      select: householdSelect,
    });
    if (current.photoPublicId) await this.cloudinary.remove(current.photoPublicId);
    return this.toResponse(household);
  }

  /** N'expose jamais l'identifiant de stockage : seulement une URL prête à afficher. */
  private toResponse({ photoPublicId, photoVersion, ...rest }: HouseholdRow) {
    return {
      ...rest,
      photoUrl:
        photoPublicId && photoVersion
          ? this.cloudinary.url({ publicId: photoPublicId, version: photoVersion }, 'avatar')
          : null,
    };
  }
}
