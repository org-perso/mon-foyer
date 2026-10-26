import { ForbiddenException, NotFoundException } from '@nestjs/common';
import type { PrismaService } from '../prisma/prisma.service.js';
import { HouseholdMembersService, MANAGER_ROLES } from './household-members.service.js';

function serviceWith(membership: unknown) {
  const findUnique = vi.fn().mockResolvedValue(membership);
  const prisma = { householdMember: { findUnique } } as unknown as PrismaService;
  return { service: new HouseholdMembersService(prisma), findUnique };
}

describe('HouseholdMembersService.requireMembership', () => {
  it("refuse l'accès à un foyer dont l'utilisateur n'est pas membre (404)", async () => {
    const { service } = serviceWith(null);
    await expect(service.requireMembership('user-b', 'household-a')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('vérifie l’appartenance sur le couple (foyer, utilisateur)', async () => {
    const { service, findUnique } = serviceWith({ id: 'm1', role: 'MEMBER' });
    await service.requireMembership('user-a', 'household-a');
    expect(findUnique).toHaveBeenCalledWith({
      where: { householdId_userId: { householdId: 'household-a', userId: 'user-a' } },
    });
  });

  it('refuse une action réservée aux gestionnaires à un simple membre (403)', async () => {
    const { service } = serviceWith({ id: 'm1', role: 'MEMBER' });
    await expect(
      service.requireMembership('user-a', 'household-a', MANAGER_ROLES),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('autorise le propriétaire', async () => {
    const { service } = serviceWith({ id: 'm1', role: 'OWNER' });
    await expect(
      service.requireMembership('user-a', 'household-a', MANAGER_ROLES),
    ).resolves.toMatchObject({ role: 'OWNER' });
  });
});
