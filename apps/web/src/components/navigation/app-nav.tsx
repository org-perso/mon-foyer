"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_ITEMS } from "./nav-items";

function isActive(pathname: string, href: string) {
  if (href === "/transactions") return pathname === "/transactions";
  return pathname === href || pathname.startsWith(`${href}/`);
}

/** Barre de navigation fixe en bas sur mobile. */
export function MobileNav() {
  const pathname = usePathname();
  return (
    <nav
      aria-label="Navigation principale"
      className="fixed inset-x-0 bottom-0 z-20 border-t border-border bg-surface/95 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden"
    >
      <ul className="grid grid-cols-5">
        {NAV_ITEMS.map((item) => {
          const active = isActive(pathname, item.href);
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`flex min-h-14 flex-col items-center justify-center gap-0.5 text-xs ${
                  active ? "font-semibold text-primary" : "text-muted"
                }`}
              >
                <span aria-hidden className="text-lg leading-none">
                  {item.icon}
                </span>
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

/** Barre latérale sur tablette et ordinateur. */
export function SideNav() {
  const pathname = usePathname();
  return (
    <nav aria-label="Navigation principale" className="hidden w-56 shrink-0 md:block">
      <div className="sticky top-0 flex h-dvh flex-col gap-1 border-r border-border p-4">
        <Link href="/dashboard" className="mb-6 px-3 text-lg font-semibold">
          Mon-Foyer
        </Link>
        {[...NAV_ITEMS, { href: "/settings", label: "Réglages", icon: "⚙" }].map((item) => {
          const active = isActive(pathname, item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={`flex items-center gap-3 rounded-xl px-3 py-2 text-sm ${
                active ? "bg-primary/10 font-semibold text-primary" : "text-foreground hover:bg-border/50"
              }`}
            >
              <span aria-hidden className="w-4 text-center">
                {item.icon}
              </span>
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
