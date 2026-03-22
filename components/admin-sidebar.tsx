"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const navItems = [
  { label: "Dashboard", href: "/admin" },
  { label: "Saison", href: "/admin/seasons" },
  { label: "Clubs", href: "/admin/clubs" },
  { label: "Tours", href: "/admin/tours" },
  { label: "Tableaux", href: "/admin/tableaux" },
  { label: "Templates", href: "/admin/tableau-templates" },
  { label: "Joueurs", href: "/admin/players" },
  { label: "Inscriptions", href: "/admin/inscriptions" },
  { label: "Users", href: "/admin/users" },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-full border-b border-border/60 bg-background md:w-64 md:border-b-0 md:border-r">
      <div className="flex h-full flex-col gap-6 p-4">
        <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Admin
        </div>
        <nav className="flex flex-col gap-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  buttonVariants({
                    variant: isActive ? "secondary" : "ghost",
                    size: "default",
                  }),
                  "justify-start",
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
