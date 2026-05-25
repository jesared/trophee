import Link from "next/link";
import { revalidatePath } from "next/cache";
import { notFound } from "next/navigation";
import { PencilLine } from "lucide-react";

import { AdminTourEditDialog } from "@/components/admin-tour-edit-dialog";
import { AdminTourRegistrations } from "@/components/admin-tour-registrations";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";
import { sortByTableauNaturalOrder } from "@/lib/tableau-order";
import {
  getAdminTourStatusAction,
  getTourStatusLabel,
  type TourStatus,
} from "@/lib/tour-status";
import { readTourFormData, validateTourFormData } from "@/lib/tour-form";

type PageProps = {
  params: Promise<{ id: string }>;
  searchParams?: Promise<{ edit?: string }>;
};

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

  revalidatePath(`/admin/tours/${id}`);
  revalidatePath("/admin/tours");
}

async function updateTour(
  _prevState: { ok: boolean; message: string },
  formData: FormData,
): Promise<{ ok: boolean; message: string }> {
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

export default async function AdminTourDashboard({
  params,
  searchParams,
}: PageProps) {
  await requireAdmin();

  const { id } = await params;
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const defaultEditOpen = resolvedSearchParams?.edit === "1";

  const [tour, seasons, clubs] = await Promise.all([
    prisma.tour.findUnique({
      where: { id },
      include: {
        season: true,
        club: true,
      },
    }),
    prisma.season.findMany({ orderBy: { year: "desc" } }),
    prisma.club.findMany({ orderBy: { name: "asc" } }),
  ]);

  if (!tour) {
    notFound();
  }

  const [tableaux, registrations] = await Promise.all([
    prisma.tableau.findMany({
      where: { tourId: id },
      include: { template: true },
      orderBy: [{ template: { name: "asc" } }, { startTime: "asc" }],
    }),
    prisma.registration.findMany({
      where: { tourId: id },
      include: {
        player: true,
        tableau: { include: { template: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const totalRegistrations = registrations.length;
  const orderedTableaux = sortByTableauNaturalOrder(
    tableaux,
    (tableau) => tableau.template.name,
    (tableau) => tableau.startTime,
  );
  const uniquePlayers = new Set(registrations.map((r) => r.playerId)).size;
  const presentCount = registrations.filter(
    (r) => r.presence === "PRESENT",
  ).length;
  const absentCount = registrations.filter(
    (r) => r.presence === "ABSENT",
  ).length;
  const presenceRate =
    totalRegistrations > 0
      ? Math.round((presentCount / totalRegistrations) * 100)
      : 0;

  const stats = [
    { label: "Inscriptions", value: totalRegistrations },
    { label: "Joueurs", value: uniquePlayers },
    { label: "Presents", value: presentCount },
    { label: "Absents", value: absentCount },
    { label: "Tableaux", value: orderedTableaux.length },
    { label: "Taux presence", value: `${presenceRate}%` },
  ];

  const grouped = registrations.reduce(
    (acc, registration) => {
      const key = registration.playerId;
      const existing = acc.get(key);
      if (!existing) {
        acc.set(key, {
          player: registration.player,
          tableaux: [registration.tableau],
          createdAt: registration.createdAt,
          presence: registration.presence,
          ids: [registration.id],
        });
        return acc;
      }
      existing.tableaux.push(registration.tableau);
      existing.ids.push(registration.id);
      if (registration.presence !== "UNKNOWN") {
        existing.presence = registration.presence;
      }
      if (registration.createdAt > existing.createdAt) {
        existing.createdAt = registration.createdAt;
      }
      return acc;
    },
    new Map<
      string,
      {
        player: typeof registrations[number]["player"];
        tableaux: typeof registrations[number]["tableau"][];
        createdAt: Date;
        ids: string[];
        presence: "UNKNOWN" | "PRESENT" | "ABSENT";
      }
    >(),
  );

  const groupedRows = Array.from(grouped.values()).sort(
    (a, b) => b.createdAt.getTime() - a.createdAt.getTime(),
  );

  const registrationRows = groupedRows.map((row) => ({
    playerId: row.player.id,
    playerName: `${row.player.firstName} ${row.player.lastName}`.trim(),
    createdAt: row.createdAt.toISOString(),
    presence: row.presence ?? "UNKNOWN",
    ids: row.ids,
    tableaux: sortByTableauNaturalOrder(
      row.tableaux,
      (tableau) => tableau.template.name,
    ).map((tableau) => ({
      id: tableau.id,
      name: tableau.template.name,
    })),
  }));

  const tableauOptions = orderedTableaux.map((tableau) => ({
    id: tableau.id,
    name: tableau.template.name,
  }));

  const dateFormatter = new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
  const statusAction = getAdminTourStatusAction(tour.status as TourStatus);

  return (
    <section className="page">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="page-header">
          <h1 className="page-title">{tour.name}</h1>
          <p className="page-subtitle">
            {tour.season.name} · {dateFormatter.format(tour.date)}
          </p>
          <div className="mt-2">
            <span className="badge-pill">
              {getTourStatusLabel(tour.status as TourStatus)}
            </span>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <AdminTourEditDialog
            action={updateTour}
            seasons={seasons}
            clubs={clubs}
            defaultOpen={defaultEditOpen}
            tour={{
              id: tour.id,
              name: tour.name,
              date: tour.date,
              seasonId: tour.seasonId,
              clubId: tour.clubId,
              venue: tour.venue,
              city: tour.city,
              address: tour.address,
              coverUrl: tour.coverUrl,
              rulesUrl: tour.rulesUrl,
            }}
            trigger={
              <Button size="sm" variant="secondary">
                Modifier
              </Button>
            }
          />
          <Button asChild variant="secondary" size="sm">
            <Link href={`/tours/${tour.id}`}>Voir le tour</Link>
          </Button>
          <Button asChild variant="secondary" size="sm">
            <Link href={`/admin/inscriptions?tourId=${tour.id}`}>
              Voir inscriptions
            </Link>
          </Button>
          <Button asChild variant="secondary" size="sm">
            <Link href={`/admin/tours/${tour.id}/checkin`}>Check-in mobile</Link>
          </Button>
          <Button asChild variant="secondary" size="sm">
            <Link href={`/api/admin/registrations/export?tourId=${tour.id}`}>
              Export CSV
            </Link>
          </Button>
          {statusAction ? (
            <form action={toggleTourStatus}>
              <input type="hidden" name="id" value={tour.id} />
              <input
                type="hidden"
                name="nextStatus"
                value={statusAction.nextStatus}
              />
              <Button size="sm" variant="secondary">
                {statusAction.label}
              </Button>
            </form>
          ) : null}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-6">
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
        <Card className="sm:col-span-2 xl:col-span-3">
          <CardHeader className="flex flex-col gap-3 pb-2 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Infos
              </CardTitle>
            </div>
            <Button asChild size="sm" variant="secondary">
              <Link href={`/admin/tours/${tour.id}?edit=1`} className="gap-2">
                <PencilLine className="h-4 w-4" />
                Modifier le tour
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-1 text-sm text-muted-foreground">
            <div>Club : {tour.club?.name ?? "-"}</div>
            <div>Salle : {tour.venue ?? "-"}</div>
            <div>Ville : {tour.city ?? "-"}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6">
        <Card className="border-border/70">
          <CardHeader className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base">Inscriptions</CardTitle>
              <p className="text-sm text-muted-foreground">
                Dernieres inscriptions sur ce tour.
              </p>
            </div>
            <Button asChild size="sm" variant="secondary">
              <Link href={`/admin/inscriptions?tourId=${tour.id}`}>Gerer</Link>
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            <div className="p-4">
              <AdminTourRegistrations
                tourId={tour.id}
                rows={registrationRows}
                tableaux={tableauOptions}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
