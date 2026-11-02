import type { ReactNode } from "react";

export function PageHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}) {
  return (
    <header className="mb-5 flex items-center justify-between gap-3">
      <div className="min-w-0">
        {subtitle && <p className="text-sm text-muted">{subtitle}</p>}
        <h1 className="truncate text-2xl font-bold tracking-tight">{title}</h1>
      </div>
      {action}
    </header>
  );
}
