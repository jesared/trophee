"use client";

import {
  LogOut,
  type LucideIcon,
} from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import * as React from "react";

import { buttonVariants } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

type SidebarFooterActionProps = {
  href: string;
  label: string;
  icon: LucideIcon;
  collapsed: boolean;
  badge?: string;
};

function withTooltip(
  collapsed: boolean,
  label: string,
  children: React.ReactElement,
) {
  if (!collapsed) {
    return children;
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>{children}</TooltipTrigger>
      <TooltipContent side="right" sideOffset={8} className="text-xs">
        {label}
      </TooltipContent>
    </Tooltip>
  );
}

export function SidebarFooterAction({
  href,
  label,
  icon: Icon,
  collapsed,
  badge,
}: SidebarFooterActionProps) {
  const action = (
    <Link
      href={href}
      aria-label={collapsed ? label : undefined}
      className={cn(
        buttonVariants({ variant: "ghost", size: "default" }),
        "h-9 w-full justify-start gap-2.5 rounded-lg border border-transparent px-3 text-sm font-semibold text-muted-foreground hover:border-border/70 hover:bg-muted/70 hover:text-foreground",
        collapsed && "size-10 justify-center px-0",
      )}
    >
      <Icon className="h-4 w-4" />
      <span className={cn("truncate", collapsed && "sr-only")}>{label}</span>
      {badge ? (
        <span
          className={cn(
            "ml-auto rounded-full bg-primary/90 px-2.5 py-0.5 text-[0.6rem] font-bold uppercase text-primary-foreground",
            collapsed && "sr-only",
          )}
        >
          {badge}
        </span>
      ) : null}
    </Link>
  );

  return withTooltip(collapsed, label, action);
}

export function SidebarIdentity({
  collapsed,
  fallbackName,
  fallbackInitial,
}: {
  collapsed: boolean;
  fallbackName: string;
  fallbackInitial: string;
}) {
  const { data } = useSession();
  const user = data?.user;
  const initials = user?.name
    ? user.name
        .split(" ")
        .map((part) => part[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : fallbackInitial;
  const name = user?.name ?? fallbackName;
  const email = user?.email ?? "-";

  const identity = (
    <div
      className={cn(
        "flex min-h-12 items-center gap-3 rounded-lg border border-border/70 bg-muted/35 px-3 py-2 shadow-sm shadow-black/5",
        collapsed && "justify-center px-2",
      )}
    >
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground shadow-sm">
        {initials}
      </div>
      <div className={cn("min-w-0 flex-1", collapsed && "sr-only")}>
        <p className="truncate text-sm font-semibold leading-5">{name}</p>
        <p className="truncate text-xs leading-4 text-muted-foreground">
          {email}
        </p>
      </div>
    </div>
  );

  return withTooltip(collapsed, `${name} - ${email}`, identity);
}

export function SidebarSignOutButton({ collapsed }: { collapsed: boolean }) {
  const action = (
    <button
      type="button"
      aria-label={collapsed ? "Se deconnecter" : undefined}
      className={cn(
        buttonVariants({ variant: "outline", size: "default" }),
        "h-9 w-full justify-start gap-2.5 rounded-lg border-border/80 bg-background/40 px-3 text-sm font-semibold hover:border-destructive/30 hover:bg-destructive/10 hover:text-destructive",
        collapsed && "size-10 justify-center px-0",
      )}
      onClick={() => signOut()}
    >
      <LogOut className="h-4 w-4" />
      <span className={cn("truncate", collapsed && "sr-only")}>
        Se deconnecter
      </span>
    </button>
  );

  return withTooltip(collapsed, "Se deconnecter", action);
}
