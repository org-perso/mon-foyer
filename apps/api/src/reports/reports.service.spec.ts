import { NotFoundException } from '@nestjs/common';
import { Decimal } from '../common/money.js';
import type { PrismaService } from '../prisma/prisma.service.js';
import type { TransactionsService } from '../transactions/transactions.service.js';
import { ReportsService } from './reports.service.js';

function setup(groups: { type: string; _sum: { amount: Decimal | null } }[]) {
  const prisma = {
    household: {
      findUniqueOrThrow: vi.fn().mockResolvedValue({ currency: 'MGA', timezone: 'Indian/Antananarivo' }),
    },
    user: { findUniqueOrThrow: vi.fn().mockResolvedValue({ defaultCurrency: 'MGA' }) },
    transaction: { groupBy: vi.fn().mockResolvedValue(groups) },
  };
  const transactions = {
    resolveContext: vi.fn(async (userId: string, householdId?: string) =>
      householdId ? { kind: 'household', householdId } : { kind: 'personal', userId },
    ),
  };
  const service = new ReportsService(
    prisma as unknown as PrismaService,
    transactions as unknown as TransactionsService,
  );
  return { service, prisma, transactions };
}

describe('ReportsService.monthlySummary', () => {
  it('distingue revenus, dépenses et solde net', async () => {
    const { service } = setup([
      { type: 'INCOME', _sum: { amount: new Decimal('1500000') } },
      { type: 'EXPENSE', _sum: { amount: new Decimal('1750000') } },
    ]);
    await expect(service.monthlySummary('user-a', undefined, '2026-10')).resolves.toEqual({
      month: '2026-10',
      currency: 'MGA',
      totalIncome: '1500000',
      totalExpense: '1750000',
      net: '-250000',
    });
  });

  it('agrège uniquement la devise de référence et le mois demandé', async () => {
    const { service, prisma } = setup([]);
    await service.monthlySummary('user-a', 'household-a', '2026-10');
    expect(prisma.transaction.groupBy).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          scope: 'HOUSEHOLD',
          householdId: 'household-a',
          currency: 'MGA',
          occurredOn: {
            gte: new Date('2026-10-01T00:00:00Z'),
            lt: new Date('2026-11-01T00:00:00Z'),
          },
        },
      }),
    );
  });

  it("propage le refus d'accès à un foyer étranger", async () => {
    const { service, transactions, prisma } = setup([]);
    transactions.resolveContext.mockRejectedValue(new NotFoundException());
    await expect(service.monthlySummary('user-b', 'household-a')).rejects.toBeInstanceOf(
      NotFoundException,
    );
    expect(prisma.transaction.groupBy).not.toHaveBeenCalled();
  });
});
