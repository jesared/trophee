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
        <p className="badge-pill w-fit">Espace joueur</p>
        <h1 className="page-title">Bientôt disponible</h1>
        <p className="page-subtitle">
          Cette première version publique ne propose pas encore de parcours
          joueur complet.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <Card className="surface border-border/60">
          <CardHeader>
            <CardTitle>Le site est actuellement en mode information</CardTitle>
            <CardDescription>
              Agenda, salles, tours et classements restent accessibles
              librement.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-muted-foreground">
            <p>
              L'espace joueur reviendra dans une version ultérieure avec les
              inscriptions en ligne, le suivi de participation et les
              informations personnelles.
            </p>
            <div className="surface p-4">
              <p className="font-medium text-foreground">
                Pour le moment, utilisez le site comme portail d'information du
                trophée.
              </p>
              <p className="mt-2">
                Vous pouvez déjà consulter les prochains tours, les salles
                d'accueil et les classements officiels.
              </p>
            </div>
          </CardContent>
          <CardFooter className="flex flex-wrap gap-3">
            <Button asChild>
              <Link href="/agenda">Voir l'agenda</Link>
            </Button>
            <Button asChild variant="secondary">
              <Link href="/classement">Consulter les classements</Link>
            </Button>
          </CardFooter>
        </Card>

        <Card className="surface border-border/60 bg-muted/30">
          <CardHeader>
            <CardTitle>À retenir</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <p>Les inscriptions en ligne ne sont pas encore ouvertes.</p>
            <p>Les données joueur ne sont pas affichées dans cette version.</p>
            <p>
              L'administration du site reste accessible séparément pour
              l'organisation.
            </p>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
