import { revalidatePath } from "next/cache";

import { AdminTourCreateDialog } from "@/components/admin-tour-create-dialog";
import { AdminDeleteForm } from "@/components/admin-delete-form";
import { EmptyState } from "@/components/empty-state";
import { Button } from "@/components/ui/button";
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

type ActionState = {
  ok: boolean;
  message: string;
};

function normalizeSupabasePublicUrl(value: string) {
  if (!value) return value;
  const signedMarker = "/storage/v1/object/sign/";
  const publicMarker = "/storage/v1/object/public/";
  if (value.includes(signedMarker)) {
    const [base] = value.split("?");
    return base.replace(signedMarker, publicMarker);
  }
  return value;
}

type PageProps = {
  searchParams: Promise<{ q?: string }>;
};

async function createTour(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  "use server";

  await requireAdmin();

  const seasonId = String(formData.get("seasonId") ?? "").trim();
  const name = String(formData.get("name") ?? "").trim();
  const dateValue = String(formData.get("date") ?? "").trim();
  const clubId = String(formData.get("clubId") ?? "").trim();
  const venue = String(formData.get("venue") ?? "").trim();
  const city = String(formData.get("city") ?? "").trim();
  const address = String(formData.get("address") ?? "").trim();
  const coverUrl = normalizeSupabasePublicUrl(
    String(formData.get("coverUrl") ?? "").trim(),
  );
  const rulesUrl = normalizeSupabasePublicUrl(
    String(formData.get("rulesUrl") ?? "").trim(),
  );

  if (!seasonId || !name || !dateValue || !venue || !clubId) {
    return {
      ok: false,
      message: "Saison, club, nom, date et salle obligatoires.",
    };
  }

  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) {
    return { ok: false, message: "Date invalide." };
  }

  await prisma.tour.create({
    data: {
      name,
      date,
      venue: venue || null,
      city: city || null,
      address: address || null,
      coverUrl: coverUrl || null,
      rulesUrl: rulesUrl || null,
      seasonId,
      clubId,
    },
  });

  revalidatePath("/admin/tours");

  return { ok: true, message: "Tour créé." };
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

  const linkedTableaux = await prisma.tableau.count({
    where: { tourId: id },
  });

  if (linkedTableaux > 0) {
    return {
      ok: false,
      message: "Supprimez d'abord les tableaux liés à ce tour.",
    };
  }

  await prisma.tour.delete({
    where: { id },
  });

  revalidatePath("/admin/tours");

  return { ok: true, message: "Tour supprimé." };
}

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

  revalidatePath("/admin/tours");
}

export default async function AdminToursPage({ searchParams }: PageProps) {
  await requireAdmin();

  const { q } = await searchParams;
  const query = q?.trim();

  type SeasonItem = { id: string; name: string; year: number; isActive: boolean };
  type ClubItem = { id: string; name: string };
  type TourItem = {
    id: string;
    name: string;
    date: Date;
    status: "DRAFT" | "OPEN" | "CLOSED" | "DONE";
    venue: string | null;
    city: string | null;
    season: { name: string };
    club: { name: string } | null;
  };

  const [seasons, clubs, tours]: [SeasonItem[], ClubItem[], TourItem[]] =
    await Promise.all([
      prisma.season.findMany({ orderBy: { year: "desc" } }),
      prisma.club.findMany({ orderBy: { name: "asc" } }),
      prisma.tour.findMany({
        where: query
          ? {
              OR: [
                { name: { contains: query, mode: "insensitive" } },
                { venue: { contains: query, mode: "insensitive" } },
                { city: { contains: query, mode: "insensitive" } },
                { address: { contains: query, mode: "insensitive" } },
                { season: { name: { contains: query, mode: "insensitive" } } },
              ],
            }
          : undefined,
        include: { season: true, club: true },
        orderBy: { date: "asc" },
      }),
    ]);

  const formatter = new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  return (
    <section className="page">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="page-header">
          <h1 className="page-title">Tours</h1>
          <p className="page-subtitle">Gérez les tours par saison.</p>
        </div>

        <AdminTourCreateDialog
          action={createTour}
          seasons={seasons}
          clubs={clubs}
        />
      </div>

      {seasons.length === 0 || clubs.length === 0 ? (
        <div className="surface p-4 text-sm text-muted-foreground">
          {seasons.length === 0
            ? "Aucune saison disponible. Créez une saison pour ajouter un tour."
            : "Aucun club disponible. Créez un club pour ajouter un tour."}
        </div>
      ) : null}

      <div className="surface">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nom</TableHead>
              <TableHead>Saison</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Inscriptions</TableHead>
              <TableHead>Club</TableHead>
              <TableHead>Salle</TableHead>
              <TableHead>Ville</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tours.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="py-6">
                  <EmptyState
                    title="Aucun tour pour le moment"
                    description="Créez un tour pour lier les tableaux."
                  />
                </TableCell>
              </TableRow>
            ) : (
              tours.map((tour: TourItem) => (
                <TableRow key={tour.id}>
                  <TableCell className="font-medium">{tour.name}</TableCell>
                  <TableCell>{tour.season.name}</TableCell>
                  <TableCell>{formatter.format(tour.date)}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className="badge-pill">
                        {tour.status === "OPEN"
                          ? "Ouvert"
                          : tour.status === "CLOSED"
                            ? "Fermé"
                            : "Brouillon"}
                      </span>
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
                  </TableCell>
                  <TableCell>{tour.club?.name ?? "-"}</TableCell>
                  <TableCell>{tour.venue ?? "-"}</TableCell>
                  <TableCell>{tour.city ?? "-"}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex flex-wrap justify-end gap-2">
                      <Button asChild size="sm" variant="secondary">
                        <a href={`/admin/tours/${tour.id}`}>Dashboard</a>
                      </Button>
                      <AdminDeleteForm id={tour.id} action={deleteTour} />
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </section>
  );
}
