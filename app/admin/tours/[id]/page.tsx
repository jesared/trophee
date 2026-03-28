import { revalidatePath } from "next/cache";
import { notFound } from "next/navigation";

import { AdminDeleteForm } from "@/components/admin-delete-form";
import { AdminTourRegistrations } from "@/components/admin-tour-registrations";
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
import { requireAdmin } from "@/lib/require-admin";
import { prisma } from "@/lib/prisma";

type PageProps = {
  params: Promise<{ id: string }>;
};

async function toggleTourStatus(formData: FormData) {
  "use server";

  await requireAdmin();

  const id = String(formData.get("id") ?? "").trim();
  const nextStatus = String(formData.get("nextStatus") ?? "").trim();

  if (!id || (nextStatus !== "OPEN" && nextStatus !== "CLOSED")) {
    return;
  }

  await prisma.tour.update({
    where: { id },
    data: { status: nextStatus },
  });

  revalidatePath(`/admin/tours/${id}`);
  revalidatePath("/admin/tours");
}

async function deleteTableau(
  _prevState: { ok: boolean; message: string },
  formData: FormData,
): Promise<{ ok: boolean; message: string }> {
  "use server";

  await requireAdmin();

  const id = String(formData.get("id") ?? "").trim();
  if (!id) {
    return { ok: false, message: "Tableau introuvable." };
  }

  const tableau = await prisma.tableau.findUnique({
    where: { id },
    select: { tourId: true },
  });

  await prisma.tableau.delete({ where: { id } });
  revalidatePath("/admin/tours");
  if (tableau?.tourId) {
    revalidatePath(`/admin/tours/${tableau.tourId}`);
  }
  return { ok: true, message: "Tableau supprimé." };
}

export default async function AdminTourDashboard({ params }: PageProps) {
  await requireAdmin();

  const { id } = await params;

  const tour = await prisma.tour.findUnique({
    where: { id },
    include: {
      season: true,
      club: true,
    },
  });

  if (!tour) {
    notFound();
  }

  const [tableaux, registrations] = await Promise.all([
    prisma.tableau.findMany({
      where: { tourId: id },
      include: { template: true },
      orderBy: { startTime: "asc" },
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
    { label: "Présents", value: presentCount },
    { label: "Absents", value: absentCount },
    { label: "Tableaux", value: tableaux.length },
    { label: "Taux présence", value: `${presenceRate}%` },
  ];

  const tableauStats = registrations.reduce(
    (acc, registration) => {
      const key = registration.tableauId;
      const current = acc.get(key) ?? { total: 0, present: 0 };
      current.total += 1;
      if (registration.presence === "PRESENT") {
        current.present += 1;
      }
      acc.set(key, current);
      return acc;
    },
    new Map<string, { total: number; present: number }>(),
  );

  const grouped = registrations.reduce(
    (acc, registration) => {
      const key = `${registration.playerId}`;
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
    tableaux: row.tableaux.map((tableau) => ({
      id: tableau.id,
      name: tableau.template.name,
    })),
  }));

  const tableauOptions = tableaux.map((tableau) => ({
    id: tableau.id,
    name: tableau.template.name,
  }));

  const dateFormatter = new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
  const timeFormatter = new Intl.DateTimeFormat("fr-FR", {
    timeStyle: "short",
    timeZone: "Europe/Paris",
  });

  return (
    <section className="page">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="page-header">
          <h1 className="page-title">{tour.name}</h1>
          <p className="page-subtitle">
            {tour.season.name} · {dateFormatter.format(tour.date)}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild variant="secondary" size="sm">
            <a href={`/admin/inscriptions?tourId=${tour.id}`}>
              Voir inscriptions
            </a>
          </Button>
          <Button asChild variant="secondary" size="sm">
            <a href={`/admin/tours/${tour.id}/checkin`}>Check-in mobile</a>
          </Button>
          <Button asChild variant="secondary" size="sm">
            <a href={`/api/admin/registrations/export?tourId=${tour.id}`}>
              Export CSV
            </a>
          </Button>
          <form action={toggleTourStatus}>
            <input type="hidden" name="id" value={tour.id} />
            <input
              type="hidden"
              name="nextStatus"
              value={tour.status === "OPEN" ? "CLOSED" : "OPEN"}
            />
            <Button size="sm" variant="secondary">
              {tour.status === "OPEN" ? "Fermer" : "Ouvrir"}
            </Button>
          </form>
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
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Infos
            </CardTitle>
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
                Dernières inscriptions sur ce tour.
              </p>
            </div>
            <Button asChild size="sm" variant="secondary">
              <a href={`/admin/inscriptions?tourId=${tour.id}`}>Gérer</a>
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
