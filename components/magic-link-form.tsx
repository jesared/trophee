"use client";

import * as React from "react";
import { AlertCircle, CheckCircle2, LoaderCircle, Mail } from "lucide-react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type MagicLinkStatus =
  | {
      type: "error" | "success";
      message: string;
    }
  | null;

type MagicLinkFormProps = {
  className?: string;
  emailPlaceholder?: string;
  inputId?: string;
  pendingHint?: string;
  submitLabel?: string;
};

export function MagicLinkForm({
  className = "space-y-4",
  emailPlaceholder = "ex: contact@mail.com",
  inputId = "magic-email",
  pendingHint = "Vérification en cours. Vous allez être redirigé vers l'écran de confirmation dès que le lien est envoyé.",
  submitLabel = "Envoyer un lien magique",
}: MagicLinkFormProps) {
  const router = useRouter();
  const [email, setEmail] = React.useState("");
  const [status, setStatus] = React.useState<MagicLinkStatus>(null);
  const [pending, setPending] = React.useState(false);

  const handleMagicLink = async (event: React.FormEvent) => {
    event.preventDefault();
    const trimmed = email.trim();

    if (!trimmed) {
      setStatus({
        type: "error",
        message: "Veuillez saisir un email.",
      });
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
        setStatus({
          type: "success",
          message: "Lien de connexion envoyé.",
        });
        router.push(`/login/check-email?email=${encodeURIComponent(trimmed)}`);
      } else {
        setStatus({
          type: "error",
          message: "Impossible d'envoyer le lien.",
        });
      }
    } catch {
      setStatus({
        type: "error",
        message: "Erreur lors de l'envoi.",
      });
    } finally {
      setPending(false);
    }
  };

  return (
    <form className={className} onSubmit={handleMagicLink}>
      <div className="space-y-2">
        <Label htmlFor={inputId}>Email</Label>
        <Input
          id={inputId}
          name="email"
          type="email"
          placeholder={emailPlaceholder}
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
        />
      </div>
      {status ? (
        <Alert variant={status.type === "error" ? "destructive" : "success"}>
          {status.type === "error" ? (
            <AlertCircle aria-hidden="true" />
          ) : (
            <CheckCircle2 aria-hidden="true" />
          )}
          <div>
            <AlertTitle>
              {status.type === "error" ? "Envoi impossible" : "Lien envoyé"}
            </AlertTitle>
            <AlertDescription>{status.message}</AlertDescription>
          </div>
        </Alert>
      ) : null}
      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? (
          <LoaderCircle className="h-4 w-4 animate-spin" />
        ) : (
          <Mail className="h-4 w-4" />
        )}
        {pending ? "Envoi du lien..." : submitLabel}
      </Button>
      {pending ? (
        <p className="text-center text-xs leading-relaxed text-muted-foreground">
          {pendingHint}
        </p>
      ) : null}
    </form>
  );
}
