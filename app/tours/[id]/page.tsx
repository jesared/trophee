import Link from "next/link";
import { notFound } from "next/navigation";
import { PencilLine } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getIsCurrentVisitorAdmin } from "@/lib/current-visitor-admin";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type PageProps = {
  params: Promise<{ id: string }>;
};

function buildFallbackDescription(tour: {
  name: string;
  season: { name: string };
  club: { name: string } | null;
  city: string | null;
  venue: string | null;
  status: "DRAFT" | "OPEN" | "CLOSED" | "DONE";
  tableaux: { id: string }[];
}) {
  const locationBits = [tour.city, tour.venue].filter(Boolean);
  const locationLabel =
    locationBits.length > 0 ? ` a ${locationBits.join(", ")}` : "";
  const organizerLabel = tour.club?.name
    ? ` organise par ${tour.club.name}`
    : "";

  const intro = `${tour.name} fait partie de ${tour.season.name}${organizerLabel}${locationLabel}.`;

  if (tour.tableaux.length > 0) {
    return `${intro} Retrouvez ci-dessous les tableaux prevus, leurs horaires et les categories de points associees.`;
  }

  if (tour.status === "DONE") {
    return `${intro} Ce tour est desormais termine. Les informations principales sont conservees ici pour consultation.`;
  }

  return `${intro} Les precisions complementaires seront ajoutees prochainement par l'organisation.`;
}

export default async function TourDetailPage({ params }: PageProps) {
  const { id } = await params;
  const isAdmin = await getIsCurrentVisitorAdmin();

  const tour = await prisma.tour.findUnique({
    where: { id },
    include: {
      club: true,
      season: true,
      tableaux: {
        include: { template: true },
        orderBy: { startTime: "asc" },
      },
    },
  });

  if (!tour) {
    notFound();
  }

  const formatter = new Intl.DateTimeFormat("fr-FR", {
    dateStyle: "long",
  });
  const timeFormatter = new Intl.DateTimeFormat("fr-FR", {
    timeStyle: "short",
    timeZone: "Europe/Paris",
  });
  const publicInfoLabel =
    tour.status === "OPEN"
      ? "Inscriptions bientot disponibles"
      : tour.status === "DONE"
        ? "Tour termine"
        : "Informations uniquement";
  const description = tour.description?.trim() || buildFallbackDescription(tour);

  return (
    <section className="space-y-10">
      <header className="space-y-6">
        <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
          <Link href="/agenda" className="hover:text-foreground">
            Agenda & salles
          </Link>
          <span>•</span>
          <span>{tour.season.name}</span>
          <span>•</span>
          <span>{formatter.format(tour.date)}</span>
        </div>

        {tour.coverUrl ? (
          <div className="overflow-hidden rounded-2xl border border-border/60">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={tour.coverUrl}
              alt={`Couverture ${tour.name}`}
              className="h-auto w-full object-cover"
            />
          </div>
        ) : null}

        <div className="space-y-3">
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            {tour.name}
          </h1>

          <div className="flex flex-wrap items-center gap-2">
            <span className="badge-pill">
              {tour.status === "OPEN"
                ? "Ouvert"
                : tour.status === "CLOSED"
                  ? "Ferme"
                  : tour.status === "DONE"
                    ? "Termine"
                    : "Brouillon"}
            </span>
            {tour.club?.name ? (
              <span className="badge-pill">Club : {tour.club.name}</span>
            ) : null}
            {tour.venue ? (
              <span className="badge-pill">{tour.venue}</span>
            ) : null}
            {tour.city ? <span className="badge-pill">{tour.city}</span> : null}
          </div>

          {tour.address ? (
            <p className="text-sm text-muted-foreground">{tour.address}</p>
          ) : null}
          <p className="max-w-2xl text-base text-foreground/80">
            {description}
          </p>
        </div>

        {isAdmin ? (
          <div className="flex flex-col gap-3 rounded-2xl border border-primary/20 bg-primary/5 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-1">
              <p className="text-sm font-semibold text-foreground">
                Mode administration
              </p>
              <p className="text-sm text-muted-foreground">
                Modifie rapidement ce tour depuis la page publique.
              </p>
            </div>
            <Button asChild size="sm" className="gap-2 self-start sm:self-auto">
              <Link href={`/admin/tours/${tour.id}?edit=1`}>
                <PencilLine className="h-4 w-4" />
                Modifier ce tour
              </Link>
            </Button>
          </div>
        ) : null}

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Date</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              {formatter.format(tour.date)}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Club</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              {tour.club?.name ?? "-"}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Salle</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              {tour.venue ?? "-"}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Ville</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              {tour.city ?? "-"}
            </CardContent>
          </Card>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {tour.rulesUrl ? (
            <Button asChild variant="secondary" size="sm">
              <Link href={tour.rulesUrl} target="_blank" rel="noreferrer">
                Reglement du tour
              </Link>
            </Button>
          ) : null}
          <Button size="sm" variant="outline" disabled>
            {publicInfoLabel}
          </Button>
        </div>
      </header>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Tableaux</h2>
        </div>
        {tour.tableaux.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Aucun tableau defini pour ce tour.
          </p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {tour.tableaux.map((tableau) => (
              <Card
                key={tableau.id}
                className="bg-card transition hover:-translate-y-0.5"
              >
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-full border border-border/60 bg-muted text-base font-semibold text-foreground">
                      {tableau.template.name
                        .trim()
                        .slice(0, 2)
                        .toUpperCase()}
                    </div>
                    <div>
                      <CardTitle className="text-base">
                        Tableau {tableau.template.name}
                      </CardTitle>
                      <p className="text-xs text-muted-foreground">
                        Categorie par points
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">
                  <p>Horaire : {timeFormatter.format(tableau.startTime)}</p>
                  {tableau.template.minPoints != null ||
                  tableau.template.maxPoints != null ? (
                    <p>
                      Points : {tableau.template.minPoints ?? "-"} -{" "}
                      {tableau.template.maxPoints ?? "+"}
                    </p>
                  ) : (
                    <p>Points : libre</p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
