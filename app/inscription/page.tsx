import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const participationConditions = [
  "Être en règle avec sa licence et son classement officiel.",
  "Respecter les horaires de convocation et le règlement du tour.",
  "Choisir un tableau cohérent avec son niveau et les catégories annoncées.",
];

const tableauRules = [
  {
    title: "Répartition par niveau",
    description:
      "Les tableaux sont organisés par tranches de points pour garder un format lisible et équilibré.",
  },
  {
    title: "Horaires annoncés à l'avance",
    description:
      "Chaque tableau possède son horaire de démarrage afin de faciliter l'organisation de la journée.",
  },
  {
    title: "Classement homogène",
    description:
      "Le même cadre est repris d'un tour à l'autre pour conserver la cohérence du trophée sur la saison.",
  },
];

const usefulInfo = [
  "Nom, prénom et club",
  "Numéro de licence ou classement FFTT à jour",
  "Tour visé et tableau correspondant",
  "Disponibilités ou informations particulières si besoin",
];

const practicalNotes = [
  "Consultez l'agenda pour connaître les dates, les salles et les clubs organisateurs.",
  "Les détails d'un tour permettent de vérifier les horaires, le lieu et les tableaux proposés.",
  "Les classements sont publiés séparément afin de suivre l'évolution de la saison.",
];

export default function InscriptionPage() {
  return (
    <section className="page">
      <header className="relative overflow-hidden rounded-3xl border border-border/60 bg-background p-8 sm:p-10">
        <div className="space-y-5">
          <div className="badge-pill w-fit">Participer au trophée</div>
          <h1 className="page-title sm:text-4xl">
            Informations pratiques pour les joueurs
          </h1>
          <p className="page-subtitle max-w-3xl text-base">
            Cette page rassemble les informations utiles pour préparer votre
            participation aux tours du Trophée François Grieder.
          </p>
          <div className="surface max-w-2xl p-4 text-sm text-muted-foreground">
            <p className="font-medium text-foreground">
              Inscriptions en ligne bientôt disponibles
            </p>
            <p className="mt-2">
              La mise en ligne actuelle est centrée sur les informations
              publiques du trophée. En attendant l&apos;ouverture du parcours
              d&apos;inscription, consultez les tours, les tableaux et les
              coordonnées de l&apos;organisation.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button asChild size="lg">
              <Link href="/agenda">Voir l&apos;agenda</Link>
            </Button>
            <Button asChild size="lg" variant="secondary">
              <Link href="/tours">Voir les tours</Link>
            </Button>
          </div>
        </div>
      </header>

      <section className="grid gap-6 lg:grid-cols-[1fr_1fr]">
        <Card className="surface border-border/60">
          <CardHeader>
            <CardTitle>Conditions de participation</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            {participationConditions.map((item) => (
              <div key={item} className="flex items-start gap-3">
                <span className="mt-1 h-2 w-2 rounded-full bg-primary" />
                <span>{item}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="surface border-border/60 bg-muted/30">
          <CardHeader>
            <CardTitle>Pièces et infos utiles</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            {usefulInfo.map((item) => (
              <div key={item} className="flex items-start gap-3">
                <span className="mt-1 h-2 w-2 rounded-full bg-primary" />
                <span>{item}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>

      <section className="rounded-3xl border border-border/60 bg-muted/30 p-6 sm:p-8">
        <div className="page-header">
          <h2 className="page-title text-2xl">Fonctionnement des tableaux</h2>
          <p className="page-subtitle">
            Le trophée s&apos;appuie sur des catégories lisibles, annoncées tour par
            tour.
          </p>
        </div>
        <div className="mt-6 grid gap-4 lg:grid-cols-3">
          {tableauRules.map((item) => (
            <Card key={item.title} className="surface border-border/60">
              <CardHeader>
                <CardTitle>{item.title}</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                {item.description}
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <Card className="surface border-border/60">
          <CardHeader>
            <CardTitle>Avant de venir</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            {practicalNotes.map((item) => (
              <div key={item} className="flex items-start gap-3">
                <span className="mt-1 h-2 w-2 rounded-full bg-primary" />
                <span>{item}</span>
              </div>
            ))}
            <div className="flex flex-wrap gap-3 pt-2">
              <Button asChild size="sm" variant="secondary">
                <Link href="/agenda">Agenda & salles</Link>
              </Button>
              <Button asChild size="sm" variant="secondary">
                <Link href="/classement">Classements</Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="surface border-border/60 bg-background">
          <CardHeader>
            <CardTitle>Contact organisateur</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <p>
              Pour toute question sur un tour, un tableau ou les modalités de
              participation, utilisez les coordonnées de contact affichées dans
              le pied de page du site.
            </p>
            <p>
              Les clubs organisateurs et les salles hôtes sont également visibles
              dans l&apos;agenda et sur chaque fiche de tour.
            </p>
            <Button asChild size="sm" variant="secondary">
              <Link href="/agenda">Consulter les coordonnées utiles</Link>
            </Button>
          </CardContent>
        </Card>
      </section>
    </section>
  );
}
