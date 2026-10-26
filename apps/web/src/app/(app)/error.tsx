"use client";

import { Button } from "@/components/ui/button";
import { ErrorState } from "@/components/ui/states";

export default function AppError({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="flex flex-col gap-4">
      <ErrorState message="Impossible de charger cette page. Vérifiez votre connexion puis réessayez." />
      <Button variant="secondary" onClick={reset}>
        Réessayer
      </Button>
    </div>
  );
}
