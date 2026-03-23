import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";

import { AdminRegistrationActions } from "@/components/admin-registration-actions";
import { AdminRegistrationFilters } from "@/components/admin-registration-filters";
import { AdminRegistrationForm } from "@/components/admin-registration-form";
import { EmptyState } from "@/components/empty-state";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import {
  fetchFfttLicence,
  initFfttSerie,
  isFfttEnabled,
  parseFfttSerie,
} from "@/lib/fftt";

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
    include: {
      tour: { select: { status: true } },
      template: { select: { minPoints: true, maxPoints: true } },
    },
  });

  if (!tableau) {
    return { ok: false, message: "Tableau introuvable." };
  }

  if (tableau.tourId !== tourId) {
    return { ok: false, message: "Tableau non associe a ce tour." };
  }

  if (tableau.tour.status !== "OPEN") {
    return { ok: false, message: "Inscriptions fermees pour ce tour." };
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

  const player = await prisma.player.findUnique({
    where: { id: playerId },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      licence: true,
      club: true,
      points: true,
      ffttSerie: true,
    },
  });

  if (!player) {
    return { ok: false, message: "Joueur introuvable." };
  }

  const ffttEnabled = isFfttEnabled();
  const enforceFftt = process.env.FFTT_ENFORCE === "true";
  let currentPoints = player.points ?? null;

  if (ffttEnabled && player.licence) {
    try {
      let serie = player.ffttSerie ?? null;
      if (!serie) {
        const initXml = await initFfttSerie();
        const parsedSerie = parseFfttSerie(initXml);
        if (parsedSerie) {
          serie = parsedSerie;
          await prisma.player.update({
            where: { id: player.id },
            data: { ffttSerie: parsedSerie },
          });
        }
      }

      const ffttInfo = await fetchFfttLicence(player.licence, serie ?? undefined);
      const updates: Record<string, unknown> = {};

      if (ffttInfo.club && ffttInfo.club !== player.club) {
        updates.club = ffttInfo.club;
      }
      if (ffttInfo.points != null && ffttInfo.points !== player.points) {
        updates.points = ffttInfo.points;
        currentPoints = ffttInfo.points;
      }
      if (ffttInfo.firstName && ffttInfo.firstName !== player.firstName) {
        updates.firstName = ffttInfo.firstName;
      }
      if (ffttInfo.lastName && ffttInfo.lastName !== player.lastName) {
        updates.lastName = ffttInfo.lastName;
      }

      if (Object.keys(updates).length > 0) {
        await prisma.player.update({
          where: { id: player.id },
          data: { ...updates, ffttLastSync: new Date() },
        });
      }
    } catch (error) {
      if (enforceFftt) {
        return {
          ok: false,
          message: "Verification FFTT impossible. Reessayez plus tard.",
        };
      }
    }
  }

  const { minPoints, maxPoints } = tableau.template;
  if (currentPoints != null) {
    if (minPoints != null && currentPoints < minPoints) {
      return { ok: false, message: "Points insuffisants pour ce tableau." };
    }
    if (maxPoints != null && currentPoints > maxPoints) {
      return { ok: false, message: "Points trop eleves pour ce tableau." };
    }
  }

  try {
    await prisma.registration.create({
      data: {
        playerId,
        tableauId,
        tourId,
      },
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2002") {
        return { ok: false, message: "Inscription deja existante." };
      }
    }
    return { ok: false, message: "Erreur lors de la creation." };
  }

  revalidatePath("/admin/inscriptions");

  return { ok: true, message: "Inscription creee." };
}

