import { CURRENCY_DECIMALS, type MoneyString } from '@mon-foyer/shared';
import { Prisma } from '../generated/prisma/client.js';

export const Decimal = Prisma.Decimal;
export type Decimal = Prisma.Decimal;

/** Nombre de décimales d'une devise (2 par défaut pour une devise non répertoriée). */
export function currencyDecimals(currency: string): number {
  return CURRENCY_DECIMALS[currency] ?? 2;
}

/**
 * Convertit une chaîne saisie en Decimal en vérifiant la précision de la devise.
 * Lève une erreur si le montant n'est pas strictement positif ou trop précis.
 */
export function parseAmount(value: MoneyString, currency: string): Decimal {
  const amount = new Decimal(value);
  if (!amount.isFinite() || amount.lte(0)) {
    throw new RangeError('Le montant doit être strictement positif.');
  }
  if (amount.decimalPlaces() > currencyDecimals(currency)) {
    throw new RangeError(`Trop de décimales pour la devise ${currency}.`);
  }
  return amount;
}

/** Formate un Decimal en chaîne avec la précision de la devise (sans perte). */
export function formatAmount(amount: Decimal, currency: string): MoneyString {
  return amount.toFixed(currencyDecimals(currency));
}

/** Somme exacte d'une liste de montants. */
export function sumAmounts(amounts: readonly Decimal[]): Decimal {
  return amounts.reduce<Decimal>((acc, a) => acc.plus(a), new Decimal(0));
}
