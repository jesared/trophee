"use client";

import * as React from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { notifyError, notifySuccess } from "@/lib/toast";

type AdminMediaBulkActionsProps = {
  selected: string[];
  onClear: () => void;
};

export function AdminMediaBulkActions({
  selected,
  onClear,
}: AdminMediaBulkActionsProps) {
  const router = useRouter();
  const [pending, setPending] = React.useState(false);

  const handleDelete = async () => {
    if (selected.length === 0) {
      notifyError("Aucun fichier selectionne.");
      return;
    }
    if (!confirm(`Supprimer ${selected.length} fichier(s) ?`)) {
      return;
    }
    setPending(true);
    try {
      const res = await fetch("/api/admin/medias/delete-bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: selected }),
      });
      const data = (await res.json()) as { ok: boolean; message: string };
      if (!res.ok || !data.ok) {
        notifyError(data.message || "Suppression echouee.");
      } else {
        notifySuccess(data.message || "Suppression terminee.");
        onClear();
        router.refresh();
      }
    } catch {
      notifyError("Erreur serveur pendant la suppression.");
    } finally {
      setPending(false);
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button type="button" variant="secondary" size="sm" onClick={handleDelete}>
        {pending ? "Suppression..." : `Supprimer (${selected.length})`}
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={onClear}
        disabled={selected.length === 0}
      >
        Vider la selection
      </Button>
    </div>
  );
}
