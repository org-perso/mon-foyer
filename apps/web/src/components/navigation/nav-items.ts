export interface NavItem {
  href: string;
  label: string;
  icon: string;
}

export const NAV_ITEMS: NavItem[] = [
  { href: "/dashboard", label: "Accueil", icon: "◉" },
  { href: "/transactions", label: "Transactions", icon: "≡" },
  { href: "/transactions/new", label: "Ajouter", icon: "+" },
  { href: "/reports", label: "Bilans", icon: "◔" },
  { href: "/household", label: "Foyer", icon: "⌂" },
];
