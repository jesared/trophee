"use client";

import * as React from "react";
import { Plus, Search, Sparkles, X } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { AdminBreadcrumbs } from "@/components/layout/AdminBreadcrumbs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { openAdminTourCreateDialog } from "@/lib/admin-events";

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
      { match: "/admin/tours", label: "Creer un tour", href: "/admin/tours" },
      {
        match: "/admin/tableaux",
        label: "Creer un tableau",
        href: "/admin/tableaux",
      },
      {
        match: "/admin/tableau-templates",
        label: "Creer un template",
        href: "/admin/tableau-templates",
      },
      {
        match: "/admin/players",
        label: "Ajouter un joueur",
        href: "/admin/players",
      },
      {
        match: "/admin/inscriptions",
        label: "Nouvelle inscription",
        href: "/admin/inscriptions",
      },
      {
        match: "/admin/seasons",
        label: "Creer une saison",
        href: "/admin/seasons",
      },
      { match: "/admin/clubs", label: "Creer un club", href: "/admin/clubs" },
      {
        match: "/admin/users",
        label: "Ajouter un utilisateur",
        href: "/admin/users",
      },
    ];

    return map.find((item) => pathname.startsWith(item.match));
  }, [pathname]);

  const opensInlineTourDialog =
    pathname === "/admin/tours" && createAction?.match === "/admin/tours";

  return (
    <div className="sticky top-0 z-20 border-b border-border/60 bg-background/80 backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-2 px-4 py-2.5 lg:flex-row lg:items-center lg:justify-between lg:gap-3 lg:py-3">
        <div className="flex min-w-0 flex-1 flex-col gap-1.5 lg:gap-2">
          <div className="flex items-center gap-2">
            <Badge
              variant="secondary"
              className="hidden gap-1 px-2.5 py-1 tracking-[0.12em] sm:inline-flex"
            >
              <Sparkles className="h-3 w-3" />
              Back-office
            </Badge>
          </div>
          <div className="hidden sm:block">
            <AdminBreadcrumbs />
          </div>
        </div>

        <div className="flex flex-col gap-2 lg:min-w-[420px] lg:max-w-[520px] lg:flex-1 lg:flex-row lg:items-center lg:justify-end lg:gap-3">
          <form
            className="flex w-full items-center gap-2 rounded-[1rem] border border-border/70 bg-background px-3 py-1.5 shadow-sm shadow-black/5 lg:max-w-md lg:rounded-xl lg:py-2"
            onSubmit={(event) => {
              event.preventDefault();
              submitSearch(query);
            }}
          >
            <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              className="h-6 border-0 bg-transparent px-0 text-sm shadow-none focus-visible:ring-0 lg:h-7"
              placeholder="Rechercher tours, joueurs, tableaux..."
              aria-label="Rechercher dans l'administration"
            />
            {query ? (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-7 w-7 shrink-0"
                onClick={() => submitSearch("")}
                aria-label="Effacer la recherche"
              >
                <X className="h-3.5 w-3.5" />
              </Button>
            ) : null}
          </form>

          <div className="flex items-center justify-end gap-1 lg:gap-2 lg:pl-2">
            {createAction ? (
              opensInlineTourDialog ? (
                <Button
                  className="hidden gap-2 lg:inline-flex"
                  onClick={openAdminTourCreateDialog}
                >
                  <Plus className="h-4 w-4" />
                  {createAction.label}
                </Button>
              ) : (
                <Button asChild className="hidden gap-2 lg:inline-flex">
                  <Link href={createAction.href}>
                    <Plus className="h-4 w-4" />
                    {createAction.label}
                  </Link>
                </Button>
              )
            ) : (
              <Button className="hidden gap-2 lg:inline-flex">
                <Plus className="h-4 w-4" />
                Nouveau
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
