import { BadRequestException, Injectable } from '@nestjs/common';
import type { MonthlyReportSummary } from '@mon-foyer/shared';
import { Decimal, formatAmount } from '../common/money.js';
import { currentMonthIn, isValidMonth, monthRange } from '../common/month.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { TransactionsService } from '../transactions/transactions.service.js';
import { transactionVisibilityWhere } from '../transactions/transaction-visibility.js';

@Injectable()
export class ReportsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly transactions: TransactionsService,
  ) {}

  /**
   * Bilan mensuel calculé en base à partir des données persistées.
   * Seules les transactions dans la devise de référence du contexte sont agrégées :
   * les montants de devises différentes ne sont jamais additionnés.
   */
  async monthlySummary(
    userId: string,
    householdId: string | undefined,
    month?: string,
  ): Promise<MonthlyReportSummary> {
    const ctx = await this.transactions.resolveContext(userId, householdId);
    const reference = householdId
      ? await this.prisma.household.findUniqueOrThrow({
          where: { id: householdId },
          select: { currency: true, timezone: true },
        })
      : await this.prisma.user
          .findUniqueOrThrow({ where: { id: userId }, select: { defaultCurrency: true } })
          .then((u) => ({ currency: u.defaultCurrency, timezone: undefined }));

    const targetMonth = month ?? currentMonthIn(reference.timezone ?? 'UTC');
    if (!isValidMonth(targetMonth)) {
      throw new BadRequestException('month doit être au format AAAA-MM');
    }
    const range = monthRange(targetMonth);

    const groups = await this.prisma.transaction.groupBy({
      by: ['type'],
      where: {
        ...transactionVisibilityWhere(ctx),
        currency: reference.currency,
        occurredOn: { gte: range.start, lt: range.end },
      },
      _sum: { amount: true },
    });

    const total = (type: 'INCOME' | 'EXPENSE') =>
      groups.find((g) => g.type === type)?._sum.amount ?? new Decimal(0);
    const income = total('INCOME');
    const expense = total('EXPENSE');

    return {
      month: targetMonth,
      currency: reference.currency,
      totalIncome: formatAmount(income, reference.currency),
      totalExpense: formatAmount(expense, reference.currency),
      net: formatAmount(income.minus(expense), reference.currency),
    };
  }
}
