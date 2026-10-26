import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/page-header";
import { EmptyState } from "@/components/ui/states";

export const metadata: Metadata = { title: "Bilans" };

export default function ReportsPage() {
  return (
    <>
      <PageHeader title="Bilans" />
      <EmptyState
        title="Bilans mensuels à venir"
        description="Revenus, dépenses et solde net par catégorie et par membre, avec graphiques."
      />
    </>
  );
}
