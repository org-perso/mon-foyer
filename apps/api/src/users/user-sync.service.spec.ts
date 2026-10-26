import type { UserJSON } from '@clerk/backend';
import { UnauthorizedException } from '@nestjs/common';
import type { ClerkClient } from '../auth/clerk.provider.js';
import type { PrismaService } from '../prisma/prisma.service.js';
import { profileFromWebhook } from './clerk-profile.js';
import { UserSyncService } from './user-sync.service.js';

function setup(existing: unknown, clerkUser?: unknown) {
  const findUnique = vi.fn().mockResolvedValue(existing);
  const upsert = vi.fn(async (args: { create: unknown }) => args.create);
  const getUser = vi.fn().mockResolvedValue(clerkUser);
  const service = new UserSyncService(
    { user: { findUnique, upsert } } as unknown as PrismaService,
    { users: { getUser } } as unknown as ClerkClient,
  );
  return { service, upsert, getUser };
}

describe('UserSyncService.ensureUser', () => {
  it("n'appelle pas Clerk si l'utilisateur existe déjà", async () => {
    const { service, getUser } = setup({ id: 'user_1', email: 'a@b.c', name: 'A' });
    await service.ensureUser('user_1');
    expect(getUser).not.toHaveBeenCalled();
  });

  it('crée l’utilisateur à la volée depuis Clerk (e-mail principal, en minuscules)', async () => {
    const { service, upsert } = setup(null, {
      id: 'user_1',
      firstName: 'Hery',
      lastName: null,
      imageUrl: '',
      primaryEmailAddress: { emailAddress: 'Hery@Example.com' },
      emailAddresses: [],
    });
    await expect(service.ensureUser('user_1')).resolves.toEqual({
      id: 'user_1',
      email: 'hery@example.com',
      name: 'Hery',
      imageUrl: null,
    });
    expect(upsert).toHaveBeenCalledOnce();
  });

  it('refuse un compte Clerk sans e-mail', async () => {
    const { service } = setup(null, {
      id: 'user_1',
      firstName: null,
      lastName: null,
      imageUrl: '',
      primaryEmailAddress: null,
      emailAddresses: [],
    });
    await expect(service.ensureUser('user_1')).rejects.toBeInstanceOf(UnauthorizedException);
  });
});

describe('profileFromWebhook', () => {
  it("utilise l'adresse principale et un nom de repli", () => {
    const profile = profileFromWebhook({
      id: 'user_1',
      first_name: null,
      last_name: null,
      image_url: 'https://img.clerk.com/x',
      primary_email_address_id: 'e2',
      email_addresses: [
        { id: 'e1', email_address: 'old@example.com' },
        { id: 'e2', email_address: 'Rova@Example.com' },
      ],
    } as unknown as UserJSON);
    expect(profile).toEqual({
      id: 'user_1',
      email: 'rova@example.com',
      name: 'rova',
      imageUrl: 'https://img.clerk.com/x',
    });
  });
});
