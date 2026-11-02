import { ChevronRight, Home, Mail } from "lucide-react";
import Link from "next/link";

/** Affiché tant que l'utilisateur n'a pas de foyer : créer ou rejoindre. */
export function HouseholdOnboarding() {
  return (
    <div className="flex flex-col gap-3">
      <Link
        href="/household/new"
        className="group flex items-center gap-4 rounded-3xl bg-gradient-to-br from-[#4f46e5] to-[#7c3aed] p-5 text-white shadow-lg shadow-indigo-500/25 transition active:scale-[0.99]"
      >
        <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-white/15">
          <Home aria-hidden className="size-6" />
        </span>
        <span className="flex-1">
          <span className="block text-lg font-bold">Créer mon foyer</span>
          <span className="block text-sm text-white/80">Puis invitez votre conjoint ou votre famille</span>
        </span>
        <ChevronRight aria-hidden className="size-5 transition group-hover:translate-x-0.5" />
      </Link>

      <div className="flex items-center gap-4 rounded-3xl border border-border/70 bg-surface p-5">
        <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-primary-soft text-primary">
          <Mail aria-hidden className="size-6" />
        </span>
        <div>
          <p className="font-bold">Rejoindre un foyer</p>
          <p className="text-sm text-muted">
            Un membre vous a invité ? Ouvrez simplement le lien d’invitation qu’il vous a envoyé.
          </p>
        </div>
      </div>
    </div>
  );
}
