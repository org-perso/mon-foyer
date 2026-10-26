import Link from "next/link";
import { Suspense } from "react";
import { ApiStatus } from "@/components/api-status";

const features = [
  { title: "Personnel et commun", text: "Vos dépenses personnelles restent privées ; les dépenses du foyer sont partagées." },
  { title: "Bilans mensuels", text: "Revenus, dépenses et solde net par catégorie et par personne." },
  { title: "En ariary par défaut", text: "Montants exacts, sans arrondi approximatif." },
];

export default function Home() {
  return (
    <main className="mx-auto flex w-full max-w-xl flex-1 flex-col justify-center gap-8 px-5 py-12">
      <div className="flex flex-col gap-4">
        <Suspense fallback={<p className="text-xs text-muted">Vérification de l’API…</p>}>
          <ApiStatus />
        </Suspense>
        <h1 className="text-4xl font-semibold tracking-tight">Mon-Foyer</h1>
        <p className="text-lg text-muted">
          Les finances de votre foyer, au même endroit : dépenses, revenus et bilans, à deux ou en famille.
        </p>
      </div>

      <ul className="flex flex-col gap-3">
        {features.map((f) => (
          <li key={f.title} className="rounded-2xl border border-border bg-surface p-4">
            <p className="font-medium">{f.title}</p>
            <p className="mt-1 text-sm text-muted">{f.text}</p>
          </li>
        ))}
      </ul>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Link
          href="/register"
          className="flex min-h-12 items-center justify-center rounded-xl bg-primary font-medium text-primary-foreground"
        >
          Créer un compte
        </Link>
        <Link
          href="/login"
          className="flex min-h-12 items-center justify-center rounded-xl border border-border bg-surface font-medium"
        >
          Se connecter
        </Link>
      </div>
    </main>
  );
}
