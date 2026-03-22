import { notFound } from "next/navigation";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type Tour = {
  id: string;
  name: string;
  date: string;
  description: string;
  tableaux: Array<{ name: string }>;
};

const tours: Tour[] = [
  {
    id: "tour-1",
    name: "Tour 1 - Ouverture",
    date: "12 avril 2026",
    description:
      "Lancement officiel du trophee avec une journee dediee aux qualifications et aux premieres phases eliminatoires.",
    tableaux: [{ name: "-1300" }, { name: "-1500" }, { name: "+1500" }],
  },
  {
    id: "tour-2",
    name: "Tour 2 - Printemps",
    date: "26 avril 2026",
    description:
      "Un tour axe sur le rythme et la precision, avec des matches rapides et un format condense.",
    tableaux: [{ name: "-1300" }, { name: "-1700" }, { name: "+1700" }],
  },
  {
    id: "tour-3",
    name: "Tour 3 - Riviera",
    date: "10 mai 2026",
    description:
      "Le rendez-vous en bord de mer pour les joueurs confirmes et les nouveaux challengers.",
    tableaux: [{ name: "-1400" }, { name: "-1600" }, { name: "+1600" }],
  },
];

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function TourDetailPage({ params }: PageProps) {
  const { id } = await params;
  const tour = tours.find((item) => item.id === id);

  if (!tour) {
    notFound();
  }

  return (
    <section className="space-y-10">
      <header className="space-y-3">
        <p className="text-sm font-medium text-muted-foreground">Tour</p>
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          {tour.name}
        </h1>
        <p className="text-sm text-muted-foreground">{tour.date}</p>
        <p className="max-w-2xl text-base text-foreground/80">
          {tour.description}
        </p>
      </header>

      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Tableaux</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {tour.tableaux.map((tableau) => (
            <Card key={tableau.name} className="bg-card">
              <CardHeader>
                <CardTitle className="text-base">{tableau.name}</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                Inscription ouverte pour ce tableau.
              </CardContent>
              <CardFooter>
                <Button size="sm">S'inscrire</Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
