import {
  BookOpen,
  Building2,
  CalendarDays,
  ClipboardList,
  Image,
  LayoutDashboard,
  LayoutGrid,
  Medal,
  MessageSquare,
  Settings,
  Trophy,
  UserCircle2,
  Users,
} from "lucide-react";

import type {
  SidebarNavSection,
  SidebarStats,
} from "@/components/layout/sidebar-types";

export function getAdminSidebarSections(
  counts: SidebarStats = {},
): SidebarNavSection[] {
  return [
    {
      title: "MAIN",
      items: [
        { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
        { label: "Saison", href: "/admin/seasons", icon: CalendarDays },
        {
          label: "Tours",
          href: "/admin/tours",
          icon: Trophy,
          badge: counts.tours,
        },
        {
          label: "Templates",
          href: "/admin/tableau-templates",
          icon: LayoutGrid,
          badge: counts.templates,
        },
      ],
    },
    {
      title: "DATA",
      items: [
        {
          label: "Clubs",
          href: "/admin/clubs",
          icon: Building2,
          badge: counts.clubs,
        },
        {
          label: "Joueurs",
          href: "/admin/players",
          icon: Users,
          badge: counts.players,
        },
        {
          label: "Inscriptions",
          href: "/admin/inscriptions",
          icon: ClipboardList,
          badge: counts.registrations,
        },
        {
          label: "Avis",
          href: "/admin/testimonials",
          icon: MessageSquare,
        },
        {
          label: "Médias",
          href: "/admin/medias",
          icon: Image,
        },
      ],
    },
    {
      title: "SYSTEM",
      items: [
        {
          label: "Users",
          href: "/admin/users",
          icon: UserCircle2,
          badge: counts.users,
        },
        {
          label: "Documentation",
          href: "/admin/documentation",
          icon: BookOpen,
        },
        { label: "Settings", href: "/admin/settings", icon: Settings },
      ],
    },
  ];
}

export function getUserSidebarSections(): SidebarNavSection[] {
  return [
    {
      title: "ESPACE JOUEUR",
      items: [
        { label: "Dashboard", href: "/me", icon: LayoutDashboard },
        {
          label: "Mes inscriptions",
          href: "/me/inscriptions",
          icon: ClipboardList,
        },
        { label: "Mes résultats", href: "/me/resultats", icon: Medal },
        { label: "Classement", href: "/me/classement", icon: Trophy },
        { label: "Laisser un avis", href: "/me/avis", icon: MessageSquare },
        { label: "Profil", href: "/me/profil", icon: UserCircle2 },
      ],
    },
  ];
}
