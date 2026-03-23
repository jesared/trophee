"use client";

import { Button } from "@/components/ui/button";
import { notifyError, notifySuccess } from "@/lib/toast";

type AdminMediaCopyButtonProps = {
  url?: string | null;
};

export function AdminMediaCopyButton({ url }: AdminMediaCopyButtonProps) {
  const handleCopy = async () => {
    if (!url) return;
    try {
      await navigator.clipboard.writeText(url);
      notifySuccess("Lien copié.");
    } catch {
      notifyError("Impossible de copier le lien.");
    }
  };

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={handleCopy}
      disabled={!url}
    >
      Copier lien
    </Button>
  );
}
