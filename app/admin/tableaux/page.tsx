import { revalidatePath } from "next/cache";
import { z } from "zod";

import { AdminDeleteForm } from "@/components/admin-delete-form";
import { AdminTableauDialog } from "@/components/admin-tableau-dialog";
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

const createSchema = z.object({
  templateId: z.string().min(1, "Template requis."),
  tourId: z.string().min(1, "Tour requis."),
  startTime: z.string().regex(/^\d{2}:\d{2}$/, "Horaire requis."),
});

function formatRange(minPoints: number | null, maxPoints: number | null) {
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
}

async function createTableau(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  "use server";

  await requireAdmin();

  const parsed = createSchema.safeParse({
    templateId: String(formData.get("templateId") ?? "").trim(),
    tourId: String(formData.get("tourId") ?? "").trim(),
    startTime: String(formData.get("startTime") ?? "").trim(),
  });

  if (!parsed.success) {
    return {
      ok: false,
      message: parsed.error.issues[0]?.message ?? "Donnees invalides.",
    };
  }

  const tour = await prisma.tour.findUnique({
    where: { id: parsed.data.tourId },
    select: { date: true },
  });

  if (!tour) {
    return { ok: false, message: "Tour introuvable." };
  }

  const [hours, minutes] = parsed.data.startTime.split(":").map(Number);
  if (Number.isNaN(hours) || Number.isNaN(minutes)) {
    return { ok: false, message: "Horaire invalide." };
  }

  const startTime = new Date(tour.date);
  startTime.setHours(hours, minutes, 0, 0);

  await prisma.tableau.create({
    data: {
      templateId: parsed.data.templateId,
      tourId: parsed.data.tourId,
      startTime,
    },
  });

  revalidatePath("/admin/tableaux");

  return { ok: true, message: "Tableau cree." };
}

async function deleteTableau(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  "use server";

  await requireAdmin();

  const id = String(formData.get("id") ?? "").trim();

  if (!id) {
    return { ok: false, message: "Tableau introuvable." };
  }

  await prisma.tableau.delete({
    where: { id },
  });

  revalidatePath("/admin/tableaux");

  return { ok: true, message: "Tableau supprime." };
}

export default async function AdminTableauxPage() {
  await requireAdmin();

  type TourItem = {
    id: string;
    name: string;
    date: Date;
    season: { year: number };
  };
  type TemplateItem = {
    id: string;
    name: string;
    minPoints: number | null;
    maxPoints: number | null;
  };
  type TableauItem = {
    id: string;
    startTime: Date;
    template: TemplateItem;
    tour: { name: string };
  };

  const [tours, templates, tableaux]: [
    TourItem[],
    TemplateItem[],
    TableauItem[],
  ] = await Promise.all([
    prisma.tour.findMany({
      include: { season: true },
      orderBy: { date: "asc" },
    }),
    prisma.tableauTemplate.findMany({
      orderBy: { name: "asc" },
    }),
    prisma.tableau.findMany({
      include: {
        template: true,
        tour: { include: { season: true } },
      },
      orderBy: { startTime: "asc" },
    }),
  ]);

  const formatter = new Intl.DateTimeFormat("fr-FR", {
    timeStyle: "short",
  });

  const tourOptions = tours.map((tour: TourItem) => ({
    id: tour.id,
    label: `${tour.name} - ${tour.season.year}`,
  }));

  const templateOptions = templates.map((template: TemplateItem) => ({
    id: template.id,
    name: template.name,
    minPoints: template.minPoints,
    maxPoints: template.maxPoints,
  }));

  return (
    <section className="page">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="page-header">
          <h1 className="page-title">Tableaux</h1>
          <p className="page-subtitle">
            Gere les tableaux associes aux tours.
          </p>
        </div>
        <AdminTableauDialog
          action={createTableau}
          tours={tourOptions}
          templates={templateOptions}
        />
      </div>

      {tours.length === 0 || templates.length === 0 ? (
        <div className="surface p-4 text-sm text-muted-foreground">
          Creez d&apos;abord un tour et un template pour ajouter un tableau.
        </div>
      ) : null}

      <div className="surface">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nom</TableHead>
              <TableHead>Plage de points</TableHead>
              <TableHead>Tour</TableHead>
              <TableHead>Horaire</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tableaux.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="py-10 text-center">
                  Aucun tableau pour le moment.
                </TableCell>
              </TableRow>
            ) : (
              tableaux.map((tableau: TableauItem) => (
                <TableRow key={tableau.id}>
                  <TableCell className="font-medium">
                    {tableau.template.name}
                  </TableCell>
                  <TableCell>
                    {formatRange(
                      tableau.template.minPoints,
                      tableau.template.maxPoints,
                    )}
                  </TableCell>
                  <TableCell>{tableau.tour.name}</TableCell>
                  <TableCell>{formatter.format(tableau.startTime)}</TableCell>
                  <TableCell className="text-right">
                    <AdminDeleteForm id={tableau.id} action={deleteTableau} />
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
