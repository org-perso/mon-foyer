"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useApi } from "@/lib/use-api";

const MAX_BYTES = 2 * 1024 * 1024;
const ACCEPTED = ["image/jpeg", "image/png", "image/webp"];

/**
 * Photo du foyer. Le contrôle côté navigateur sert seulement à guider l'utilisateur :
 * l'API revalide le contenu réel du fichier avant tout envoi à Cloudinary.
 */
export function HouseholdPhoto({
  householdId,
  name,
  photoUrl,
  canEdit,
}: {
  householdId: string;
  name: string;
  photoUrl: string | null;
  canEdit: boolean;
}) {
  const api = useApi();
  const router = useRouter();
  const input = useRef<HTMLInputElement>(null);
  const [pending, setPending] = useState(false);
  const [confirmRemove, setConfirmRemove] = useState(false);
  const [error, setError] = useState<string>();

  async function upload(file: File) {
    setError(undefined);
    if (!ACCEPTED.includes(file.type)) return setError("Format accepté : JPEG, PNG ou WebP.");
    if (file.size > MAX_BYTES) return setError("Image trop volumineuse (2 Mo maximum).");
    const body = new FormData();
    body.append("photo", file);
    setPending(true);
    try {
      await api(`/households/${householdId}/photo`, { method: "PUT", body });
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Envoi impossible.");
    } finally {
      setPending(false);
      if (input.current) input.current.value = "";
    }
  }

  async function remove() {
    setPending(true);
    try {
      await api(`/households/${householdId}/photo`, { method: "DELETE" });
      setConfirmRemove(false);
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Suppression impossible.");
    } finally {
      setPending(false);
    }
  }

  const initials = name
    .split(/\s+/)
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="flex items-center gap-4">
      <div className="relative size-16 shrink-0 overflow-hidden rounded-2xl bg-primary/10">
        {photoUrl ? (
          <Image src={photoUrl} alt={`Photo du foyer ${name}`} fill sizes="64px" className="object-cover" />
        ) : (
          <span aria-hidden className="flex size-full items-center justify-center text-lg font-semibold text-primary">
            {initials}
          </span>
        )}
      </div>
      {canEdit && (
        <div className="flex flex-col gap-2">
          <div className="flex flex-wrap gap-2">
            <Button variant="secondary" loading={pending} onClick={() => input.current?.click()}>
              {photoUrl ? "Changer la photo" : "Ajouter une photo"}
            </Button>
            {photoUrl && (
              <Button variant="ghost" disabled={pending} onClick={() => setConfirmRemove(true)}>
                Retirer
              </Button>
            )}
          </div>
          <input
            ref={input}
            type="file"
            accept={ACCEPTED.join(",")}
            className="sr-only"
            aria-label="Choisir une photo pour le foyer"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) void upload(file);
            }}
          />
          {error && (
            <p role="alert" className="text-xs text-danger">
              {error}
            </p>
          )}
        </div>
      )}
      <ConfirmDialog
        open={confirmRemove}
        title="Retirer la photo du foyer ?"
        description="La photo sera supprimée pour tous les membres."
        confirmLabel="Retirer"
        loading={pending}
        onConfirm={remove}
        onCancel={() => setConfirmRemove(false)}
      />
    </div>
  );
}
