"use client";

import * as React from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { notifyError, notifySuccess } from "@/lib/toast";

export default function AdminTestEmailPage() {
  const [email, setEmail] = React.useState("");
  const [pending, setPending] = React.useState(false);
  const [response, setResponse] = React.useState<string | null>(null);

  const handleSend = async (event: React.FormEvent) => {
    event.preventDefault();
    const trimmed = email.trim();
    if (!trimmed) {
      notifyError("Email requis.");
      return;
    }
    setPending(true);
    setResponse(null);
    try {
      const res = await fetch("/api/debug/send-test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ to: trimmed }),
      });
      const data = (await res.json()) as {
        ok: boolean;
        message: string;
        response?: string;
        messageId?: string;
      };
      if (!res.ok || !data.ok) {
        notifyError(data.message || "Envoi echoue.");
      } else {
        notifySuccess("Email teste avec succes.");
      }
      setResponse(JSON.stringify(data, null, 2));
    } catch {
      notifyError("Erreur serveur.");
    } finally {
      setPending(false);
    }
  };

  return (
    <section className="page">
      <div className="page-header">
        <h1 className="page-title">Test email</h1>
        <p className="page-subtitle">
          Envoi d'un email de test via SMTP.
        </p>
      </div>

      <Card className="surface border-border/60">
        <CardHeader>
          <CardTitle>SMTP</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handleSend} className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor="email">Destinataire</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="ex: joueur@mail.com"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
            </div>
            <Button type="submit" disabled={pending}>
              {pending ? "Envoi..." : "Envoyer un test"}
            </Button>
          </form>

          {response ? (
            <pre className="rounded-md border border-border/60 bg-muted/40 p-3 text-xs text-muted-foreground">
              {response}
            </pre>
          ) : null}
        </CardContent>
      </Card>
    </section>
  );
}
