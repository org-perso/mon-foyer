import { ConflictException } from '@nestjs/common';
import { MAX_HOUSEHOLDS_PER_USER } from '@mon-foyer/shared';
import type { Prisma } from '../generated/prisma/client.js';

/**
 * À appeler dans une transaction, juste avant de rattacher un utilisateur à un foyer
 * (création ou invitation acceptée).
 *
 * Le verrou consultatif par utilisateur sérialise les demandes simultanées :
 * deux créations en parallèle ne peuvent pas dépasser la limite.
 */
export async function assertCanJoinHousehold(
  tx: Prisma.TransactionClient,
  userId: string,
): Promise<void> {
  await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtextextended(${`household-limit:${userId}`}, 0))`;
  const count = await tx.householdMember.count({ where: { userId } });
  if (count >= MAX_HOUSEHOLDS_PER_USER) {
    throw new ConflictException(
      MAX_HOUSEHOLDS_PER_USER === 1
        ? 'Vous faites déjà partie d’un foyer.'
        : `Vous faites déjà partie de ${String(MAX_HOUSEHOLDS_PER_USER)} foyers.`,
    );
  }
}
