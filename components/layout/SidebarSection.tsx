import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type SidebarSectionProps = {
  title: string;
  children: ReactNode;
  collapsed?: boolean;
  active?: boolean;
};

export function SidebarSection({
  title,
  children,
  collapsed = false,
  active = false,
}: SidebarSectionProps) {
  return (
    <div className="space-y-2">
      <p
        className={cn(
          "px-3 text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-muted-foreground transition-colors",
          active && "text-foreground",
          collapsed && "sr-only",
        )}
      >
        {title}
      </p>
      <div className="space-y-1">{children}</div>
    </div>
  );
}
