"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

export interface FilterOption {
  value: string;
  label: string;
}

const fieldClass =
  "min-h-11 w-full rounded-xl border border-border bg-surface px-3 text-sm focus-visible:outline-2 focus-visible:outline-primary";

/** Filtres synchronisés avec l'URL (partageables, compatibles avec le rendu serveur). */
export function TransactionFilters({
  categories = [],
  members = [],
}: {
  categories?: FilterOption[];
  members?: FilterOption[];
}) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  function update(key: string, value: string) {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);
    else next.delete(key);
    router.replace(`${pathname}?${next.toString()}`, { scroll: false });
  }

  return (
    <form role="search" aria-label="Filtrer les transactions" className="grid grid-cols-2 gap-2 sm:grid-cols-4">
      <label className="col-span-2 sm:col-span-1">
        <span className="sr-only">Mois</span>
        <input
          type="month"
          className={fieldClass}
          defaultValue={params.get("month") ?? ""}
          onChange={(e) => update("month", e.target.value)}
        />
      </label>
      <label>
        <span className="sr-only">Type</span>
        <select className={fieldClass} defaultValue={params.get("type") ?? ""} onChange={(e) => update("type", e.target.value)}>
          <option value="">Tous types</option>
          <option value="EXPENSE">Dépenses</option>
          <option value="INCOME">Revenus</option>
        </select>
      </label>
      <label>
        <span className="sr-only">Catégorie</span>
        <select
          className={fieldClass}
          defaultValue={params.get("categoryId") ?? ""}
          onChange={(e) => update("categoryId", e.target.value)}
        >
          <option value="">Toutes catégories</option>
          {categories.map((c) => (
            <option key={c.value} value={c.value}>
              {c.label}
            </option>
          ))}
        </select>
      </label>
      {members.length > 0 && (
        <label>
          <span className="sr-only">Membre</span>
          <select
            className={fieldClass}
            defaultValue={params.get("memberId") ?? ""}
            onChange={(e) => update("memberId", e.target.value)}
          >
            <option value="">Tous les membres</option>
            {members.map((m) => (
              <option key={m.value} value={m.value}>
                {m.label}
              </option>
            ))}
          </select>
        </label>
      )}
    </form>
  );
}
