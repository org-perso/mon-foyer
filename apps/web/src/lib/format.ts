import { CURRENCY_DECIMALS, type MoneyString } from "@mon-foyer/shared";

/**
 * Formate un montant reçu en chaîne décimale sans passer par un float :
 * Intl.NumberFormat accepte directement les chaînes numériques.
 */
export function formatMoney(amount: MoneyString, currency: string, locale = "fr-FR"): string {
  const digits = CURRENCY_DECIMALS[currency] ?? 2;
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(amount as Intl.StringNumericLiteral);
}

export function formatMonth(month: string, locale = "fr-FR"): string {
  const [y, m] = month.split("-").map(Number);
  return new Intl.DateTimeFormat(locale, { month: "long", year: "numeric", timeZone: "UTC" }).format(
    new Date(Date.UTC(y ?? 1970, (m ?? 1) - 1, 1)),
  );
}
