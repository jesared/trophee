"use client";

import Link from "next/link";
import { Info } from "lucide-react";

import { Button } from "@/components/ui/button";

export function UserTopbar() {
  return (
    <div className="sticky top-0 z-20 border-b border-border/60 bg-background/80 backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-3 px-4 py-3">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Info className="h-4 w-4" />
          <span>Espace joueur en préparation</span>
        </div>
        <Button asChild size="sm" variant="secondary">
          <Link href="/agenda">Retour aux informations du trophée</Link>
        </Button>
      </div>
    </div>
  );
}
