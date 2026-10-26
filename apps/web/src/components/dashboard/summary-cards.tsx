import type { MonthlyReportSummary } from "@mon-foyer/shared";
import { Card } from "@/components/ui/card";
import { formatMoney } from "@/lib/format";

export function SummaryCards({ report }: { report: MonthlyReportSummary }) {
  const netNegative = report.net.startsWith("-");
  const items = [
    { label: "Revenus", value: report.totalIncome, tone: "text-income" },
    { label: "Dépenses", value: report.totalExpense, tone: "text-expense" },
    { label: "Solde net", value: report.net, tone: netNegative ? "text-expense" : "text-foreground" },
  ];
  return (
    <dl className="grid grid-cols-1 gap-3 sm:grid-cols-3">
      {items.map((item) => (
        <Card key={item.label}>
          <dt className="text-sm text-muted">{item.label}</dt>
          <dd className={`tabular mt-1 text-2xl font-semibold ${item.tone}`}>
            {formatMoney(item.value, report.currency)}
          </dd>
        </Card>
      ))}
    </dl>
  );
}
