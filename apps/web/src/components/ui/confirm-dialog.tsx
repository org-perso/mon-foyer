"use client";

import { useEffect, useRef } from "react";
import { Button } from "./button";

/**
 * Confirmation des actions destructrices (ex. suppression d'une transaction).
 * S'appuie sur <dialog> natif : focus piégé, Échap pour fermer.
 */
export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = "Supprimer",
  onConfirm,
  onCancel,
  loading = false,
}: {
  open: boolean;
  title: string;
  description?: string;
  confirmLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
}) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      onCancel={onCancel}
      aria-labelledby="confirm-title"
      className="m-auto w-[min(24rem,calc(100%-2rem))] rounded-2xl border border-border bg-surface p-5 text-foreground backdrop:bg-black/40"
    >
      <h2 id="confirm-title" className="text-lg font-semibold">
        {title}
      </h2>
      {description && <p className="mt-2 text-sm text-muted">{description}</p>}
      <div className="mt-5 flex justify-end gap-2">
        <Button variant="secondary" onClick={onCancel} disabled={loading}>
          Annuler
        </Button>
        <Button variant="danger" onClick={onConfirm} loading={loading}>
          {confirmLabel}
        </Button>
      </div>
    </dialog>
  );
}
