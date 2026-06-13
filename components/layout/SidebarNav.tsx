"use client";

import { usePathname } from "next/navigation";

import { SidebarItem } from "@/components/layout/SidebarItem";
import { SidebarSection } from "@/components/layout/SidebarSection";
import type { SidebarNavSection } from "@/components/layout/sidebar-types";

function isActivePath(pathname: string, href: string) {
  if (href === "/admin" || href === "/me") {
    return pathname === href;
  }

  return pathname.startsWith(href);
}

type SidebarNavProps = {
  sections: SidebarNavSection[];
  collapsed?: boolean;
  onNavigate?: () => void;
};

export function SidebarNav({
  sections,
  collapsed = false,
  onNavigate,
}: SidebarNavProps) {
  const pathname = usePathname();

  return (
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
                onNavigate={onNavigate}
              />
            ))}
          </SidebarSection>
        );
      })}
    </div>
  );
}
