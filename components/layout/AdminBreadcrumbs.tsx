"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight } from "lucide-react";

import { cn } from "@/lib/utils";

const LABELS: Record<string, string> = {
  admin: "Admin",
  seasons: "Saison",
  tours: "Tours",
  clubs: "Clubs",
  players: "Joueurs",
  inscriptions: "Inscriptions",
  tableaux: "Tableaux",
  "tableau-templates": "Templates",
  users: "Utilisateurs",
  settings: "Settings",
};

export function AdminBreadcrumbs() {
  const pathname = usePathname();
  const parts = pathname.split("/").filter(Boolean);

  if (parts.length === 0) {
    return null;
  }

  const items = parts.map((part, index) => {
    const href = `/${parts.slice(0, index + 1).join("/")}`;
    return {
      label: LABELS[part] ?? part,
      href,
      isLast: index === parts.length - 1,
    };
  });

  return (
    <nav className="flex items-center gap-2 text-xs text-muted-foreground">
      {items.map((item, index) => (
        <div key={item.href} className="flex items-center gap-2">
          {index > 0 ? <ChevronRight className="h-3 w-3" /> : null}
          {item.isLast ? (
            <span className="font-medium text-foreground">{item.label}</span>
          ) : (
            <Link
              href={item.href}
              className={cn(
                "transition-colors hover:text-foreground",
                item.label === "Admin" && "font-medium text-foreground",
              )}
            >
              {item.label}
            </Link>
          )}
        </div>
      ))}
    </nav>
  );
}
