import type { HealthResponse } from "@mon-foyer/shared";
import { publicApiFetch } from "@/lib/api.server";

/** Vérifie la communication frontend → API → base de données. */
export async function ApiStatus() {
  let health: HealthResponse | null = null;
  try {
    health = await publicApiFetch<HealthResponse>("/health");
  } catch {
    health = null;
  }
  const ok = health?.status === "ok";
  return (
    <p role="status" className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-1 text-xs">
      <span aria-hidden className={`size-2 rounded-full ${ok ? "bg-income" : "bg-danger"}`} />
      {health
        ? `API ${ok ? "opérationnelle" : "dégradée"} · base de données ${health.database === "up" ? "connectée" : "indisponible"}`
        : "API injoignable"}
    </p>
  );
}
