import { revalidatePath } from "next/cache";

import { AdminRegistrationFilters } from "@/components/admin-registration-filters";
import { AdminRegistrationForm } from "@/components/admin-registration-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";

type ActionState = {
  ok: boolean;
  message: string;
};

type PageProps = {
  searchParams: Promise<{ tourId?: string; tableauId?: string; q?: string }>;
};

const formatRange = (minPoints: number | null, maxPoints: number | null) => {
  if (minPoints != null && maxPoints != null) {
    return `${minPoints} - ${maxPoints}`;
  }
  if (minPoints != null) {
    return `>= ${minPoints}`;
  }
  if (maxPoints != null) {
    return `<= ${maxPoints}`;
  }
  return "Libre";
};

async function createRegistration(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  "use server";

  await requireAdmin();

  const playerId = String(formData.get("playerId") ?? "").trim();
  const tableauId = String(formData.get("tableauId") ?? "").trim();

  const tourId = String(formData.get("tourId") ?? "").trim();

  if (!playerId || !tableauId || !tourId) {
    return { ok: false, message: "Joueur, tour et tableau requis." };
  }

  const tableau = await prisma.tableau.findUnique({
    where: { id: tableauId },
  });

  if (!tableau) {
    return { ok: false, message: "Tableau introuvable." };
  }

  if (tableau.tourId !== tourId) {
    return { ok: false, message: "Tableau non associe a ce tour." };
  }

  const existing = await prisma.registration.findFirst({
    where: {
      playerId,
      tourId,
      tableauId,
    },
    select: { id: true },
  });

  if (existing) {
    return { ok: false, message: "Inscription deja existante." };
  }

  await prisma.registration.create({
    data: {
      playerId,
      tableauId,
      tourId,
    },
  });

  revalidatePath("/admin/inscriptions");

  return { ok: true, message: "Inscription creee." };
}

async function deleteRegistration(formData: FormData) {
  "use server";

  await requireAdmin();

  const id = String(formData.get("id") ?? "").trim();

  if (!id) {
    return;
  }

  await prisma.registration.delete({
    where: { id },
  });

  revalidatePath("/admin/inscriptions");
}

