"use client";

import * as React from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { notifyError, notifySuccess } from "@/lib/toast";

type AdminMediaDeleteButtonProps = {
  name: string;
  onDeleted?: () => void;
  variant?: "outline" | "secondary";
};

export function AdminMediaDeleteButton({
  name,
  onDeleted,
  variant = "outline",
}: AdminMediaDeleteButtonProps) {
  const router = useRouter();
  const [pending, setPending] = React.useState(false);

  const handleDelete = async () => {
    if (!confirm("Supprimer cette image ?")) {
      return;
    }
    setPending(true);
    try {
      const formData = new FormData();
      formData.set("name", name);
      const res = await fetch("/api/admin/medias/delete", {
        method: "POST",
        body: formData,
      });
      const data = (await res.json()) as { ok: boolean; message: string };
      if (!res.ok || !data.ok) {
        notifyError(data.message || "Suppression echouee.");
      } else {
        notifySuccess(data.message || "Image supprimee.");
        onDeleted?.();
        router.refresh();
      }
    } catch {
      notifyError("Erreur serveur pendant la suppression.");
    } finally {
      setPending(false);
    }
  };

  return (
    <Button
      type="button"
      variant={variant}
      size="sm"
      onClick={handleDelete}
      disabled={pending}
    >
      {pending ? "Suppression..." : "Supprimer"}
    </Button>
  );
}