export default async function AdminRegistrationsPage({ searchParams }: PageProps) {
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
    registrationFilters.length > 0
      ? { AND: registrationFilters }
      : undefined;

  type TourItem = {
    id: string;
    name: string;
    date: Date;
    season: { year: number };
  };
  type PlayerItem = { id: string; firstName: string; lastName: string };
  type TableauItem = {
    id: string;
    tourId: string;
    startTime: Date | null;
    template: { name: string };
    tour: { name: string; season: { year: number } };
  };
  type RegistrationItem = {
    id: string;
    playerId: string;
    tourId: string;
    createdAt: Date;
    player: PlayerItem;
    tableau: TableauItem;
    tour: { name: string; season: { year: number } };
  };

  const [tours, players, tableaux, registrations]: [
    TourItem[],
    PlayerItem[],
    TableauItem[],
    RegistrationItem[],
  ] = await Promise.all([
    prisma.tour.findMany({
      select: {
        id: true,
        name: true,
        date: true,
        season: { select: { year: true } },
      },
      orderBy: { date: "asc" },
    }),
    prisma.player.findMany({
      select: { id: true, firstName: true, lastName: true },
      orderBy: { lastName: "asc" },
    }),
    prisma.tableau.findMany({
      include: {
        template: { select: { name: true } },
        tour: { select: { name: true, season: { select: { year: true } } } },
      },
      orderBy: { startTime: "asc" },
    }),
    prisma.registration.findMany({
      where: registrationWhere,
      include: {
        player: { select: { id: true, firstName: true, lastName: true } },
        tableau: {
          include: {
            template: { select: { name: true } },
            tour: { select: { name: true, season: { select: { year: true } } } },
          },
        },
        tour: { select: { name: true, season: { select: { year: true } } } },
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

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const playerOptions = players.map((player: PlayerItem) => ({
    id: player.id,
    label: `${player.firstName} ${player.lastName}`,
  }));

  const tourOptions = tours.map((tour: TourItem) => ({
    id: tour.id,
    name: tour.name,
    label: `${tour.name} - ${tour.season.year}`,
  }));

  const upcomingTourIds = new Set(
    tours.filter((tour) => tour.date >= today).map((tour) => tour.id),
  );

  const tourOptionsUpcoming = tourOptions.filter((tour) =>
    upcomingTourIds.has(tour.id),
  );

  const tableauOptions = tableaux.map((tableau: TableauItem) => ({
    id: tableau.id,
    tourId: tableau.tourId,
    label: `${tableau.template.name} - ${tableau.tour.name} (${tableau.tour.season.year})`,
  }));

  const tableauOptionsUpcoming = tableauOptions.filter((tableau) =>
    upcomingTourIds.has(tableau.tourId),
  );

  const grouped = registrations.reduce(
    (
      acc: Map<
        string,
        {
          id: string;
          tourId: string;
          player: typeof registrations[number]["player"];
          tour: typeof registrations[number]["tour"];
          createdAt: Date;
          tableaux: typeof registrations[number]["tableau"][];
          ids: string[];
        }
      >,
      registration: (typeof registrations)[number],
    ) => {
      const key = `${registration.playerId}-${registration.tourId}`;
      const existing = acc.get(key);

      if (!existing) {
        acc.set(key, {
          id: key,
          tourId: registration.tourId,
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
    new Map(),
  );

  const groupedRows = Array.from(grouped.values()).sort(
    (a, b) => b.createdAt.getTime() - a.createdAt.getTime(),
  );

  const tableauxByTour = tableaux.reduce((acc, tableau) => {
    const list = acc.get(tableau.tourId) ?? [];
    list.push(tableau);
    acc.set(tableau.tourId, list);
    return acc;
  }, new Map<string, TableauItem[]>());

  const formatter = new Intl.DateTimeFormat("fr-FR", {
    dateStyle: "medium",
    timeStyle: "short",
  });

  return (
    <section className="page">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="page-header">
          <h1 className="page-title">Inscriptions</h1>
          <p className="page-subtitle">
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
            tableauOptionsUpcoming.length === 0 ||
            tourOptionsUpcoming.length === 0 ? (
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
                tableaux={tableauOptionsUpcoming}
                tours={tourOptionsUpcoming}
                action={createRegistration}
              />
            )}
          </CardContent>
        </Card>

        <Card className="border-border/70">
          <CardHeader>
            <CardTitle className="text-base">Inscriptions recentes</CardTitle>
            <p className="text-sm text-muted-foreground">
              Suivez les inscriptions et gerez les doublons rapidement.
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
                    <TableCell colSpan={6} className="py-6">
                      <EmptyState
                        title="Aucune inscription pour le moment"
                        description="Creez une inscription pour apparaitre ici."
                      />
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
                          {row.tableaux.map((tableau: TableauItem) => (
                            <span key={tableau.id} className="badge-pill">
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
                        <AdminRegistrationActions
                          playerId={row.player.id}
                          playerName={`${row.player.firstName} ${row.player.lastName}`}
                          tourId={row.tourId}
                          tourName={row.tour.name}
                          tableauOptions={(tableauxByTour.get(row.tourId) ?? []).map(
                            (tableau) => ({
                              id: tableau.id,
                              label: `${tableau.template.name} · ${tableau.tour.season.year}`,
                            }),
                          )}
                          selectedTableauIds={row.tableaux.map(
                            (tableau: TableauItem) => tableau.id,
                          )}
                          registrationIds={row.ids}
                        />
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
