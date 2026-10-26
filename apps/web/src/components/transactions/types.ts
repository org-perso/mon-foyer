import type { MoneyString, TransactionScope, TransactionType } from "@mon-foyer/shared";

/** Forme renvoyée par GET /api/transactions */
export interface TransactionItem {
  id: string;
  type: TransactionType;
  scope: TransactionScope;
  amount: MoneyString;
  currency: string;
  description: string;
  occurredOn: string; // AAAA-MM-JJ
  category: { id: string; name: string; icon: string | null; color: string | null };
  member: { id: string; displayName: string | null; user: { name: string } } | null;
  author: { id: string; name: string };
}
