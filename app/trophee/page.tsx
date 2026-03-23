import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const stats = [
  { label: "Saisons actives", value: "1" },
  { label: "Tours officiels", value: "8" },
  { label: "Tableaux par niveau", value: "12+" },
];

const principles = [
  "Des tableaux répartis par niveaux de points",
  "Un barème identique sur chaque tournoi",
  "Un classement général par tableau",
  "Une remise de récompenses en fin de saison",
];

const tieBreakers = [
  "Nombre de tournois disputés",
  "Nombre de victoires",
  "Nombre de places de finaliste, puis demi-finaliste, etc.",
  "Âge du joueur en dernier critère",
];

export default function TropheePage() {
  return (
    <section className="page">
      <header className="relative overflow-hidden rounded-3xl border border-border/60 bg-background p-8 sm:p-10">
        <div className="space-y-5">
          <p className="badge-pill w-fit">Le Trophée</p>
          <h1 className="page-title sm:text-4xl">
            Trophée François Grieder
          </h1>
          <p className="page-subtitle max-w-3xl text-base text-foreground/80">
            Le Trophée François Grieder est un challenge régional de tennis de
            table organisé autour des tournois homologués du département de la
            Marne et des Ardennes.
          </p>
          <p className="page-subtitle max-w-3xl text-base text-foreground/80">
            Créé en hommage à François Grieder, fidèle participant du circuit,
            ce trophée récompense la régularité et la performance des joueurs
            tout au long de la saison.
          </p>
          <div className="flex flex-wrap gap-3">
            <Button asChild>
              <Link href="/agenda">Voir l'agenda</Link>
            </Button>
            <Button asChild variant="secondary">
              <Link href="/classement">Classements</Link>
            </Button>
          </div>
        </div>
      </header>

      <section className="grid gap-4 rounded-3xl border border-border/60 bg-background p-6 sm:grid-cols-3 sm:p-8">
        {stats.map((stat) => (
          <div key={stat.label} className="surface px-5 py-4">
            <p className="text-xs font-medium text-muted-foreground">
              {stat.label}
            </p>
            <p className="text-2xl font-semibold text-foreground">
              {stat.value}
            </p>
          </div>
        ))}
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <Card className="surface border-border/60">
          <CardHeader>
            <CardTitle>Le principe</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-muted-foreground">
            <p>
              Chaque tournoi du circuit propose les mêmes tableaux par
              catégories de points. Les joueurs accumulent des points en
              fonction de leurs résultats afin d'établir un classement général
              sur l'ensemble de la saison.
            </p>
            <ul className="list-disc space-y-2 pl-5">
              {principles.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card className="surface border-border/60 bg-muted/30">
          <CardHeader>
            <CardTitle>Fonctionnement</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-muted-foreground">
            <p>
              Les points sont attribués selon la performance réalisée dans
              chaque tableau. En cas d'égalité au classement général, le
              départage s'effectue selon plusieurs critères successifs :
            </p>
            <ul className="list-disc space-y-2 pl-5">
              {tieBreakers.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </section>

      <section className="rounded-3xl border border-border/60 bg-muted/30 p-6 sm:p-8">
        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold text-foreground">
              Récompenses
            </h2>
            <p className="text-sm text-muted-foreground">
              Chaque club participant contribue à la dotation du challenge afin
              de récompenser les trois premiers de chaque classement général.
            </p>
            <p className="text-sm text-muted-foreground">
              La cérémonie officielle de remise des récompenses a lieu à
              l'issue du dernier tournoi de la saison.
            </p>
          </div>
          <div className="surface p-5 text-sm text-muted-foreground">
            <p className="text-xs font-medium text-muted-foreground">
              Pour aller plus loin
            </p>
            <p className="mt-2 text-foreground">
              Consultez le détail des tableaux, le barème des points et la
              liste complète des récompenses.
            </p>
            <div className="mt-4 flex flex-col gap-2">
              <Button asChild size="sm" variant="secondary">
                <Link href="/classement">Classements</Link>
              </Button>
              <Button asChild size="sm" variant="secondary">
                <Link href="/agenda">Agenda & salles</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </section>
  );
}
