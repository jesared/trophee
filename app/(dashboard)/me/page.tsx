import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const summary = {
  registrations: 4,
  nextTournament: "Tour 3 - Riviera",
  ranking: "#128",
};

const upcomingTours = [
  { name: "Tour 3 - Riviera", date: "10 May 2026" },
  { name: "Tour 4 - Nord", date: "24 May 2026" },
  { name: "Tour 5 - Atlantique", date: "7 Jun 2026" },
];

const recentResults = [
  { tour: "Tour 2 - Printemps", tableau: "-1500", position: "8e" },
  { tour: "Tour 1 - Ouverture", tableau: "-1300", position: "4e" },
];

export default function UserDashboardPage() {
  return (
    <section className="space-y-8">
      <div className="space-y-2">
        <p className="text-sm font-medium text-muted-foreground">Dashboard</p>
        <h1 className="text-3xl font-semibold tracking-tight">Mon espace</h1>
        <p className="max-w-2xl text-sm text-muted-foreground">
          Suivez vos inscriptions, prochains tours et performances.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        <Card className="transition-all hover:-translate-y-0.5 hover:shadow-lg">
          <CardHeader>
            <CardTitle>Resume utilisateur</CardTitle>
            <CardDescription>Vue rapide de votre saison.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                Inscriptions
              </span>
              <span className="text-lg font-semibold">
                {summary.registrations}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                Prochain tour
              </span>
              <span className="text-sm font-medium">
                {summary.nextTournament}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Classement</span>
              <span className="text-lg font-semibold">{summary.ranking}</span>
            </div>
          </CardContent>
        </Card>

        <Card className="transition-all hover:-translate-y-0.5 hover:shadow-lg">
          <CardHeader>
            <CardTitle>Prochains tours</CardTitle>
            <CardDescription>Ne manquez aucun rendez-vous.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {upcomingTours.map((tour) => (
              <div
                key={tour.name}
                className="flex items-center justify-between"
              >
                <div>
                  <p className="text-sm font-medium">{tour.name}</p>
                  <p className="text-xs text-muted-foreground">{tour.date}</p>
                </div>
                <Button variant="outline" size="sm">
                  Voir
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="transition-all hover:-translate-y-0.5 hover:shadow-lg">
          <CardHeader>
            <CardTitle>Derniers resultats</CardTitle>
            <CardDescription>Vos derniers parcours.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentResults.map((result) => (
              <div
                key={`${result.tour}-${result.tableau}`}
                className="flex items-center justify-between rounded-md border border-border/60 px-3 py-2"
              >
                <div>
                  <p className="text-sm font-medium">{result.tour}</p>
                  <p className="text-xs text-muted-foreground">
                    {result.tableau}
                  </p>
                </div>
                <span className="text-sm font-semibold">{result.position}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="transition-all hover:-translate-y-0.5 hover:shadow-lg">
          <CardHeader>
            <CardTitle>Actions rapides</CardTitle>
            <CardDescription>
              Acces direct aux actions courantes.
            </CardDescription>
          </CardHeader>
          <CardFooter className="flex flex-col gap-3 sm:flex-row">
            <Button className="w-full">S&apos;inscrire</Button>
            <Button variant="outline" className="w-full">
              Voir mes inscriptions
            </Button>
          </CardFooter>
        </Card>
      </div>
    </section>
  );
}
