import { revalidatePath } from "next/cache";
import { z } from "zod";

import { AdminDeleteDialog } from "@/components/admin-delete-dialog";
import { AdminTableauTemplateDialog } from "@/components/admin-tableau-template-dialog";
import { AdminTableauTemplateDuplicateForm } from "@/components/admin-tableau-template-duplicate-form";
import { EmptyState } from "@/components/empty-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
import { sortByTableauNaturalOrder } from "@/lib/tableau-order";

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
    seasonId: z.string().min(1, "Saison requise."),
    minPoints: pointsSchema,
    maxPoints: pointsSchema,
    startTime: z.string().regex(/^\d{2}:\d{2}$/, "Horaire requis."),
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

function formatStartTime(startTime: string | null) {
  return startTime?.trim() || "A definir";
}

async function createTableauTemplate(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  "use server";

  await requireAdmin();

  const rawName = String(formData.get("name") ?? "").trim();
  const parsed = templateSchema.safeParse({
    seasonId: String(formData.get("seasonId") ?? "").trim(),
    minPoints: formData.get("minPoints"),
    maxPoints: formData.get("maxPoints"),
    startTime: String(formData.get("startTime") ?? "").trim(),
  });

  if (!parsed.success) {
    return {
      ok: false,
      message: parsed.error.issues[0]?.message ?? "Donnees invalides.",
    };
  }

  const { seasonId, minPoints, maxPoints, startTime } = parsed.data;
  const name = rawName || formatRange(minPoints ?? null, maxPoints ?? null);

  if (!rawName && name === "Libre") {
    return { ok: false, message: "Nom requis." };
  }

  const season = await prisma.season.findUnique({
    where: { id: seasonId },
    select: { id: true },
  });

  if (!season) {
    return { ok: false, message: "Saison introuvable." };
  }

  const existing = await prisma.tableauTemplate.findUnique({
    where: { seasonId_name: { seasonId, name } },
    select: { id: true },
  });

  if (existing) {
    return {
      ok: false,
      message:
        "Un tableau de reference avec ce nom existe deja pour cette saison.",
    };
  }

  await prisma.tableauTemplate.create({
    data: {
      seasonId,
      name,
      minPoints: minPoints ?? null,
      maxPoints: maxPoints ?? null,
      startTime,
    },
  });

  revalidatePath("/admin/tableau-templates");

  return { ok: true, message: "Tableau de reference ajoute." };
}

async function deleteTableauTemplate(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  "use server";

  await requireAdmin();

  const id = String(formData.get("id") ?? "").trim();

  if (!id) {
    return { ok: false, message: "Tableau de reference introuvable." };
  }

  const linkedTableaux = await prisma.tableau.count({
    where: { templateId: id },
  });

  if (linkedTableaux > 0) {
    return {
      ok: false,
      message: "Supprimez d'abord les tableaux lies a cette reference.",
    };
  }

  await prisma.tableauTemplate.delete({
    where: { id },
  });

  revalidatePath("/admin/tableau-templates");

  return { ok: true, message: "Tableau de reference supprime." };
}

async function duplicateTableauTemplates(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  "use server";

  await requireAdmin();

  const targetSeasonId = String(formData.get("targetSeasonId") ?? "").trim();
  const sourceSeasonId = String(formData.get("sourceSeasonId") ?? "").trim();

  if (!targetSeasonId || !sourceSeasonId) {
    return { ok: false, message: "Saison source et cible requises." };
  }

  if (targetSeasonId === sourceSeasonId) {
    return { ok: false, message: "Choisissez deux saisons differentes." };
  }

  const [targetSeason, sourceSeason] = await Promise.all([
    prisma.season.findUnique({
      where: { id: targetSeasonId },
      select: {
        id: true,
        _count: { select: { tableauTemplates: true } },
      },
    }),
    prisma.season.findUnique({
      where: { id: sourceSeasonId },
      include: {
        tableauTemplates: {
          orderBy: [{ name: "asc" }, { startTime: "asc" }],
        },
      },
    }),
  ]);

  if (!targetSeason) {
    return { ok: false, message: "Saison cible introuvable." };
  }

  if (targetSeason._count.tableauTemplates > 0) {
    return {
      ok: false,
      message: "La saison cible a deja des tableaux de reference.",
    };
  }

  if (!sourceSeason || sourceSeason.tableauTemplates.length === 0) {
    return {
      ok: false,
      message: "La saison source n'a aucun tableau de reference.",
    };
  }

  const sourceTemplates = sortByTableauNaturalOrder(
    sourceSeason.tableauTemplates,
    (template) => template.name,
    (template) => template.startTime,
  );

  const created = await prisma.tableauTemplate.createMany({
    data: sourceTemplates.map((template) => ({
      seasonId: targetSeason.id,
      name: template.name,
      minPoints: template.minPoints,
      maxPoints: template.maxPoints,
      startTime: template.startTime,
    })),
    skipDuplicates: true,
  });

  revalidatePath("/admin/tableau-templates");

  return {
    ok: true,
    message: `${created.count} tableau(x) de reference duplique(s).`,
  };
}

