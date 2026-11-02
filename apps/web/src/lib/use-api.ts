"use client";

import { useAuth } from "@clerk/nextjs";
import type { ApiErrorResponse } from "@mon-foyer/shared";
import { useCallback } from "react";

/** Appels API depuis le navigateur (via le proxy /api), avec le jeton Clerk courant. */
export function useApi() {
  const { getToken } = useAuth();

  return useCallback(
    async <T>(path: string, init?: RequestInit): Promise<T> => {
      const token = await getToken();
      const res = await fetch(`/api${path}`, {
        ...init,
        headers: { ...init?.headers, ...(token && { authorization: `Bearer ${token}` }) },
      });
      if (!res.ok) {
        const body = (await res.json().catch(() => null)) as ApiErrorResponse | null;
        const message = Array.isArray(body?.message) ? body.message[0] : body?.message;
        throw new Error(message ?? "Une erreur est survenue.");
      }
      return (await res.json()) as T;
    },
    [getToken],
  );
}
