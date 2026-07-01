import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const dateFormatter = new Intl.DateTimeFormat("fr-FR", {
  day: "2-digit",
  month: "long",
  year: "numeric",
});

function formatPoints(minPoints: number | null, maxPoints: number | null) {
  if (minPoints != null && maxPoints != null) {
    return `${minPoints} - ${maxPoints} pts`;
  }

  if (minPoints != null) {
    return `A partir de ${minPoints} pts`;
  }

  if (maxPoints != null) {
    return `Jusqu'a ${maxPoints} pts`;
  }

  return "Plage libre";
}

function getStatusLabel(status: "DRAFT" | "OPEN" | "CLOSED" | "DONE") {
  if (status === "OPEN") return "Ouvert";
  if (status === "CLOSED") return "Ferme";
  if (status === "DONE") return "Termine";
  return "Brouillon";
}

async function getDisplaySeason() {
  const include = {
    tours: {
      include: {
        club: { select: { name: true, city: true } },
        _count: { select: { tableaux: true, registrations: true } },
      },
      orderBy: { date: "asc" as const },
    },
    tableauTemplates: {
      select: {
        id: true,
        name: true,
        minPoints: true,
        maxPoints: true,
        startTime: true,
      },
      orderBy: { name: "asc" as const },
    },
  };

  const activeSeason = await prisma.season.findFirst({
    where: { isActive: true },
    include,
    orderBy: { year: "desc" },
  });

  if (activeSeason) {
    return activeSeason;
  }

  return prisma.season.findFirst({
    include,
    orderBy: { year: "desc" },
  });
}

