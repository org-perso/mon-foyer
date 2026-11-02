import "server-only";
import { auth } from "@clerk/nextjs/server";
import type { ApiErrorResponse } from "@mon-foyer/shared";

const API_URL = process.env.API_INTERNAL_URL ?? "http://localhost:3001";

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message);
  }
}

async function parseError(res: Response): Promise<ApiError> {
  const body = (await res.json().catch(() => null)) as ApiErrorResponse | null;
  const message = Array.isArray(body?.message) ? body.message.join(", ") : body?.message;
  return new ApiError(res.status, message ?? res.statusText);
}

/**
 * Appel de l'API depuis un Server Component, avec le jeton de session Clerk
 * (courte durée, renouvelé par Clerk). Jamais mis en cache : données propres à l'utilisateur.
 */
export async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const token = await (await auth()).getToken();
  if (!token) throw new ApiError(401, "Authentification requise.");
  const res = await fetch(`${API_URL}/api${path}`, {
    ...init,
    cache: "no-store",
    headers: { ...init?.headers, authorization: `Bearer ${token}`, accept: "application/json" },
  });
  if (!res.ok) throw await parseError(res);
  return (await res.json()) as T;
}

/** Variante publique (sans jeton). */
export async function publicApiFetch<T>(path: string): Promise<T> {
  const res = await fetch(`${API_URL}/api${path}`, { cache: "no-store" });
  if (!res.ok) throw await parseError(res);
  return (await res.json()) as T;
}
