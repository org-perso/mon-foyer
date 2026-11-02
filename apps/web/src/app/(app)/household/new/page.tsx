import { ChevronLeft } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { CreateHouseholdForm } from "@/components/household/create-household-form";
import { PageHeader } from "@/components/layout/page-header";
import { LoadingState } from "@/components/ui/states";
import { getMyHousehold } from "@/lib/households";

export const metadata: Metadata = { title: "Créer mon foyer" };

/** Un seul foyer par utilisateur : si le foyer existe déjà, on y renvoie. */
async function Gate() {
  if (await getMyHousehold()) redirect("/household");
  return <CreateHouseholdForm />;
}

export default function NewHouseholdPage() {
  return (
    <>
      <Link
        href="/household"
        className="-ml-2 mb-2 inline-flex min-h-11 items-center gap-1 px-2 text-sm font-semibold text-muted"
      >
        <ChevronLeft aria-hidden className="size-4" />
        Retour
      </Link>
      <PageHeader title="Créer mon foyer" subtitle="Les dépenses communes seront partagées avec ses membres" />
      <Suspense fallback={<LoadingState />}>
        <Gate />
      </Suspense>
    </>
  );
}
