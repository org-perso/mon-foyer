import type { MonthlyReportSummary } from "@mon-foyer/shared";
import { currentUser } from "@clerk/nextjs/server";
import { ChevronRight, Home, Receipt } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { SummaryCards } from "@/components/dashboard/summary-cards";
import { PageHeader } from "@/components/layout/page-header";
import { TransactionList } from "@/components/transactions/transaction-list";
import type { TransactionItem } from "@/components/transactions/types";
import { EmptyState, LoadingState, Skeleton } from "@/components/ui/states";
import { apiFetch } from "@/lib/api.server";
import { getMyHousehold } from "@/lib/households";

export const metadata: Metadata = { title: "Accueil" };

async function Greeting() {
  const user = await currentUser();
  return <PageHeader subtitle="Bonjour 👋" title={user?.firstName ?? "Bienvenue"} />;
}

async function PersonalSummary() {
  const report = await apiFetch<MonthlyReportSummary>("/reports/monthly");
  return <SummaryCards report={report} />;
}

/** Rappel discret tant que l'utilisateur n'a pas de foyer. */
async function HouseholdPrompt() {
  if (await getMyHousehold()) return null;
  return (
    <Link
      href="/household/new"
      className="mt-4 flex items-center gap-3 rounded-3xl border border-primary/20 bg-primary-soft p-4 transition active:scale-[0.99]"
    >
      <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
        <Home aria-hidden className="size-5" />
      </span>
      <span className="flex-1">
        <span className="block font-bold text-primary">Créez votre foyer</span>
        <span className="block text-sm text-muted">Pour partager les dépenses communes avec votre conjoint</span>
      </span>
      <ChevronRight aria-hidden className="size-5 text-primary" />
    </Link>
  );
}

async function RecentTransactions() {
  const items = await apiFetch<TransactionItem[]>("/transactions?take=5");
  if (items.length === 0) {
    return (
      <EmptyState
        icon={Receipt}
        title="Aucune transaction ce mois-ci"
        description="Ajoutez votre première dépense ou votre premier revenu pour voir votre bilan."
        action={
          <Link
            href="/transactions/new"
            className="inline-flex min-h-11 items-center rounded-2xl bg-primary px-5 text-sm font-semibold text-primary-foreground hover:bg-primary-hover"
          >
            Ajouter une transaction
          </Link>
        }
      />
    );
  }
  return <TransactionList items={items} />;
}

export default function DashboardPage() {
  return (
    <>
      <Suspense fallback={<Skeleton className="mb-5 h-12 w-40" />}>
        <Greeting />
      </Suspense>

      <Suspense fallback={<LoadingState />}>
        <PersonalSummary />
      </Suspense>

      <Suspense>
        <HouseholdPrompt />
      </Suspense>

      <section aria-labelledby="recent-title" className="mt-8">
        <div className="mb-3 flex items-center justify-between">
          <h2 id="recent-title" className="text-lg font-bold">
            Dernières transactions
          </h2>
          <Link
            href="/transactions"
            className="flex min-h-11 items-center gap-0.5 text-sm font-semibold text-primary"
          >
            Tout voir
            <ChevronRight aria-hidden className="size-4" />
          </Link>
        </div>
        <Suspense fallback={<Skeleton className="h-48 rounded-3xl" />}>
          <RecentTransactions />
        </Suspense>
      </section>
    </>
  );
}
