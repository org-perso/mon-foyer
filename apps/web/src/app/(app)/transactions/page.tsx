import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { TransactionFilters } from "@/components/transactions/transaction-filters";
import { TransactionList } from "@/components/transactions/transaction-list";
import type { TransactionItem } from "@/components/transactions/types";
import { LoadingState } from "@/components/ui/states";
import { apiFetch } from "@/lib/api.server";

export const metadata: Metadata = { title: "Transactions" };

const ALLOWED_FILTERS = ["householdId", "month", "type", "categoryId", "memberId"];

async function Transactions({ searchParams }: { searchParams: PageProps<"/transactions">["searchParams"] }) {
  const raw = await searchParams;
  const query = new URLSearchParams();
  for (const key of ALLOWED_FILTERS) {
    const value = raw[key];
    if (typeof value === "string" && value) query.set(key, value);
  }
  const items = await apiFetch<TransactionItem[]>(`/transactions?${query.toString()}`);
  return <TransactionList items={items} />;
}

export default function TransactionsPage(props: PageProps<"/transactions">) {
  return (
    <>
      <PageHeader
        title="Transactions"
        action={
          <Link href="/transactions/new" className="rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">
            Ajouter
          </Link>
        }
      />
      <div className="flex flex-col gap-4">
        <Suspense>
          <TransactionFilters />
        </Suspense>
        <Suspense fallback={<LoadingState />}>
          <Transactions searchParams={props.searchParams} />
        </Suspense>
      </div>
    </>
  );
}
