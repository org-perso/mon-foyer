import { CheckCircle2 } from "lucide-react";
import type { Metadata } from "next";
import { Suspense } from "react";
import { HouseholdOnboarding } from "@/components/household/household-onboarding";
import { HouseholdPhoto } from "@/components/household/household-photo";
import { PageHeader } from "@/components/layout/page-header";
import { Card } from "@/components/ui/card";
import { ErrorState, LoadingState } from "@/components/ui/states";
import { getHouseholdMembers, getMyHousehold, ROLE_LABELS } from "@/lib/households";

export const metadata: Metadata = { title: "Foyer" };

async function Notice({ searchParams }: { searchParams: PageProps<"/household">["searchParams"] }) {
  const { created, photo } = await searchParams;
  if (photo === "error") {
    return (
      <div className="mb-4">
        <ErrorState
          title="Foyer créé, mais la photo n’a pas pu être envoyée"
          message="Vous pouvez la réessayer ci-dessous."
        />
      </div>
    );
  }
  if (created) {
    return (
      <p role="status" className="mb-4 flex items-center gap-2 rounded-2xl bg-income-soft p-4 text-sm font-semibold text-income">
        <CheckCircle2 aria-hidden className="size-5" />
        Votre foyer est créé.
      </p>
    );
  }
  return null;
}

async function Household() {
  const household = await getMyHousehold();
  if (!household) return <HouseholdOnboarding />;

  const members = await getHouseholdMembers(household.id);
  const canManage = household.myRole === "OWNER" || household.myRole === "ADMIN";

  return (
    <div className="flex flex-col gap-4">
      <Card className="flex flex-col gap-4 p-5">
        <HouseholdPhoto
          householdId={household.id}
          name={household.name}
          photoUrl={household.photoUrl}
          canEdit={canManage}
        />
        <div>
          <p className="text-xl font-bold">{household.name}</p>
          <p className="text-sm text-muted">
            {ROLE_LABELS[household.myRole]} · Devise {household.currency}
          </p>
        </div>
      </Card>

      <section aria-labelledby="members-title">
        <h2 id="members-title" className="mb-3 text-lg font-bold">
          Membres <span className="text-muted">({members.length})</span>
        </h2>
        <ul className="overflow-hidden rounded-3xl border border-border/70 bg-surface">
          {members.map((m) => {
            const name = m.displayName ?? m.user.name;
            return (
              <li key={m.id} className="flex items-center gap-3 border-b border-border/60 px-4 py-3 last:border-0">
                <span
                  aria-hidden
                  className="flex size-10 items-center justify-center rounded-full bg-primary-soft text-sm font-bold text-primary"
                >
                  {name.slice(0, 1).toUpperCase()}
                </span>
                <span className="flex-1 truncate font-semibold">{name}</span>
                <span className="rounded-full bg-surface-muted px-2.5 py-1 text-xs font-medium text-muted">
                  {ROLE_LABELS[m.role]}
                </span>
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}

export default function HouseholdPage(props: PageProps<"/household">) {
  return (
    <>
      <PageHeader title="Mon foyer" />
      <Suspense>
        <Notice searchParams={props.searchParams} />
      </Suspense>
      <Suspense fallback={<LoadingState />}>
        <Household />
      </Suspense>
    </>
  );
}
