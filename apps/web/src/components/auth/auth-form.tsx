"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Field } from "@/components/forms/field";
import { Button } from "@/components/ui/button";
import { ErrorState } from "@/components/ui/states";
import { authClient } from "@/lib/auth-client";

/** N'accepte qu'un chemin interne pour éviter les redirections ouvertes. */
function safeNext(next: string | null): string {
  return next && next.startsWith("/") && !next.startsWith("//") ? next : "/dashboard";
}

export function AuthForm({ mode }: { mode: "login" | "register" }) {
  const router = useRouter();
  const params = useSearchParams();
  const [error, setError] = useState<string>();
  const [pending, setPending] = useState(false);

  async function handleSubmit(form: FormData) {
    setPending(true);
    setError(undefined);
    const email = String(form.get("email") ?? "");
    const password = String(form.get("password") ?? "");
    const result =
      mode === "login"
        ? await authClient.signIn.email({ email, password })
        : await authClient.signUp.email({ email, password, name: String(form.get("name") ?? "") });
    setPending(false);
    if (result.error) {
      setError(
        result.error.status === 429
          ? "Trop de tentatives. Réessayez dans une minute."
          : mode === "login"
            ? "Email ou mot de passe incorrect."
            : (result.error.message ?? "Inscription impossible."),
      );
      return;
    }
    router.replace(safeNext(params.get("next")));
    router.refresh();
  }

  return (
    <form action={handleSubmit} className="flex flex-col gap-4">
      {error && <ErrorState title={error} />}
      {mode === "register" && <Field id="name" name="name" label="Prénom" autoComplete="given-name" required maxLength={80} />}
      <Field id="email" name="email" label="Email" type="email" autoComplete="email" required />
      <Field
        id="password"
        name="password"
        label="Mot de passe"
        type="password"
        autoComplete={mode === "login" ? "current-password" : "new-password"}
        minLength={10}
        required
        hint={mode === "register" ? "10 caractères minimum." : undefined}
      />
      <Button type="submit" loading={pending}>
        {mode === "login" ? "Se connecter" : "Créer mon compte"}
      </Button>
      <p className="text-center text-sm text-muted">
        {mode === "login" ? (
          <>
            Pas encore de compte ?{" "}
            <Link href="/register" className="font-medium text-primary underline-offset-4 hover:underline">
              S’inscrire
            </Link>
          </>
        ) : (
          <>
            Déjà inscrit ?{" "}
            <Link href="/login" className="font-medium text-primary underline-offset-4 hover:underline">
              Se connecter
            </Link>
          </>
        )}
      </p>
    </form>
  );
}
