"use client";

import * as React from "react";

import { AdminRegistrationPresence } from "@/components/admin-registration-presence";
import { EmptyState } from "@/components/empty-state";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type PresenceValue = "UNKNOWN" | "PRESENT" | "ABSENT";

type TableauOption = {
  id: string;
  name: string;
};

type RegistrationRow = {
  playerId: string;
  playerName: string;
  createdAt: string;
  presence: PresenceValue;
  ids: string[];
  tableaux: { id: string; name: string }[];
};

type AdminTourRegistrationsProps = {
  tourId: string;
  rows: RegistrationRow[];
  tableaux: TableauOption[];
};

const presenceOptions: { value: PresenceValue | "ALL"; label: string }[] = [
  { value: "ALL", label: "Toutes" },
  { value: "UNKNOWN", label: "En attente" },
  { value: "PRESENT", label: "Present" },
  { value: "ABSENT", label: "Absent" },
];

export function AdminTourRegistrations({
  tourId,
  rows,
  tableaux,
}: AdminTourRegistrationsProps) {
  const [query, setQuery] = React.useState("");
  const [presenceFilter, setPresenceFilter] = React.useState<
    PresenceValue | "ALL"
  >("ALL");
  const [tableauFilter, setTableauFilter] = React.useState("ALL");

  const filtered = React.useMemo(() => {
    const search = query.trim().toLowerCase();
    return rows.filter((row) => {
      if (
        search &&
        !row.playerName.toLowerCase().includes(search)
      ) {
        return false;
      }
      if (presenceFilter !== "ALL" && row.presence !== presenceFilter) {
        return false;
      }
      if (
        tableauFilter !== "ALL" &&
        !row.tableaux.some((tableau) => tableau.id === tableauFilter)
      ) {
        return false;
      }
      return true;
    });
  }, [presenceFilter, query, rows, tableauFilter]);

  const exportUrl = React.useMemo(() => {
    const params = new URLSearchParams({ tourId });
    if (presenceFilter !== "ALL") {
      params.set("presence", presenceFilter);
    }
    if (tableauFilter !== "ALL") {
      params.set("tableauId", tableauFilter);
    }
    return `/api/admin/registrations/export?${params.toString()}`;
  }, [presenceFilter, tableauFilter, tourId]);

  const dateFormatter = React.useMemo(
    () =>
      new Intl.DateTimeFormat("fr-FR", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      }),
    [],
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm text-muted-foreground">
            {filtered.length} inscription{filtered.length > 1 ? "s" : ""} affichee
            {filtered.length > 1 ? "s" : ""}.
          </p>
        </div>
        <Button asChild size="sm" variant="secondary">
          <a href={exportUrl}>Exporter CSV</a>
        </Button>
      </div>

      <div className="grid gap-3 lg:grid-cols-[1.3fr_0.9fr_0.9fr_0.9fr]">
        <div className="space-y-1">
          <label className="text-xs font-medium text-muted-foreground">
            Recherche joueur
          </label>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Nom ou prenom"
            className="h-9 w-full rounded-md border border-border bg-background px-3 text-sm"
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-medium text-muted-foreground">
            Presence
          </label>
          <select
            value={presenceFilter}
            onChange={(event) =>
              setPresenceFilter(event.target.value as PresenceValue | "ALL")
            }
            className="h-9 w-full rounded-md border border-border bg-background px-2 text-sm"
          >
            {presenceOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-1">
          <label className="text-xs font-medium text-muted-foreground">
            Tableau
          </label>
          <select
            value={tableauFilter}
            onChange={(event) => setTableauFilter(event.target.value)}
            className="h-9 w-full rounded-md border border-border bg-background px-2 text-sm"
          >
            <option value="ALL">Tous</option>
            {tableaux.map((tableau) => (
              <option key={tableau.id} value={tableau.id}>
                {tableau.name}
              </option>
            ))}
          </select>
        </div>
        <div className="flex items-end">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="w-full"
            onClick={() => {
              setQuery("");
              setPresenceFilter("ALL");
              setTableauFilter("ALL");
            }}
          >
            Reinitialiser
          </Button>
        </div>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Joueur</TableHead>
            <TableHead>Tableaux</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Presence</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filtered.length === 0 ? (
            <TableRow>
              <TableCell colSpan={4} className="py-6">
                <EmptyState
                  title="Aucune inscription"
                  description="Ajustez les filtres ou ouvrez les inscriptions."
                />
              </TableCell>
            </TableRow>
          ) : (
            filtered.map((row) => (
              <TableRow key={row.playerId}>
                <TableCell className="font-medium">{row.playerName}</TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-2">
                    {row.tableaux.map((tableau) => (
                      <span key={tableau.id} className="badge-pill">
                        {tableau.name}
                      </span>
                    ))}
                  </div>
                </TableCell>
                <TableCell>
                  {dateFormatter.format(new Date(row.createdAt))}
                </TableCell>
                <TableCell>
                  <AdminRegistrationPresence
                    ids={row.ids}
                    value={row.presence}
                  />
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
