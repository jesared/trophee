import Link from "next/link";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function UserDashboardPage() {
  return (
    <section className="page">
      <div className="page-header">
        <p className="badge-pill w-fit">Dashboard</p>
        <h1 className="page-title">Mon espace</h1>
        <p className="page-subtitle">
          Suivez vos inscriptions, prochains tours et performances.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        <Card className="card-hover">
          <CardHeader>
            <CardTitle>Résumé utilisateur</CardTitle>
            <CardDescription>Vue rapide de votre saison.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-muted-foreground">
            <div className="flex items-center justify-between">
              <span>Inscriptions</span>
              <span className="text-foreground">—</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Prochain tour</span>
              <span className="text-foreground">—</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Classement</span>
              <span className="text-foreground">—</span>
            </div>
            <p className="text-xs">
              Les données s’afficheront dès que vos inscriptions seront créées.
            </p>
          </CardContent>
        </Card>

        <Card className="card-hover">
          <CardHeader>
            <CardTitle>Prochains tours</CardTitle>
            <CardDescription>Ne manquez aucun rendez-vous.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-muted-foreground">
            <p>Aucun tour suivi pour le moment.</p>
            <Button asChild size="sm" variant="secondary">
              <Link href="/agenda">Voir l’agenda</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="card-hover">
          <CardHeader>
            <CardTitle>Derniers résultats</CardTitle>
            <CardDescription>Vos derniers parcours.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <p>Aucun résultat disponible pour l’instant.</p>
            <Button asChild size="sm" variant="secondary">
              <Link href="/classement">Consulter les classements</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="card-hover">
          <CardHeader>
            <CardTitle>Actions rapides</CardTitle>
            <CardDescription>
              Acces direct aux actions courantes.
            </CardDescription>
          </CardHeader>
          <CardFooter className="flex flex-col gap-3 sm:flex-row">
            <Button asChild className="w-full">
              <Link href="/inscription">S’inscrire</Link>
            </Button>
            <Button asChild variant="outline" className="w-full">
              <Link href="/me/inscriptions">Voir mes inscriptions</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    </section>
  );
}
