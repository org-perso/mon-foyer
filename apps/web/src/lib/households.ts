import "server-only";
import type { HouseholdRole } from "@mon-foyer/shared";
import { apiFetch } from "./api.server";

export interface HouseholdSummary {
  id: string;
  name: string;
  currency: string;
  timezone: string;
  photoUrl: string | null;
  myRole: HouseholdRole;
}

export interface HouseholdMemberItem {
  id: string;
  role: HouseholdRole;
  displayName: string | null;
  joinedAt: string;
  user: { id: string; name: string; imageUrl: string | null };
}

/** Foyer de l'utilisateur (un seul pendant la phase de test), ou null. */
export async function getMyHousehold(): Promise<HouseholdSummary | null> {
  const households = await apiFetch<HouseholdSummary[]>("/households");
  return households[0] ?? null;
}

export function getHouseholdMembers(householdId: string): Promise<HouseholdMemberItem[]> {
  return apiFetch<HouseholdMemberItem[]>(`/households/${householdId}/members`);
}

export const ROLE_LABELS: Record<HouseholdRole, string> = {
  OWNER: "Propriétaire",
  ADMIN: "Administrateur",
  MEMBER: "Membre",
};
