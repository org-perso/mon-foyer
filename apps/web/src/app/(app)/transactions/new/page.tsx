import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/page-header";
import { TransactionForm } from "@/components/transactions/transaction-form";

export const metadata: Metadata = { title: "Nouvelle transaction" };

export default function NewTransactionPage() {
  return (
    <>
      <PageHeader title="Nouvelle transaction" />
      <p className="mb-4 text-sm text-muted">
        L’enregistrement sera activé avec l’endpoint de création des transactions (prochaine étape).
      </p>
      <TransactionForm categories={[]} canUseHousehold />
    </>
  );
}
