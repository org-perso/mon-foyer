import type { ReactNode } from "react";

/** Squelette de chargement accessible. */
export function Skeleton({ className = "" }: { className?: string }) {
  return <div aria-hidden className={`animate-pulse rounded-xl bg-border ${className}`} />;
}

export function LoadingState({ label = "Chargement…" }: { label?: string }) {
  return (
    <div role="status" className="space-y-3">
      <span className="sr-only">{label}</span>
      <Skeleton className="h-20" />
      <Skeleton className="h-20" />
      <Skeleton className="h-20" />
    </div>
  );
}

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-border p-8 text-center">
      <p className="font-medium">{title}</p>
      {description && <p className="text-sm text-muted">{description}</p>}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}

export function ErrorState({ title = "Une erreur est survenue", message }: { title?: string; message?: string }) {
  return (
    <div role="alert" className="rounded-2xl border border-danger/40 bg-danger/5 p-4 text-sm">
      <p className="font-medium text-danger">{title}</p>
      {message && <p className="mt-1 text-muted">{message}</p>}
    </div>
  );
}
