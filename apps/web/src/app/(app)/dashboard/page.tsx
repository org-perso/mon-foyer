import type { MonthlyReportSummary } from "@mon-foyer/shared";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { SummaryCards } from "@/components/dashboard/summary-cards";
import { PageHeader } from "@/components/layout/page-header";
import { LoadingState } from "@/components/ui/states";
import { ApiError, apiFetch } from "@/lib/api.server";
import { formatMonth } from "@/lib/format";

export const metadata: Metadata = { title: "Tableau de bord" };

async function PersonalSummary() {
  let report: MonthlyReportSummary;
  try {
    report = await apiFetch<MonthlyReportSummary>("/reports/monthly");
  } catch (e) {
    if (e instanceof ApiError && e.status === 401) redirect("/login?next=/dashboard");
    throw e;
  }
  return (
    <section aria-labelledby="summary-title" className="flex flex-col gap-3">
      <h2 id="summary-title" className="text-sm font-medium text-muted capitalize">
        Mes finances · {formatMonth(report.month)}
      </h2>
      <SummaryCards report={report} />
    </section>
  );
}

export default function DashboardPage() {
  return (
    <>
      <PageHeader title="Tableau de bord" />
      <Suspense fallback={<LoadingState />}>
        <PersonalSummary />
      </Suspense>
    </>
  );
}
