import type { HTMLAttributes } from "react";

export function Card({ className = "", ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`rounded-3xl border border-border/70 bg-surface p-4 shadow-[0_1px_2px_rgb(17_24_39/0.04)] ${className}`}
      {...props}
    />
  );
}
