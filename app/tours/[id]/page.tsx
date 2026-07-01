import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { PencilLine } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getIsCurrentVisitorAdmin } from "@/lib/current-visitor-admin";
import { prisma } from "@/lib/prisma";
import { sortByTableauNaturalOrder } from "@/lib/tableau-order";

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
  const intro = `${tour.name} fait partie de ${tour.season.name}.`;
  const organizerSentence = tour.club?.name
    ? `Ce tour est organis\u00e9 par ${tour.club.name}.`
    : null;
  const locationBits = [tour.venue, tour.city].filter(Boolean);
  const locationSentence =
    locationBits.length > 0
      ? `Lieu pr\u00e9vu : ${locationBits.join(", ")}.`
      : null;
  const context = [organizerSentence, locationSentence].filter(Boolean).join(" ");

  if (tour.tableaux.length > 0) {
    return `${intro} ${context} Retrouvez ci-dessous les tableaux pr\u00e9vus, leurs horaires et les cat\u00e9gories de points associ\u00e9es.`
      .trim();
  }

  if (tour.status === "DONE") {
    return `${intro} ${context} Ce tour est d\u00e9sormais termin\u00e9. Les informations principales sont conserv\u00e9es ici pour consultation.`
      .trim();
  }

  return `${intro} ${context} Les pr\u00e9cisions compl\u00e9mentaires seront ajout\u00e9es prochainement par l'organisation.`
    .trim();
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
        orderBy: [{ template: { name: "asc" } }, { startTime: "asc" }],
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
  const statusLabel =
    tour.status === "OPEN"
      ? "Ouvert"
      : tour.status === "CLOSED"
        ? "Ferm\u00e9"
        : tour.status === "DONE"
          ? "Termin\u00e9"
          : "Brouillon";
  const publicInfoLabel =
    tour.status === "OPEN"
      ? "Inscriptions bient\u00f4t disponibles"
      : tour.status === "DONE"
        ? "Tour termin\u00e9"
        : "Informations uniquement";
  const description = tour.description?.trim() || buildFallbackDescription(tour);
  const locationLabel = [tour.venue, tour.city].filter(Boolean).join(" \u00b7 ");
  const orderedTableaux = sortByTableauNaturalOrder(
    tour.tableaux,
    (tableau) => tableau.template.name,
    (tableau) => tableau.startTime,
  );
  const earliestTableau =
    tour.tableaux.reduce<Date | null>((earliest, tableau) => {
      if (!earliest || tableau.startTime < earliest) {
        return tableau.startTime;
      }

      return earliest;
    }, null) ?? null;

  return (
    <section className="space-y-10">
      <header className="space-y-6">
        <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
          <Link href="/agenda" className="hover:text-foreground">
            Agenda &amp; salles
          </Link>
          <span>&bull;</span>
          <span>{tour.season.name}</span>
        </div>

        {tour.coverUrl ? (
          <div className="relative aspect-[16/9] overflow-hidden rounded-2xl border border-border/60">
            <Image
              src={tour.coverUrl}
              alt={`Couverture ${tour.name}`}
              fill
              preload
              sizes="(max-width: 1279px) 100vw, 1200px"
              className="object-cover"
            />
          </div>
        ) : null}

        <div className="space-y-3">
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            {tour.name}
          </h1>

          <div className="flex flex-wrap items-center gap-2">
            <span className="badge-pill">{statusLabel}</span>
            <span className="badge-pill">{publicInfoLabel}</span>
            {tour.club?.name ? <span className="badge-pill">{tour.club.name}</span> : null}
            {locationLabel ? <span className="badge-pill">{locationLabel}</span> : null}
          </div>

          {tour.address ? (
            <p className="text-sm text-muted-foreground">{tour.address}</p>
          ) : null}

          <p className="max-w-2xl text-base text-foreground/80">{description}</p>
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

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Quand</CardTitle>
            </CardHeader>
            <CardContent className="space-y-1">
              <p className="text-base font-semibold text-foreground">
                {formatter.format(tour.date)}
              </p>
              <p className="text-sm text-muted-foreground">
                {earliestTableau
                  ? `Premier tableau \u00e0 ${timeFormatter.format(earliestTableau)}`
                  : "Horaires d\u00e9taill\u00e9s ci-dessous"}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Organisation</CardTitle>
            </CardHeader>
            <CardContent className="space-y-1">
              <p className="text-base font-semibold text-foreground">
                {tour.club?.name ?? "Club \u00e0 confirmer"}
              </p>
              <p className="text-sm text-muted-foreground">{tour.season.name}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Lieu</CardTitle>
            </CardHeader>
            <CardContent className="space-y-1">
              <p className="text-base font-semibold text-foreground">
                {tour.venue ?? tour.city ?? "Lieu \u00e0 confirmer"}
              </p>
              <p className="text-sm text-muted-foreground">
                {tour.address ?? tour.city ?? "Adresse \u00e0 venir"}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Tableaux</CardTitle>
            </CardHeader>
            <CardContent className="space-y-1">
              <p className="text-base font-semibold text-foreground">
                {tour.tableaux.length}
              </p>
              <p className="text-sm text-muted-foreground">
                {tour.tableaux.length > 0
                  ? "Cr\u00e9neaux publi\u00e9s"
                  : "Aucun tableau d\u00e9fini"}
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {tour.rulesUrl ? (
            <Button asChild variant="secondary" size="sm">
              <Link href={tour.rulesUrl} target="_blank" rel="noreferrer">
                R&egrave;glement du tour
              </Link>
            </Button>
          ) : null}
        </div>
      </header>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Tableaux</h2>
        </div>
        {tour.tableaux.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Aucun tableau d&eacute;fini pour ce tour.
          </p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {orderedTableaux.map((tableau) => (
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
                        Cat&eacute;gorie par points
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
