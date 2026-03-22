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
  name: string;
};

type AdminRegistrationFilterProps = {
  tours: TourOption[];
  currentTourId?: string;
};

export function AdminRegistrationFilter({
  tours,
  currentTourId,
}: AdminRegistrationFilterProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const handleChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());

    if (!value || value === "all") {
      params.delete("tourId");
    } else {
      params.set("tourId", value);
    }

    const query = params.toString();
    router.push(query ? `${pathname}?${query}` : pathname);
  };

  return (
    <Select value={currentTourId ?? "all"} onValueChange={handleChange}>
      <SelectTrigger className="w-full sm:w-64">
        <SelectValue placeholder="Filtrer par tour" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">Tous les tours</SelectItem>
        {tours.map((tour) => (
          <SelectItem key={tour.id} value={tour.id}>
            {tour.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
