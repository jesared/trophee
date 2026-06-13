"use client";

import type { ReactNode } from "react";
import * as React from "react";
import type { LucideIcon } from "lucide-react";
import { PanelLeft } from "lucide-react";
import Link from "next/link";

import { SidebarNav } from "@/components/layout/SidebarNav";
import type { SidebarNavSection } from "@/components/layout/sidebar-types";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { TooltipProvider } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

type SidebarFooterRenderProps = {
  collapsed: boolean;
  onNavigate?: () => void;
};

type AppSidebarProps = {
  storageKey: string;
  widthVariable: "--sidebar-width" | "--user-sidebar-width";
  desktopLabel: string;
  mobileLabel: string;
  homeHref: string;
  homeIcon: LucideIcon;
  homeTitle: string;
  sections: SidebarNavSection[];
  renderFooter: (props: SidebarFooterRenderProps) => ReactNode;
};

function SidebarFrame({
  collapsed,
  onToggle,
  onNavigate,
  homeHref,
  homeIcon: HomeIcon,
  homeTitle,
  sections,
  renderFooter,
}: {
  collapsed: boolean;
  onToggle?: () => void;
  onNavigate?: () => void;
  homeHref: string;
  homeIcon: LucideIcon;
  homeTitle: string;
  sections: SidebarNavSection[];
  renderFooter: AppSidebarProps["renderFooter"];
}) {
  return (
    <div
      className={cn(
        "flex h-full flex-col gap-6 bg-background px-3 py-4 transition-all duration-200",
        collapsed ? "px-2" : "px-3",
      )}
    >
      <div className="flex items-center justify-between px-2">
        <Link href={homeHref} className="flex items-center gap-2" onClick={onNavigate}>
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <HomeIcon className="h-4 w-4" />
          </span>
          <span className={cn("text-sm font-semibold", collapsed && "sr-only")}>
            {homeTitle}
          </span>
        </Link>
        {onToggle ? (
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggle}
            className="hidden md:inline-flex"
            aria-label={collapsed ? "Déplier la sidebar" : "Réduire la sidebar"}
          >
            <PanelLeft className="h-4 w-4" />
          </Button>
        ) : null}
      </div>

      <SidebarNav
        sections={sections}
        collapsed={collapsed}
        onNavigate={onNavigate}
      />

      <div className="border-t border-border/60 pt-3">
        {renderFooter({ collapsed, onNavigate })}
      </div>
    </div>
  );
}

export function AppSidebar({
  storageKey,
  widthVariable,
  desktopLabel,
  mobileLabel,
  homeHref,
  homeIcon,
  homeTitle,
  sections,
  renderFooter,
}: AppSidebarProps) {
  const [collapsed, setCollapsed] = React.useState(false);
  const [mobileOpen, setMobileOpen] = React.useState(false);

  React.useEffect(() => {
    const stored = window.localStorage.getItem(storageKey);
    if (stored) {
      setCollapsed(stored === "true");
    }
  }, [storageKey]);

  React.useEffect(() => {
    window.localStorage.setItem(storageKey, String(collapsed));
    document.documentElement.style.setProperty(
      widthVariable,
      collapsed ? "64px" : "260px",
    );
  }, [collapsed, storageKey, widthVariable]);

  const handleToggle = React.useCallback(() => {
    setCollapsed((prev) => !prev);
  }, []);

  return (
    <TooltipProvider delayDuration={200}>
      <div className="md:hidden">
        <div className="sticky top-0 z-40 flex items-center justify-between border-b border-border/60 bg-background/80 px-4 py-3 backdrop-blur">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setMobileOpen(true)}
            aria-label={`Ouvrir le menu ${mobileLabel.toLowerCase()}`}
          >
            <PanelLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm font-semibold">{mobileLabel}</span>
          <div className="h-9 w-9" />
        </div>
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetContent side="left" className="p-0">
            <SheetHeader className="sr-only">
              <SheetTitle>{desktopLabel}</SheetTitle>
              <SheetDescription>{mobileLabel}</SheetDescription>
            </SheetHeader>
            <SidebarFrame
              collapsed={false}
              onNavigate={() => setMobileOpen(false)}
              homeHref={homeHref}
              homeIcon={homeIcon}
              homeTitle={homeTitle}
              sections={sections}
              renderFooter={renderFooter}
            />
          </SheetContent>
        </Sheet>
      </div>

      <aside
        className={cn(
          "fixed left-0 top-0 z-30 hidden h-screen border-r border-border/60 bg-background transition-all duration-200 md:block",
          collapsed ? "w-16" : "w-[260px]",
        )}
      >
        <SidebarFrame
          collapsed={collapsed}
          onToggle={handleToggle}
          homeHref={homeHref}
          homeIcon={homeIcon}
          homeTitle={homeTitle}
          sections={sections}
          renderFooter={renderFooter}
        />
      </aside>
    </TooltipProvider>
  );
}
