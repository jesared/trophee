"use client";

import * as React from "react";
import { useRouter } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { notifyError, notifySuccess } from "@/lib/toast";

type RoleValue = "USER" | "ORGANIZER" | "ADMIN";

type AdminUserRoleProps = {
  id: string;
  role: RoleValue | null;
};

const roles = ["USER", "ORGANIZER", "ADMIN"] as const;
const roleLabels: Record<RoleValue, string> = {
  USER: "Utilisateur",
  ORGANIZER: "Organisateur",
  ADMIN: "Admin",
};

export function AdminUserRole({ id, role }: AdminUserRoleProps) {
  const router = useRouter();
  const [value, setValue] = React.useState<RoleValue>(role ?? "USER");
  const [pending, setPending] = React.useState(false);

  React.useEffect(() => {
    setValue(role ?? "USER");
  }, [role]);

  const handleChange = async (next: RoleValue) => {
    setValue(next);
    setPending(true);
    try {
      const res = await fetch("/api/admin/users/update-role", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, role: next }),
      });
      const data = (await res.json()) as { ok: boolean; message: string };
      if (!res.ok || !data.ok) {
        notifyError(data.message || "Mise a jour echouee.");
        setValue(role ?? "USER");
      } else {
        notifySuccess(data.message || "Role mis a jour.");
        router.refresh();
      }
    } catch {
      notifyError("Erreur serveur pendant la mise a jour.");
      setValue(role ?? "USER");
    } finally {
      setPending(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Select
        value={value}
        onValueChange={(next) => handleChange(next as RoleValue)}
        disabled={pending}
      >
        <SelectTrigger className="h-9 w-[170px]">
          <SelectValue placeholder="Choisir un role" />
        </SelectTrigger>
        <SelectContent>
          {roles.map((item) => (
            <SelectItem key={item} value={item}>
              {roleLabels[item]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Badge variant="secondary" className="text-[0.6rem]">
        {pending ? "Mise a jour..." : "Auto"}
      </Badge>
    </div>
  );
}
