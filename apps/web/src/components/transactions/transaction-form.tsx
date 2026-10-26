"use client";

import { MONEY_PATTERN, type TransactionScope, type TransactionType } from "@mon-foyer/shared";
import { useState } from "react";
import { Field, inputClass } from "@/components/forms/field";
import { Button } from "@/components/ui/button";

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
  onSubmit,
}: {
  categories: { value: string; label: string }[];
  canUseHousehold: boolean;
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
      <fieldset className="grid grid-cols-2 gap-2">
        <legend className="sr-only">Type</legend>
        {(["EXPENSE", "INCOME"] as const).map((value) => (
          <Button
            key={value}
            type="button"
            variant={type === value ? "primary" : "secondary"}
            aria-pressed={type === value}
            onClick={() => setType(value)}
          >
            {value === "EXPENSE" ? "Dépense" : "Revenu"}
          </Button>
        ))}
      </fieldset>

      <Field
        id="amount"
        name="amount"
        label="Montant"
        inputMode="decimal"
        autoComplete="off"
        required
        placeholder="0"
        error={error}
      />
      <Field id="description" name="description" label="Description" required maxLength={255} />
      <Field id="occurredOn" name="occurredOn" label="Date" type="date" required />

      <div className="flex flex-col gap-1">
        <label htmlFor="categoryId" className="text-sm font-medium">
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
          <legend className="text-sm font-medium">Visibilité</legend>
          {(
            [
              ["PERSONAL", "Personnelle — visible par moi uniquement"],
              ["HOUSEHOLD", "Commune — visible par les membres du foyer"],
            ] as const
          ).map(([value, label]) => (
            <label key={value} className="flex min-h-11 items-center gap-3 rounded-xl border border-border px-3">
              <input
                type="radio"
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
