import type { Prisma } from '../generated/prisma/client.js';

/**
 * Contexte de lecture : soit l'espace personnel de l'utilisateur,
 * soit un foyer précis (dont l'appartenance a déjà été vérifiée).
 * Les deux ne sont jamais mélangés dans une même requête.
 */
export type TransactionContext =
  | { kind: 'personal'; userId: string }
  | { kind: 'household'; householdId: string };

/**
 * Filtre de visibilité. Une transaction personnelle n'est jamais incluse
 * dans le contexte d'un foyer, même si son propriétaire en est membre.
 */
export function transactionVisibilityWhere(ctx: TransactionContext): Prisma.TransactionWhereInput {
  switch (ctx.kind) {
    case 'personal':
      return { scope: 'PERSONAL', ownerId: ctx.userId };
    case 'household':
      return { scope: 'HOUSEHOLD', householdId: ctx.householdId };
  }
}
