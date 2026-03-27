import Link from "next/link";
import { notFound } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function TourDetailPage({ params }: PageProps) {
  const { id } = await params;

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
                  ? "Fermé"
                  : tour.status === "DONE"
                    ? "Terminé"
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
          {tour.description ? (
            <p className="max-w-2xl text-base text-foreground/80">
              {tour.description}
            </p>
          ) : null}
        </div>

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
                Règlement du tour
              </Link>
            </Button>
          ) : null}
          {tour.status === "OPEN" ? (
            <Button asChild size="sm">
              <Link href="/inscription">S'inscrire</Link>
            </Button>
          ) : (
            <Button size="sm" variant="outline" disabled>
              Inscriptions fermées
            </Button>
          )}
        </div>
      </header>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Tableaux</h2>
        </div>
        {tour.tableaux.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Aucun tableau défini pour ce tour.
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
                        Catégorie par points
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
