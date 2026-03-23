import { revalidatePath } from "next/cache";
import { z } from "zod";

import { AdminDeleteForm } from "@/components/admin-delete-form";
import { AdminTableauTemplateDialog } from "@/components/admin-tableau-template-dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { EmptyState } from "@/components/empty-state";
import { requireAdmin } from "@/lib/require-admin";
import { prisma } from "@/lib/prisma";

type ActionState = {
  ok: boolean;
  message: string;
};

const pointsSchema = z.preprocess((value) => {
  if (value === null || value === undefined) {
    return undefined;
  }
  const parsed = String(value).trim();
  if (!parsed) {
    return undefined;
  }
  const numeric = Number(parsed);
  if (Number.isNaN(numeric)) {
    return value;
  }
  return numeric;
}, z.number().int().optional());

const templateSchema = z
  .object({
    minPoints: pointsSchema,
    maxPoints: pointsSchema,
  })
  .refine(
    (data) => {
      if (data.minPoints == null || data.maxPoints == null) {
        return true;
      }
      return data.minPoints <= data.maxPoints;
    },
    { message: "La plage de points est invalide." },
  );

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

async function createTableauTemplate(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  "use server";

  await requireAdmin();

  const rawName = String(formData.get("name") ?? "").trim();
  const parsed = templateSchema.safeParse({
    minPoints: formData.get("minPoints"),
    maxPoints: formData.get("maxPoints"),
  });

  if (!parsed.success) {
    return {
      ok: false,
      message: parsed.error.issues[0]?.message ?? "Donnees invalides.",
    };
  }

  const { minPoints, maxPoints } = parsed.data;
  const name = rawName || formatRange(minPoints ?? null, maxPoints ?? null);

  if (!rawName && name === "Libre") {
    return { ok: false, message: "Nom requis." };
  }

  await prisma.tableauTemplate.create({
    data: {
      name,
      minPoints: minPoints ?? null,
      maxPoints: maxPoints ?? null,
    },
  });

  revalidatePath("/admin/tableau-templates");

  return { ok: true, message: "Template cree." };
}

async function deleteTableauTemplate(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  "use server";

  await requireAdmin();

  const id = String(formData.get("id") ?? "").trim();

  if (!id) {
    return { ok: false, message: "Template introuvable." };
  }

  const linkedTableaux = await prisma.tableau.count({
    where: { templateId: id },
  });

  if (linkedTableaux > 0) {
    return {
      ok: false,
      message: "Supprimez d'abord les tableaux lies a ce template.",
    };
  }

  await prisma.tableauTemplate.delete({
    where: { id },
  });

  revalidatePath("/admin/tableau-templates");

  return { ok: true, message: "Template supprime." };
}

export default async function AdminTableauTemplatesPage() {
  await requireAdmin();

  type TemplateItem = {
    id: string;
    name: string;
    minPoints: number | null;
    maxPoints: number | null;
  };

  const templates: TemplateItem[] = await prisma.tableauTemplate.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <section className="page">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="page-header">
          <h1 className="page-title">Templates</h1>
          <p className="page-subtitle">Gere les templates de tableaux.</p>
        </div>
        <AdminTableauTemplateDialog action={createTableauTemplate} />
      </div>

      <div className="surface">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nom</TableHead>
              <TableHead>Plage de points</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {templates.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className="py-6">
                  <EmptyState
                    title="Aucun template pour le moment"
                    description="Définissez une plage de points pour créer un tableau."
                  />
                </TableCell>
              </TableRow>
            ) : (
              templates.map((template: TemplateItem) => (
                <TableRow key={template.id}>
                  <TableCell className="font-medium">{template.name}</TableCell>
                  <TableCell>
                    {formatRange(template.minPoints, template.maxPoints)}
                  </TableCell>
                  <TableCell className="text-right">
                    <AdminDeleteForm
                      id={template.id}
                      action={deleteTableauTemplate}
                    />
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
