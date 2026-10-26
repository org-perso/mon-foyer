import type { InputHTMLAttributes } from "react";

export const inputClass =
  "min-h-11 w-full rounded-xl border border-border bg-surface px-3 text-base focus-visible:outline-2 focus-visible:outline-primary aria-invalid:border-danger";

export function Field({
  label,
  error,
  hint,
  id,
  ...props
}: InputHTMLAttributes<HTMLInputElement> & { label: string; error?: string; hint?: string; id: string }) {
  const describedBy = [error && `${id}-error`, hint && `${id}-hint`].filter(Boolean).join(" ") || undefined;
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className="text-sm font-medium">
        {label}
      </label>
      <input id={id} className={inputClass} aria-invalid={!!error || undefined} aria-describedby={describedBy} {...props} />
      {hint && (
        <p id={`${id}-hint`} className="text-xs text-muted">
          {hint}
        </p>
      )}
      {error && (
        <p id={`${id}-error`} className="text-xs text-danger">
          {error}
        </p>
      )}
    </div>
  );
}
