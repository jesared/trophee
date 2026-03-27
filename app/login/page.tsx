"use client";

import * as React from "react";
import { signIn } from "next-auth/react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function LoginPage() {
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

  return (
    <div className="page">
      <div className="mx-auto grid max-w-4xl gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <Card className="surface border-border/60">
          <CardHeader>
            <CardTitle>Se connecter</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <Button className="w-full" onClick={() => signIn("google")}>
                Continuer avec Google
              </Button>
            </div>

            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <span className="h-px flex-1 bg-border" />
              ou
              <span className="h-px flex-1 bg-border" />
            </div>

            <form className="space-y-4" onSubmit={handleMagicLink}>
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
              <Button
                type="submit"
                className="w-full"
                disabled={pending}
              >
                {pending ? "Envoi..." : "Envoyer un lien magique"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="surface border-border/60 bg-muted/30">
          <CardHeader>
            <CardTitle>Accès sécurisé</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <p>
              Le lien magique vous permet de vous connecter sans mot de passe.
              Vérifiez votre boîte mail après l'envoi.
            </p>
            <p>
              Besoin d'aide ? Contactez l'organisation depuis la page
              <Link
                href="/inscription"
                className="ml-1 font-medium text-foreground"
              >
                Inscription
              </Link>
              .
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
