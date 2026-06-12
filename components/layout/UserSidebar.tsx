"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  ArrowUpRight,
  ClipboardList,
  LayoutDashboard,
  Medal,
  MessageSquare,
  PanelLeft,
  Shield,
  Trophy,
  UserCircle2,
} from "lucide-react";

import { cn } from "@/lib/utils";
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
import {
  SidebarFooterAction,
  SidebarIdentity,
  SidebarSignOutButton,
} from "@/components/layout/SidebarFooter";
import { UserSidebarItem } from "@/components/layout/UserSidebarItem";

const SIDEBAR_STORAGE_KEY = "user-sidebar-collapsed";

const items = [
  { label: "Dashboard", href: "/me", icon: LayoutDashboard },
  { label: "Mes inscriptions", href: "/me/inscriptions", icon: ClipboardList },
  { label: "Mes resultats", href: "/me/resultats", icon: Medal },
  { label: "Classement", href: "/me/classement", icon: Trophy },
  { label: "Laisser un avis", href: "/me/avis", icon: MessageSquare },
  { label: "Profil", href: "/me/profil", icon: UserCircle2 },
];

function isActivePath(pathname: string, href: string) {
  if (href === "/me") {
    return pathname === "/me";
  }

  return pathname.startsWith(href);
}

function SidebarContent({
  collapsed,
  onToggle,
}: {
  collapsed: boolean;
  onToggle?: () => void;
}) {
  const pathname = usePathname();
  const { data } = useSession();
  const isAdmin = data?.user?.role === "ADMIN";

  return (
    <div
      className={cn(
        "flex h-full flex-col gap-6 bg-background px-3 py-4",
        collapsed ? "px-2" : "px-3",
      )}
    >
      <div className="flex items-center justify-between px-2">
        <Link href="/me" className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <UserCircle2 className="h-4 w-4" />
          </span>
          <span className={cn("text-sm font-semibold", collapsed && "sr-only")}>
            Mon espace
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

      <nav className="flex-1 space-y-1 overflow-y-auto pb-6">
        {items.map((item) => (
          <UserSidebarItem
            key={item.href}
            href={item.href}
            label={item.label}
            icon={item.icon}
            active={isActivePath(pathname, item.href)}
            collapsed={collapsed}
          />
        ))}
      </nav>

      <div className="border-t border-border/60 pt-3">
        <div className="space-y-2">
          <SidebarFooterAction
            href="/"
            label="Retour au site"
            icon={ArrowUpRight}
            collapsed={collapsed}
          />

          {isAdmin ? (
            <SidebarFooterAction
              href="/admin"
              label="Administration"
              icon={Shield}
              collapsed={collapsed}
              badge="Admin"
            />
          ) : null}

          <SidebarIdentity
            collapsed={collapsed}
            fallbackName="Utilisateur"
            fallbackInitial="U"
          />
          <SidebarSignOutButton collapsed={collapsed} />
        </div>
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

export function UserSidebar() {
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
      "--user-sidebar-width",
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
          <span className="text-sm font-semibold">Mon espace</span>
          <div className="h-9 w-9" />
        </div>
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger asChild>
            <span className="hidden" />
          </SheetTrigger>
          <SheetContent side="left" className="p-0">
            <SheetHeader className="sr-only">
              <SheetTitle>Navigation utilisateur</SheetTitle>
              <SheetDescription>Menu utilisateur</SheetDescription>
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
