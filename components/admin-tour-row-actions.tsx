"use client";

import * as React from "react";
import Link from "next/link";
import {
  Eye,
  LayoutDashboard,
  Lock,
  MoreHorizontal,
  PencilLine,
  Trash2,
  Unlock,
} from "lucide-react";

import { AdminDeleteDialog } from "@/components/admin-delete-dialog";
import { AdminTourEditDialog } from "@/components/admin-tour-edit-dialog";
import { Button } from "@/components/ui/button";
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
  const statusFormRef = React.useRef<HTMLFormElement | null>(null);

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

      <AdminDeleteDialog
        id={tourId}
        action={deleteAction}
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        confirmLabel="Supprimer"
        title="Supprimer ce tour ?"
        description={`Cette action supprimera ${tourName}, ses tableaux et les inscriptions associees.`}
      />

      <DropdownMenu open={menuOpen} onOpenChange={setMenuOpen}>
        <DropdownMenuTrigger asChild>
          <Button size="icon-sm" variant="secondary" aria-label="Actions du tour">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>Actions du tour</DropdownMenuLabel>
          <DropdownMenuItem asChild>
            <Link href={`/admin/tours/${tourId}`} className="gap-2">
              <LayoutDashboard className="h-4 w-4" />
              Voir le dashboard
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href={`/tours/${tourId}`} className="gap-2">
              <Eye className="h-4 w-4" />
              Voir le tour
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem
            onSelect={(event) => {
              event.preventDefault();
              setMenuOpen(false);
              setEditOpen(true);
            }}
          >
            <PencilLine className="h-4 w-4" />
            Modifier
          </DropdownMenuItem>
          {statusAction ? (
            <DropdownMenuItem
              onSelect={(event) => {
                event.preventDefault();
                setMenuOpen(false);
                statusFormRef.current?.requestSubmit();
              }}
            >
              {statusAction.nextStatus === "OPEN" ? (
                <Unlock className="h-4 w-4" />
              ) : (
                <Lock className="h-4 w-4" />
              )}
              {statusAction.label}
            </DropdownMenuItem>
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
            <Trash2 className="h-4 w-4" />
            Supprimer
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuLabel className="px-2 py-1.5">
            <span className="block text-[11px] uppercase tracking-wide text-muted-foreground/80">
              Statut
            </span>
            <span className="block pt-1 text-sm text-foreground">
              {statusLabel ?? tourStatus}
            </span>
          </DropdownMenuLabel>
        </DropdownMenuContent>
      </DropdownMenu>

      {statusAction ? (
        <form ref={statusFormRef} action={toggleAction} className="hidden">
          <input type="hidden" name="id" value={tourId} />
          <input type="hidden" name="nextStatus" value={statusAction.nextStatus} />
        </form>
      ) : null}
    </>
  );
}
