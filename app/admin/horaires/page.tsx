import { revalidatePath } from "next/cache";
import { z } from "zod";

import { AdminHorairesForm } from "@/components/admin-horaires-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requireAdmin } from "@/lib/require-admin";
import { prisma } from "@/lib/prisma";

type ActionState = {
  ok: boolean;
  message: string;
};

const horairesSchema = z.object({
  title: z.string().min(2, "Titre requis."),
  content: z.string().min(10, "Contenu requis."),
});

async function saveHoraires(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  "use server";

  await requireAdmin();

  const parsed = horairesSchema.safeParse({
    title: String(formData.get("title") ?? "").trim(),
    content: String(formData.get("content") ?? "").trim(),
  });

  if (!parsed.success) {
    return {
      ok: false,
      message: parsed.error.issues[0]?.message ?? "Donnees invalides.",
    };
  }

  const { title, content } = parsed.data;

  await prisma.schedulePage.upsert({
    where: { slug: "horaires" },
    update: { title, content },
    create: { slug: "horaires", title, content },
  });

  revalidatePath("/admin/horaires");

  return { ok: true, message: "Horaires mis a jour." };
}

export default async function AdminHorairesPage() {
  await requireAdmin();

  const existing = await prisma.schedulePage.findUnique({
    where: { slug: "horaires" },
  });

  const defaultTitle = existing?.title ?? "Horaires & informations";
  const defaultContent =
    existing?.content ??
    "Ajoutez ici les horaires ou informations pratiques à afficher en cas d'indisponibilite de la source externe.";

  const updatedAtLabel = existing?.updatedAt
    ? new Intl.DateTimeFormat("fr-FR", {
        dateStyle: "long",
        timeStyle: "short",
      }).format(existing.updatedAt)
    : undefined;

  return (
    <section className="page">
      <div className="page-header">
        <h1 className="page-title">Horaires</h1>
        <p className="page-subtitle">
          Contenu de secours si la source externe n'est pas disponible.
        </p>
      </div>

      <Card className="surface border-border/60">
        <CardHeader>
          <CardTitle>Contenu</CardTitle>
        </CardHeader>
        <CardContent>
          <AdminHorairesForm
            action={saveHoraires}
            defaultTitle={defaultTitle}
            defaultContent={defaultContent}
            updatedAtLabel={updatedAtLabel}
          />
        </CardContent>
      </Card>
    </section>
  );
}
