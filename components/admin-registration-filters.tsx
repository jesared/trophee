"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type TourOption = {
  id: string;
  label: string;
};

type TableauOption = {
  id: string;
  label: string;
  tourId: string;
};

type AdminRegistrationFiltersProps = {
  tours: TourOption[];
  tableaux: TableauOption[];
  currentTourId?: string;
  currentTableauId?: string;
};

export function AdminRegistrationFilters({
  tours,
  tableaux,
  currentTourId,
  currentTableauId,
}: AdminRegistrationFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const pushParams = (next: URLSearchParams) => {
    const query = next.toString();
    router.push(query ? `${pathname}?${query}` : pathname);
  };

  const handleTourChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());

    if (!value || value === "all") {
      params.delete("tourId");
    } else {
      params.set("tourId", value);
    }

    // reset tableau filter when tour changes
    params.delete("tableauId");
    pushParams(params);
  };

  const handleTableauChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());

    if (!value || value === "all") {
      params.delete("tableauId");
    } else {
      params.set("tableauId", value);
    }

    pushParams(params);
  };

  const filteredTableaux = currentTourId
    ? tableaux.filter((tableau) => tableau.tourId === currentTourId)
    : tableaux;

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      <Select value={currentTourId ?? "all"} onValueChange={handleTourChange}>
        <SelectTrigger className="w-full sm:w-64">
          <SelectValue placeholder="Filtrer par tour" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Tous les tours</SelectItem>
          {tours.map((tour) => (
            <SelectItem key={tour.id} value={tour.id}>
              {tour.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={currentTableauId ?? "all"}
        onValueChange={handleTableauChange}
        disabled={filteredTableaux.length === 0}
      >
        <SelectTrigger className="w-full sm:w-64">
          <SelectValue
            placeholder={
              filteredTableaux.length === 0
                ? "Aucun tableau"
                : "Filtrer par tableau"
            }
          />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Tous les tableaux</SelectItem>
          {filteredTableaux.map((tableau) => (
            <SelectItem key={tableau.id} value={tableau.id}>
              {tableau.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
