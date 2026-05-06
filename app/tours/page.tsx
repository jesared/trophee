import Link from "next/link";
import { PencilLine } from "lucide-react";

import { EmptyState } from "@/components/empty-state";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getIsCurrentVisitorAdmin } from "@/lib/current-visitor-admin";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function ToursPage() {
  const isAdmin = await getIsCurrentVisitorAdmin();
  const season = await prisma.season.findFirst({
    where: { isActive: true },
    include: {
      tours: {
        include: { club: true },
        orderBy: { date: "asc" },
      },
    },
    orderBy: { year: "desc" },
  });

  const formatter = new Intl.DateTimeFormat("fr-FR", {
    dateStyle: "long",
  });
  const now = new Date();

  const sortedTours = [...(season?.tours ?? [])].sort(
    (a, b) => a.date.getTime() - b.date.getTime(),
  );
  const upcomingTours = sortedTours.filter((tour) => tour.date >= now);
  const pastTours = sortedTours.filter((tour) => tour.date < now);
  const tours = [...upcomingTours, ...pastTours];
  const nextTour = tours.find((tour) => tour.date >= now) ?? null;

  return (
    <section className="space-y-6">
      <div className="space-y-2">
        <p className="text-sm font-medium text-muted-foreground">
          {season ? `Saison ${season.year}` : "Saison"}
        </p>
        <h1 className="text-3xl font-semibold tracking-tight">Les tours</h1>
        <p className="text-sm text-muted-foreground">
          Retrouvez les tours du trophee et les informations associees.
        </p>
      </div>

      {!season || tours.length === 0 ? (
        <EmptyState
          title="Aucun tour disponible"
          description="Activez une saison et ajoutez des tours."
        />
      ) : (
        <>
          <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            <span className="badge-pill bg-emerald-500/10 text-emerald-600">
              A venir
            </span>
            <span className="badge-pill">Passe</span>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {tours.map((tour) => {
              const isPast = tour.date < now;
              const isToday = tour.date.toDateString() === now.toDateString();
              const isNext = nextTour ? tour.id === nextTour.id : false;

              return (
                <Card
                  key={tour.id}
                  className={`group h-full overflow-hidden border-border/70 bg-card/95 transition-all hover:-translate-y-0.5 hover:shadow-lg ${
                    tour.coverUrl ? "pt-0" : ""
                  } ${
                    isPast ? "opacity-70 grayscale" : ""
                  }`}
                >
                  <CardHeader className="space-y-0 p-0">
                    {tour.coverUrl ? (
                      <div className="overflow-hidden rounded-t-xl">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={tour.coverUrl}
                          alt={`Couverture ${tour.name}`}
                          className="aspect-[16/10] w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                        />
                      </div>
                    ) : null}

                    <div className="space-y-4 px-5 py-5">
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
                        {isToday ? (
                          <span className="badge-pill bg-primary/10 text-primary">
                            Aujourd&apos;hui
                          </span>
                        ) : isPast ? (
                          <span className="badge-pill">Passe</span>
                        ) : (
                          <span className="badge-pill bg-emerald-500/10 text-emerald-600">
                            A venir
                          </span>
                        )}
                        {isNext ? (
                          <span className="badge-pill bg-primary/10 text-primary">
                            Prochain
                          </span>
                        ) : null}
                        {isAdmin ? (
                          <Button asChild size="icon-xs" variant="secondary" className="ml-auto">
                            <Link
                              href={`/admin/tours/${tour.id}?edit=1`}
                              aria-label={`Modifier ${tour.name}`}
                            >
                              <PencilLine className="h-3.5 w-3.5" />
                            </Link>
                          </Button>
                        ) : null}
                      </div>

                      <CardTitle className="leading-tight">{tour.name}</CardTitle>
                    </div>
                  </CardHeader>

                  <CardContent className="flex-1 space-y-2 px-5 pb-0 text-sm text-muted-foreground">
                    <p className="font-medium text-foreground/85">
                      {formatter.format(tour.date)}
                    </p>
                    <p className="leading-relaxed">
                      {tour.venue ?? "Salle a confirmer"}
                      {tour.city ? ` - ${tour.city}` : ""}
                    </p>
                    {tour.club?.name ? <p>Club : {tour.club.name}</p> : null}
                  </CardContent>

                  <CardFooter className="mt-auto px-5 py-5">
                    <Button asChild variant="outline" size="sm">
                      <Link href={`/tours/${tour.id}`}>Infos pratiques</Link>
                    </Button>
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        </>
      )}
    </section>
  );
}
