import { Injectable } from '@nestjs/common';
import { formatAmount } from '../common/money.js';
import { monthRange } from '../common/month.js';
import { HouseholdMembersService } from '../household-members/household-members.service.js';
import { PrismaService } from '../prisma/prisma.service.js';
import type { ListTransactionsQuery } from './dto/list-transactions.query.js';
import { transactionVisibilityWhere, type TransactionContext } from './transaction-visibility.js';

@Injectable()
export class TransactionsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly members: HouseholdMembersService,
  ) {}

  /** Résout le contexte en vérifiant l'appartenance au foyer côté serveur. */
  async resolveContext(userId: string, householdId?: string): Promise<TransactionContext> {
    if (!householdId) return { kind: 'personal', userId };
    await this.members.requireMembership(userId, householdId);
    return { kind: 'household', householdId };
  }

  async list(userId: string, query: ListTransactionsQuery) {
    const ctx = await this.resolveContext(userId, query.householdId);
    const range = query.month ? monthRange(query.month) : undefined;
    const rows = await this.prisma.transaction.findMany({
      where: {
        ...transactionVisibilityWhere(ctx),
        ...(query.type && { type: query.type }),
        ...(query.categoryId && { categoryId: query.categoryId }),
        ...(query.memberId && { memberId: query.memberId }),
        ...(range && { occurredOn: { gte: range.start, lt: range.end } }),
      },
      orderBy: [{ occurredOn: 'desc' }, { createdAt: 'desc' }],
      take: query.take,
      select: {
        id: true,
        type: true,
        scope: true,
        amount: true,
        currency: true,
        description: true,
        occurredOn: true,
        category: { select: { id: true, name: true, icon: true, color: true } },
        member: { select: { id: true, displayName: true, user: { select: { name: true } } } },
        author: { select: { id: true, name: true } },
      },
    });
    // Montants sérialisés en chaîne : jamais de nombre flottant côté client
    return rows.map((t) => ({
      ...t,
      amount: formatAmount(t.amount, t.currency),
      occurredOn: t.occurredOn.toISOString().slice(0, 10),
    }));
  }
}