export default async function AdminTableauTemplatesPage() {
  await requireAdmin();

  type SeasonItem = {
    id: string;
    name: string;
    year: number;
    isActive: boolean;
  };

  type TemplateItem = {
    id: string;
    name: string;
    minPoints: number | null;
    maxPoints: number | null;
    startTime: string | null;
    season: SeasonItem | null;
  };

  type TableauUsageItem = {
    templateId: string;
    tour: {
      id: string;
      seasonId: string;
    };
  };

  const [seasons, templates, tableauUsages]: [
    SeasonItem[],
    TemplateItem[],
    TableauUsageItem[],
  ] =
    await Promise.all([
      prisma.season.findMany({ orderBy: { year: "desc" } }),
      prisma.tableauTemplate.findMany({
        include: { season: true },
        orderBy: [
          { season: { year: "desc" } },
          { name: "asc" },
          { startTime: "asc" },
        ],
      }),
      prisma.tableau.findMany({
        select: {
          templateId: true,
          tour: {
            select: {
              id: true,
              seasonId: true,
            },
          },
        },
      }),
    ]);

  const templatesBySeasonId = new Map<string, TemplateItem[]>();
  const orphanTemplates: TemplateItem[] = [];
  const usedTourIdsBySeasonId = new Map<string, Set<string>>();
  const usedTourIdsByTemplateId = new Map<string, Set<string>>();

  for (const template of templates) {
    if (!template.season) {
      orphanTemplates.push(template);
      continue;
    }

    const list = templatesBySeasonId.get(template.season.id) ?? [];
    list.push(template);
    templatesBySeasonId.set(template.season.id, list);
  }

  for (const [seasonId, seasonTemplates] of templatesBySeasonId) {
    templatesBySeasonId.set(
      seasonId,
      sortByTableauNaturalOrder(
        seasonTemplates,
        (template) => template.name,
        (template) => template.startTime,
      ),
    );
  }

  const sortedOrphanTemplates = sortByTableauNaturalOrder(
    orphanTemplates,
    (template) => template.name,
    (template) => template.startTime,
  );

  for (const usage of tableauUsages) {
    const tourIds = usedTourIdsBySeasonId.get(usage.tour.seasonId) ?? new Set();
    tourIds.add(usage.tour.id);
    usedTourIdsBySeasonId.set(usage.tour.seasonId, tourIds);

    const templateTourIds =
      usedTourIdsByTemplateId.get(usage.templateId) ?? new Set();
    templateTourIds.add(usage.tour.id);
    usedTourIdsByTemplateId.set(usage.templateId, templateTourIds);
  }

  const activeSeason = seasons.find((season) => season.isActive) ?? null;
  const nextSeason = activeSeason
    ? (seasons
        .filter((season) => season.year > activeSeason.year)
        .sort((a, b) => a.year - b.year)[0] ?? null)
    : (seasons[0] ?? null);
  const activeTemplateCount = activeSeason
    ? (templatesBySeasonId.get(activeSeason.id)?.length ?? 0)
    : 0;
  const activeUsedTourCount = activeSeason
    ? (usedTourIdsBySeasonId.get(activeSeason.id)?.size ?? 0)
    : 0;
  const nextTemplateCount = nextSeason
    ? (templatesBySeasonId.get(nextSeason.id)?.length ?? 0)
    : 0;
  const summaryItems = [
    {
      label: "Saison active",
      value: activeSeason
        ? `${activeSeason.name} (${activeSeason.year})`
        : "Aucune",
      hint: activeSeason ? "Reference principale" : "A definir",
    },
    {
      label: "Tableaux configures",
      value: activeTemplateCount.toString(),
      hint: activeSeason ? "Sur la saison active" : "Aucune saison active",
    },
    {
      label: "Tours utilisateurs",
      value: activeUsedTourCount.toString(),
      hint: "Tours rattaches a ces references",
    },
    {
      label: "Saison suivante",
      value: nextSeason ? nextTemplateCount.toString() : "-",
      hint: nextSeason
        ? `${nextSeason.name} (${nextSeason.year})`
        : "Aucune saison suivante",
    },
  ];

  return (
    <section className="page">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="page-header">
          <h1 className="page-title">Tableaux de reference</h1>
          <p className="page-subtitle">
            Gere les tableaux de reference par saison.
          </p>
        </div>
        <AdminTableauTemplateDialog
          action={createTableauTemplate}
          seasons={seasons}
        />
      </div>

      {seasons.length === 0 ? (
        <div className="surface p-4 text-sm text-muted-foreground">
          Creez une saison avant de definir ses tableaux de reference.
        </div>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {summaryItems.map((item) => (
          <Card key={item.label} className="surface border-border/60">
            <CardContent className="space-y-1 pt-6">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                {item.label}
              </p>
              <p className="text-2xl font-semibold text-foreground">
                {item.value}
              </p>
              <p className="text-xs text-muted-foreground">{item.hint}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {seasons.length === 0 && templates.length === 0 ? (
        <div className="surface">
          <EmptyState
            title="Aucun tableau de reference pour le moment"
            description="Creez une saison puis definissez ses tableaux de reference."
          />
        </div>
      ) : (
        <div className="space-y-4">
          {seasons.map((season) => {
            const seasonTemplates = templatesBySeasonId.get(season.id) ?? [];
            const sourceSeasons = seasons
              .filter((candidate) => {
                if (candidate.id === season.id) {
                  return false;
                }

                return (templatesBySeasonId.get(candidate.id)?.length ?? 0) > 0;
              })
              .map((candidate) => ({
                id: candidate.id,
                name: candidate.name,
                year: candidate.year,
                templateCount:
                  templatesBySeasonId.get(candidate.id)?.length ?? 0,
              }));

            return (
              <section key={season.id} className="surface overflow-hidden">
                <div className="flex flex-col gap-2 border-b border-border/60 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-base font-semibold text-foreground">
                        {season.name} ({season.year})
                      </h2>
                      {season.isActive ? <Badge>Active</Badge> : null}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {seasonTemplates.length} tableau(x) de reference.
                    </p>
                  </div>
                </div>

                {seasonTemplates.length === 0 ? (
                  <div className="px-4 py-6">
                    <EmptyState
                      title="Aucun tableau de reference pour cette saison"
                      description="Ajoutez les tableaux de reference avant de creer les tours de cette saison."
                      action={
                        <AdminTableauTemplateDuplicateForm
                          action={duplicateTableauTemplates}
                          targetSeasonId={season.id}
                          sourceSeasons={sourceSeasons}
                        />
                      }
                    />
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nom</TableHead>
                        <TableHead>Plage de points</TableHead>
                        <TableHead>Horaire</TableHead>
                        <TableHead>Utilisation</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {seasonTemplates.map((template) => {
                        const usedTourCount =
                          usedTourIdsByTemplateId.get(template.id)?.size ?? 0;

                        return (
                          <TableRow key={template.id}>
                            <TableCell className="font-medium">
                              {template.name}
                            </TableCell>
                            <TableCell>
                              {formatRange(
                                template.minPoints,
                                template.maxPoints,
                              )}
                            </TableCell>
                            <TableCell>
                              {formatStartTime(template.startTime)}
                            </TableCell>
                            <TableCell>
                              {usedTourCount > 0 ? (
                                <Badge variant="secondary">
                                  Utilise par {usedTourCount} tour(s)
                                </Badge>
                              ) : (
                                <span className="text-sm text-muted-foreground">
                                  Non utilise
                                </span>
                              )}
                            </TableCell>
                            <TableCell className="text-right">
                              {usedTourCount > 0 ? (
                                <Button size="sm" variant="outline" disabled>
                                  Protege
                                </Button>
                              ) : (
                                <AdminDeleteDialog
                                  id={template.id}
                                  action={deleteTableauTemplate}
                                  title="Supprimer ce template ?"
                                  description={`Cette action supprimera ${template.name}.`}
                                />
                              )}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                )}
              </section>
            );
          })}

          {orphanTemplates.length > 0 ? (
            <section className="surface overflow-hidden">
              <div className="border-b border-border/60 px-4 py-4">
                <h2 className="text-base font-semibold text-foreground">
                  Saison non rattachee
                </h2>
                <p className="text-xs text-muted-foreground">
                  Tableaux de reference existants sans saison associee.
                </p>
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nom</TableHead>
                    <TableHead>Plage de points</TableHead>
                    <TableHead>Horaire</TableHead>
                    <TableHead>Utilisation</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedOrphanTemplates.map((template) => {
                    const usedTourCount =
                      usedTourIdsByTemplateId.get(template.id)?.size ?? 0;

                    return (
                      <TableRow key={template.id}>
                        <TableCell className="font-medium">
                          {template.name}
                        </TableCell>
                        <TableCell>
                          {formatRange(template.minPoints, template.maxPoints)}
                        </TableCell>
                        <TableCell>{formatStartTime(template.startTime)}</TableCell>
                        <TableCell>
                          {usedTourCount > 0 ? (
                            <Badge variant="secondary">
                              Utilise par {usedTourCount} tour(s)
                            </Badge>
                          ) : (
                            <span className="text-sm text-muted-foreground">
                              Non utilise
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          {usedTourCount > 0 ? (
                            <Button size="sm" variant="outline" disabled>
                              Protege
                            </Button>
                          ) : (
                            <AdminDeleteDialog
                              id={template.id}
                              action={deleteTableauTemplate}
                              title="Supprimer ce template ?"
                              description={`Cette action supprimera ${template.name}.`}
                            />
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </section>
          ) : null}
        </div>
      )}
    </section>
  );
}
