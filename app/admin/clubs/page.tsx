import { revalidatePath } from "next/cache";
import { z } from "zod";

import { AdminClubDialog } from "@/components/admin-club-dialog";
import { AdminDeleteForm } from "@/components/admin-delete-form";
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
  });

  if (!parsed.success) {
    return {
      ok: false,
      message: parsed.error.issues[0]?.message ?? "Donnees invalides.",
    };
  }

  const { name, city } = parsed.data;

  await prisma.club.create({
    data: {
      name,
      city: city || null,
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
  }> = await prisma.club.findMany({
    orderBy: [{ name: "asc" }],
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
              <TableHead>Ville</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {clubs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className="py-10 text-center">
                  Aucun club pour le moment.
                </TableCell>
              </TableRow>
            ) : (
              clubs.map((club) => (
                <TableRow key={club.id}>
                  <TableCell className="font-medium">{club.name}</TableCell>
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
