import { revalidatePath } from "next/cache";
import { CalendarDays, Clock3, DoorOpen, Layers3 } from "lucide-react";

import { AdminTourFilters } from "@/components/admin-tour-filters";
import { AdminTourCreateDialog } from "@/components/admin-tour-create-dialog";
import { AdminTourRowActions } from "@/components/admin-tour-row-actions";
import { EmptyState } from "@/components/empty-state";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
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
  getAdminTourStatusAction,
  getTourStatusLabel,
  type TourStatus,
} from "@/lib/tour-status";
import { readTourFormData, validateTourFormData } from "@/lib/tour-form";
import { buildSeasonTemplateTableauxData } from "@/lib/tableau-template-defaults";

type ActionState = {
  ok: boolean;
  message: string;
};

type PageProps = {
  searchParams: Promise<{
    q?: string;
    seasonId?: string;
    status?: string;
    clubId?: string;
    period?: string;
  }>;
};

type SeasonItem = {
  id: string;
  name: string;
  year: number;
  isActive: boolean;
};

type ClubItem = {
  id: string;
  name: string;
};

type TourItem = {
  id: string;
  name: string;
  date: Date;
  status: TourStatus;
  seasonId: string;
  clubId: string | null;
  venue: string | null;
  city: string | null;
  address: string | null;
  coverUrl: string | null;
  rulesUrl: string | null;
  season: { name: string };
  club: { name: string } | null;
  _count: {
    tableaux: number;
    registrations: number;
  };
};

const TOUR_STATUS_SEARCH_ALIASES: Record<TourStatus, string[]> = {
  DRAFT: ["draft", "brouillon"],
  OPEN: ["open", "ouvert", "ouverte", "inscription ouverte", "inscriptions ouvertes"],
  CLOSED: ["closed", "ferme", "fermee", "fermer", "clos", "cloture"],
  DONE: ["done", "termine", "terminee", "fini", "fini", "passe", "passee"],
};

function normalizeSearchText(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function getMatchingStatuses(query?: string) {
  const normalizedQuery = normalizeSearchText(query ?? "");

  if (!normalizedQuery) {
    return [] as TourStatus[];
  }

  return (Object.entries(TOUR_STATUS_SEARCH_ALIASES) as Array<
    [TourStatus, string[]]
  >)
    .filter(([, aliases]) =>
      aliases.some((alias) => normalizedQuery.includes(normalizeSearchText(alias))),
    )
    .map(([status]) => status);
}

async function createTour(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  "use server";

  await requireAdmin();

  const parsed = validateTourFormData(readTourFormData(formData));

  if (!parsed.ok) {
    return parsed;
  }

  const result = await prisma.$transaction(async (tx) => {
    const tour = await tx.tour.create({
      data: parsed.data,
      select: { id: true, date: true, seasonId: true },
    });

    const { data, skippedWithoutTime } = await buildSeasonTemplateTableauxData(
      tx,
      {
        seasonId: tour.seasonId,
        tourId: tour.id,
        tourDate: tour.date,
      },
    );

    if (data.length > 0) {
      await tx.tableau.createMany({
        data,
        skipDuplicates: true,
      });
    }

    return {
      createdTableaux: data.length,
      skippedWithoutTime,
    };
  });

  revalidatePath("/admin/tours");
  revalidatePath("/admin");
  revalidatePath("/agenda");
  revalidatePath("/tours");

  const skippedMessage =
    result.skippedWithoutTime.length > 0
      ? ` ${result.skippedWithoutTime.length} template(s) sans horaire ignore(s).`
      : "";

  return {
    ok: true,
    message: `Tour cree. ${result.createdTableaux} tableau(x) ajoute(s).${skippedMessage}`,
  };
}

async function updateTour(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  "use server";

  await requireAdmin();

  const id = String(formData.get("id") ?? "").trim();

  if (!id) {
    return { ok: false, message: "Tour introuvable." };
  }

  const parsed = validateTourFormData(readTourFormData(formData));

  if (!parsed.ok) {
    return parsed;
  }

  await prisma.tour.update({
    where: { id },
    data: parsed.data,
  });

  revalidatePath("/admin");
  revalidatePath("/admin/tours");
  revalidatePath(`/admin/tours/${id}`);
  revalidatePath("/agenda");
  revalidatePath("/tours");
  revalidatePath(`/tours/${id}`);

  return { ok: true, message: "Tour mis a jour." };
}

async function deleteTour(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  "use server";

  await requireAdmin();

  const id = String(formData.get("id") ?? "").trim();

  if (!id) {
    return { ok: false, message: "Tour introuvable." };
  }

  const deleted = await prisma.$transaction(async (tx) => {
    const tour = await tx.tour.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!tour) {
      return null;
    }

    const registrations = await tx.registration.deleteMany({
      where: { tourId: id },
    });
    const tableaux = await tx.tableau.deleteMany({
      where: { tourId: id },
    });

    await tx.tour.delete({
      where: { id },
    });

    return {
      registrations: registrations.count,
      tableaux: tableaux.count,
    };
  });

  if (!deleted) {
    return { ok: false, message: "Tour introuvable." };
  }

  revalidatePath("/admin");
  revalidatePath("/admin/tours");
  revalidatePath(`/admin/tours/${id}`);
  revalidatePath("/admin/tableaux");
  revalidatePath("/admin/inscriptions");
  revalidatePath("/agenda");
  revalidatePath("/tours");
  revalidatePath(`/tours/${id}`);

  return {
    ok: true,
    message: `Tour supprime avec ${deleted.tableaux} tableau(x) et ${deleted.registrations} inscription(s).`,
  };
}

