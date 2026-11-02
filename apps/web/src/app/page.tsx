import Link from "next/link";

/**
 * Landing page : un message, deux actions.
 * Mobile : boutons en bas de l'écran, à portée de pouce. Ordinateur : centrés sous le texte.
 */
export default function Home() {
  return (
    <main className="relative isolate flex min-h-dvh flex-1 flex-col overflow-hidden bg-gradient-to-br from-[#4f46e5] via-[#5b3fe0] to-[#7c3aed] text-white">
      <div aria-hidden className="absolute -top-24 -right-24 -z-10 size-72 rounded-full bg-white/10 blur-[2px]" />
      <div aria-hidden className="absolute -bottom-32 -left-24 -z-10 size-80 rounded-full bg-white/5" />

      <div className="mx-auto flex w-full max-w-md flex-1 flex-col px-6 pt-[max(3rem,env(safe-area-inset-top))] pb-[max(2rem,env(safe-area-inset-bottom))] md:justify-center">
        <div className="flex items-center gap-2 text-lg font-bold">
          <span className="flex size-10 items-center justify-center rounded-2xl bg-white/15 text-sm ring-1 ring-white/20">
            MF
          </span>
          Mon-Foyer
        </div>

        <div className="mt-auto md:mt-16">
          <h1 className="text-[2.5rem] leading-[1.1] font-bold tracking-tight">
            Les finances du foyer, enfin simples.
          </h1>
          <p className="mt-4 text-lg text-white/80">
            Dépenses, revenus et bilans du mois, à deux ou en famille.
          </p>
        </div>

        <div className="mt-10 flex flex-col gap-3">
          <Link
            href="/register"
            className="flex min-h-14 items-center justify-center rounded-2xl bg-white text-base font-semibold text-[#4f46e5] shadow-lg shadow-black/10 transition active:scale-[0.98] hover:bg-white/90"
          >
            Créer un compte
          </Link>
          <Link
            href="/login"
            className="flex min-h-14 items-center justify-center rounded-2xl text-base font-semibold text-white ring-1 ring-white/40 transition active:scale-[0.98] hover:bg-white/10"
          >
            J’ai déjà un compte
          </Link>
        </div>
      </div>
    </main>
  );
}
