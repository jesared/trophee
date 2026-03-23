"use client";

import * as React from "react";
import { useRouter } from "next/navigation";

import { notifyError, notifySuccess } from "@/lib/toast";

type AdminUserRoleProps = {
  id: string;
  role: "USER" | "ORGANIZER" | "ADMIN" | null;
};

const roles = ["USER", "ORGANIZER", "ADMIN"] as const;

export function AdminUserRole({ id, role }: AdminUserRoleProps) {
  const router = useRouter();
  const [value, setValue] = React.useState(role ?? "USER");
  const [pending, setPending] = React.useState(false);

  React.useEffect(() => {
    setValue(role ?? "USER");
  }, [role]);

  const handleChange = async (next: string) => {
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
      <select
        name="role"
        value={value}
        disabled={pending}
        onChange={(event) => handleChange(event.target.value)}
        className="h-9 rounded-md border border-border bg-background px-2 text-sm"
      >
        {roles.map((item) => (
          <option key={item} value={item}>
            {item}
          </option>
        ))}
      </select>
      <span className="text-xs text-muted-foreground">
        {pending ? "Mise a jour..." : "Auto"}
      </span>
    </div>
  );
}
