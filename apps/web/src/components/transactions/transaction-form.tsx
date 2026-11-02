"use client";

import {
  DEFAULT_CURRENCY,
  MONEY_PATTERN,
  type TransactionScope,
  type TransactionType,
} from "@mon-foyer/shared";
import { useState } from "react";
import { Field, inputClass } from "@/components/forms/field";
import { Button } from "@/components/ui/button";
import { AmountInput } from "./amount-input";

export interface TransactionFormValues {
  type: TransactionType;
  scope: TransactionScope;
  amount: string;
  description: string;
  occurredOn: string;
  categoryId: string;
}

/**
 * Formulaire commun aux dépenses et revenus.
 * Le montant reste une chaîne jusqu'à l'API (pas de conversion en float).
 * La validation finale est toujours faite côté serveur.
 */
export function TransactionForm({
  categories,
  canUseHousehold,
  currency = DEFAULT_CURRENCY,
  onSubmit,
}: {
  categories: { value: string; label: string }[];
  canUseHousehold: boolean;
  currency?: string;
  onSubmit?: (values: TransactionFormValues) => Promise<void>;
}) {
  const [type, setType] = useState<TransactionType>("EXPENSE");
  const [scope, setScope] = useState<TransactionScope>("PERSONAL");
  const [error, setError] = useState<string>();
  const [pending, setPending] = useState(false);

  async function handleSubmit(form: FormData) {
    const amount = String(form.get("amount") ?? "").replace(",", ".").replace(/\s/g, "");
    if (!MONEY_PATTERN.test(amount) || Number(amount) === 0) {
      setError("Montant invalide.");
      return;
    }
    setError(undefined);
    setPending(true);
    try {
      await onSubmit?.({
        type,
        scope,
        amount,
        description: String(form.get("description") ?? ""),
        occurredOn: String(form.get("occurredOn") ?? ""),
        categoryId: String(form.get("categoryId") ?? ""),
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Enregistrement impossible.");
    } finally {
      setPending(false);
    }
  }

  return (
    <form action={handleSubmit} className="flex flex-col gap-4">
      {/* Rouge = dépense, vert = revenu : la couleur confirme le choix d'un coup d'œil */}
      <fieldset className="grid grid-cols-2 gap-1 rounded-2xl bg-surface-muted p-1">
        <legend className="sr-only">Type</legend>
        {(["EXPENSE", "INCOME"] as const).map((value) => {
          const selected = type === value;
          const tone = value === "EXPENSE" ? "bg-expense text-white" : "bg-income text-white";
          return (
            <button
              key={value}
              type="button"
              aria-pressed={selected}
              onClick={() => setType(value)}
              className={`min-h-11 rounded-xl text-sm font-semibold transition ${
                selected ? `${tone} shadow-sm` : "text-muted hover:text-foreground"
              }`}
            >
              {value === "EXPENSE" ? "Dépense" : "Revenu"}
            </button>
          );
        })}
      </fieldset>

      <AmountInput type={type} currency={currency} error={error} />
      <Field id="description" name="description" label="Description" required maxLength={255} />
      <Field id="occurredOn" name="occurredOn" label="Date" type="date" required />

      <div className="flex flex-col gap-1.5">
        <label htmlFor="categoryId" className="text-sm font-semibold">
          Catégorie
        </label>
        <select id="categoryId" name="categoryId" required className={inputClass}>
          <option value="">Choisir…</option>
          {categories.map((c) => (
            <option key={c.value} value={c.value}>
              {c.label}
            </option>
          ))}
        </select>
      </div>

      {canUseHousehold && (
        <fieldset className="flex flex-col gap-2">
          <legend className="text-sm font-semibold">Visibilité</legend>
          {(
            [
              ["PERSONAL", "Personnelle — visible par moi uniquement"],
              ["HOUSEHOLD", "Commune — visible par les membres du foyer"],
            ] as const
          ).map(([value, label]) => (
            <label key={value} className="flex min-h-12 items-center gap-3 rounded-2xl border border-border bg-surface px-4 has-checked:border-primary has-checked:bg-primary-soft">
              <input
                type="radio"
                className="size-4 accent-primary"
                name="scope"
                value={value}
                checked={scope === value}
                onChange={() => setScope(value)}
              />
              <span className="text-sm">{label}</span>
            </label>
          ))}
        </fieldset>
      )}

      <Button type="submit" loading={pending} disabled={!onSubmit}>
        Enregistrer
      </Button>
    </form>
  );
}
