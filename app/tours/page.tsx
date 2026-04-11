import Link from "next/link";

import { EmptyState } from "@/components/empty-state";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function ToursPage() {
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
          Retrouvez les tours du trophée et les informations associées.
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
              À venir
            </span>
            <span className="badge-pill">Passé</span>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {tours.map((tour) => {
              const isPast = tour.date < now;
              const isToday = tour.date.toDateString() === now.toDateString();
              const isNext = nextTour ? tour.id === nextTour.id : false;

              return (
            <Card
              key={tour.id}
              className={`h-full transition-all hover:-translate-y-0.5 hover:shadow-lg ${
                isPast ? "opacity-70 grayscale" : ""
              }`}
            >
              <CardHeader>
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
                  {isToday ? (
                    <span className="badge-pill bg-primary/10 text-primary">
                      Aujourd&apos;hui
                    </span>
                  ) : isPast ? (
                    <span className="badge-pill">Passé</span>
                  ) : (
                    <span className="badge-pill bg-emerald-500/10 text-emerald-600">
                      À venir
                    </span>
                  )}
                  {isNext ? (
                    <span className="badge-pill bg-primary/10 text-primary">
                      Prochain
                    </span>
                  ) : null}
                </div>
                <CardTitle className="mt-2">{tour.name}</CardTitle>
              </CardHeader>
              <CardContent className="flex-1 space-y-1 text-sm text-muted-foreground">
                <p>{formatter.format(tour.date)}</p>
                <p>
                  {tour.venue ?? "Salle à confirmer"}
                  {tour.city ? ` — ${tour.city}` : ""}
                </p>
                {tour.club?.name ? <p>Club : {tour.club.name}</p> : null}
              </CardContent>
              <CardFooter className="mt-auto flex items-center justify-start gap-3">
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
