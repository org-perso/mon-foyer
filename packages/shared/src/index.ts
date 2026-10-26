/**
 * Types et constantes réellement partagés entre l'API et le frontend.
 * Les valeurs d'énumération doivent rester alignées avec le schéma Prisma.
 */

export const TransactionType = {
  EXPENSE: 'EXPENSE',
  INCOME: 'INCOME',
} as const;
export type TransactionType = (typeof TransactionType)[keyof typeof TransactionType];

export const TransactionScope = {
  PERSONAL: 'PERSONAL',
  HOUSEHOLD: 'HOUSEHOLD',
} as const;
export type TransactionScope = (typeof TransactionScope)[keyof typeof TransactionScope];

export const HouseholdRole = {
  OWNER: 'OWNER',
  ADMIN: 'ADMIN',
  MEMBER: 'MEMBER',
} as const;
export type HouseholdRole = (typeof HouseholdRole)[keyof typeof HouseholdRole];

/** Devise de référence initiale (ISO 4217). L'ariary n'a pas de subdivision utilisée. */
export const DEFAULT_CURRENCY = 'MGA';
export const DEFAULT_TIMEZONE = 'Indian/Antananarivo';

/** Nombre de décimales par devise prise en charge. */
export const CURRENCY_DECIMALS: Record<string, number> = {
  MGA: 0,
  EUR: 2,
  USD: 2,
};

/**
 * Les montants transitent en chaîne décimale (ex. "15000" ou "12.50")
 * afin d'éviter toute perte de précision liée aux nombres flottants.
 */
export type MoneyString = string;
export const MONEY_PATTERN = /^\d{1,13}(\.\d{1,2})?$/;

export interface HealthResponse {
  status: 'ok' | 'degraded';
  service: string;
  version: string;
  timestamp: string;
  database: 'up' | 'down';
}

export interface ApiErrorResponse {
  statusCode: number;
  error: string;
  message: string | string[];
  path: string;
  timestamp: string;
}

export interface MonthlyReportSummary {
  month: string; // AAAA-MM
  currency: string;
  totalIncome: MoneyString;
  totalExpense: MoneyString;
  net: MoneyString;
}
