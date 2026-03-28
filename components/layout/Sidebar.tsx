"use client";

import {
  ArrowUpRight,
  BookOpen,
  Building2,
  CalendarDays,
  ClipboardList,
  Image,
  Layers,
  LayoutDashboard,
  LayoutGrid,
  LogOut,
  MessageSquare,
  PanelLeft,
  Settings,
  Trophy,
  UserCircle,
  Users,
} from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import * as React from "react";

import { SidebarItem } from "@/components/layout/SidebarItem";
import { SidebarSection } from "@/components/layout/SidebarSection";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { TooltipProvider } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

const SIDEBAR_STORAGE_KEY = "admin-sidebar-collapsed";

type SidebarCounts = {
  tours?: number;
  tableaux?: number;
  templates?: number;
  clubs?: number;
  players?: number;
  registrations?: number;
  users?: number;
};

const buildSections = (counts: SidebarCounts) => [
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
        label: "Tableaux",
        href: "/admin/tableaux",
        icon: Layers,
        badge: counts.tableaux,
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
        icon: UserCircle,
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

function isActivePath(pathname: string, href: string) {
  if (href === "/admin") {
    return pathname === "/admin";
  }

  return pathname.startsWith(href);
}

function AdminIdentity({ collapsed }: { collapsed: boolean }) {
  const { data } = useSession();
  const user = data?.user;
  const initials = user?.name
    ? user.name
        .split(" ")
        .map((part) => part[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "A";

  return (
    <div className="flex items-center gap-3 rounded-lg border border-border/60 bg-muted/30 px-3 py-2">
      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
        {initials}
      </div>
      <div className={cn("min-w-0", collapsed && "sr-only")}>
        <p className="truncate text-sm font-medium">{user?.name ?? "Admin"}</p>
        <p className="truncate text-xs text-muted-foreground">
          {user?.email ?? "-"}
        </p>
      </div>
    </div>
  );
}

function SidebarContent({
  collapsed,
  onToggle,
}: {
  collapsed: boolean;
  onToggle?: () => void;
}) {
  const pathname = usePathname();
  const [counts, setCounts] = React.useState<SidebarCounts>({});

  React.useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const res = await fetch("/api/admin/stats");
        if (!res.ok) return;
        const data = (await res.json()) as SidebarCounts;
        if (active) setCounts(data);
      } catch {
        // ignore
      }
    };
    load();
    return () => {
      active = false;
    };
  }, []);

  const sections = buildSections(counts);

  return (
    <div
      className={cn(
        "flex h-full flex-col gap-6 bg-background px-3 py-4 transition-all duration-200",
        collapsed ? "px-2" : "px-3",
      )}
    >
      <div className="flex items-center justify-between px-2">
        <Link href="/admin" className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <Trophy className="h-4 w-4" />
          </span>
          <span className={cn("text-sm font-semibold", collapsed && "sr-only")}>
            Trophee Admin
          </span>
        </Link>
        {onToggle ? (
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggle}
            className="hidden md:inline-flex"
          >
            <PanelLeft className="h-4 w-4" />
          </Button>
        ) : null}
      </div>

      <div className="flex-1 space-y-6 overflow-y-auto pb-6">
        {sections.map((section) => {
          const activeSection = section.items.some((item) =>
            isActivePath(pathname, item.href),
          );
          return (
            <SidebarSection
              key={section.title}
              title={section.title}
              collapsed={collapsed}
              active={activeSection}
            >
              {section.items.map((item) => (
                <SidebarItem
                  key={item.href}
                  href={item.href}
                  label={item.label}
                  icon={item.icon}
                  active={isActivePath(pathname, item.href)}
                  collapsed={collapsed}
                  badge={item.badge}
                />
              ))}
            </SidebarSection>
          );
        })}
      </div>

      <div className="space-y-3">
        <Button
          asChild
          variant="secondary"
          size="sm"
          className={cn("w-full", collapsed && "px-2")}
        >
          <Link href="/" className="flex items-center gap-2">
            <ArrowUpRight className="h-4 w-4" />
            <span className={cn("text-sm", collapsed && "sr-only")}>
              Retour au site
            </span>
          </Link>
        </Button>

        <Button
          asChild
          variant="secondary"
          size="sm"
          className={cn("w-full", collapsed && "px-2")}
        >
          <Link href="/me/profil" className="flex items-center gap-2">
            <UserCircle className="h-4 w-4" />
            <span className={cn("text-sm", collapsed && "sr-only")}>
              Mon profil
            </span>
          </Link>
        </Button>

        <AdminIdentity collapsed={collapsed} />
        <Button
          variant="outline"
          size="sm"
          className={cn("w-full", collapsed && "px-2")}
          onClick={() => signOut()}
        >
          <LogOut className="h-4 w-4" />
          <span className={cn("ml-2 text-sm", collapsed && "sr-only")}>
            Se deconnecter
          </span>
        </Button>
      </div>

      <Button
        variant="ghost"
        size="icon"
        onClick={onToggle}
        className="mx-auto md:hidden"
      >
        <PanelLeft className="h-4 w-4" />
      </Button>
    </div>
  );
}

export function Sidebar() {
  const [collapsed, setCollapsed] = React.useState(false);
  const [mobileOpen, setMobileOpen] = React.useState(false);

  React.useEffect(() => {
    const stored = window.localStorage.getItem(SIDEBAR_STORAGE_KEY);
    if (stored) {
      setCollapsed(stored === "true");
    }
  }, []);

  React.useEffect(() => {
    window.localStorage.setItem(SIDEBAR_STORAGE_KEY, String(collapsed));
    document.documentElement.style.setProperty(
      "--sidebar-width",
      collapsed ? "64px" : "260px",
    );
  }, [collapsed]);

  const handleToggle = () => setCollapsed((prev) => !prev);

  return (
    <TooltipProvider delayDuration={200}>
      <div className="md:hidden">
        <div className="sticky top-0 z-40 flex items-center justify-between border-b border-border/60 bg-background/80 px-4 py-3 backdrop-blur">
          <button
            className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-border bg-background"
            onClick={() => setMobileOpen(true)}
          >
            <PanelLeft className="h-4 w-4" />
          </button>
          <span className="text-sm font-semibold">Admin</span>
          <div className="h-9 w-9" />
        </div>
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger asChild>
            <span className="hidden" />
          </SheetTrigger>
          <SheetContent side="left" className="p-0">
            <SheetHeader className="sr-only">
              <SheetTitle>Admin navigation</SheetTitle>
              <SheetDescription>Menu admin</SheetDescription>
            </SheetHeader>
            <SidebarContent collapsed={false} />
          </SheetContent>
        </Sheet>
      </div>

      <aside
        className={cn(
          "fixed left-0 top-0 z-30 hidden h-screen border-r border-border/60 bg-background transition-all duration-200 md:block",
          collapsed ? "w-16" : "w-[260px]",
        )}
      >
        <SidebarContent collapsed={collapsed} onToggle={handleToggle} />
      </aside>
    </TooltipProvider>
  );
}
