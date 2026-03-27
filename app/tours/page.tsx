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

      {!season || season.tours.length === 0 ? (
        <EmptyState
          title="Aucun tour disponible"
          description="Activez une saison et ajoutez des tours."
        />
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {season.tours.map((tour) => (
            <Card
              key={tour.id}
              className="transition-all hover:-translate-y-0.5 hover:shadow-lg"
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
                </div>
                <CardTitle className="mt-2">{tour.name}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-1 text-sm text-muted-foreground">
                <p>{formatter.format(tour.date)}</p>
                <p>
                  {tour.venue ?? "Salle à confirmer"}
                  {tour.city ? ` — ${tour.city}` : ""}
                </p>
                {tour.club?.name ? <p>Club : {tour.club.name}</p> : null}
              </CardContent>
              <CardFooter className="flex items-center justify-between">
                <Button asChild variant="outline" size="sm">
                  <Link href={`/tours/${tour.id}`}>Voir le détail</Link>
                </Button>
                {tour.status === "OPEN" ? (
                  <Button asChild size="sm">
                    <Link href="/inscription">S&apos;inscrire</Link>
                  </Button>
                ) : null}
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </section>
  );
}
