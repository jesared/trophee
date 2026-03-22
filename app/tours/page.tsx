import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const tours = [
  {
    id: "tour-1",
    name: "Tour 1 - Ouverture",
    date: "12 avril 2026",
    venue: "Gymnase Lamy",
    city: "Reims",
  },
  {
    id: "tour-2",
    name: "Tour 2 - Printemps",
    date: "26 avril 2026",
    venue: "Salle Bayard",
    city: "Charleville",
  },
  {
    id: "tour-3",
    name: "Tour 3 - Riviera",
    date: "10 mai 2026",
    venue: "Complexe Pierre",
    city: "Sedan",
  },
  {
    id: "tour-4",
    name: "Tour 4 - Nord",
    date: "24 mai 2026",
    venue: "Salle des Sports",
    city: "Epernay",
  },
  {
    id: "tour-5",
    name: "Tour 5 - Atlantique",
    date: "7 juin 2026",
    venue: "Salle Ocean",
    city: "Bordeaux",
  },
  {
    id: "tour-6",
    name: "Tour 6 - Alpes",
    date: "21 juin 2026",
    venue: "Salle Mont Blanc",
    city: "Annecy",
  },
  {
    id: "tour-7",
    name: "Tour 7 - Sud",
    date: "5 juillet 2026",
    venue: "Palais du Sport",
    city: "Marseille",
  },
  {
    id: "tour-8",
    name: "Tour 8 - Finales",
    date: "19 juillet 2026",
    venue: "Arena Capitole",
    city: "Toulouse",
  },
];

export default function ToursPage() {
  return (
    <section className="space-y-6">
      <div className="space-y-2">
        <p className="text-sm font-medium text-muted-foreground">Saison 2026</p>
        <h1 className="text-3xl font-semibold tracking-tight">Les tours</h1>
        <p className="text-sm text-muted-foreground">
          Decouvrez les 8 tours du troph&eacute;e et les lieux associes.
        </p>
      </div>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {tours.map((tour) => (
          <Card
            key={tour.id}
            className="transition-all hover:-translate-y-0.5 hover:shadow-lg"
          >
            <CardHeader>
              <CardTitle>{tour.name}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-1 text-sm text-muted-foreground">
              <p>{tour.date}</p>
              <p>
                {tour.venue} - {tour.city}
              </p>
            </CardContent>
            <CardFooter>
              <Button variant="outline" size="sm">
                Voir le detail
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </section>
  );
}
