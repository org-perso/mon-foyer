"use client";

import { Plus } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_ITEMS, SETTINGS_ITEM, type NavItem } from "./nav-items";

function isActive(pathname: string, href: string) {
  if (href === "/transactions") return pathname === "/transactions";
  return pathname === href || pathname.startsWith(`${href}/`);
}

function TabLink({ item, pathname }: { item: NavItem; pathname: string }) {
  const active = isActive(pathname, item.href);
  const Icon = item.icon;
  return (
    <Link
      href={item.href}
      aria-current={active ? "page" : undefined}
      className={`flex min-h-16 flex-col items-center justify-center gap-1 text-[11px] font-medium transition ${
        active ? "text-primary" : "text-muted"
      }`}
    >
      <span
        className={`flex h-7 w-12 items-center justify-center rounded-full transition ${active ? "bg-primary-soft" : ""}`}
      >
        <Icon aria-hidden className="size-5" strokeWidth={active ? 2.4 : 2} />
      </span>
      {item.label}
    </Link>
  );
}

/**
 * Barre de navigation mobile, à portée de pouce :
 * 4 onglets + bouton central « Ajouter », l'action la plus fréquente.
 */
export function MobileNav() {
  const pathname = usePathname();
  const [first, second, third, fourth] = NAV_ITEMS as [NavItem, NavItem, NavItem, NavItem];
  return (
    <nav
      aria-label="Navigation principale"
      className="fixed inset-x-0 bottom-0 z-20 border-t border-border/70 bg-surface/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-lg md:hidden"
    >
      <ul className="mx-auto grid max-w-md grid-cols-5 items-end">
        <li><TabLink item={first} pathname={pathname} /></li>
        <li><TabLink item={second} pathname={pathname} /></li>
        <li className="flex justify-center">
          <Link
            href="/transactions/new"
            aria-label="Ajouter une transaction"
            className="-mt-6 mb-2 flex size-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/40 transition active:scale-95"
          >
            <Plus aria-hidden className="size-7" strokeWidth={2.5} />
          </Link>
        </li>
        <li><TabLink item={third} pathname={pathname} /></li>
        <li><TabLink item={fourth} pathname={pathname} /></li>
      </ul>
    </nav>
  );
}

/** Barre latérale sur tablette et ordinateur. */
export function SideNav() {
  const pathname = usePathname();
  return (
    <nav aria-label="Navigation principale" className="hidden w-64 shrink-0 md:block">
      <div className="sticky top-0 flex h-dvh flex-col gap-1 border-r border-border/70 bg-surface p-4">
        <Link href="/dashboard" className="mb-6 flex items-center gap-2 px-3 py-2 text-lg font-bold">
          <span className="flex size-8 items-center justify-center rounded-xl bg-primary text-sm text-primary-foreground">
            MF
          </span>
          Mon-Foyer
        </Link>
        <Link
          href="/transactions/new"
          className="mb-4 flex min-h-11 items-center justify-center gap-2 rounded-2xl bg-primary text-sm font-semibold text-primary-foreground shadow-sm shadow-primary/30 hover:bg-primary-hover"
        >
          <Plus aria-hidden className="size-4" strokeWidth={2.5} />
          Ajouter
        </Link>
        {[...NAV_ITEMS, SETTINGS_ITEM].map((item) => {
          const active = isActive(pathname, item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={`flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm transition ${
                active
                  ? "bg-primary-soft font-semibold text-primary"
                  : "text-muted hover:bg-surface-muted hover:text-foreground"
              }`}
            >
              <Icon aria-hidden className="size-5" />
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
