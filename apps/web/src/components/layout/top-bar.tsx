import { UserButton } from "@clerk/nextjs";
import { Settings } from "lucide-react";
import Link from "next/link";

/** En-tête mobile : marque à gauche, réglages et compte à droite. */
export function TopBar() {
  return (
    <div className="sticky top-0 z-10 -mx-4 mb-2 flex h-14 items-center justify-between bg-background/90 px-4 backdrop-blur-lg md:hidden">
      <Link href="/dashboard" className="flex items-center gap-2 font-bold">
        <span className="flex size-8 items-center justify-center rounded-xl bg-primary text-xs text-primary-foreground">
          MF
        </span>
        Mon-Foyer
      </Link>
      <div className="flex items-center gap-1">
        <Link
          href="/settings"
          aria-label="Réglages"
          className="flex size-11 items-center justify-center rounded-full text-muted hover:bg-surface-muted"
        >
          <Settings aria-hidden className="size-5" />
        </Link>
        <UserButton />
      </div>
    </div>
  );
}
