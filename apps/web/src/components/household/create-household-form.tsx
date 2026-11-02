"use client";

import { SUPPORTED_CURRENCIES } from "@mon-foyer/shared";
import { Camera, ChevronDown, X } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Field, inputClass } from "@/components/forms/field";
import { Button } from "@/components/ui/button";
import { ErrorState } from "@/components/ui/states";
import { useApi } from "@/lib/use-api";

const MAX_BYTES = 2 * 1024 * 1024;
const ACCEPTED = ["image/jpeg", "image/png", "image/webp"];
const CURRENCY_LABELS: Record<(typeof SUPPORTED_CURRENCIES)[number], string> = {
  MGA: "Ariary (MGA)",
  EUR: "Euro (EUR)",
  USD: "Dollar US (USD)",
};

/**
 * Création du foyer : nom obligatoire, photo et devise facultatives.
 * La photo est envoyée après la création ; si cet envoi échoue, le foyer existe
 * quand même et la photo peut être ajoutée depuis la page du foyer.
 */
export function CreateHouseholdForm() {
  const api = useApi();
  const router = useRouter();
  const fileInput = useRef<HTMLInputElement>(null);
  const [photo, setPhoto] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [nameError, setNameError] = useState<string>();
  const [error, setError] = useState<string>();
  const [pending, setPending] = useState(false);

  // Libère l'URL temporaire de l'aperçu
  useEffect(() => () => void (preview && URL.revokeObjectURL(preview)), [preview]);

  function pickPhoto(file: File | undefined) {
    setError(undefined);
    if (!file) return;
    if (!ACCEPTED.includes(file.type)) return setError("Photo : format accepté JPEG, PNG ou WebP.");
    if (file.size > MAX_BYTES) return setError("Photo trop volumineuse (2 Mo maximum).");
    setPhoto(file);
    setPreview(URL.createObjectURL(file));
  }

  function clearPhoto() {
    setPhoto(null);
    setPreview(null);
    if (fileInput.current) fileInput.current.value = "";
  }

  async function handleSubmit(form: FormData) {
    const name = String(form.get("name") ?? "").trim();
    if (name.length < 2) {
      setNameError("Donnez un nom à votre foyer (2 caractères minimum).");
      return;
    }
    setNameError(undefined);
    setError(undefined);
    setPending(true);

    let householdId: string;
    try {
      const created = await api<{ id: string }>("/households", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ name, currency: form.get("currency") }),
      });
      householdId = created.id;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Création impossible.");
      setPending(false);
      return;
    }

    let photoFailed = false;
    if (photo) {
      const body = new FormData();
      body.append("photo", photo);
      try {
        await api(`/households/${householdId}/photo`, { method: "PUT", body });
      } catch {
        photoFailed = true;
      }
    }

    router.replace(photoFailed ? "/household?photo=error" : "/household?created=1");
    router.refresh();
  }

  return (
    <form action={handleSubmit} className="flex flex-col gap-6">
      {error && <ErrorState title={error} />}

      <div className="flex flex-col items-center gap-3">
        <button
          type="button"
          onClick={() => fileInput.current?.click()}
          className="group relative flex size-28 items-center justify-center overflow-hidden rounded-3xl bg-primary-soft text-primary ring-1 ring-primary/20 transition hover:ring-primary/50"
          aria-label={photo ? "Changer la photo du foyer" : "Ajouter une photo du foyer"}
        >
          {preview ? (
            <Image src={preview} alt="" fill unoptimized className="object-cover" />
          ) : (
            <Camera aria-hidden className="size-8" />
          )}
          <span className="absolute inset-x-0 bottom-0 bg-black/40 py-1 text-[11px] font-semibold text-white opacity-0 transition group-hover:opacity-100">
            {photo ? "Changer" : "Ajouter"}
          </span>
        </button>
        {photo ? (
          <button type="button" onClick={clearPhoto} className="flex min-h-11 items-center gap-1 text-sm text-muted">
            <X aria-hidden className="size-4" />
            Retirer la photo
          </button>
        ) : (
          <p className="text-sm text-muted">Photo facultative</p>
        )}
        <input
          ref={fileInput}
          type="file"
          accept={ACCEPTED.join(",")}
          className="sr-only"
          tabIndex={-1}
          aria-hidden
          onChange={(e) => pickPhoto(e.target.files?.[0])}
        />
      </div>

      <Field
        id="name"
        name="name"
        label="Nom du foyer"
        placeholder="Ex. Famille Rakoto"
        autoComplete="off"
        maxLength={80}
        required
        error={nameError}
      />

      <details className="group rounded-2xl border border-border bg-surface px-4">
        <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between text-sm font-semibold">
          Options avancées
          <ChevronDown aria-hidden className="size-4 text-muted transition group-open:rotate-180" />
        </summary>
        <div className="flex flex-col gap-1.5 pb-4">
          <label htmlFor="currency" className="text-sm font-semibold">
            Devise du foyer
          </label>
          <select id="currency" name="currency" defaultValue="MGA" className={inputClass}>
            {SUPPORTED_CURRENCIES.map((c) => (
              <option key={c} value={c}>
                {CURRENCY_LABELS[c]}
              </option>
            ))}
          </select>
          <p className="text-xs text-muted">Tous les totaux du foyer seront calculés dans cette devise.</p>
        </div>
      </details>

      <Button type="submit" loading={pending}>
        Créer mon foyer
      </Button>
    </form>
  );
}
