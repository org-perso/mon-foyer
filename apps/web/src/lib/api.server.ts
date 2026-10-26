import "server-only";
import type { ApiErrorResponse } from "@mon-foyer/shared";
import { cookies } from "next/headers";

const API_URL = process.env.API_INTERNAL_URL ?? "http://localhost:3001";

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message);
  }
}

/**
 * Appel de l'API depuis un Server Component, en transmettant le cookie de session.
 * Toujours non mis en cache : les données financières sont propres à chaque utilisateur.
 */
export async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const cookieHeader = (await cookies()).toString();
  const res = await fetch(`${API_URL}/api${path}`, {
    ...init,
    cache: "no-store",
    headers: { ...init?.headers, cookie: cookieHeader, accept: "application/json" },
  });
  if (!res.ok) {
    const body = (await res.json().catch(() => null)) as ApiErrorResponse | null;
    const message = Array.isArray(body?.message) ? body.message.join(", ") : body?.message;
    throw new ApiError(res.status, message ?? res.statusText);
  }
  return (await res.json()) as T;
}

/** Variante publique (sans cookie), utilisable hors contexte de requête utilisateur. */
export async function publicApiFetch<T>(path: string): Promise<T> {
  const res = await fetch(`${API_URL}/api${path}`, { cache: "no-store" });
  if (!res.ok) throw new ApiError(res.status, res.statusText);
  return (await res.json()) as T;
}
