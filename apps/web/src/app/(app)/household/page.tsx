import type { Metadata } from "next";
import { Suspense } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { Card } from "@/components/ui/card";
import { EmptyState, LoadingState } from "@/components/ui/states";
import { apiFetch } from "@/lib/api.server";

export const metadata: Metadata = { title: "Foyer" };

interface HouseholdSummary {
  id: string;
  name: string;
  currency: string;
  members: { role: string }[];
}

const roleLabel: Record<string, string> = { OWNER: "Propriétaire", ADMIN: "Administrateur", MEMBER: "Membre" };

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
          <Card className="flex items-center justify-between">
            <div>
              <p className="font-medium">{h.name}</p>
              <p className="text-xs text-muted">Devise : {h.currency}</p>
            </div>
            <span className="text-xs text-muted">{roleLabel[h.members[0]?.role ?? "MEMBER"]}</span>
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
