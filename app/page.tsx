import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const highlights = [
  {
    title: "Saison en cours",
    description: "Suivez les dates clés et les classements mis à jour.",
    href: "/agenda",
    cta: "Voir l'agenda",
  },
  {
    title: "Classements officiels",
    description: "Accédez aux PDF par saison, tour et tableau.",
    href: "/classement",
    cta: "Consulter les classements",
  },
  {
    title: "Inscription rapide",
    description: "Choisissez votre tour et votre tableau en quelques clics.",
    href: "/inscription",
    cta: "S'inscrire",
  },
];

const steps = [
  "Choisissez un tour depuis l'agenda.",
  "Sélectionnez le tableau adapté à votre niveau.",
  "Confirmez votre inscription et suivez vos résultats.",
];

const stats = [
  { label: "Tours officiels", value: "8" },
  { label: "Tableaux par niveau", value: "12+" },
  { label: "Clubs partenaires", value: "20+" },
];

const testimonials = [
  {
    quote:
      "Un circuit bien organisé qui permet de jouer régulièrement et de suivre sa progression.",
    name: "J. Martin",
    role: "Joueur licencié",
  },
  {
    quote:
      "Des tableaux cohérents et une super ambiance sur chaque tour. On y revient chaque saison.",
    name: "C. Morel",
    role: "Responsable club",
  },
  {
    quote:
      "Tout est centralisé : agenda, inscriptions et classements. C'est clair et efficace.",
    name: "L. Petit",
    role: "Capitaine d'équipe",
  },
];

export default async function Home() {
  type SeasonItem = {
    year: number;
    tours: { name: string; date: Date; venue: string | null }[];
  };

  const season: SeasonItem | null = await prisma.season.findFirst({
    where: { isActive: true },
    include: {
      tours: {
        select: { name: true, date: true, venue: true },
        orderBy: { date: "asc" },
      },
    },
    orderBy: { year: "desc" },
  });

  const partnerClubs = await prisma.club.findMany({
    select: { name: true },
    orderBy: { name: "asc" },
  });
  const clubNames = partnerClubs.map((club) => club.name);

  const now = new Date();
  const nextTour = season?.tours.find((tour) => tour.date >= now) ?? null;
  const formatter = new Intl.DateTimeFormat("fr-FR", { dateStyle: "long" });

  const scrollerClubs =
    clubNames.length > 0 ? clubNames : ["Clubs à venir"];

  return (
    <div className="page">
      <section className="relative overflow-hidden rounded-3xl border border-border/60 bg-background p-8 sm:p-10">
        <div className="grid items-center gap-10 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="space-y-6">
            <div className="badge-pill w-fit">Trophée François Grieder</div>
            <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
              Le challenge régional de tennis de table
            </h1>
            <p className="page-subtitle text-base">
              Le Trophée François Grieder réunit les clubs de la région autour
              d'un challenge convivial, rythmé par des rencontres sportives et
              une ambiance associative.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button asChild size="lg">
                <Link href="/agenda">Voir les tours</Link>
              </Button>
              <Button asChild size="lg" variant="secondary">
                <Link href="/classement">Classements</Link>
              </Button>
            </div>
            <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
              <span className="badge-pill">Calendrier clair</span>
              <span className="badge-pill">Tableaux homogènes</span>
              <span className="badge-pill">Classement par saison</span>
            </div>
          </div>

          <Card className="surface border-border/60 bg-background/90">
            <CardHeader>
              <CardTitle>En un coup d'œil</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-muted-foreground">
              <div className="surface p-4">
                <p className="text-xs font-medium text-muted-foreground">
                  Prochain tour
                </p>
                {nextTour ? (
                  <>
                    <p className="text-base font-semibold text-foreground">
                      {nextTour.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatter.format(nextTour.date)}
                      {nextTour.venue ? ` • ${nextTour.venue}` : ""}
                    </p>
                  </>
                ) : (
                  <p className="text-base font-semibold text-foreground">
                    Consultez l'agenda pour la prochaine date
                  </p>
                )}
              </div>
              <div className="surface p-4">
                <p className="text-xs font-medium text-muted-foreground">
                  Classement en direct
                </p>
                <p className="text-base font-semibold text-foreground">
                  Classements disponibles par saison
                </p>
              </div>
              <Button asChild size="sm" variant="secondary">
                <Link href="/trophee">Comprendre le trophée</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>

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

      <section className="rounded-3xl border border-border/60 bg-muted/30 p-6 sm:p-8">
        <div className="page-header">
          <h2 className="page-title text-2xl">Clubs partenaires</h2>
          <p className="page-subtitle">
            Une communauté engagée qui fait vivre le trophée.
          </p>
        </div>
        <div className="mt-6 overflow-hidden">
          <div className="flex gap-4 animate-[scroll_18s_linear_infinite]">
            {scrollerClubs.concat(scrollerClubs).map((club, index) => (
              <div
                key={`${club}-${index}`}
                className="surface min-w-[180px] px-4 py-3 text-sm font-medium"
              >
                {club}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="rounded-3xl border border-border/60 bg-background p-6 sm:p-8">
        <div className="page-header">
          <h2 className="page-title text-2xl">Ils en parlent</h2>
          <p className="page-subtitle">
            Quelques retours de clubs et joueurs impliqués.
          </p>
        </div>
        <div className="mt-6 grid gap-4 lg:grid-cols-3">
          {testimonials.map((item) => (
            <Card key={item.name} className="surface border-border/60">
              <CardContent className="space-y-3 pt-6 text-sm text-muted-foreground">
                <p className="text-foreground">"{item.quote}"</p>
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    {item.name}
                  </p>
                  <p className="text-xs text-muted-foreground">{item.role}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="rounded-3xl border border-border/60 bg-muted/30 p-6 sm:p-8">
        <div className="page-header">
          <h2 className="page-title text-2xl">Suivre la saison</h2>
          <p className="page-subtitle">
            Accédez rapidement aux informations essentielles du trophée.
          </p>
        </div>
        <div className="mt-6 grid gap-6 lg:grid-cols-3">
          {highlights.map((item) => (
            <Card key={item.title} className="surface border-border/60">
              <CardHeader>
                <CardTitle>{item.title}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm text-muted-foreground">
                <p>{item.description}</p>
                <Button asChild size="sm" variant="secondary">
                  <Link href={item.href}>{item.cta}</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <Card className="surface border-border/60">
          <CardHeader>
            <CardTitle>Inscription en 3 étapes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            {steps.map((step) => (
              <div key={step} className="flex items-start gap-3">
                <span className="mt-1 h-2 w-2 rounded-full bg-primary" />
                <span>{step}</span>
              </div>
            ))}
            <Button asChild size="sm" className="mt-2">
              <Link href="/inscription">S'inscrire</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="surface border-border/60">
          <CardHeader>
            <CardTitle>Ressources clés</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <p>
              Consultez le règlement, les tableaux et les informations pratiques
              pour préparer votre prochain tour.
            </p>
            <Button asChild size="sm" variant="secondary">
              <Link href="/classement">Voir les classements</Link>
            </Button>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
