import { GoneException, NotFoundException } from '@nestjs/common';
import type { ConfigService } from '@nestjs/config';
import type { HouseholdMembersService } from '../household-members/household-members.service.js';
import type { PrismaService } from '../prisma/prisma.service.js';
import { generateInvitationToken, hashInvitationToken } from './invitation-token.js';
import { InvitationsService } from './invitations.service.js';

const user = { id: 'user-b', email: 'B@example.com', name: 'B' };

function setup(invitation: Record<string, unknown> | null) {
  const tx = {
    invitation: {
      findUnique: vi.fn().mockResolvedValue(invitation),
      update: vi.fn(),
      updateMany: vi.fn().mockResolvedValue({ count: 1 }),
    },
    householdMember: { findUnique: vi.fn().mockResolvedValue(null), create: vi.fn() },
  };
  const prisma = {
    $transaction: (fn: (t: typeof tx) => unknown) => fn(tx),
  } as unknown as PrismaService;
  const service = new InvitationsService(
    prisma,
    {} as HouseholdMembersService,
    {} as ConfigService<never, true>,
  );
  return { service, tx };
}

const pending = (overrides: Record<string, unknown> = {}) => ({
  id: 'inv-1',
  householdId: 'household-a',
  status: 'PENDING',
  email: null,
  role: 'MEMBER',
  expiresAt: new Date(Date.now() + 3600_000),
  ...overrides,
});

describe('invitation token', () => {
  it('génère des tokens uniques de 256 bits et ne stocke que le hash', () => {
    const a = generateInvitationToken();
    const b = generateInvitationToken();
    expect(a.token).toHaveLength(43);
    expect(a.token).not.toBe(b.token);
    expect(a.tokenHash).toBe(hashInvitationToken(a.token));
    expect(a.tokenHash).not.toContain(a.token);
  });
});

describe('InvitationsService.accept', () => {
  it('rattache l’utilisateur au foyer avec le rôle prévu', async () => {
    const { service, tx } = setup(pending());
    await expect(service.accept(user, 'x'.repeat(43))).resolves.toEqual({
      householdId: 'household-a',
    });
    expect(tx.householdMember.create).toHaveBeenCalledWith({
      data: { householdId: 'household-a', userId: 'user-b', role: 'MEMBER' },
    });
  });

  it('refuse une invitation déjà utilisée', async () => {
    const { service, tx } = setup(pending({ status: 'ACCEPTED' }));
    await expect(service.accept(user, 'x'.repeat(43))).rejects.toBeInstanceOf(NotFoundException);
    expect(tx.householdMember.create).not.toHaveBeenCalled();
  });

  it('refuse et marque expirée une invitation périmée', async () => {
    const { service, tx } = setup(pending({ expiresAt: new Date(Date.now() - 1) }));
    await expect(service.accept(user, 'x'.repeat(43))).rejects.toBeInstanceOf(GoneException);
    expect(tx.invitation.update).toHaveBeenCalledWith({
      where: { id: 'inv-1' },
      data: { status: 'EXPIRED' },
    });
  });

  it('refuse une invitation destinée à une autre adresse', async () => {
    const { service } = setup(pending({ email: 'someone-else@example.com' }));
    await expect(service.accept(user, 'x'.repeat(43))).rejects.toBeInstanceOf(NotFoundException);
  });

  it('accepte une adresse identique à la casse près', async () => {
    const { service } = setup(pending({ email: 'b@example.com' }));
    await expect(service.accept(user, 'x'.repeat(43))).resolves.toBeDefined();
  });

  it('refuse en cas d’utilisation concurrente', async () => {
    const { service, tx } = setup(pending());
    tx.invitation.updateMany.mockResolvedValue({ count: 0 });
    await expect(service.accept(user, 'x'.repeat(43))).rejects.toBeInstanceOf(NotFoundException);
    expect(tx.householdMember.create).not.toHaveBeenCalled();
  });
});
