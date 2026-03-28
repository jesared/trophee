import { revalidatePath } from "next/cache";
import { notFound } from "next/navigation";

import {
  AdminTourCheckinClient,
  type CheckinRow,
} from "@/components/admin-tour-checkin-client";
import { Button } from "@/components/ui/button";
import { requireAdmin } from "@/lib/require-admin";
import { prisma } from "@/lib/prisma";

type PageProps = {
  params: Promise<{ id: string }>;
};

async function updatePresence(formData: FormData) {
  "use server";

  await requireAdmin();

  const ids = String(formData.get("ids") ?? "")
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);
  const presence = String(formData.get("presence") ?? "").trim();

  if (!ids.length || !["UNKNOWN", "PRESENT", "ABSENT"].includes(presence)) {
    return;
  }

  await prisma.registration.updateMany({
    where: { id: { in: ids } },
    data: { presence: presence as "UNKNOWN" | "PRESENT" | "ABSENT" },
  });

  const tourId = String(formData.get("tourId") ?? "").trim();
  if (tourId) {
    revalidatePath(`/admin/tours/${tourId}/checkin`);
    revalidatePath(`/admin/tours/${tourId}`);
  }
}

export default async function AdminTourCheckinPage({ params }: PageProps) {
  await requireAdmin();

  const { id } = await params;

  const tour = await prisma.tour.findUnique({
    where: { id },
    select: { id: true, name: true, date: true, season: { select: { name: true } } },
  });

  if (!tour) {
    notFound();
  }

  const registrations = await prisma.registration.findMany({
    where: { tourId: id },
    include: {
      player: true,
      tableau: { include: { template: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const grouped = registrations.reduce(
    (acc, registration) => {
      const key = registration.playerId;
      const existing = acc.get(key);
      if (!existing) {
        acc.set(key, {
          playerId: registration.playerId,
          playerName: `${registration.player.firstName} ${registration.player.lastName}`.trim(),
          tableaux: [
            {
              id: registration.tableauId,
              name: registration.tableau.template.name,
              presence: registration.presence,
              registrationId: registration.id,
            },
          ],
        });
        return acc;
      }
      existing.tableaux.push({
        id: registration.tableauId,
        name: registration.tableau.template.name,
        presence: registration.presence,
        registrationId: registration.id,
      });
      return acc;
    },
    new Map<string, CheckinRow>(),
  );

  const rows: CheckinRow[] = Array.from(grouped.values()).map((row) => ({
    playerId: row.playerId,
    playerName: row.playerName,
    tableaux: row.tableaux,
  }));

  const dateFormatter = new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  return (
    <section className="page">
      <div className="page-header">
        <p className="badge-pill w-fit">Check-in</p>
        <h1 className="page-title">{tour.name}</h1>
        <p className="page-subtitle">
          {tour.season.name} · {dateFormatter.format(tour.date)}
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button asChild variant="secondary" size="sm">
          <a href={`/admin/tours/${tour.id}`}>Retour dashboard</a>
        </Button>
        <Button asChild variant="secondary" size="sm">
          <a href={`/admin/inscriptions?tourId=${tour.id}`}>Voir inscriptions</a>
        </Button>
      </div>

      <div className="mt-6">
        <AdminTourCheckinClient rows={rows} tourId={tour.id} action={updatePresence} />
      </div>
    </section>
  );
}
