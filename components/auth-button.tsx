"use client";

import { signIn, signOut } from "next-auth/react";

import { MagicLinkForm } from "@/components/magic-link-form";
import { useCurrentUser } from "@/hooks/use-current-user";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function AuthButton() {
  const user = useCurrentUser();

  if (user) {
    return (
      <div className="flex items-center gap-3">
        <span className="hidden text-sm text-muted-foreground sm:inline">
          {user.name ?? user.email}
        </span>
        <Button variant="outline" size="sm" onClick={() => signOut()}>
          Déconnexion
        </Button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Button size="sm" onClick={() => signIn("google")}>
        Continuer avec Google
      </Button>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button size="sm" variant="secondary">
            Lien magique
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-80">
          <div className="p-1">
            <MagicLinkForm
              className="space-y-3"
              emailPlaceholder="ex: joueur@mail.com"
              inputId="auth-button-magic-email"
              pendingHint="Vous allez être redirigé vers l'écran de confirmation dès que le lien est envoyé."
            />
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
