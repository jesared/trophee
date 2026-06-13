"use client";

import * as React from "react";
import { ArrowUpRight, Trophy, UserCircle2 } from "lucide-react";

import { AppSidebar } from "@/components/layout/AppSidebar";
import {
  SidebarFooterAction,
  SidebarIdentity,
  SidebarSignOutButton,
} from "@/components/layout/SidebarFooter";
import { getAdminSidebarSections } from "@/components/layout/sidebar-config";
import type { SidebarStats } from "@/components/layout/sidebar-types";

const SIDEBAR_STORAGE_KEY = "admin-sidebar-collapsed";

export function Sidebar() {
  const [counts, setCounts] = React.useState<SidebarStats>({});

  React.useEffect(() => {
    let active = true;

    const load = async () => {
      try {
        const res = await fetch("/api/admin/stats");
        if (!res.ok) return;

        const data = (await res.json()) as SidebarStats;
        if (active) {
          setCounts(data);
        }
      } catch {
        // ignore
      }
    };

    load();

    return () => {
      active = false;
    };
  }, []);

  return (
    <AppSidebar
      storageKey={SIDEBAR_STORAGE_KEY}
      widthVariable="--sidebar-width"
      desktopLabel="Admin navigation"
      mobileLabel="Admin"
      homeHref="/admin"
      homeIcon={Trophy}
      homeTitle="Trophee Admin"
      sections={getAdminSidebarSections(counts)}
      renderFooter={({ collapsed, onNavigate }) => (
        <div className="space-y-2">
          <SidebarFooterAction
            href="/"
            label="Retour au site"
            icon={ArrowUpRight}
            collapsed={collapsed}
            onNavigate={onNavigate}
          />
          <SidebarFooterAction
            href="/me/profil"
            label="Mon profil"
            icon={UserCircle2}
            collapsed={collapsed}
            onNavigate={onNavigate}
          />
          <SidebarIdentity
            collapsed={collapsed}
            fallbackName="Admin"
            fallbackInitial="A"
          />
          <SidebarSignOutButton collapsed={collapsed} />
        </div>
      )}
    />
  );
}
