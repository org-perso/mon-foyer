import { ArrowLeftRight, Home, PieChart, Settings, Users, type LucideIcon } from "lucide-react";

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

/** Onglets de la barre mobile (le bouton « Ajouter » central est séparé). */
export const NAV_ITEMS: NavItem[] = [
  { href: "/dashboard", label: "Accueil", icon: Home },
  { href: "/transactions", label: "Historique", icon: ArrowLeftRight },
  { href: "/reports", label: "Bilans", icon: PieChart },
  { href: "/household", label: "Foyer", icon: Users },
];

export const SETTINGS_ITEM: NavItem = { href: "/settings", label: "Réglages", icon: Settings };
