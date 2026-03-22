"use client";

import Link from "next/link";

import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

type SidebarItemProps = {
  href: string;
  label: string;
  icon: React.ElementType;
  active?: boolean;
  collapsed?: boolean;
  badge?: string | number;
};

function Badge({ value }: { value: string | number }) {
  return (
    <span className="rounded-full bg-muted px-2 py-0.5 text-[0.65rem] font-semibold text-muted-foreground">
      {value}
    </span>
  );
}

export function SidebarItem({
  href,
  label,
  icon: Icon,
  active = false,
  collapsed = false,
  badge,
}: SidebarItemProps) {
  const item = (
    <Link
      href={href}
      className={cn(
        buttonVariants({
          variant: active ? "default" : "ghost",
          size: "default",
        }),
        "h-10 w-full justify-start gap-3 px-3",
        active && "bg-primary text-primary-foreground hover:bg-primary/90",
      )}
    >
      <Icon className="h-4 w-4" />
      <span className={cn("text-sm", collapsed && "sr-only")}>{label}</span>
      {!collapsed && badge !== undefined ? (
        <span className="ml-auto">
          <Badge value={badge} />
        </span>
      ) : null}
    </Link>
  );

  if (!collapsed) {
    return item;
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>{item}</TooltipTrigger>
      <TooltipContent side="right" className="text-xs">
        {label}
        {badge !== undefined ? ` (${badge})` : ""}
      </TooltipContent>
    </Tooltip>
  );
}
