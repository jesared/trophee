import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { prisma } from "@/lib/prisma";

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
            name: tour.venue ?? "Salle a confirmer",
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

  return (
    <section className="page">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-3">
          <div className="badge-pill gap-2">
            Agenda &amp; salles
            {season ? (
              <span className="badge-pill bg-primary/10 text-[11px] font-semibold text-primary">
                Saison {season.year}
              </span>
            ) : null}
          </div>
          <h1 className="page-title sm:text-4xl">
            Agenda des tours et salles
          </h1>
          <p className="page-subtitle">
            Retrouvez les prochains tours du troph&eacute;e, les clubs organisateurs
            et les salles d&rsquo;accueil.
          </p>
        </div>
      </header>

      {!season ? (
        <Card className="bg-card">
          <CardHeader>
            <CardTitle>Aucune saison active</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Activez une saison pour afficher l&rsquo;agenda.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
          <Card className="bg-card">
            <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <CardTitle>Prochains tours</CardTitle>
              <span className="text-xs text-muted-foreground">
                {tours.length} tour(s)
              </span>
            </CardHeader>
            <CardContent className="space-y-4">
              {tours.length === 0 ? (
                <div className="text-sm text-muted-foreground">
                  Aucun tour pour cette saison.
                </div>
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
                              Passe
                            </span>
                          ) : (
                            <span className="badge-pill bg-emerald-500/10 text-[11px] font-semibold text-emerald-600">
                              A venir
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
                        <Button variant="outline" size="sm">
                          Voir
                        </Button>
                        {!isPast ? (
                          <Button size="sm">S&apos;inscrire</Button>
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
                        <span className="badge-pill">
                          {tour.venue}
                        </span>
                      ) : null}
                      {tour.city ? (
                        <span className="badge-pill">
                          {tour.city}
                        </span>
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

          <Card className="bg-card">
            <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <CardTitle>Salles h&ocirc;tes</CardTitle>
              <span className="text-xs text-muted-foreground">
                {salles.length} salle(s)
              </span>
            </CardHeader>
            <CardContent className="space-y-3">
              {salles.length === 0 ? (
                <div className="text-sm text-muted-foreground">
                  Aucun lieu pour cette saison.
                </div>
              ) : (
                salles.map((salle) => (
                  <div key={salle.name} className="surface px-4 py-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1">
                        <p className="text-sm font-medium">{salle.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {salle.address || "Adresse a confirmer"}
                        </p>
                        {salle.city ? (
                          <p className="text-xs text-muted-foreground">
                            {salle.city}
                          </p>
                        ) : null}
                      </div>
                      <span className="badge-pill bg-primary/10 text-[11px] font-semibold text-primary">
                        {salle.tours} tour(s)
                      </span>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </section>
  );
}
