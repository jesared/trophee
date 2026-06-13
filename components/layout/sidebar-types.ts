import type { LucideIcon } from "lucide-react";

export type SidebarNavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
  badge?: string | number;
};

export type SidebarNavSection = {
  title: string;
  items: SidebarNavItem[];
};

export type SidebarStats = {
  tours?: number;
  tableaux?: number;
  templates?: number;
  clubs?: number;
  players?: number;
  registrations?: number;
  users?: number;
};
