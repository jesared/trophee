import {
  ArrowRight,
  CalendarDays,
  ClipboardList,
  FileText,
  MapPin,
  Quote,
  Trophy,
  Users,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const quickLinks = [
  {
    title: "Agenda & salles",
    description: "Dates, lieux et horaires des prochains tours.",
    href: "/agenda",
    icon: CalendarDays,
  },
  {
    title: "Classements",
    description: "PDF officiels par saison, tour et tableau.",
    href: "/classement",
    icon: Trophy,
  },
  {
    title: "Tours",
    description: "Détails pratiques, tableaux et informations de chaque tour.",
    href: "/tours",
    icon: ClipboardList,
  },
  {
    title: "Le trophée",
    description: "Règlement, format et esprit du challenge.",
    href: "/trophee",
    icon: FileText,
  },
];

export default async function Home() {
  type SeasonItem = {
    name: string;
    year: number;
    tours: {
      id: string;
      name: string;
      date: Date;
      venue: string | null;
      coverUrl: string | null;
      _count: { tableaux: number };
    }[];
  };

  const season: SeasonItem | null = await prisma.season.findFirst({
    where: { isActive: true },
    include: {
      tours: {
        select: {
          id: true,
          name: true,
          date: true,
          venue: true,
          coverUrl: true,
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
  const nextTourHref = nextTour ? `/tours/${nextTour.id}` : "/agenda";
  const primaryCtaLabel = nextTour
    ? "Voir le prochain tour"
    : "Consulter l'agenda";
  const nextTourPanelClass = nextTour?.coverUrl
    ? "xl:row-span-3"
    : "xl:self-start";
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
          </div>

          <div
            className={`relative overflow-hidden rounded-[1.75rem] p-4 text-foreground dark:bg-slate-900 dark:text-white sm:p-6 xl:col-start-2 ${nextTourPanelClass}`}
          >
            <div className="relative space-y-4 sm:space-y-6">
              <div className="hidden items-center justify-between gap-4 sm:flex">
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

              {nextTour?.coverUrl ? (
                <Link
                  href={nextTourHref}
                  className="group relative block aspect-[16/8] overflow-hidden rounded-[1.5rem] border border-border/80 bg-background/80 dark:border-white/10 dark:bg-white/5"
                  aria-label={`Voir la page de ${nextTour.name}`}
                >
                  <Image
                    src={nextTour.coverUrl}
                    alt={`Couverture ${nextTour.name}`}
                    fill
                    preload
                    sizes="(max-width: 1279px) 100vw, 42vw"
                    className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                  />
                </Link>
              ) : (
                <div className="hidden rounded-[1.5rem] border border-border/80 bg-background/75 p-5 shadow-sm dark:border-white/10 dark:bg-white/5 sm:block">
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary/15 text-primary dark:bg-white/10">
                      <Trophy className="h-6 w-6" />
                    </div>
                    <div className="min-w-0 space-y-2">
                      <p className="kicker text-primary/75 dark:text-white/60">
                        La saison en bref
                      </p>
                      <p className="font-heading text-2xl font-bold leading-tight tracking-[-0.04em]">
                        {partnerClubs.length > 0
                          ? `${partnerClubs.length} clubs engagés dans le trophée`
                          : "Le calendrier du trophée se prépare"}
                      </p>
                      <p className="max-w-sm text-sm leading-6 text-foreground/70 dark:text-white/70">
                        Tours, salles et classements sont centralisés pour suivre la compétition.
                      </p>
                    </div>
                  </div>

                  <div className="mt-5 flex flex-wrap gap-2">
                    <div className="flex items-center gap-2 rounded-full border border-border/70 bg-background/80 px-3 py-2 text-sm font-semibold dark:border-white/10 dark:bg-white/5">
                      <Trophy className="h-4 w-4 text-primary" />
                      <span>{seasonLabel}</span>
                    </div>

                    <div className="flex items-center gap-2 rounded-full border border-border/70 bg-background/80 px-3 py-2 text-sm font-semibold dark:border-white/10 dark:bg-white/5">
                      {partnerClubs.length > 0 ? (
                        <Users className="h-4 w-4 text-primary" />
                      ) : (
                        <CalendarDays className="h-4 w-4 text-primary" />
                      )}
                      <span>
                        {partnerClubs.length > 0
                          ? `${partnerClubs.length} clubs`
                          : "Clubs à venir"}
                      </span>
                    </div>
                  </div>
                </div>
              )}

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

              <Button asChild size="sm" className="w-fit gap-2 bg-primary text-primary-foreground hover:bg-primary/90">
                <Link href={nextTourHref}>
                  {primaryCtaLabel}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>

          <div className="flex flex-wrap gap-3 xl:col-start-1 xl:row-start-2">
            <Button asChild size="lg" className="gap-2">
              <Link href={nextTourHref}>
                {primaryCtaLabel}
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

          <div className="grid gap-3 sm:grid-cols-2 xl:col-start-1 xl:row-start-3">
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

        <div className="mt-6 grid gap-3 sm:hidden">
          {scrollerClubs.map((club) => {
            return (
              <div
                key={club.name}
                className="surface rounded-[1.2rem] px-4 py-3 text-sm font-medium tracking-tight"
              >
                <div className="flex items-center gap-3">
                  {club.logoUrl ? (
                    <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-xl border border-border/70 bg-background">
                      <Image
                        src={club.logoUrl}
                        alt={`Logo ${club.name}`}
                        fill
                        sizes="40px"
                        className="object-contain p-1.5"
                      />
                    </div>
                  ) : null}
                  <div className="min-w-0 space-y-1">
                    <div className="line-clamp-2 text-sm leading-tight font-semibold tracking-[-0.03em] text-foreground">
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

        <div className="club-marquee relative mt-6 hidden overflow-hidden rounded-[1.35rem] border border-border/70 bg-background/70 px-3 py-3 backdrop-blur sm:block">
          <div className="club-marquee-track flex w-max gap-3">
            {scrollerClubs.map((club) => {
              return (
                <div
                  key={club.name}
                  className="group surface min-w-[272px] max-w-[272px] rounded-[1.2rem] px-4 py-3 text-sm font-medium tracking-tight transition-colors duration-200 hover:border-primary/30 hover:bg-accent/20 backdrop-blur supports-[backdrop-filter]:bg-background/70 supports-[backdrop-filter]:hover:bg-accent/20"
                >
                  <div className="flex items-center gap-3">
                    {club.logoUrl ? (
                      <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-xl border border-border/70 bg-background">
                        <Image
                          src={club.logoUrl}
                          alt={`Logo ${club.name}`}
                          fill
                          sizes="44px"
                          className="object-contain p-1.5"
                        />
                      </div>
                    ) : null}
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
            {scrollerClubs.map((club) => {
              return (
                <div
                  key={`${club.name}-duplicate`}
                  aria-hidden="true"
                  className="group surface min-w-[272px] max-w-[272px] rounded-[1.2rem] px-4 py-3 text-sm font-medium tracking-tight transition-colors duration-200 hover:border-primary/30 hover:bg-accent/20 backdrop-blur supports-[backdrop-filter]:bg-background/70 supports-[backdrop-filter]:hover:bg-accent/20"
                >
                  <div className="flex items-center gap-3">
                    {club.logoUrl ? (
                      <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-xl border border-border/70 bg-background">
                        <Image
                          src={club.logoUrl}
                          alt=""
                          fill
                          sizes="44px"
                          className="object-contain p-1.5"
                        />
                      </div>
                    ) : null}
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
            <p className="kicker text-primary">Accès rapides</p>
            <h2 className="page-title text-2xl">Accès rapides</h2>
            <p className="page-subtitle">
              Accédez rapidement aux informations essentielles du trophée.
            </p>
          </div>

          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            {quickLinks.map((item) => {
              const Icon = item.icon;

              return (
              <Link key={item.title} href={item.href} className="group block">
                <Card className="surface h-full rounded-[1.35rem] border-border/70 bg-background/90 transition-colors duration-200 group-hover:border-primary/20 group-hover:bg-accent/20">
                  <CardHeader className="gap-3">
                    <div className="flex items-center justify-between gap-4">
                      <Icon className="h-5 w-5 text-primary" />
                      <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform duration-200 group-hover:translate-x-1 group-hover:text-primary" />
                    </div>
                    <CardTitle>{item.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4 text-sm text-muted-foreground">
                    <p className="leading-7">{item.description}</p>
                  </CardContent>
                </Card>
              </Link>
              );
            })}
          </div>
        </div>
      </section>

    </div>
  );
}
