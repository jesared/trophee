"use client";

import { ArrowUpRight, Shield, UserCircle2 } from "lucide-react";
import { useSession } from "next-auth/react";

import { AppSidebar } from "@/components/layout/AppSidebar";
import {
  SidebarFooterAction,
  SidebarIdentity,
  SidebarSignOutButton,
} from "@/components/layout/SidebarFooter";
import { getUserSidebarSections } from "@/components/layout/sidebar-config";

const SIDEBAR_STORAGE_KEY = "user-sidebar-collapsed";

export function UserSidebar() {
  const { data } = useSession();
  const isAdmin = data?.user?.role === "ADMIN";

  return (
    <AppSidebar
      storageKey={SIDEBAR_STORAGE_KEY}
      widthVariable="--user-sidebar-width"
      desktopLabel="Navigation utilisateur"
      mobileLabel="Mon espace"
      homeHref="/me"
      homeIcon={UserCircle2}
      homeTitle="Mon espace"
      sections={getUserSidebarSections()}
      renderFooter={({ collapsed, onNavigate }) => (
        <div className="space-y-2">
          <SidebarFooterAction
            href="/"
            label="Retour au site"
            icon={ArrowUpRight}
            collapsed={collapsed}
            onNavigate={onNavigate}
          />
          {isAdmin ? (
            <SidebarFooterAction
              href="/admin"
              label="Administration"
              icon={Shield}
              collapsed={collapsed}
              badge="Admin"
              onNavigate={onNavigate}
            />
          ) : null}
          <SidebarIdentity
            collapsed={collapsed}
            fallbackName="Utilisateur"
            fallbackInitial="U"
          />
          <SidebarSignOutButton collapsed={collapsed} />
        </div>
      )}
    />
  );
}
