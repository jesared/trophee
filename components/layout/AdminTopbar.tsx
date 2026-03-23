"use client";

import * as React from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Search, Bell, Plus, X } from "lucide-react";
import Link from "next/link";

import { AdminBreadcrumbs } from "@/components/layout/AdminBreadcrumbs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function AdminTopbar() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentQuery = searchParams.get("q") ?? "";
  const [query, setQuery] = React.useState(currentQuery);

  React.useEffect(() => {
    setQuery(currentQuery);
  }, [currentQuery]);

  const submitSearch = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    const trimmed = value.trim();

    if (trimmed) {
      params.set("q", trimmed);
    } else {
      params.delete("q");
    }

    const next = params.toString();
    router.push(next ? `${pathname}?${next}` : pathname);
  };

  const createAction = React.useMemo(() => {
    const map = [
      { match: "/admin/tours", label: "Créer un tour", href: "/admin/tours" },
      {
        match: "/admin/tableaux",
        label: "Créer un tableau",
        href: "/admin/tableaux",
      },
      {
        match: "/admin/tableau-templates",
        label: "Créer un template",
        href: "/admin/tableau-templates",
      },
      { match: "/admin/players", label: "Ajouter un joueur", href: "/admin/players" },
      {
        match: "/admin/inscriptions",
        label: "Nouvelle inscription",
        href: "/admin/inscriptions",
      },
      { match: "/admin/seasons", label: "Créer une saison", href: "/admin/seasons" },
      { match: "/admin/clubs", label: "Créer un club", href: "/admin/clubs" },
      { match: "/admin/users", label: "Ajouter un utilisateur", href: "/admin/users" },
    ];

    return map.find((item) => pathname.startsWith(item.match));
  }, [pathname]);

  return (
    <div className="sticky top-0 z-20 border-b border-border/60 bg-background/80 backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center">
        <div className="flex flex-1 items-center gap-3">
          <AdminBreadcrumbs />
        </div>
        <form
          className="flex w-full items-center gap-2 surface px-2.5 py-1.5 sm:max-w-md"
          onSubmit={(event) => {
            event.preventDefault();
            submitSearch(query);
          }}
        >
          <Search className="h-4 w-4 text-muted-foreground" />
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            className="h-7 border-0 px-0 shadow-none focus-visible:ring-0"
            placeholder="Rechercher tours, joueurs, tableaux..."
          />
          {query ? (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => submitSearch("")}
            >
              <X className="h-3.5 w-3.5" />
            </Button>
          ) : null}
        </form>
        <div className="flex items-center gap-2 sm:pl-2">
          <Button variant="ghost" size="icon" aria-label="Notifications">
            <Bell className="h-4 w-4" />
          </Button>
          {createAction ? (
            <Button asChild className="gap-2">
              <Link href={createAction.href}>
                <Plus className="h-4 w-4" />
                {createAction.label}
              </Link>
            </Button>
          ) : (
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Nouveau
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
