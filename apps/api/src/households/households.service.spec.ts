import { BadRequestException, ConflictException, ForbiddenException } from '@nestjs/common';
import type { ConfigService } from '@nestjs/config';
import type { HouseholdMembersService } from '../household-members/household-members.service.js';
import type { CloudinaryService } from '../media/cloudinary.service.js';
import type { PrismaService } from '../prisma/prisma.service.js';
import { HouseholdsService } from './households.service.js';

const PNG = Buffer.from('89504e470d0a1a0a0000000d49484452000000010000000108060000001f15c489', 'hex');

function setup(requireMembership: () => Promise<unknown>) {
  const upload = vi.fn().mockResolvedValue({ publicId: 'mon-foyer-dev/households/h1/photo', version: 42 });
  const update = vi.fn(async ({ data }: { data: object }) => ({
    id: 'h1',
    name: 'Foyer',
    currency: 'MGA',
    timezone: 'Indian/Antananarivo',
    createdAt: new Date(),
    ...data,
  }));
  const service = new HouseholdsService(
    { household: { update } } as unknown as PrismaService,
    { requireMembership: vi.fn(requireMembership) } as unknown as HouseholdMembersService,
    { upload, url: vi.fn(() => 'https://res.cloudinary.com/x.webp') } as unknown as CloudinaryService,
    {} as ConfigService<never, true>,
  );
  return { service, upload, update };
}

describe('HouseholdsService.setPhoto', () => {
  it("n'envoie rien à Cloudinary si l'utilisateur n'est pas gestionnaire", async () => {
    const { service, upload } = setup(() => Promise.reject(new ForbiddenException()));
    await expect(service.setPhoto('user_b', 'h1', PNG)).rejects.toBeInstanceOf(ForbiddenException);
    expect(upload).not.toHaveBeenCalled();
  });

  it("n'envoie rien à Cloudinary si le fichier n'est pas une image autorisée", async () => {
    const { service, upload } = setup(() => Promise.resolve({ role: 'OWNER' }));
    await expect(service.setPhoto('user_a', 'h1', Buffer.from('<svg/>'))).rejects.toBeInstanceOf(
      BadRequestException,
    );
    expect(upload).not.toHaveBeenCalled();
  });

  it('stocke identifiant et version, et ne renvoie que l’URL', async () => {
    const { service, upload, update } = setup(() => Promise.resolve({ role: 'OWNER' }));
    const result = await service.setPhoto('user_a', 'h1', PNG);
    expect(upload).toHaveBeenCalledWith('households/h1/photo', PNG, 'image/png');
    expect(update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: { photoPublicId: 'mon-foyer-dev/households/h1/photo', photoVersion: 42 },
      }),
    );
    expect(result).toMatchObject({ photoUrl: 'https://res.cloudinary.com/x.webp' });
    expect(result).not.toHaveProperty('photoPublicId');
  });
});

describe('HouseholdsService.create', () => {
  function setupCreate(existingMemberships: number) {
    const create = vi.fn(async ({ data }: { data: { name: string; currency: string } }) => ({
      id: 'h1',
      name: data.name,
      currency: data.currency,
      timezone: 'Indian/Antananarivo',
      photoPublicId: null,
      photoVersion: null,
      createdAt: new Date(),
    }));
    const tx = {
      $executeRaw: vi.fn(),
      householdMember: { count: vi.fn().mockResolvedValue(existingMemberships) },
      household: { create },
    };
    const service = new HouseholdsService(
      { $transaction: (fn: (t: typeof tx) => unknown) => fn(tx) } as unknown as PrismaService,
      {} as HouseholdMembersService,
      {} as CloudinaryService,
      { get: (key: string) => (key === 'DEFAULT_CURRENCY' ? 'MGA' : 'Indian/Antananarivo') } as unknown as ConfigService<
        never,
        true
      >,
    );
    return { service, tx, create };
  }

  it('crée le foyer avec son créateur comme propriétaire, en MGA par défaut', async () => {
    const { service, create, tx } = setupCreate(0);
    const result = await service.create('user_a', { name: 'Famille Rakoto' });
    expect(tx.$executeRaw).toHaveBeenCalled(); // verrou anti-création simultanée
    expect(create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          name: 'Famille Rakoto',
          currency: 'MGA',
          createdById: 'user_a',
          members: { create: { userId: 'user_a', role: 'OWNER' } },
        }),
      }),
    );
    expect(result).toMatchObject({ myRole: 'OWNER', photoUrl: null });
  });

  it('refuse un second foyer', async () => {
    const { service, create } = setupCreate(1);
    await expect(service.create('user_a', { name: 'Autre foyer' })).rejects.toBeInstanceOf(
      ConflictException,
    );
    expect(create).not.toHaveBeenCalled();
  });
});
