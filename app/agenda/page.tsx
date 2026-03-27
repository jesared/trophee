import Link from "next/link";

import { EmptyState } from "@/components/empty-state";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function AgendaPage() {
  type TourItem = {
    id: string;
    name: string;
    date: Date;
    venue: string | null;
    city: string | null;
    address: string | null;
    club: { name: string } | null;
  };
  type SeasonItem = {
    year: number;
    tours: TourItem[];
  };

  const season: SeasonItem | null = await prisma.season.findFirst({
    where: { isActive: true },
    include: { tours: { include: { club: true } } },
    orderBy: { year: "desc" },
  });

  const now = new Date();

  const sorted = (season?.tours ?? []).sort(
    (a: TourItem, b: TourItem) => a.date.getTime() - b.date.getTime(),
  );
  const upcomingTours = sorted.filter((tour: TourItem) => tour.date >= now);
  const pastTours = sorted.filter((tour: TourItem) => tour.date < now);
  const tours = [...upcomingTours, ...pastTours];

  const nextTour = tours.find((tour: TourItem) => tour.date >= now);

  const salles = Array.from(
    new Map(
      tours
        .filter((tour: TourItem) => tour.venue || tour.address || tour.city)
        .map((tour: TourItem) => [
          tour.venue ?? tour.address ?? tour.city ?? tour.id,
          {
            name: tour.venue ?? "Salle à confirmer",
            address: tour.address ?? tour.city ?? "",
            city: tour.city ?? "",
            tours: tours.filter((item) => item.venue === tour.venue).length,
          },
        ]),
    ).values(),
  );

  const formatter = new Intl.DateTimeFormat("fr-FR", {
    dateStyle: "long",
  });

  const stats = [
    { label: "Tours à venir", value: upcomingTours.length.toString() },
    { label: "Tours passés", value: pastTours.length.toString() },
    { label: "Salles hôtes", value: salles.length.toString() },
  ];

  return (
    <section className="page">
      <header className="relative overflow-hidden rounded-3xl border border-border/60 bg-background p-8 sm:p-10">
        <div className="space-y-4">
          <div className="badge-pill w-fit gap-2">
            Agenda & salles
            {season ? (
              <span className="badge-pill bg-primary/10 text-[11px] font-semibold text-primary">
                Saison {season.year}
              </span>
            ) : null}
          </div>
          <h1 className="page-title sm:text-4xl">Agenda des tours et salles</h1>
          <p className="page-subtitle max-w-2xl">
            Retrouvez les prochains tours du trophée, les clubs organisateurs et
            les salles d&apos;accueil.
          </p>
          <div className="flex flex-wrap gap-3">
            <Button asChild>
              <Link href="/inscription">S&apos;inscrire</Link>
            </Button>
            <Button asChild variant="secondary">
              <Link href="/classement">Classements</Link>
            </Button>
          </div>
        </div>
      </header>

      {!season ? (
        <EmptyState
          title="Aucune saison active"
          description="Activez une saison pour afficher l'agenda."
          action={
            <Button asChild size="sm" variant="secondary">
              <Link href="/trophee">Découvrir le trophée</Link>
            </Button>
          }
        />
      ) : (
        <>
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

          <section className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
            <Card className="surface border-border/60">
              <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div className="space-y-1">
                  <CardTitle>Prochains tours</CardTitle>
                  <p className="text-xs text-muted-foreground">
                    {tours.length} tour(s) — triés par date
                  </p>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span className="badge-pill bg-emerald-500/10 text-emerald-600">
                    À venir
                  </span>
                  <span className="badge-pill">Passé</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {tours.length === 0 ? (
                  <EmptyState
                    title="Aucun tour pour cette saison"
                    description="Ajoutez un tour pour alimenter l'agenda."
                  />
                ) : (
                  tours.map((tour) => {
                    const isPast = tour.date < now;
                    const isNext = nextTour ? tour.id === nextTour.id : false;
                    const isToday =
                      tour.date.toDateString() === now.toDateString();
                    return (
                      <div
                        key={tour.id}
                        className={`surface flex flex-col gap-4 px-4 py-4 transition hover:border-primary/40 ${
                          isPast ? "opacity-70 grayscale" : ""
                        }`}
                      >
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                          <div className="space-y-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <p className="text-sm font-semibold text-foreground">
                                {tour.name}
                              </p>
                              {isToday ? (
                                <span className="badge-pill bg-primary/10 text-[11px] font-semibold text-primary">
                                  Aujourd&apos;hui
                                </span>
                              ) : isPast ? (
                                <span className="badge-pill text-[11px] font-semibold">
                                  Passé
                                </span>
                              ) : (
                                <span className="badge-pill bg-emerald-500/10 text-[11px] font-semibold text-emerald-600">
                                  À venir
                                </span>
                              )}
                              {isNext ? (
                                <span className="badge-pill bg-primary/10 text-[11px] font-semibold text-primary">
                                  Prochain
                                </span>
                              ) : null}
                            </div>
                            <p className="text-xs text-muted-foreground">
                              {formatter.format(tour.date)}
                            </p>
                          </div>
                          <div className="flex flex-wrap items-center gap-2">
                            <Button asChild variant="outline" size="sm">
                              <Link href={`/tours/${tour.id}`}>Voir</Link>
                            </Button>
                            {!isPast ? (
                              <Button asChild size="sm">
                                <Link href="/inscription">S&apos;inscrire</Link>
                              </Button>
                            ) : null}
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          {tour.club ? (
                            <span className="badge-pill">
                              Club : {tour.club.name}
                            </span>
                          ) : null}
                          {tour.venue ? (
                            <span className="badge-pill">{tour.venue}</span>
                          ) : null}
                          {tour.city ? (
                            <span className="badge-pill">{tour.city}</span>
                          ) : null}
                        </div>

                        {tour.address ? (
                          <p className="text-xs text-muted-foreground">
                            {tour.address}
                          </p>
                        ) : null}
                      </div>
                    );
                  })
                )}
              </CardContent>
            </Card>

            <Card className="surface border-border/60 bg-muted/30">
              <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div className="space-y-1">
                  <CardTitle>Salles hôtes</CardTitle>
                  <p className="text-xs text-muted-foreground">
                    {salles.length} salle(s) — lieux de la saison
                  </p>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {salles.length === 0 ? (
                  <EmptyState
                    title="Aucun lieu pour cette saison"
                    description="Ajoutez un tour avec une salle pour l'afficher ici."
                  />
                ) : (
                  salles.map((salle) => (
                    <div key={salle.name} className="surface px-4 py-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-1">
                          <p className="text-sm font-medium">{salle.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {salle.address || "Adresse à confirmer"}
                          </p>
                          {salle.city ? (
                            <p className="text-xs text-muted-foreground">
                              {salle.city}
                            </p>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </section>
        </>
      )}
    </section>
  );
}
