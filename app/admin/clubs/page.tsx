import { revalidatePath } from "next/cache";
import { z } from "zod";

import { AdminClubDialog } from "@/components/admin-club-dialog";
import { AdminDeleteForm } from "@/components/admin-delete-form";
import { EmptyState } from "@/components/empty-state";
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

const clubSchema = z.object({
  name: z.string().min(2, "Nom requis."),
  city: z.string().optional().or(z.literal("")),
  ffttId: z.string().optional().or(z.literal("")),
  ffttNumber: z.string().optional().or(z.literal("")),
  hallName: z.string().optional().or(z.literal("")),
  hallAddress1: z.string().optional().or(z.literal("")),
  hallAddress2: z.string().optional().or(z.literal("")),
  hallAddress3: z.string().optional().or(z.literal("")),
  hallZip: z.string().optional().or(z.literal("")),
  hallCity: z.string().optional().or(z.literal("")),
  website: z.string().optional().or(z.literal("")),
  contactName: z.string().optional().or(z.literal("")),
  contactFirstName: z.string().optional().or(z.literal("")),
  contactEmail: z.string().optional().or(z.literal("")),
  contactPhone: z.string().optional().or(z.literal("")),
  latitude: z.string().optional().or(z.literal("")),
  longitude: z.string().optional().or(z.literal("")),
});

async function createClub(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  "use server";

  await requireAdmin();

  const parsed = clubSchema.safeParse({
    name: String(formData.get("name") ?? "").trim(),
    city: String(formData.get("city") ?? "").trim(),
    ffttId: String(formData.get("ffttId") ?? "").trim(),
    ffttNumber: String(formData.get("ffttNumber") ?? "").trim(),
    hallName: String(formData.get("hallName") ?? "").trim(),
    hallAddress1: String(formData.get("hallAddress1") ?? "").trim(),
    hallAddress2: String(formData.get("hallAddress2") ?? "").trim(),
    hallAddress3: String(formData.get("hallAddress3") ?? "").trim(),
    hallZip: String(formData.get("hallZip") ?? "").trim(),
    hallCity: String(formData.get("hallCity") ?? "").trim(),
    website: String(formData.get("website") ?? "").trim(),
    contactName: String(formData.get("contactName") ?? "").trim(),
    contactFirstName: String(formData.get("contactFirstName") ?? "").trim(),
    contactEmail: String(formData.get("contactEmail") ?? "").trim(),
    contactPhone: String(formData.get("contactPhone") ?? "").trim(),
    latitude: String(formData.get("latitude") ?? "").trim(),
    longitude: String(formData.get("longitude") ?? "").trim(),
  });

  if (!parsed.success) {
    return {
      ok: false,
      message: parsed.error.issues[0]?.message ?? "Donnees invalides.",
    };
  }

  const {
    name,
    city,
    ffttId,
    ffttNumber,
    hallName,
    hallAddress1,
    hallAddress2,
    hallAddress3,
    hallZip,
    hallCity,
    website,
    contactName,
    contactFirstName,
    contactEmail,
    contactPhone,
    latitude,
    longitude,
  } = parsed.data;

  await prisma.club.create({
    data: {
      name,
      city: city || null,
      ffttId: ffttId || null,
      ffttNumber: ffttNumber || null,
      hallName: hallName || null,
      hallAddress1: hallAddress1 || null,
      hallAddress2: hallAddress2 || null,
      hallAddress3: hallAddress3 || null,
      hallZip: hallZip || null,
      hallCity: hallCity || null,
      website: website || null,
      contactName: contactName || null,
      contactFirstName: contactFirstName || null,
      contactEmail: contactEmail || null,
      contactPhone: contactPhone || null,
      latitude: latitude ? Number(latitude) : null,
      longitude: longitude ? Number(longitude) : null,
    },
  });

  revalidatePath("/admin/clubs");

  return { ok: true, message: "Club cree." };
}

async function deleteClub(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  "use server";

  await requireAdmin();

  const id = String(formData.get("id") ?? "").trim();

  if (!id) {
    return { ok: false, message: "Club introuvable." };
  }

  const linkedTours = await prisma.tour.count({
    where: { clubId: id },
  });

  if (linkedTours > 0) {
    return {
      ok: false,
      message: "Supprimez d'abord les tours lies a ce club.",
    };
  }

  await prisma.club.delete({
    where: { id },
  });

  revalidatePath("/admin/clubs");

  return { ok: true, message: "Club supprime." };
}

export default async function AdminClubsPage() {
  await requireAdmin();

  const clubs: Array<{
    id: string;
    name: string;
    city: string | null;
    ffttNumber: string | null;
  }> = await prisma.club.findMany({
    orderBy: [{ name: "asc" }],
    select: { id: true, name: true, city: true, ffttNumber: true },
  });

  return (
    <section className="page">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="page-header">
          <h1 className="page-title">Clubs</h1>
          <p className="page-subtitle">
            Gere les clubs organisateurs des tours.
          </p>
        </div>
        <AdminClubDialog action={createClub} />
      </div>

      <div className="surface">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nom</TableHead>
              <TableHead>Numero</TableHead>
              <TableHead>Ville</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {clubs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="py-6">
                  <EmptyState
                    title="Aucun club pour le moment"
                    description="Ajoutez un club organisateur pour debloquer les tours."
                  />
                </TableCell>
              </TableRow>
            ) : (
              clubs.map((club) => (
                <TableRow key={club.id}>
                  <TableCell className="font-medium">{club.name}</TableCell>
                  <TableCell>{club.ffttNumber ?? "-"}</TableCell>
                  <TableCell>{club.city ?? "-"}</TableCell>
                  <TableCell className="text-right">
                    <AdminDeleteForm id={club.id} action={deleteClub} />
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
