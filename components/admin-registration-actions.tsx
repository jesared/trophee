"use client";

import * as React from "react";
import { MoreHorizontal } from "lucide-react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { notifyError, notifySuccess } from "@/lib/toast";

type TableauOption = {
  id: string;
  label: string;
};

type AdminRegistrationActionsProps = {
  playerId: string;
  playerName: string;
  tourId: string;
  tourName: string;
  tableauOptions: TableauOption[];
  selectedTableauIds: string[];
  registrationIds: string[];
};

export function AdminRegistrationActions({
  playerId,
  playerName,
  tourId,
  tourName,
  tableauOptions,
  selectedTableauIds,
  registrationIds,
}: AdminRegistrationActionsProps) {
  const router = useRouter();
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [checked, setChecked] = React.useState<string[]>(selectedTableauIds);

  React.useEffect(() => {
    setChecked(selectedTableauIds);
  }, [selectedTableauIds]);

  const handleDeleteAll = async () => {
    if (!confirm("Supprimer toute l'inscription ?")) {
      return;
    }
    try {
      const res = await fetch("/api/admin/inscriptions/delete-group", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: registrationIds }),
      });
      const data = (await res.json()) as { ok: boolean; message: string };
      if (!res.ok || !data.ok) {
        notifyError(data.message || "Suppression echouee.");
      } else {
        notifySuccess(data.message || "Inscription supprimee.");
        router.refresh();
      }
    } catch {
      notifyError("Erreur serveur pendant la suppression.");
    }
  };

  const handleSave = async () => {
    if (checked.length === 0) {
      notifyError("Selectionnez au moins un tableau.");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/admin/inscriptions/update-tableaux", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          playerId,
          tourId,
          tableauIds: checked,
        }),
      });
      const data = (await res.json()) as { ok: boolean; message: string };
      if (!res.ok || !data.ok) {
        notifyError(data.message || "Mise a jour echouee.");
      } else {
        notifySuccess(data.message || "Inscriptions mises a jour.");
        setDialogOpen(false);
        router.refresh();
      }
    } catch {
      notifyError("Erreur serveur pendant la mise a jour.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button size="icon-sm" variant="secondary">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DialogTrigger asChild>
            <DropdownMenuItem>Modifier tableaux</DropdownMenuItem>
          </DialogTrigger>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleDeleteAll}>
            Supprimer tout
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Modifier les tableaux</DialogTitle>
          <DialogDescription>
            {playerName} · {tourName}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-2 sm:grid-cols-2">
          {tableauOptions.map((tableau) => (
            <label
              key={tableau.id}
              className="flex items-center gap-2 rounded-md border border-border/60 bg-muted/20 px-3 py-2 text-sm"
            >
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-border"
                checked={checked.includes(tableau.id)}
                onChange={(event) => {
                  if (event.target.checked) {
                    setChecked((prev) => [...prev, tableau.id]);
                  } else {
                    setChecked((prev) => prev.filter((id) => id !== tableau.id));
                  }
                }}
              />
              <span className="flex-1">{tableau.label}</span>
            </label>
          ))}
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline" type="button">
              Annuler
            </Button>
          </DialogClose>
          <Button type="button" onClick={handleSave} disabled={saving}>
            {saving ? "Enregistrement..." : "Enregistrer"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
