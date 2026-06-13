"use client";

import { ArrowUpRight, Info, Shield } from "lucide-react";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export function UserTopbar() {
  return (
    <div className="sticky top-0 z-20 border-b border-border/60 bg-background/80 backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 flex-col gap-2">
          <Badge
            variant="secondary"
            className="w-fit gap-1 px-2.5 py-1 tracking-[0.12em]"
          >
            <Shield className="h-3 w-3" />
            Espace joueur
          </Badge>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Info className="h-4 w-4 shrink-0" />
            <span>Espace joueur en préparation</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button asChild size="sm" variant="secondary" className="gap-2">
            <Link href="/agenda">
              Retour aux informations du trophée
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
