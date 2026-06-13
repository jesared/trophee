"use client";

import * as React from "react";
import type { Role } from "@prisma/client";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type AdminUsersFiltersProps = {
  query?: string;
  roleFilter?: string;
  roles: readonly Role[];
};

const roleLabels: Record<Role, string> = {
  USER: "Utilisateur",
  ORGANIZER: "Organisateur",
  ADMIN: "Admin",
};

export function AdminUsersFilters({
  query = "",
  roleFilter = "",
  roles,
}: AdminUsersFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [search, setSearch] = React.useState(query);
  const [selectedRole, setSelectedRole] = React.useState(roleFilter || "all");

  React.useEffect(() => {
    setSearch(query);
  }, [query]);

  React.useEffect(() => {
    setSelectedRole(roleFilter || "all");
  }, [roleFilter]);

  const submit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const params = new URLSearchParams(searchParams.toString());
    const trimmed = search.trim();

    if (trimmed) {
      params.set("q", trimmed);
    } else {
      params.delete("q");
    }

    if (selectedRole !== "all") {
      params.set("role", selectedRole);
    } else {
      params.delete("role");
    }

    const next = params.toString();
    router.push(next ? `${pathname}?${next}` : pathname);
  };

  return (
    <form className="flex flex-wrap items-center gap-2" onSubmit={submit}>
      <Input
        value={search}
        onChange={(event) => setSearch(event.target.value)}
        placeholder="Rechercher par nom ou email"
        className="h-9 w-64"
        aria-label="Rechercher un utilisateur"
      />
      <Select value={selectedRole} onValueChange={setSelectedRole}>
        <SelectTrigger className="h-9 w-[180px]">
          <SelectValue placeholder="Tous les roles" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Tous les roles</SelectItem>
          {roles.map((item) => (
            <SelectItem key={item} value={item}>
              {roleLabels[item]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Button size="sm" variant="secondary" type="submit">
        Filtrer
      </Button>
    </form>
  );
}
