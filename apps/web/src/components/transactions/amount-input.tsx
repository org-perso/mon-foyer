"use client";

import { CURRENCY_DECIMALS } from "@mon-foyer/shared";
import { useState } from "react";

const MAX_INTEGER_DIGITS = 13; // aligné sur MONEY_PATTERN (DECIMAL(15,2) en base)
const GROUP_SEPARATOR = " "; // espace fine insécable, comme en typographie française

/**
 * Nettoie la saisie : chiffres uniquement, virgule ou point comme séparateur décimal,
 * nombre de décimales limité par la devise (0 pour l'ariary).
 */
export function normalizeAmount(raw: string, decimals: number): string {
  const cleaned = raw.replace(/[^\d.,]/g, "").replace(",", ".");
  const [intPart = "", ...rest] = cleaned.split(".");
  const integer = intPart.replace(/^0+(?=\d)/, "").slice(0, MAX_INTEGER_DIGITS);
  if (decimals === 0 || rest.length === 0) return integer;
  return `${integer || "0"}.${rest.join("").slice(0, decimals)}`;
}

/** Ajoute les séparateurs de milliers pour l'affichage : 1500000 → 1 500 000. */
export function groupThousands(value: string): string {
  const [integer = "", fraction] = value.split(".");
  const grouped = integer.replace(/\B(?=(\d{3})+(?!\d))/g, GROUP_SEPARATOR);
  return fraction === undefined ? grouped : `${grouped},${fraction}`;
}

/** Taille de police décroissante : le montant reste entièrement visible sur un petit écran. */
function fontSizeFor(length: number): string {
  if (length <= 5) return "3rem";
  if (length <= 8) return "2.5rem";
  if (length <= 11) return "2rem";
  if (length <= 14) return "1.625rem";
  return "1.375rem";
}

export function AmountInput({
  type,
  currency,
  currencyLabel = currency === "MGA" ? "Ar" : currency,
  error,
}: {
  type: "EXPENSE" | "INCOME";
  currency: string;
  currencyLabel?: string;
  error?: string;
}) {
  const decimals = CURRENCY_DECIMALS[currency] ?? 2;
  const [value, setValue] = useState(""); // valeur brute, ex. « 1500000 »
  const display = groupThousands(value);
  const tone = type === "EXPENSE" ? "text-expense" : "text-income";

  return (
    <div className="flex flex-col items-center gap-1 py-2">
      <label htmlFor="amount" className="text-sm font-semibold text-muted">
        Montant
      </label>
      <div
        className={`flex w-full min-w-0 items-baseline justify-center gap-1.5 font-bold ${tone}`}
        style={{ fontSize: fontSizeFor(display.length) }}
      >
        <span aria-hidden className="shrink-0 transition-[font-size]">
          {type === "EXPENSE" ? "−" : "+"}
        </span>
        <input
          id="amount"
          inputMode={decimals > 0 ? "decimal" : "numeric"}
          autoComplete="off"
          enterKeyHint="next"
          required
          placeholder="0"
          value={display}
          onChange={(e) => setValue(normalizeAmount(e.target.value, decimals))}
          aria-invalid={!!error || undefined}
          aria-describedby={error ? "amount-error" : "amount-hint"}
          // Largeur ajustée au contenu (chiffres à chasse fixe) : jamais tronqué ni décentré
          style={{ width: `${Math.max(display.length, 1) + 0.5}ch` }}
          className="tabular min-w-[1.5ch] max-w-full bg-transparent text-center leading-tight placeholder:text-muted/40 focus:outline-none"
        />
        <span className="shrink-0 text-[0.45em] font-semibold text-muted">{currencyLabel}</span>
        {/* Valeur envoyée : sans séparateurs */}
        <input type="hidden" name="amount" value={value} />
      </div>
      {error ? (
        <p id="amount-error" className="text-xs font-medium text-danger">
          {error}
        </p>
      ) : (
        <p id="amount-hint" className="sr-only">
          {decimals === 0 ? "Montant entier, sans décimales" : `Jusqu’à ${String(decimals)} décimales`}
        </p>
      )}
    </div>
  );
}
