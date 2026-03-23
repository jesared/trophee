"use client";

import { useRouter, useSearchParams } from "next/navigation";
import * as React from "react";

import { Button } from "@/components/ui/button";

type SortKey = "date" | "name" | "size";

const options: { key: SortKey; label: string }[] = [
  { key: "date", label: "Date" },
  { key: "name", label: "Nom" },
  { key: "size", label: "Taille" },
];

export function AdminMediaSortBar({ sort }: { sort: SortKey }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [value, setValue] = React.useState<SortKey>(sort);

  React.useEffect(() => {
    setValue(sort);
  }, [sort]);

  const handleChange = (next: SortKey) => {
    setValue(next);
    const params = new URLSearchParams(searchParams?.toString());
    params.set("sort", next);
    router.replace(`/admin/medias?${params.toString()}`);
  };

  return (
    <div className="mb-4 flex flex-wrap items-center gap-2">
      <span className="text-xs font-medium text-muted-foreground">
        Trier par
      </span>
      {options.map((option) => (
        <Button
          key={option.key}
          type="button"
          variant={value === option.key ? "secondary" : "ghost"}
          size="sm"
          onClick={() => handleChange(option.key)}
        >
          {option.label}
        </Button>
      ))}
    </div>
  );
}
