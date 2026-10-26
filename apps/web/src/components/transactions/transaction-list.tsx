import { EmptyState } from "@/components/ui/states";
import { formatMoney } from "@/lib/format";
import type { TransactionItem } from "./types";

const dateFormat = new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "short", timeZone: "UTC" });

export function TransactionList({ items }: { items: TransactionItem[] }) {
  if (items.length === 0) {
    return (
      <EmptyState
        title="Aucune transaction"
        description="Les dépenses et revenus enregistrés apparaîtront ici."
      />
    );
  }
  return (
    <ul className="divide-y divide-border rounded-2xl border border-border bg-surface">
      {items.map((t) => {
        const isExpense = t.type === "EXPENSE";
        const member = t.member?.displayName ?? t.member?.user.name;
        return (
          <li key={t.id} className="flex items-center gap-3 p-3">
            <span
              aria-hidden
              className="flex size-10 shrink-0 items-center justify-center rounded-full bg-background text-lg"
              style={t.category.color ? { color: t.category.color } : undefined}
            >
              {t.category.icon ?? (isExpense ? "−" : "+")}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate font-medium">{t.description}</p>
              <p className="truncate text-xs text-muted">
                {t.category.name}
                {member && ` · ${member}`} · {dateFormat.format(new Date(t.occurredOn))}
              </p>
            </div>
            <p className={`tabular shrink-0 font-semibold ${isExpense ? "text-expense" : "text-income"}`}>
              <span className="sr-only">{isExpense ? "Dépense" : "Revenu"} </span>
              {isExpense ? "−" : "+"}
              {formatMoney(t.amount, t.currency)}
            </p>
          </li>
        );
      })}
    </ul>
  );
}
