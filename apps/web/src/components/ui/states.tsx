import { AlertCircle, Inbox, type LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

/** Squelette de chargement accessible. */
export function Skeleton({ className = "" }: { className?: string }) {
  return <div aria-hidden className={`animate-pulse rounded-2xl bg-surface-muted ${className}`} />;
}

export function LoadingState({ label = "Chargement…" }: { label?: string }) {
  return (
    <div role="status" className="space-y-3">
      <span className="sr-only">{label}</span>
      <Skeleton className="h-36 rounded-3xl" />
      <div className="grid grid-cols-2 gap-3">
        <Skeleton className="h-20" />
        <Skeleton className="h-20" />
      </div>
    </div>
  );
}

export function EmptyState({
  title,
  description,
  action,
  icon: Icon = Inbox,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
  icon?: LucideIcon;
}) {
  return (
    <div className="flex flex-col items-center gap-2 rounded-3xl border border-dashed border-border bg-surface/60 px-6 py-10 text-center">
      <span className="mb-1 flex size-12 items-center justify-center rounded-2xl bg-primary-soft text-primary">
        <Icon aria-hidden className="size-6" />
      </span>
      <p className="font-semibold">{title}</p>
      {description && <p className="max-w-xs text-sm text-muted">{description}</p>}
      {action && <div className="mt-3">{action}</div>}
    </div>
  );
}

export function ErrorState({ title = "Une erreur est survenue", message }: { title?: string; message?: string }) {
  return (
    <div role="alert" className="flex gap-3 rounded-2xl bg-expense-soft p-4 text-sm">
      <AlertCircle aria-hidden className="size-5 shrink-0 text-danger" />
      <div>
        <p className="font-semibold text-danger">{title}</p>
        {message && <p className="mt-1 text-foreground/80">{message}</p>}
      </div>
    </div>
  );
}
