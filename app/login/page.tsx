"use client";

import * as React from "react";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function LoginPage() {
  const router = useRouter();
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
        router.push(`/login/check-email?email=${encodeURIComponent(trimmed)}`);
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
      <div className="mx-auto grid max-w-5xl gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <Card className="surface border-border/60 bg-muted/30">
          <CardHeader>
            <CardTitle>Accès réservé</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5 text-sm text-muted-foreground">
            <p className="text-base text-foreground">
              L'espace joueur n'est pas encore ouvert dans cette première mise
              en ligne.
            </p>
            <p>
              Le site public se concentre pour le moment sur les informations
              pratiques du trophée: agenda, salles, détails des tours et
              classements.
            </p>
            <div className="surface p-4">
              <p className="font-medium text-foreground">
                Inscriptions et espace joueur bientôt disponibles
              </p>
              <p className="mt-2">
                En attendant, utilisez le site comme portail d'information du
                trophée.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button asChild>
                <Link href="/agenda">Voir l'agenda</Link>
              </Button>
              <Button asChild variant="secondary">
                <Link href="/classement">Voir les classements</Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="surface border-border/60">
          <CardHeader>
            <CardTitle>Accès organisation</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="text-sm text-muted-foreground">
              Cet accès peut rester utilisé par l'organisation pour
              l'administration du site.
            </p>

            <div className="space-y-3">
              <Button
                className="w-full"
                onClick={() => signIn("google", { callbackUrl: "/" })}
              >
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
                  placeholder="ex: organisation@mail.com"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                />
              </div>
              {status ? (
                <p className="text-xs text-muted-foreground">{status}</p>
              ) : null}
              <Button type="submit" className="w-full" disabled={pending}>
                {pending ? "Envoi..." : "Envoyer un lien magique"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
