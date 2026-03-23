import { notFound } from "next/navigation";
import { revalidatePath } from "next/cache";

import { AdminDeleteForm } from "@/components/admin-delete-form";
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
) {
  "use server";

  await requireAdmin();

  const id = String(formData.get("id") ?? "").trim();
  if (!id) return;

  const tableau = await prisma.tableau.findUnique({
    where: { id },
    select: { tourId: true },
  });

  await prisma.tableau.delete({ where: { id } });
  revalidatePath("/admin/tours");
  if (tableau?.tourId) {
    revalidatePath(`/admin/tours/${tableau.tourId}`);
  }
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

  const stats = [
    { label: "Tableaux", value: tableaux.length },
    { label: "Inscriptions", value: registrations.length },
    { label: "Joueurs", value: new Set(registrations.map((r) => r.playerId)).size },
  ];

  const grouped = registrations.reduce((acc, registration) => {
    const key = `${registration.playerId}`;
    const existing = acc.get(key);
    if (!existing) {
      acc.set(key, {
        player: registration.player,
        tableaux: [registration.tableau],
        createdAt: registration.createdAt,
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
  }, new Map<string, { player: typeof registrations[number]["player"]; tableaux: typeof registrations[number]["tableau"][]; createdAt: Date; ids: string[] }>());

  const groupedRows = Array.from(grouped.values()).sort(
    (a, b) => b.createdAt.getTime() - a.createdAt.getTime(),
  );

  const dateFormatter = new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
  const timeFormatter = new Intl.DateTimeFormat("fr-FR", {
    timeStyle: "short",
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
        <Card className="sm:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Infos
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-1 text-sm text-muted-foreground">
            <div>Club: {tour.club?.name ?? "-"}</div>
            <div>Salle: {tour.venue ?? "-"}</div>
            <div>Ville: {tour.city ?? "-"}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.1fr_1.6fr]">
        <Card className="border-border/70">
          <CardHeader className="flex items-center justify-between">
            <CardTitle className="text-base">Tableaux</CardTitle>
            <Button asChild size="sm" variant="secondary">
              <a href="/admin/tableaux">Ajouter un tableau</a>
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nom</TableHead>
                  <TableHead>Horaire</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tableaux.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} className="py-6">
                      <EmptyState
                        title="Aucun tableau"
                        description="Ajoutez un tableau pour ouvrir les inscriptions."
                      />
                    </TableCell>
                  </TableRow>
                ) : (
                  tableaux.map((tableau) => (
                    <TableRow key={tableau.id}>
                      <TableCell className="font-medium">
                        {tableau.template.name}
                      </TableCell>
                      <TableCell>
                        {timeFormatter.format(tableau.startTime)}
                      </TableCell>
                      <TableCell className="text-right">
                        <AdminDeleteForm
                          id={tableau.id}
                          action={deleteTableau}
                        />
                        <input type="hidden" name="tourId" value={tour.id} />
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card className="border-border/70">
          <CardHeader className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base">Inscriptions</CardTitle>
              <p className="text-sm text-muted-foreground">
                Dernieres inscriptions sur ce tour.
              </p>
            </div>
            <Button asChild size="sm" variant="secondary">
              <a href={`/admin/inscriptions?tourId=${tour.id}`}>
                Gerer
              </a>
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Joueur</TableHead>
                  <TableHead>Tableaux</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {groupedRows.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} className="py-6">
                      <EmptyState
                        title="Aucune inscription"
                        description="Ouvrez les inscriptions pour commencer."
                      />
                    </TableCell>
                  </TableRow>
                ) : (
                  groupedRows.map((row) => (
                    <TableRow key={row.player.id}>
                      <TableCell className="font-medium">
                        {row.player.firstName} {row.player.lastName}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-2">
                          {row.tableaux.map((tableau) => (
                            <span key={tableau.id} className="badge-pill">
                              {tableau.template.name}
                            </span>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>
                        {dateFormatter.format(row.createdAt)}
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
