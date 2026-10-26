import type { Metadata } from "next";
import { Suspense } from "react";
import { HouseholdPhoto } from "@/components/household/household-photo";
import { PageHeader } from "@/components/layout/page-header";
import { Card } from "@/components/ui/card";
import { EmptyState, LoadingState } from "@/components/ui/states";
import { apiFetch } from "@/lib/api.server";

export const metadata: Metadata = { title: "Foyer" };

interface HouseholdSummary {
  id: string;
  name: string;
  currency: string;
  photoUrl: string | null;
  myRole: "OWNER" | "ADMIN" | "MEMBER";
}

const roleLabel: Record<HouseholdSummary["myRole"], string> = {
  OWNER: "Propriétaire",
  ADMIN: "Administrateur",
  MEMBER: "Membre",
};

async function Households() {
  const households = await apiFetch<HouseholdSummary[]>("/households");
  if (households.length === 0) {
    return (
      <EmptyState
        title="Aucun foyer"
        description="Créez votre foyer puis invitez votre conjoint, ou rejoignez un foyer existant avec une invitation."
      />
    );
  }
  return (
    <ul className="flex flex-col gap-3">
      {households.map((h) => (
        <li key={h.id}>
          <Card className="flex flex-col gap-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-lg font-semibold">{h.name}</p>
                <p className="text-xs text-muted">
                  {roleLabel[h.myRole]} · Devise {h.currency}
                </p>
              </div>
            </div>
            <HouseholdPhoto
              householdId={h.id}
              name={h.name}
              photoUrl={h.photoUrl}
              canEdit={h.myRole === "OWNER" || h.myRole === "ADMIN"}
            />
          </Card>
        </li>
      ))}
    </ul>
  );
}

export default function HouseholdPage() {
  return (
    <>
      <PageHeader title="Mon foyer" />
      <Suspense fallback={<LoadingState />}>
        <Households />
      </Suspense>
    </>
  );
}