export default async function AdminRegistrationsPage({
  searchParams,
}: PageProps) {
  await requireAdmin();

  const { tourId, tableauId, q } = await searchParams;
  const query = q?.trim();

  const registrationFilters = [] as Array<Record<string, unknown>>;

  if (tourId) {
    registrationFilters.push({ tourId });
  }

  if (tableauId) {
    registrationFilters.push({ tableauId });
  }

  if (query) {
    registrationFilters.push({
      OR: [
        { player: { firstName: { contains: query, mode: "insensitive" } } },
        { player: { lastName: { contains: query, mode: "insensitive" } } },
        {
          tableau: {
            template: { name: { contains: query, mode: "insensitive" } },
          },
        },
        { tour: { name: { contains: query, mode: "insensitive" } } },
      ],
    });
  }

  const registrationWhere =
    registrationFilters.length > 0 ? { AND: registrationFilters } : undefined;

  const [tours, players, tableaux, registrations] = await Promise.all([
    prisma.tour.findMany({
      include: { season: true },
      orderBy: { date: "asc" },
    }),
    prisma.player.findMany({
      select: { id: true, firstName: true, lastName: true },
      orderBy: { lastName: "asc" },
    }),
    prisma.tableau.findMany({
      include: {
        template: true,
        tour: { include: { season: true } },
      },
      orderBy: { startTime: "asc" },
    }),
    prisma.registration.findMany({
      where: registrationWhere,
      include: {
        player: true,
        tableau: { include: { template: true } },
        tour: { include: { season: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const stats = [
    { label: "Inscriptions", value: registrations.length },
    { label: "Joueurs", value: players.length },
    { label: "Tableaux", value: tableaux.length },
    { label: "Tours", value: tours.length },
  ];

  const playerOptions = players.map((player) => ({
    id: player.id,
    label: `${player.firstName} ${player.lastName}`,
  }));

  const tourOptions = tours.map((tour) => ({
    id: tour.id,
    name: tour.name,
    label: `${tour.name} - ${tour.season.year}`,
  }));

  const tableauOptions = tableaux.map((tableau) => ({
    id: tableau.id,
    tourId: tableau.tourId,
    label: `${tableau.template.name} - ${tableau.tour.name} (${tableau.tour.season.year})`,
  }));

  const grouped = registrations.reduce(
    (acc, registration) => {
      const key = `${registration.playerId}-${registration.tourId}`;
      const existing = acc.get(key);

      if (!existing) {
        acc.set(key, {
          id: key,
          player: registration.player,
          tour: registration.tour,
          createdAt: registration.createdAt,
          tableaux: [registration.tableau],
          ids: [registration.id],
        });
        return acc;
      }

      existing.tableaux.push(registration.tableau);
      existing.ids.push(registration.id);
      if (registration.createdAt > existing.createdAt) {
        existing.createdAt = registration.createdAt;
      }
      return acc;
    },
    new Map<
      string,
      {
        id: string;
        player: (typeof registrations)[number]["player"];
        tour: (typeof registrations)[number]["tour"];
        createdAt: Date;
        tableaux: (typeof registrations)[number]["tableau"][];
        ids: string[];
      }
    >(),
  );

  const groupedRows = Array.from(grouped.values()).sort(
    (a, b) => b.createdAt.getTime() - a.createdAt.getTime(),
  );

  const formatter = new Intl.DateTimeFormat("fr-FR", {
    timeStyle: "short",
  });

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Inscriptions
          </h1>
          <p className="text-sm text-muted-foreground">
            Creez et suivez les inscriptions des joueurs.
          </p>
        </div>
        <AdminRegistrationFilters
          tours={tourOptions}
          tableaux={tableauOptions}
          currentTourId={tourId}
          currentTableauId={tableauId}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.label}
              </CardTitle>
            </CardHeader>
            <CardContent className="text-2xl font-semibold">
              {stat.value}
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="space-y-6">
        <Card className="border-border/70">
          <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="text-base">Creer une inscription</CardTitle>
              <p className="text-sm text-muted-foreground">
                Choisissez un tour, un joueur et un tableau.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button asChild size="sm" variant="secondary">
                <a href="/admin/players">Nouveau joueur</a>
              </Button>
              <Button asChild size="sm" variant="secondary">
                <a href="/admin/tableaux">Nouveau tableau</a>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {playerOptions.length === 0 ||
            tableauOptions.length === 0 ||
            tours.length === 0 ? (
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>Ajoutez au moins un joueur, un tableau et un tour.</p>
                <div className="flex flex-wrap gap-2">
                  <Button asChild size="sm">
                    <a href="/admin/players">Creer un joueur</a>
                  </Button>
                  <Button asChild size="sm" variant="secondary">
                    <a href="/admin/tableau-templates">Creer un template</a>
                  </Button>
                  <Button asChild size="sm" variant="secondary">
                    <a href="/admin/tableaux">Creer un tableau</a>
                  </Button>
                  <Button asChild size="sm" variant="secondary">
                    <a href="/admin/tours">Creer un tour</a>
                  </Button>
                </div>
              </div>
            ) : (
              <AdminRegistrationForm
                players={playerOptions}
                tableaux={tableauOptions}
                tours={tourOptions}
                action={createRegistration}
              />
            )}
          </CardContent>
        </Card>

        <Card className="border-border/70">
          <CardHeader>
            <CardTitle className="text-base">Inscriptions recentes</CardTitle>
            <p className="text-sm text-muted-foreground">
              Suivez les inscriptions et gerer les doublons rapidement.
            </p>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Joueur</TableHead>
                  <TableHead>Tableau</TableHead>
                  <TableHead>Tour</TableHead>
                  <TableHead>Horaire</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {groupedRows.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="py-10 text-center">
                      Aucune inscription pour le moment.
                    </TableCell>
                  </TableRow>
                ) : (
                  groupedRows.map((row) => (
                    <TableRow key={row.id}>
                      <TableCell className="font-medium">
                        {row.player.firstName} {row.player.lastName}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-2">
                          {row.tableaux.map((tableau) => (
                            <span
                              key={tableau.id}
                              className="inline-flex items-center rounded-full border border-border/60 bg-muted px-2.5 py-1 text-xs font-medium"
                            >
                              {tableau.template.name}
                            </span>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{row.tour.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {row.tour.season?.year ?? ""}
                        </div>
                      </TableCell>
                      <TableCell>
                        {row.tableaux[0]?.startTime
                          ? formatter.format(row.tableaux[0].startTime)
                          : "-"}
                      </TableCell>
                      <TableCell>
                        {row.createdAt.toLocaleDateString("fr-FR")}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex flex-col items-end gap-2">
                          {row.ids.map((id) => (
                            <form key={id} action={deleteRegistration}>
                              <input type="hidden" name="id" value={id} />
                              <Button variant="destructive" size="sm">
                                Supprimer
                              </Button>
                            </form>
                          ))}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
