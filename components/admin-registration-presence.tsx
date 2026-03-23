"use client";

import * as React from "react";
import { useRouter } from "next/navigation";

import { notifyError, notifySuccess } from "@/lib/toast";

type PresenceValue = "UNKNOWN" | "PRESENT" | "ABSENT";

type AdminRegistrationPresenceProps = {
  ids: string[];
  value: PresenceValue;
};

const presenceOptions = [
  { value: "UNKNOWN", label: "En attente" },
  { value: "PRESENT", label: "Present" },
  { value: "ABSENT", label: "Absent" },
] as const;

export function AdminRegistrationPresence({
  ids,
  value,
}: AdminRegistrationPresenceProps) {
  const router = useRouter();
  const [current, setCurrent] = React.useState<PresenceValue>(value);
  const [pending, setPending] = React.useState(false);

  React.useEffect(() => {
    setCurrent(value);
  }, [value]);

  const handleChange = async (next: PresenceValue) => {
    if (next === current || ids.length === 0) {
      return;
    }
    setCurrent(next);
    setPending(true);
    try {
      const res = await fetch("/api/admin/registrations/update-presence", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids, presence: next }),
      });
      const data = (await res.json()) as { ok: boolean; message: string };
      if (!res.ok || !data.ok) {
        notifyError(data.message || "Mise a jour echouee.");
        setCurrent(value);
      } else {
        notifySuccess(data.message || "Presence mise a jour.");
        router.refresh();
      }
    } catch {
      notifyError("Erreur serveur pendant la mise a jour.");
      setCurrent(value);
    } finally {
      setPending(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <select
        value={current}
        disabled={pending}
        onChange={(event) => handleChange(event.target.value as PresenceValue)}
        className="h-9 rounded-md border border-border bg-background px-2 text-sm"
      >
        {presenceOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <span className="text-xs text-muted-foreground">
        {pending ? "Mise a jour..." : "Auto"}
      </span>
    </div>
  );
}
