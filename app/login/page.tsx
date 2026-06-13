"use client";

import { signIn } from "next-auth/react";

import { MagicLinkForm } from "@/components/magic-link-form";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export default function LoginPage() {
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
              <Separator className="flex-1" />
              <span>ou</span>
              <Separator className="flex-1" />
            </div>

            <MagicLinkForm />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
