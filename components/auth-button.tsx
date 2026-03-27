"use client";

import * as React from "react";
import { signIn, signOut } from "next-auth/react";

import { useCurrentUser } from "@/hooks/use-current-user";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function AuthButton() {
  const user = useCurrentUser();
  const [email, setEmail] = React.useState("");
  const [status, setStatus] = React.useState<string | null>(null);
  const [pending, setPending] = React.useState(false);

  const handleMagicLink = async (event: React.FormEvent) => {
    event.preventDefault();
    const trimmed = email.trim();
    if (!trimmed) {
      setStatus("Veuillez saisir un email.");
      return;
    }
    setPending(true);
    setStatus(null);
    try {
      const res = await signIn("email", {
        email: trimmed,
        redirect: false,
      });
      if (res?.ok) {
        setStatus("Lien de connexion envoyé.");
      } else {
        setStatus("Impossible d'envoyer le lien.");
      }
    } catch {
      setStatus("Erreur lors de l'envoi.");
    } finally {
      setPending(false);
    }
  };

  if (user) {
    return (
      <div className="flex items-center gap-3">
        <span className="hidden text-sm text-muted-foreground sm:inline">
          {user.name ?? user.email}
        </span>
        <Button variant="outline" size="sm" onClick={() => signOut()}>
          Logout
        </Button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Button size="sm" onClick={() => signIn("google")}>
        Login Google
      </Button>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button size="sm" variant="secondary">
            Lien magique
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-80">
          <form className="space-y-3" onSubmit={handleMagicLink}>
            <div className="space-y-2">
              <Label htmlFor="magic-email">Email</Label>
              <Input
                id="magic-email"
                name="email"
                type="email"
                placeholder="ex: joueur@mail.com"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
            </div>
            {status ? (
              <p className="text-xs text-muted-foreground">{status}</p>
            ) : null}
            <Button type="submit" size="sm" disabled={pending} className="w-full">
              {pending ? "Envoi..." : "Envoyer le lien"}
            </Button>
          </form>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
