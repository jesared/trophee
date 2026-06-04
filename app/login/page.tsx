"use client";

import * as React from "react";
import { Mail } from "lucide-react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
      <div className="mx-auto flex min-h-[42vh] max-w-md items-center justify-center">
        <Card className="w-full border-border/70 bg-card shadow-xl">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Connexion</CardTitle>
            <CardDescription>
              Connectez-vous pour accéder à votre espace.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <Button
              className="w-full"
              onClick={() => signIn("google", { callbackUrl: "/" })}
            >
              Continuer avec Google
            </Button>

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
                  placeholder="ex: contact@mail.com"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                />
              </div>
              {status ? (
                <p className="text-xs text-muted-foreground">{status}</p>
              ) : null}
              <Button type="submit" className="w-full" disabled={pending}>
                <Mail className="h-4 w-4" />
                {pending ? "Envoi..." : "Envoyer un lien magique"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
