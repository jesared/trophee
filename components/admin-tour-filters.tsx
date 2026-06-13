"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { TourStatus } from "@/lib/tour-status";

type SeasonOption = {
  id: string;
  name: string;
  year: number;
};

type ClubOption = {
  id: string;
  name: string;
};

type TourPeriodFilter = "all" | "upcoming" | "past";

type AdminTourFiltersProps = {
  seasons: SeasonOption[];
  clubs: ClubOption[];
  currentSeasonId?: string;
  currentStatus?: TourStatus;
  currentClubId?: string;
  currentPeriod?: TourPeriodFilter;
};

export function AdminTourFilters({
  seasons,
  clubs,
  currentSeasonId,
  currentStatus,
  currentClubId,
  currentPeriod = "all",
}: AdminTourFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const pushParams = (next: URLSearchParams) => {
    const query = next.toString();
    router.push(query ? `${pathname}?${query}` : pathname);
  };

  const updateParam = (key: string, value: string, allValue = "all") => {
    const params = new URLSearchParams(searchParams.toString());

    if (!value || value === allValue) {
      params.delete(key);
    } else {
      params.set(key, value);
    }

    pushParams(params);
  };

  const clearFilters = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("seasonId");
    params.delete("status");
    params.delete("clubId");
    params.delete("period");
    pushParams(params);
  };

  const hasActiveFilters = Boolean(
    currentSeasonId || currentStatus || currentClubId || currentPeriod !== "all",
  );

  return (
    <Card className="border-border/70">
      <CardHeader className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <CardTitle className="text-sm">Filtres metier</CardTitle>
          <p className="text-xs text-muted-foreground">
            Affinez par saison, statut, club et temporalite.
          </p>
        </div>
        {hasActiveFilters ? (
          <Button variant="outline" size="sm" onClick={clearFilters}>
            Reinitialiser
          </Button>
        ) : null}
      </CardHeader>
      <CardContent>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <Select
            value={currentSeasonId ?? "all"}
            onValueChange={(value) => updateParam("seasonId", value)}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Toutes les saisons" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toutes les saisons</SelectItem>
              {seasons.map((season) => (
                <SelectItem key={season.id} value={season.id}>
                  {season.name} ({season.year})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={currentStatus ?? "all"}
            onValueChange={(value) => updateParam("status", value)}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Tous les statuts" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les statuts</SelectItem>
              <SelectItem value="DRAFT">Brouillon</SelectItem>
              <SelectItem value="OPEN">Ouvert</SelectItem>
              <SelectItem value="CLOSED">Ferme</SelectItem>
              <SelectItem value="DONE">Termine</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={currentClubId ?? "all"}
            onValueChange={(value) => updateParam("clubId", value)}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Tous les clubs" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les clubs</SelectItem>
              {clubs.map((club) => (
                <SelectItem key={club.id} value={club.id}>
                  {club.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={currentPeriod}
            onValueChange={(value) => updateParam("period", value)}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Toutes les periodes" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toutes les periodes</SelectItem>
              <SelectItem value="upcoming">A venir</SelectItem>
              <SelectItem value="past">Passes</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
}
