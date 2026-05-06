"use client";

import * as React from "react";
import Link from "next/link";
import { MoreHorizontal } from "lucide-react";

import { AdminDeleteForm } from "@/components/admin-delete-form";
import { AdminTourEditDialog } from "@/components/admin-tour-edit-dialog";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { TourStatus } from "@/lib/tour-status";

type ActionState = {
  ok: boolean;
  message: string;
};

type AdminTourRowActionsProps = {
  tourId: string;
  tourName: string;
  tourStatus: TourStatus;
  statusLabel?: string;
  statusAction?: {
    nextStatus: "OPEN" | "CLOSED";
    label: string;
  } | null;
  editAction: (
    prevState: ActionState,
    formData: FormData,
  ) => Promise<ActionState>;
  editDialogProps: {
    seasons: {
      id: string;
      name: string;
      year: number;
      isActive: boolean;
    }[];
    clubs: {
      id: string;
      name: string;
      city?: string | null;
    }[];
    tour: {
      id: string;
      name: string;
      date: Date | string;
      seasonId: string;
      clubId: string | null;
      venue: string | null;
      city: string | null;
      address: string | null;
      coverUrl: string | null;
      rulesUrl: string | null;
    };
  };
  deleteAction: (
    prevState: ActionState,
    formData: FormData,
  ) => Promise<ActionState>;
  toggleAction: (formData: FormData) => Promise<void>;
};

export function AdminTourRowActions({
  tourId,
  tourName,
  tourStatus,
  statusLabel,
  statusAction,
  editAction,
  editDialogProps,
  deleteAction,
  toggleAction,
}: AdminTourRowActionsProps) {
  const [menuOpen, setMenuOpen] = React.useState(false);
  const [editOpen, setEditOpen] = React.useState(false);
  const [deleteOpen, setDeleteOpen] = React.useState(false);

  return (
    <>
      <AdminTourEditDialog
        action={editAction}
        seasons={editDialogProps.seasons}
        clubs={editDialogProps.clubs}
        tour={editDialogProps.tour}
        open={editOpen}
        onOpenChange={setEditOpen}
      />

      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Supprimer ce tour ?</DialogTitle>
            <DialogDescription>
              Cette action supprimera {tourName} si aucun tableau n&apos;y est encore lie.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" type="button" onClick={() => setDeleteOpen(false)}>
              Annuler
            </Button>
            <AdminDeleteForm
              id={tourId}
              action={deleteAction}
              label="Supprimer"
              onSuccess={() => setDeleteOpen(false)}
            />
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <DropdownMenu open={menuOpen} onOpenChange={setMenuOpen}>
      <DropdownMenuTrigger asChild>
        <Button size="icon-sm" variant="secondary" aria-label="Actions du tour">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuLabel>Actions du tour</DropdownMenuLabel>
        <DropdownMenuItem asChild>
          <Link href={`/admin/tours/${tourId}`}>Voir le dashboard</Link>
        </DropdownMenuItem>
        <DropdownMenuItem
          onSelect={(event) => {
            event.preventDefault();
            setMenuOpen(false);
            setEditOpen(true);
          }}
        >
          Modifier
        </DropdownMenuItem>
        {statusAction ? (
          <div className="px-1">
            <form action={toggleAction}>
              <input type="hidden" name="id" value={tourId} />
              <input
                type="hidden"
                name="nextStatus"
                value={statusAction.nextStatus}
              />
              <button
                type="submit"
                className="relative flex w-full cursor-default items-center gap-1.5 rounded-md px-1.5 py-1 text-left text-sm outline-hidden select-none hover:bg-accent hover:text-accent-foreground"
              >
                {statusAction.label}
              </button>
            </form>
          </div>
        ) : null}
        <DropdownMenuSeparator />
        <DropdownMenuItem
          variant="destructive"
          onSelect={(event) => {
            event.preventDefault();
            setMenuOpen(false);
            setDeleteOpen(true);
          }}
        >
          Supprimer
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuLabel>Statut: {statusLabel ?? tourStatus}</DropdownMenuLabel>
      </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}
