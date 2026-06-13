"use client";

import type { ReactNode } from "react";

import { AdminDeleteForm } from "@/components/admin-delete-form";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";

type ActionState = {
  ok: boolean;
  message: string;
};

type AdminDeleteDialogProps = {
  id: string;
  action: (prevState: ActionState, formData: FormData) => Promise<ActionState>;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  trigger?: ReactNode;
  triggerLabel?: string;
  confirmLabel?: string;
  title?: string;
  description?: string;
};

export function AdminDeleteDialog({
  id,
  action,
  open,
  onOpenChange,
  trigger,
  triggerLabel = "Supprimer",
  confirmLabel = "Supprimer",
  title = "Confirmer la suppression ?",
  description = "Cette action est irreversible.",
}: AdminDeleteDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      {trigger ? (
        <AlertDialogTrigger asChild>{trigger}</AlertDialogTrigger>
      ) : (
        <AlertDialogTrigger asChild>
          <Button size="sm" variant="destructive">
            {triggerLabel}
          </Button>
        </AlertDialogTrigger>
      )}
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Annuler</AlertDialogCancel>
          <AdminDeleteForm
            id={id}
            action={action}
            label={confirmLabel}
            onSuccess={() => onOpenChange?.(false)}
          />
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
