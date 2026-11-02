import { ArrowDownRight, ArrowUpRight, Receipt } from "lucide-react";
import { EmptyState } from "@/components/ui/states";
import { formatMoney } from "@/lib/format";
import type { TransactionItem } from "./types";

const dateFormat = new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "short", timeZone: "UTC" });

export function TransactionList({ items }: { items: TransactionItem[] }) {
  if (items.length === 0) {
    return (
      <EmptyState
        icon={Receipt}
        title="Aucune transaction"
        description="Les dépenses et revenus enregistrés apparaîtront ici."
      />
    );
  }
  return (
    <ul className="overflow-hidden rounded-3xl border border-border/70 bg-surface">
      {items.map((t) => {
        const isExpense = t.type === "EXPENSE";
        const member = t.member?.displayName ?? t.member?.user.name;
        const Icon = isExpense ? ArrowUpRight : ArrowDownRight;
        return (
          <li key={t.id} className="flex items-center gap-3 border-b border-border/60 px-4 py-3 last:border-0">
            <span
              aria-hidden
              className={`flex size-11 shrink-0 items-center justify-center rounded-2xl text-lg ${
                isExpense ? "bg-expense-soft text-expense" : "bg-income-soft text-income"
              }`}
            >
              {t.category.icon ?? <Icon className="size-5" />}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate font-semibold">{t.description}</p>
              <p className="truncate text-xs text-muted">
                {t.category.name}
                {member && ` · ${member}`} · {dateFormat.format(new Date(t.occurredOn))}
              </p>
            </div>
            <p className={`tabular shrink-0 font-bold ${isExpense ? "text-expense" : "text-income"}`}>
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
