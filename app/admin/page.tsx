import Link from "next/link";

import { AdminPageHeader } from "@/components/admin-page-header";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
      take: 5,
      include: {
        season: { select: { year: true } },
        club: { select: { name: true } },
        registrations: { select: { id: true } },
      },
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
  const completedTours = Math.max(totalTours - remainingTours, 0);

  const dateFormatter = new Intl.DateTimeFormat("fr-FR", {
    dateStyle: "medium",
  });

  const setupSteps = [
    ["Saisons", "Creer et activer la saison en cours."],
    ["Clubs", "Ajouter les clubs organisateurs."],
    ["Templates", "Definir les plages de points globales."],
    ["Tours", "Creer les tours lies a la saison et au club."],
    ["Tableaux", "Associer les tableaux aux tours."],
    ["Joueurs", "Creer ou importer les joueurs."],
    ["Inscriptions", "Inscrire les joueurs dans les tableaux."],
    ["Verifications", "Controler agenda, salles et coherence globale."],
  ] as const;

  const quickActions = [
    { href: "/admin/seasons", label: "Gerer les saisons" },
    { href: "/admin/tours", label: "Voir les tours" },
    { href: "/admin/inscriptions", label: "Ouvrir les inscriptions" },
  ] as const;

  return (
    <section className="space-y-8">
      <AdminPageHeader
        title="Tableau de bord"
        description="Vue d'ensemble des flux principaux pour piloter la saison, les tours et les inscriptions."
        actions={
          <>
            {quickActions.map((action) => (
              <Button key={action.href} asChild size="sm" variant="secondary">
                <Link href={action.href}>{action.label}</Link>
              </Button>
            ))}
            <Button asChild size="sm">
              <Link href="/api/admin/registrations/export">Exporter CSV</Link>
            </Button>
          </>
        }
      />

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-border/70">
          <CardHeader>
            <CardDescription>Saison active</CardDescription>
            <CardTitle className="text-3xl">
              {activeSeason?.year ?? "-"}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0 text-sm text-muted-foreground">
            {activeSeason
              ? `${totalTours} tour(s) rattaches a la saison active.`
              : "Aucune saison active pour le moment."}
          </CardContent>
        </Card>

        <Card className="border-border/70">
          <CardHeader>
            <CardDescription>Tours a venir</CardDescription>
            <CardTitle className="text-3xl">{remainingTours}</CardTitle>
          </CardHeader>
          <CardContent className="pt-0 text-sm text-muted-foreground">
            {completedTours} tour(s) deja passes sur la saison en cours.
          </CardContent>
        </Card>

        <Card className="border-border/70">
          <CardHeader>
            <CardDescription>Dernieres inscriptions</CardDescription>
            <CardTitle className="text-3xl">{latestRegistrations.length}</CardTitle>
          </CardHeader>
          <CardContent className="pt-0 text-sm text-muted-foreground">
            Apercu des 5 derniers mouvements recents.
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
        <Card className="border-border/70">
          <CardHeader>
            <CardTitle>Derniers tours</CardTitle>
            <CardDescription>
              Suivi rapide des tours recents, de leur club et du volume
              d&apos;inscriptions associe.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tour</TableHead>
                  <TableHead>Saison</TableHead>
                  <TableHead>Club</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Inscriptions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {latestTours.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="py-8 text-center text-muted-foreground">
                      Aucun tour pour le moment.
                    </TableCell>
                  </TableRow>
                ) : (
                  latestTours.map((tour) => (
                    <TableRow key={tour.id}>
                      <TableCell className="font-medium">{tour.name}</TableCell>
                      <TableCell>{tour.season?.year ?? "-"}</TableCell>
                      <TableCell>{tour.club?.name ?? "-"}</TableCell>
                      <TableCell>{dateFormatter.format(tour.date)}</TableCell>
                      <TableCell className="text-right">
                        {tour.registrations.length}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Alert>
            <AlertTitle>Cycle de mise en place</AlertTitle>
            <AlertDescription>
              Travaillez dans l&apos;ordre saison, clubs, templates, tours,
              tableaux puis inscriptions pour eviter les blocages de
              configuration.
            </AlertDescription>
          </Alert>

          <Card className="border-border/70">
            <CardHeader>
              <CardTitle>Ordre recommande</CardTitle>
              <CardDescription>
                Checklist rapide pour une saison propre.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              {setupSteps.map(([title, description], index) => (
                <div key={title} className="space-y-4">
                  {index > 0 ? <Separator /> : null}
                  <div className="space-y-1">
                    <p className="font-medium text-foreground">{title}</p>
                    <p className="text-muted-foreground">{description}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>

      <Card className="border-border/70">
        <CardHeader>
          <CardTitle>Dernieres inscriptions</CardTitle>
          <CardDescription>
            Les derniers joueurs inscrits pour controler les mouvements recents.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Joueur</TableHead>
                <TableHead>Tour</TableHead>
                <TableHead>Tableau</TableHead>
                <TableHead className="text-right">Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {latestRegistrations.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="py-8 text-center text-muted-foreground">
                    Aucune inscription pour le moment.
                  </TableCell>
                </TableRow>
              ) : (
                latestRegistrations.map((registration) => (
                  <TableRow key={registration.id}>
                    <TableCell className="font-medium">
                      {registration.player.firstName} {registration.player.lastName}
                    </TableCell>
                    <TableCell>{registration.tour.name}</TableCell>
                    <TableCell>{registration.tableau.template.name}</TableCell>
                    <TableCell className="text-right">
                      {dateFormatter.format(registration.createdAt)}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </section>
  );
}
