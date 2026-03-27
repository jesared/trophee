import Link from "next/link";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type PageProps = {
  searchParams: Promise<{ email?: string }>;
};

export default async function CheckEmailPage({ searchParams }: PageProps) {
  const { email } = await searchParams;

  return (
    <div className="page">
      <div className="mx-auto max-w-2xl">
        <Card className="surface border-border/60">
          <CardHeader>
            <CardTitle>Vérifie ta boîte mail</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <p>
              Nous avons envoyé un lien de connexion à{" "}
              <span className="font-medium text-foreground">
                {email ?? "ton adresse email"}
              </span>
              .
            </p>
            <p>
              Pense à vérifier les spams si tu ne vois rien dans quelques
              minutes.
            </p>
            <div className="flex flex-wrap gap-2 pt-2">
              <Button asChild size="sm" variant="secondary">
                <Link href="/login">Renvoyer un lien</Link>
              </Button>
              <Button asChild size="sm">
                <Link href="/">Retour à l'accueil</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
