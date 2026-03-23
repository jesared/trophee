import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const highlights = [
  {
    title: "Saison en cours",
    description: "Suivez les dates clés et les classements mis à jour.",
    href: "/agenda",
    cta: "Voir l’agenda",
  },
  {
    title: "Classements officiels",
    description: "Accédez aux PDF par saison, tour et tableau.",
    href: "/classement",
    cta: "Consulter les classements",
  },
  {
    title: "Inscription rapide",
    description: "Choisissez votre tour et votre tableau en quelques clics.",
    href: "/inscription",
    cta: "S’inscrire",
  },
];

const steps = [
  "Choisissez un tour depuis l’agenda.",
  "Sélectionnez le tableau adapté à votre niveau.",
  "Confirmez votre inscription et suivez vos résultats.",
];

export default function Home() {
  return (
    <div className="space-y-16">
      <section className="grid items-center gap-10 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-6">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            Trophée François Grieder
          </p>
          <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
            Le challenge régional de tennis de table
          </h1>
          <p className="max-w-2xl text-base text-muted-foreground">
            Le Trophée François Grieder réunit les clubs de la région autour d’un
            challenge convivial, rythmé par des rencontres sportives et une
            ambiance associative.
          </p>
          <div className="flex flex-wrap gap-3">
            <Button asChild size="lg">
              <Link href="/agenda">Voir les tours</Link>
            </Button>
            <Button asChild size="lg" variant="secondary">
              <Link href="/classement">Classements</Link>
            </Button>
          </div>
          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
            <span>8 tours officiels</span>
            <span>•</span>
            <span>Tableaux par niveau</span>
            <span>•</span>
            <span>Classement général</span>
          </div>
        </div>

        <Card className="border-border/70 bg-muted/30">
          <CardHeader>
            <CardTitle>En un coup d’œil</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-muted-foreground">
            <div className="rounded-xl border border-border bg-background p-4">
              <p className="text-xs font-medium text-muted-foreground">
                Prochain tour
              </p>
              <p className="text-base font-semibold text-foreground">
                Consultez l’agenda pour la prochaine date
              </p>
            </div>
            <div className="rounded-xl border border-border bg-background p-4">
              <p className="text-xs font-medium text-muted-foreground">
                Classement en direct
              </p>
              <p className="text-base font-semibold text-foreground">
                Classements disponibles par saison
              </p>
            </div>
            <Button asChild size="sm" variant="secondary">
              <Link href="/trophee">Comprendre le trophée</Link>
            </Button>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        {highlights.map((item) => (
          <Card key={item.title} className="border-border/70">
            <CardHeader>
              <CardTitle>{item.title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-muted-foreground">
              <p>{item.description}</p>
              <Button asChild size="sm" variant="secondary">
                <Link href={item.href}>{item.cta}</Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <Card className="border-border/70 bg-background">
          <CardHeader>
            <CardTitle>Inscription en 3 étapes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            {steps.map((step) => (
              <div key={step} className="flex items-start gap-3">
                <span className="mt-1 h-2 w-2 rounded-full bg-primary" />
                <span>{step}</span>
              </div>
            ))}
            <Button asChild size="sm" className="mt-2">
              <Link href="/inscription">Commencer</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="border-border/70 bg-muted/30">
          <CardHeader>
            <CardTitle>Ressources rapides</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <p>
              Consultez les tableaux, règlements et informations pratiques pour
              préparer votre prochaine rencontre.
            </p>
            <div className="flex flex-col gap-3">
              <Button asChild size="sm" variant="secondary">
                <Link href="/trophee">Tableaux & règlement</Link>
              </Button>
              <Button asChild size="sm" variant="secondary">
                <Link href="/classement">Récompenses & classement</Link>
              </Button>
              <Button asChild size="sm" variant="secondary">
                <Link href="/agenda">Contact & lieux</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
