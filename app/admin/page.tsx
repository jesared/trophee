import Link from "next/link";

import { Button } from "@/components/ui/button";
import { prisma } from "@/lib/prisma";

export default async function AdminPage() {
  const now = new Date();

  const [activeSeason, latestTours, latestRegistrations] = await Promise.all([
    prisma.season.findFirst({
      where: { isActive: true },
      include: { tours: true },
      orderBy: { year: "desc" },
    }),
    prisma.tour.findMany({
      orderBy: { date: "desc" },
      take: 3,
      include: { season: { select: { year: true } }, club: { select: { name: true } } },
    }),
    prisma.registration.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      include: {
        player: { select: { firstName: true, lastName: true } },
        tour: { select: { name: true } },
        tableau: { include: { template: { select: { name: true } } } },
      },
    }),
  ]);

  const totalTours = activeSeason?.tours.length ?? 0;
  const remainingTours =
    activeSeason?.tours.filter((tour) => tour.date >= now).length ?? 0;

  const dateFormatter = new Intl.DateTimeFormat("fr-FR", {
    dateStyle: "medium",
  });

  return (
    <section className="page">
      <div className="page-header">
        <h1 className="page-title">Dashboard</h1>
        <p className="page-subtitle">
          Vue d&apos;ensemble de l&apos;administration du trophée.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="surface p-6">
          <h2 className="text-base font-semibold">État de saison</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Suivi de la saison active et des tours restants.
          </p>
          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            <div className="surface px-4 py-3">
              <p className="text-xs text-muted-foreground">Saison active</p>
              <p className="text-xl font-semibold text-foreground">
                {activeSeason?.year ?? "-"}
              </p>
            </div>
            <div className="surface px-4 py-3">
              <p className="text-xs text-muted-foreground">Tours planifiés</p>
              <p className="text-xl font-semibold text-foreground">
                {totalTours}
              </p>
            </div>
            <div className="surface px-4 py-3">
              <p className="text-xs text-muted-foreground">Tours restants</p>
              <p className="text-xl font-semibold text-foreground">
                {remainingTours}
              </p>
            </div>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <Button asChild size="sm" variant="secondary">
              <Link href="/admin/seasons">Gérer les saisons</Link>
            </Button>
            <Button asChild size="sm" variant="secondary">
              <Link href="/admin/tours">Voir les tours</Link>
            </Button>
          </div>
        </div>

        <div className="surface p-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-semibold">Export inscriptions</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Téléchargez la liste complète pour traitement externe.
              </p>
            </div>
            <Button asChild size="sm">
              <Link href="/api/admin/registrations/export">
                Exporter CSV
              </Link>
            </Button>
          </div>
          <div className="mt-4 text-xs text-muted-foreground">
            Le fichier contient joueurs, tours, tableaux et dates d&apos;inscription.
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
        <div className="surface p-6">
          <h2 className="text-base font-semibold">Derniers tours</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Les trois derniers tours créés.
          </p>
          <div className="mt-4 space-y-3 text-sm">
            {latestTours.length === 0 ? (
              <p className="text-muted-foreground">Aucun tour pour le moment.</p>
            ) : (
              latestTours.map((tour) => (
                <div
                  key={tour.id}
                  className="flex items-center justify-between rounded-lg border border-border/60 bg-muted/30 px-4 py-3"
                >
                  <div>
                    <p className="font-medium">{tour.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {tour.season?.year ?? "-"} ·{" "}
                      {dateFormatter.format(tour.date)}
                    </p>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {tour.club?.name ?? "-"}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="surface p-6">
          <h2 className="text-base font-semibold">Dernières inscriptions</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Les 5 derniers joueurs inscrits.
          </p>
          <div className="mt-4 space-y-3 text-sm">
            {latestRegistrations.length === 0 ? (
              <p className="text-muted-foreground">
                Aucune inscription pour le moment.
              </p>
            ) : (
              latestRegistrations.map((registration) => (
                <div
                  key={registration.id}
                  className="flex items-center justify-between rounded-lg border border-border/60 bg-muted/30 px-4 py-3"
                >
                  <div>
                    <p className="font-medium">
                      {registration.player.firstName}{" "}
                      {registration.player.lastName}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {registration.tour.name} ·{" "}
                      {registration.tableau.template.name}
                    </p>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {dateFormatter.format(registration.createdAt)}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
        <div className="surface p-6">
          <h2 className="text-base font-semibold">Hiérarchie des actions</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Suivez cet ordre pour initialiser une saison proprement.
          </p>
          <div className="mt-5 space-y-4 text-sm">
            <div className="flex gap-3">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                1
              </span>
              <div>
                <p className="font-medium">Saisons</p>
                <p className="text-muted-foreground">
                  Créer et activer la saison en cours.
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                2
              </span>
              <div>
                <p className="font-medium">Clubs</p>
                <p className="text-muted-foreground">
                  Ajouter les clubs organisateurs.
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                3
              </span>
              <div>
                <p className="font-medium">Templates de tableaux</p>
                <p className="text-muted-foreground">
                  Définir les plages de points globales.
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                4
              </span>
              <div>
                <p className="font-medium">Tours</p>
                <p className="text-muted-foreground">
                  Créer les tours liés à la saison et au club.
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                5
              </span>
              <div>
                <p className="font-medium">Tableaux</p>
                <p className="text-muted-foreground">
                  Associer les tableaux aux tours.
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                6
              </span>
              <div>
                <p className="font-medium">Joueurs</p>
                <p className="text-muted-foreground">
                  Créer ou importer les joueurs.
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                7
              </span>
              <div>
                <p className="font-medium">Inscriptions</p>
                <p className="text-muted-foreground">
                  Inscrire les joueurs dans les tableaux.
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                8
              </span>
              <div>
                <p className="font-medium">Vérifications</p>
                <p className="text-muted-foreground">
                  Contrôler l'agenda, les salles et la cohérence globale.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="surface p-6">
          <h2 className="text-base font-semibold">Conseils rapides</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Pour un démarrage fluide.
          </p>
          <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
            <li>Gardez une seule saison active à la fois.</li>
            <li>Utilisez les templates pour uniformiser les tableaux.</li>
            <li>Vérifiez les horaires des tableaux avant d'inscrire.</li>
            <li>Utilisez l'import CSV pour gagner du temps.</li>
          </ul>
        </div>
      </div>
    </section>
  );
}