export default async function TropheePage() {
  const season = await getDisplaySeason();
  const tours = season?.tours ?? [];
  const templates = season?.tableauTemplates ?? [];
  const hostClubs = Array.from(
    new Map(
      tours
        .map((tour) => tour.club)
        .filter((club): club is NonNullable<typeof club> => Boolean(club))
        .map((club) => [club.name, club]),
    ).values(),
  ).sort((a, b) => a.name.localeCompare(b.name, "fr"));
  const nextTour =
    tours.find((tour) => tour.date >= new Date() && tour.status !== "DONE") ??
    null;
  const totalRegistrations = tours.reduce(
    (total, tour) => total + tour._count.registrations,
    0,
  );

  const stats = [
    {
      label: "Saison affichee",
      value: season?.name ?? "Aucune",
      detail: season?.isActive ? "Saison active" : "Derniere saison configuree",
    },
    {
      label: "Tours planifies",
      value: tours.length.toString(),
      detail: nextTour
        ? `Prochain: ${nextTour.name}, le ${dateFormatter.format(nextTour.date)}`
        : "Calendrier a completer",
    },
    {
      label: "Tableaux types",
      value: templates.length.toString(),
      detail:
        templates.length > 0
          ? "Plages de points configurees"
          : "Aucun tableau type",
    },
    {
      label: "Clubs organisateurs",
      value: hostClubs.length.toString(),
      detail:
        totalRegistrations > 0
          ? `${totalRegistrations} inscription(s) enregistree(s)`
          : "Inscriptions non ouvertes",
    },
  ];

  return (
    <section className="page">
      <header className="relative overflow-hidden rounded-3xl border border-border/60 bg-background p-8 sm:p-10">
        <div className="max-w-4xl space-y-5">
          <p className="badge-pill w-fit">Le Trophee</p>
          <h1 className="page-title sm:text-4xl">
            Trophee Francois Grieder
          </h1>
          <p className="page-subtitle max-w-3xl text-base text-foreground/80">
            Le Trophee FG rassemble les tours de la saison, les clubs
            organisateurs, les tableaux par plages de points et les documents de
            classement publies sur le site.
          </p>
          <p className="page-subtitle max-w-3xl text-base text-foreground/80">
            Cette page reprend les informations configurees dans
            l&apos;administration. Pour les resultats et classements officiels,
            consultez la page Classement.
          </p>
          <div className="flex flex-wrap gap-3">
            <Button asChild>
              <Link href="/agenda">Voir l&apos;agenda</Link>
            </Button>
            <Button asChild variant="secondary">
              <Link href="/classement">Classements</Link>
            </Button>
          </div>
        </div>
      </header>

      <section className="grid gap-4 rounded-3xl border border-border/60 bg-background p-6 sm:grid-cols-2 xl:grid-cols-4 sm:p-8">
        {stats.map((stat) => (
          <div key={stat.label} className="stat-panel px-5 py-4">
            <p className="stat-label">{stat.label}</p>
            <p className="stat-value mt-3 text-3xl">{stat.value}</p>
            <p className="mt-2 text-xs text-muted-foreground">{stat.detail}</p>
          </div>
        ))}
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <Card className="surface border-border/60">
          <CardHeader>
            <CardTitle>Fonctionnement actuel</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-muted-foreground">
            <p>
              Une saison regroupe plusieurs tours. Chaque tour est organise par
              un club et contient des tableaux crees a partir des tableaux types
              de la saison.
            </p>
            <ul className="list-disc space-y-2 pl-5">
              <li>Les tours, lieux et clubs sont visibles dans l&apos;agenda.</li>
              <li>
                Les tableaux types definissent les plages de points utilisees
                pour les inscriptions.
              </li>
              <li>
                Les documents de classement sont centralises dans la page
                Classement.
              </li>
            </ul>
          </CardContent>
        </Card>

        <Card className="surface border-border/60 bg-muted/30">
          <CardHeader>
            <CardTitle>Tableaux de la saison</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            {templates.length === 0 ? (
              <p>Aucun tableau type n&apos;est configure pour cette saison.</p>
            ) : (
              <div className="grid gap-2 sm:grid-cols-2">
                {templates.map((template) => (
                  <div
                    key={template.id}
                    className="rounded-xl border border-border/60 bg-background/70 px-3 py-2"
                  >
                    <p className="font-semibold text-foreground">
                      Tableau {template.name}
                    </p>
                    <p className="text-xs">
                      {formatPoints(template.minPoints, template.maxPoints)}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </section>

      <section className="rounded-3xl border border-border/60 bg-muted/30 p-6 sm:p-8">
        <div className="page-header">
          <h2 className="page-title text-2xl">Calendrier de la saison</h2>
          <p className="page-subtitle">
            Les tours actuellement renseignes pour {season?.name ?? "la saison"}.
          </p>
        </div>
        {tours.length === 0 ? (
          <div className="mt-6 rounded-2xl border border-dashed border-border/70 bg-background/70 p-6 text-sm text-muted-foreground">
            Aucun tour n&apos;est encore configure.
          </div>
        ) : (
          <div className="mt-6 grid gap-4 lg:grid-cols-3">
            {tours.map((tour) => (
              <div key={tour.id} className="surface px-5 py-4">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="badge-pill w-fit">{tour.name}</span>
                  <span className="badge-pill w-fit">
                    {getStatusLabel(tour.status)}
                  </span>
                </div>
                <p className="section-title mt-3">
                  {dateFormatter.format(tour.date)}
                </p>
                <p className="mt-2 text-sm text-muted-foreground">
                  {tour.club?.name ?? "Club a confirmer"}
                </p>
                <p className="text-xs text-muted-foreground">
                  {[tour.venue, tour.city].filter(Boolean).join(" - ") ||
                    "Lieu a confirmer"}
                </p>
                <p className="mt-3 text-xs text-muted-foreground">
                  {tour._count.tableaux} tableau(x) configure(s)
                </p>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <Card className="surface border-border/60">
          <CardHeader>
            <CardTitle>Clubs organisateurs</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            {hostClubs.length === 0 ? (
              <p>Aucun club organisateur n&apos;est encore associe aux tours.</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {hostClubs.map((club) => (
                  <span key={club.name} className="badge-pill">
                    {club.name}
                    {club.city ? ` - ${club.city}` : ""}
                  </span>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="surface border-border/60 bg-muted/30">
          <CardHeader>
            <CardTitle>Documents officiels</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-muted-foreground">
            <p>
              Les classements et documents sportifs sont publies separement,
              afin de garder cette page centree sur l&apos;organisation de la
              saison.
            </p>
            <div className="flex flex-wrap gap-2">
              <Button asChild size="sm" variant="secondary">
                <Link href="/classement">Voir les classements</Link>
              </Button>
              <Button asChild size="sm" variant="secondary">
                <Link href="/agenda">Agenda & salles</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>
    </section>
  );
}
