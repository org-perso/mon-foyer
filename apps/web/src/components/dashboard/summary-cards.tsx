import type { MonthlyReportSummary } from "@mon-foyer/shared";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { formatMoney, formatMonth } from "@/lib/format";

/**
 * Synthèse du mois : solde net mis en avant (carte indigo),
 * puis revenus (vert) et dépenses (rouge) côte à côte.
 */
export function SummaryCards({ report, label = "Mon solde" }: { report: MonthlyReportSummary; label?: string }) {
  const negative = report.net.startsWith("-");
  return (
    <div className="flex flex-col gap-3">
      <section
        aria-label={`${label} — ${formatMonth(report.month)}`}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#4f46e5] to-[#7c3aed] p-5 text-white shadow-lg shadow-indigo-500/25"
      >
        <div aria-hidden className="absolute -top-10 -right-10 size-40 rounded-full bg-white/10" />
        <div aria-hidden className="absolute -right-4 -bottom-16 size-32 rounded-full bg-white/5" />
        <p className="relative text-sm text-white/80 first-letter:uppercase">
          {label} · {formatMonth(report.month)}
        </p>
        <p className="tabular relative mt-2 text-4xl font-bold tracking-tight">
          {formatMoney(report.net, report.currency)}
        </p>
        <p className="relative mt-1 text-xs text-white/70">
          {negative ? "Vous avez dépensé plus que vos revenus ce mois-ci" : "Revenus moins dépenses du mois"}
        </p>
      </section>

      <dl className="grid grid-cols-2 gap-3">
        <div className="rounded-3xl border border-border/70 bg-surface p-4">
          <dt className="flex items-center gap-2 text-sm text-muted">
            <span className="flex size-7 items-center justify-center rounded-full bg-income-soft text-income">
              <ArrowDownRight aria-hidden className="size-4" />
            </span>
            Revenus
          </dt>
          <dd className="tabular mt-2 text-lg font-bold text-income">
            +{formatMoney(report.totalIncome, report.currency)}
          </dd>
        </div>
        <div className="rounded-3xl border border-border/70 bg-surface p-4">
          <dt className="flex items-center gap-2 text-sm text-muted">
            <span className="flex size-7 items-center justify-center rounded-full bg-expense-soft text-expense">
              <ArrowUpRight aria-hidden className="size-4" />
            </span>
            Dépenses
          </dt>
          <dd className="tabular mt-2 text-lg font-bold text-expense">
            −{formatMoney(report.totalExpense, report.currency)}
          </dd>
        </div>
      </dl>
    </div>
  );
}