async function toggleTourStatus(formData: FormData) {
  "use server";

  await requireAdmin();

  const id = String(formData.get("id") ?? "").trim();
  const nextStatus = String(formData.get("nextStatus") ?? "").trim();

  if (!id || (nextStatus !== "OPEN" && nextStatus !== "CLOSED")) {
    return;
  }

  const tour = await prisma.tour.findUnique({
    where: { id },
    select: { status: true },
  });

  if (!tour) {
    return;
  }

  const allowedAction = getAdminTourStatusAction(tour.status as TourStatus);

  if (!allowedAction || allowedAction.nextStatus !== nextStatus) {
    return;
  }

  await prisma.tour.update({
    where: { id },
    data: { status: nextStatus },
  });

  revalidatePath("/admin/tours");
}

export default async function AdminToursPage({ searchParams }: PageProps) {
  await requireAdmin();

  const { q, seasonId, status, clubId, period } = await searchParams;
  const query = q?.trim();
  const selectedSeasonId = seasonId?.trim() || undefined;
  const selectedStatus = (
    status && ["DRAFT", "OPEN", "CLOSED", "DONE"].includes(status)
      ? status
      : undefined
  ) as TourStatus | undefined;
  const selectedClubId = clubId?.trim() || undefined;
  const selectedPeriod =
    period === "upcoming" || period === "past" ? period : "all";
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const matchingStatuses = getMatchingStatuses(query);
  const searchClauses = query
    ? [
        { name: { contains: query, mode: "insensitive" as const } },
        { venue: { contains: query, mode: "insensitive" as const } },
        { city: { contains: query, mode: "insensitive" as const } },
        { address: { contains: query, mode: "insensitive" as const } },
        {
          season: {
            name: { contains: query, mode: "insensitive" as const },
          },
        },
        {
          club: {
            name: { contains: query, mode: "insensitive" as const },
          },
        },
        ...(matchingStatuses.length > 0
          ? [{ status: { in: matchingStatuses } }]
          : []),
      ]
    : [];

  const whereClause = {
    ...(searchClauses.length > 0 ? { OR: searchClauses } : {}),
    ...(selectedSeasonId ? { seasonId: selectedSeasonId } : {}),
    ...(selectedStatus ? { status: selectedStatus } : {}),
    ...(selectedClubId ? { clubId: selectedClubId } : {}),
    ...(selectedPeriod === "upcoming"
      ? { date: { gte: today } }
      : selectedPeriod === "past"
        ? { date: { lt: today } }
        : {}),
  };

  const [seasons, clubs, tours]: [SeasonItem[], ClubItem[], TourItem[]] =
    await Promise.all([
      prisma.season.findMany({ orderBy: { year: "desc" } }),
      prisma.club.findMany({ orderBy: { name: "asc" } }),
      prisma.tour.findMany({
        where: whereClause,
        include: {
          season: true,
          club: true,
          _count: {
            select: {
              tableaux: true,
              registrations: true,
            },
          },
        },
        orderBy: { date: "asc" },
      }),
    ]);
  const selectedSeason = seasons.find((season) => season.id === selectedSeasonId);
  const selectedClub = clubs.find((club) => club.id === selectedClubId);
  const hasActiveCriteria = Boolean(
    query || selectedSeasonId || selectedStatus || selectedClubId || selectedPeriod !== "all",
  );
  const activeCriteria = [
    ...(query ? [`Recherche: ${query}`] : []),
    ...(selectedSeason
      ? [`Saison: ${selectedSeason.name} (${selectedSeason.year})`]
      : []),
    ...(selectedStatus ? [`Statut: ${getTourStatusLabel(selectedStatus)}`] : []),
    ...(selectedClub ? [`Club: ${selectedClub.name}`] : []),
    ...(selectedPeriod === "upcoming"
      ? ["Periode: A venir"]
      : selectedPeriod === "past"
        ? ["Periode: Passes"]
        : []),
  ];

  const formatter = new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  const upcomingTours = tours.filter((tour) => tour.date >= today);
  const openRegistrationTours = tours.filter((tour) => tour.status === "OPEN");
  const toursWithoutTableaux = tours.filter((tour) => tour._count.tableaux === 0);
  const pastToursToClose = tours.filter(
    (tour) => tour.date < today && tour.status !== "DONE",
  );

  const stats = [
    {
      label: "Tours a venir",
      value: upcomingTours.length.toString(),
      hint:
        upcomingTours.length > 0
          ? `${upcomingTours[0]?.name ?? ""} en tete de planning`
          : "Aucune date future dans cette vue",
      icon: CalendarDays,
    },
    {
      label: "Inscriptions ouvertes",
      value: openRegistrationTours.length.toString(),
      hint:
        openRegistrationTours.length > 0
          ? `${openRegistrationTours.reduce(
              (sum, tour) => sum + tour._count.registrations,
              0,
            )} inscription(s) cumulee(s)`
          : "Aucun tour ouvert actuellement",
      icon: DoorOpen,
    },
    {
      label: "Sans tableaux",
      value: toursWithoutTableaux.length.toString(),
      hint:
        toursWithoutTableaux.length > 0
          ? "Configuration a completer"
          : "Tous les tours ont au moins un tableau",
      icon: Layers3,
    },
    {
      label: "Passes a cloturer",
      value: pastToursToClose.length.toString(),
      hint:
        pastToursToClose.length > 0
          ? "Marquez-les termines quand le tour est fini"
          : "Aucun tour en attente de cloture",
      icon: Clock3,
    },
  ];

  return (
    <section className="page">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="page-header">
          <h1 className="page-title">Tours</h1>
          <p className="page-subtitle">Gerez les tours par saison.</p>
        </div>

        <AdminTourCreateDialog
          action={createTour}
          seasons={seasons}
          clubs={clubs}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;

          return (
            <Card key={stat.label} className="surface border-border/60">
              <CardContent className="flex items-start justify-between gap-4 pt-6">
                <div className="space-y-1">
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    {stat.label}
                  </p>
                  <p className="text-3xl font-semibold text-foreground">
                    {stat.value}
                  </p>
                  <p className="text-xs text-muted-foreground">{stat.hint}</p>
                </div>
                <div className="rounded-2xl border border-border/60 bg-muted/40 p-3 text-muted-foreground">
                  <Icon className="h-5 w-5" />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <AdminTourFilters
        seasons={seasons}
        clubs={clubs}
        currentSeasonId={selectedSeasonId}
        currentStatus={selectedStatus}
        currentClubId={selectedClubId}
        currentPeriod={selectedPeriod}
      />

      {hasActiveCriteria ? (
        <div className="surface flex flex-col gap-3 p-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-medium text-foreground">
                Resultats pour {tours.length} tour(s)
              </p>
              <p className="text-xs text-muted-foreground">
                Les filtres et la recherche ci-dessous sont actuellement appliques.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {activeCriteria.map((criterion) => (
              <Badge key={criterion} variant="secondary">
                {criterion}
              </Badge>
            ))}
          </div>
        </div>
      ) : null}

      {seasons.length === 0 || clubs.length === 0 ? (
        <div className="surface p-4 text-sm text-muted-foreground">
          {seasons.length === 0
            ? "Aucune saison disponible. Creez une saison pour ajouter un tour."
            : "Aucun club disponible. Creez un club pour ajouter un tour."}
        </div>
      ) : null}

      <div className="surface">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nom</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead>Organisation / lieu</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tours.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="py-6">
                  <EmptyState
                    title="Aucun tour pour le moment"
                    description="Creez un tour pour lier les tableaux."
                  />
                </TableCell>
              </TableRow>
            ) : (
              tours.map((tour) => {
                const statusAction = getAdminTourStatusAction(tour.status);

                return (
                  <TableRow key={tour.id}>
                    <TableCell className="min-w-0">
                      <div className="space-y-1">
                        <p className="font-medium text-foreground">{tour.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {tour.season.name} · {tour._count.registrations} inscription(s) ·{" "}
                          {tour._count.tableaux} tableau(x)
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>{formatter.format(tour.date)}</TableCell>
                    <TableCell>
                      <span className="badge-pill">
                        {getTourStatusLabel(tour.status)}
                      </span>
                    </TableCell>
                    <TableCell className="min-w-0">
                      <div className="space-y-1">
                        <p className="text-sm text-foreground">
                          {tour.club?.name ?? "Club non renseigne"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {tour.venue ?? "Salle non renseignee"}
                          {tour.city ? ` · ${tour.city}` : ""}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <AdminTourRowActions
                        tourId={tour.id}
                        tourName={tour.name}
                        tourStatus={tour.status}
                        statusLabel={getTourStatusLabel(tour.status)}
                        statusAction={statusAction}
                        toggleAction={toggleTourStatus}
                        deleteAction={deleteTour}
                        editAction={updateTour}
                        editDialogProps={{
                          seasons,
                          clubs,
                          tour,
                        }}
                      />
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </section>
  );
}
