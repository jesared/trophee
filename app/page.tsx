import {
  ArrowRight,
  CalendarDays,
  MapPin,
  Quote,
  ShieldCheck,
  Trophy,
  Users,
} from "lucide-react";
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
    title: "Tours & infos pratiques",
    description: "Consultez les détails des tours, des salles et du format.",
    href: "/tours",
    cta: "Voir les tours",
  },
];

function getClubMark(name: string) {
  const mark = name
    .split(" ")
    .filter(Boolean)
    .slice(0, 3)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");

  return mark || "TT";
}

export default async function Home() {
  type SeasonItem = {
    name: string;
    year: number;
    tours: {
      name: string;
      date: Date;
      venue: string | null;
      _count: { tableaux: number };
    }[];
  };

  const season: SeasonItem | null = await prisma.season.findFirst({
    where: { isActive: true },
    include: {
      tours: {
        select: {
          name: true,
          date: true,
          venue: true,
          _count: { select: { tableaux: true } },
        },
        orderBy: { date: "asc" },
      },
    },
    orderBy: { year: "desc" },
  });

  const partnerClubs = await prisma.club.findMany({
    select: { name: true, logoUrl: true, city: true },
    orderBy: { name: "asc" },
  });

  const testimonials = await prisma.testimonial.findMany({
    where: { isApproved: true },
    orderBy: { createdAt: "desc" },
    take: 6,
  });

  const clubNames = partnerClubs.map((club) => club.name);
  const now = new Date();
  const nextTour = season?.tours.find((tour) => tour.date >= now) ?? null;
  const formatter = new Intl.DateTimeFormat("fr-FR", { dateStyle: "long" });
  const totalTableaux =
    season?.tours.reduce((sum, tour) => sum + tour._count.tableaux, 0) ?? 0;
  const publicStats = [
    {
      label: "Tours publiés",
      value: season ? season.tours.length.toString() : "0",
    },
    {
      label: "Tableaux annoncés",
      value: totalTableaux > 0 ? totalTableaux.toString() : "À venir",
    },
    {
      label: "Clubs partenaires",
      value: partnerClubs.length.toString(),
    },
  ];

  const scrollerClubs =
    clubNames.length > 0
      ? partnerClubs
      : [{ name: "Clubs à venir", logoUrl: null, city: null }];
  const seasonLabel = season
    ? season.name
    : "Saison à venir";
  const nextTourDay = nextTour
    ? new Intl.DateTimeFormat("fr-FR", { day: "2-digit" }).format(nextTour.date)
    : "--";
  const nextTourMonth = nextTour
    ? new Intl.DateTimeFormat("fr-FR", { month: "short" })
        .format(nextTour.date)
        .replace(".", "")
        .toUpperCase()
    : "DATE";
  const featuredTestimonials = testimonials.slice(0, 3);
  const heroSignals = [
    {
      label: "Saison active",
      value: seasonLabel,
      icon: Trophy,
    },
    {
      label: "Clubs engagés",
      value: partnerClubs.length > 0 ? partnerClubs.length.toString() : "00",
      icon: Users,
    },
    {
      label: "Tableaux publiés",
      value: totalTableaux > 0 ? totalTableaux.toString() : "À venir",
      icon: ShieldCheck,
    },
  ];

  return (
    <div className="page">
      <section className="relative overflow-hidden px-6 py-8 sm:px-8 sm:py-10">
        <div className="relative grid gap-8 xl:grid-cols-[1.15fr_0.85fr]">
          <div className="space-y-7">
            <div className="badge-pill w-fit">Trophée François Grieder</div>
            <div className="space-y-4">
              <p className="kicker text-primary">Trophée François Grieder</p>
              <h1 className="font-heading text-4xl leading-none font-bold tracking-[-0.06em] text-balance text-foreground sm:text-6xl xl:max-w-4xl">
                Le challenge régional de tennis de table
              </h1>
              <p className="max-w-2xl text-base leading-8 text-muted-foreground sm:text-lg">
                Le Trophée François Grieder réunit les clubs de la région autour
                d&apos;un challenge convivial, rythmé par des rencontres sportives
                et une ambiance associative.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Button asChild size="lg" className="gap-2">
                <Link href="/agenda">
                  Voir les tours
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="secondary" className="gap-2">
                <Link href="/classement">
                  Classements
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              {heroSignals.map((item) => {
                const Icon = item.icon;

                return (
                  <div
                    key={item.label}
                    className="stat-panel rounded-2xl bg-background/90 px-4 py-4 backdrop-blur"
                  >
                    <div className="flex items-center gap-2 text-primary">
                      <Icon className="h-4 w-4" />
                      <p className="stat-label text-primary/80">{item.label}</p>
                    </div>
                    <p className="mt-3 font-heading text-2xl font-bold tracking-[-0.05em] text-foreground">
                      {item.value}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="relative overflow-hidden rounded-[1.75rem] p-6 text-foreground dark:bg-slate-900 dark:text-white">
            <div className="relative space-y-6">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="kicker text-primary/75 dark:text-white/60">Panneau principal</p>
                  <h2 className="font-heading text-2xl font-bold tracking-[-0.04em]">
                    En un coup d&apos;oeil
                  </h2>
                </div>
                <div className="rounded-full border border-border/80 bg-background/80 px-3 py-1 text-[0.72rem] font-semibold uppercase tracking-[0.24em] text-muted-foreground dark:border-white/15 dark:bg-white/10 dark:text-white/70">
                  {seasonLabel}
                </div>
              </div>

              <div className="grid gap-4 rounded-[1.5rem] border border-border/80 bg-background/80 p-4 sm:grid-cols-[96px_1fr] dark:border-white/10 dark:bg-white/5">
                <div className="flex flex-col items-center justify-center rounded-[1.25rem] bg-primary px-4 py-5 text-primary-foreground">
                  <span className="font-heading text-4xl font-bold leading-none tracking-[-0.06em]">
                    {nextTourDay}
                  </span>
                  <span className="mt-2 text-[0.72rem] font-semibold uppercase tracking-[0.24em]">
                    {nextTourMonth}
                  </span>
                </div>

                <div className="space-y-3">
                  <div>
                    <p className="text-[0.72rem] font-semibold uppercase tracking-[0.24em] text-muted-foreground dark:text-white/60">
                      Prochain tour
                    </p>
                    <p className="mt-2 font-heading text-2xl font-bold leading-tight tracking-[-0.04em]">
                      {nextTour ? nextTour.name : "Annonce en préparation"}
                    </p>
                  </div>
                  <div className="space-y-2 text-sm text-foreground/75 dark:text-white/75">
                    <div className="flex items-center gap-2">
                      <CalendarDays className="h-4 w-4 text-primary" />
                      <span>
                        {nextTour
                          ? formatter.format(nextTour.date)
                          : "Consultez l'agenda pour la prochaine date"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-primary" />
                      <span>{nextTour?.venue ?? "Lieu communiqué sur la page agenda"}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-[1.25rem] border border-border/80 bg-background/80 px-4 py-4 dark:border-white/10 dark:bg-white/5">
                  <p className="text-[0.72rem] font-semibold uppercase tracking-[0.24em] text-muted-foreground dark:text-white/60">
                    Classements
                  </p>
                  <p className="mt-3 font-heading text-3xl font-bold leading-none tracking-[-0.05em]">
                    Par saison
                  </p>
                </div>
                <div className="rounded-[1.25rem] border border-border/80 bg-background/80 px-4 py-4 dark:border-white/10 dark:bg-white/5">
                  <p className="text-[0.72rem] font-semibold uppercase tracking-[0.24em] text-muted-foreground dark:text-white/60">
                    Circuit
                  </p>
                  <p className="mt-3 font-heading text-3xl font-bold leading-none tracking-[-0.05em]">
                    {season ? season.tours.length : 0} tours
                  </p>
                </div>
              </div>

              <Button asChild size="sm" className="w-fit gap-2 bg-primary text-primary-foreground hover:bg-primary/90">
                <Link href="/trophee">
                  Comprendre le trophée
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {publicStats.map((stat) => (
          <div
            key={stat.label}
            className="stat-panel rounded-[1.6rem] px-5 py-5"
          >
            <p className="stat-label">{stat.label}</p>
            <p className="stat-value mt-3">{stat.value}</p>
            <div className="mt-5 h-1.5 rounded-full bg-muted">
              <div className="h-full w-2/3 rounded-full bg-primary" />
            </div>
          </div>
        ))}
      </section>

      <section className="rounded-[2rem] border border-border/60 bg-muted/30 p-5 sm:p-6">
        <div className="flex items-end justify-between gap-4">
          <div className="page-header">
            <p className="kicker text-primary">Clubs partenaires</p>
            <h2 className="page-title text-2xl">Clubs partenaires</h2>
            <p className="page-subtitle">
              Une communaut&eacute; engag&eacute;e qui fait vivre le troph&eacute;e.
            </p>
          </div>
          <div className="hidden rounded-full border border-primary/20 bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary sm:block">
            {clubNames.length > 0
              ? `${clubNames.length} clubs engag\u00e9s cette saison.`
              : "Liste des clubs \u00e0 venir."}
          </div>
        </div>

        <div className="relative mt-6 overflow-hidden rounded-[1.35rem] border border-border/70 bg-background/70 px-3 py-3 backdrop-blur">
          <div className="flex w-max gap-3 animate-[scroll_28s_linear_infinite]">
            {scrollerClubs.concat(scrollerClubs).map((club, index) => {
              const mark = getClubMark(club.name);
              const markClassName =
                mark.length >= 3
                  ? "text-[0.65rem] tracking-[0.2em]"
                  : "text-sm tracking-[0.24em]";

              return (
                <div
                  key={`${club.name}-${index}`}
                  className="group surface min-w-[248px] max-w-[248px] rounded-[1.2rem] px-4 py-3 text-sm font-medium tracking-tight transition-colors duration-200 hover:border-primary/30 hover:bg-accent/20 sm:min-w-[272px] sm:max-w-[272px] backdrop-blur supports-[backdrop-filter]:bg-background/70 supports-[backdrop-filter]:hover:bg-accent/20"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-border/60 bg-background shadow-sm transition-colors duration-200 group-hover:border-primary/20 group-hover:bg-accent/30">
                      {club.logoUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={club.logoUrl}
                          alt={club.name}
                          className="h-full w-full object-contain p-1.5"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-muted px-1 text-foreground transition-colors duration-200 group-hover:bg-accent/40">
                          <span
                            className={`block font-semibold uppercase ${markClassName}`}
                          >
                            {mark}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="min-w-0 space-y-1">
                      <div className="line-clamp-2 text-sm leading-tight font-semibold tracking-[-0.03em] text-foreground sm:text-base">
                        {club.name}
                      </div>
                      {club.city ? (
                        <div className="truncate text-xs text-muted-foreground">
                          {club.city}
                        </div>
                      ) : null}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <div className="rounded-[2rem] border border-border/60 bg-background p-6 sm:p-8">
          <div className="page-header">
            <p className="kicker text-primary">Ils en parlent</p>
            <h2 className="page-title text-2xl">Ils en parlent</h2>
            <p className="page-subtitle">
              Les retours récents des clubs et joueurs impliqués.
            </p>
          </div>

          <div className="mt-8 grid gap-4">
            {featuredTestimonials.length === 0 ? (
              <Card className="surface rounded-[1.5rem] border-border/70 bg-muted/30">
                <CardContent className="space-y-4 pt-6 text-sm text-muted-foreground">
                  <p className="text-foreground">
                    Aucun avis publié pour le moment. Les retours des clubs et
                    joueurs apparaîtront ici au fil de la saison.
                  </p>
                  <Button asChild size="sm" variant="secondary">
                    <Link href="/trophee">Découvrir le trophée</Link>
                  </Button>
                </CardContent>
              </Card>
            ) : (
              featuredTestimonials.map((item) => (
                <Card
                  key={item.id}
                  className="surface rounded-[1.5rem] border-border/70 bg-muted/20"
                >
                  <CardContent className="space-y-4 pt-6 text-sm text-muted-foreground">
                    <Quote className="h-5 w-5 text-primary" />
                    <p className="text-sm leading-7 text-foreground">
                      &quot;{item.content}&quot;
                    </p>
                    <div>
                      <p className="section-title">{item.authorName}</p>
                      {item.authorRole ? (
                        <p className="text-xs text-muted-foreground">
                          {item.authorRole}
                        </p>
                      ) : null}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>

        <div className="rounded-[2rem] border border-border/60 bg-muted/30 p-6 sm:p-8">
          <div className="page-header">
            <p className="kicker text-primary">Suivre la saison</p>
            <h2 className="page-title text-2xl">Suivre la saison</h2>
            <p className="page-subtitle">
              Accédez rapidement aux informations essentielles du trophée.
            </p>
          </div>

          <div className="mt-8 grid gap-4">
            {highlights.map((item, index) => (
              <Card
                key={item.title}
                className="group surface rounded-[1.6rem] border-border/70 bg-background/90 transition-colors duration-200 hover:border-primary/20 hover:bg-accent/20"
              >
                <CardHeader className="gap-3">
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-[0.8rem] font-bold tracking-[-0.04em] text-primary">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform duration-200 group-hover:translate-x-1 group-hover:text-primary" />
                  </div>
                  <CardTitle>{item.title}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-sm text-muted-foreground">
                  <p className="leading-7">{item.description}</p>
                  <Button asChild size="sm" variant="secondary">
                    <Link href={item.href}>{item.cta}</Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="rounded-[2rem] border border-border/60 bg-background p-6 sm:p-8">
          <div className="page-header">
            <p className="kicker text-primary">Ressources clés</p>
            <h2 className="page-title text-2xl">Ressources clés</h2>
            <p className="page-subtitle">
              Consultez le règlement, les tableaux et les informations pratiques
              pour préparer votre prochain tour.
            </p>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <div className="surface rounded-[1.5rem] px-5 py-5">
              <p className="stat-label">Classements</p>
              <p className="section-title mt-3">Voir les classements</p>
            </div>
            <div className="surface rounded-[1.5rem] px-5 py-5">
              <p className="stat-label">Informations</p>
              <p className="section-title mt-3">Règlement, tableaux et détails pratiques</p>
            </div>
          </div>
        </div>

        <div className="relative overflow-hidden rounded-[2rem] border border-primary/15 bg-accent/40 px-6 py-8 text-foreground shadow-xl dark:border-white/10 dark:bg-slate-900 dark:text-white sm:px-8">
          <div className="relative space-y-5">
            <p className="kicker text-primary/75 dark:text-white/65">Accès direct</p>
            <h2 className="font-heading text-3xl font-bold leading-none tracking-[-0.05em] text-balance">
              Consultez les classements ou l&apos;agenda en quelques secondes.
            </h2>
            <p className="max-w-xl text-sm leading-7 text-foreground/75 dark:text-white/75">
              Retrouvez rapidement les informations essentielles du trophée pour
              préparer votre prochain tour.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button asChild size="sm" className="bg-background text-foreground hover:bg-background/90">
                <Link href="/classement">Voir les classements</Link>
              </Button>
              <Button asChild size="sm" variant="secondary" className="border border-primary/15 bg-background/70 text-foreground hover:bg-background dark:border-white/15 dark:bg-white/10 dark:text-white dark:hover:bg-white/18">
                <Link href="/agenda">Agenda & salles</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
