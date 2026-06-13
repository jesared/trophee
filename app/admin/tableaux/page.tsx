import { revalidatePath } from "next/cache";
import Link from "next/link";
import { z } from "zod";
import { CalendarDays, Clock3, Layers3, Sparkles } from "lucide-react";

import { AdminDeleteDialog } from "@/components/admin-delete-dialog";
import { AdminPageHeader } from "@/components/admin-page-header";
import { AdminTableauDialog } from "@/components/admin-tableau-dialog";
import { EmptyState } from "@/components/empty-state";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";
import {
  buildSeasonTemplateTableauxData,
  buildTableauStartTime,
} from "@/lib/tableau-template-defaults";
import { sortByTableauNaturalOrder } from "@/lib/tableau-order";

type ActionState = {
  ok: boolean;
  message: string;
};

const ALL_TEMPLATES_VALUE = "__all_templates__";

const createSchema = z.object({
  templateId: z.string().min(1, "Template requis."),
  tourId: z.string().min(1, "Tour requis."),
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

function formatTemplateTime(startTime: string | null) {
  return startTime?.trim() || "Horaire manquant";
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
  });

  if (!parsed.success) {
    return {
      ok: false,
      message: parsed.error.issues[0]?.message ?? "Donnees invalides.",
    };
  }

  const tour = await prisma.tour.findUnique({
    where: { id: parsed.data.tourId },
    select: { date: true, seasonId: true },
  });

  if (!tour) {
    return { ok: false, message: "Tour introuvable." };
  }

  const existingTableaux = await prisma.tableau.findMany({
    where: { tourId: parsed.data.tourId },
    select: { templateId: true },
  });
  const existingTemplateIds = new Set(
    existingTableaux.map((tableau) => tableau.templateId),
  );

  if (parsed.data.templateId === ALL_TEMPLATES_VALUE) {
    const { data, skippedWithoutTime } =
      await buildSeasonTemplateTableauxData(prisma, {
        seasonId: tour.seasonId,
        tourId: parsed.data.tourId,
        tourDate: tour.date,
        excludeTemplateIds: existingTemplateIds,
      });

    if (data.length === 0) {
      return {
        ok: false,
        message:
          skippedWithoutTime.length > 0
            ? "Les templates manquants de cette saison n'ont pas tous un horaire."
            : "Tous les templates de cette saison sont deja ajoutes a ce tour.",
      };
    }

    await prisma.tableau.createMany({
      data,
      skipDuplicates: true,
    });

    revalidatePath("/admin/tableaux");
    revalidatePath(`/admin/tours/${parsed.data.tourId}`);

    const skippedMessage =
      skippedWithoutTime.length > 0
        ? ` ${skippedWithoutTime.length} template(s) sans horaire ignore(s).`
        : "";

    return {
      ok: true,
      message: `${data.length} tableau(x) ajoute(s).${skippedMessage}`,
    };
  }

  const template = await prisma.tableauTemplate.findUnique({
    where: { id: parsed.data.templateId },
    select: { startTime: true, name: true, seasonId: true },
  });

  if (!template) {
    return { ok: false, message: "Template introuvable." };
  }

  if (template.seasonId !== tour.seasonId) {
    return {
      ok: false,
      message: "Ce template n'appartient pas a la saison du tour.",
    };
  }

  if (existingTemplateIds.has(parsed.data.templateId)) {
    return {
      ok: false,
      message: "Ce template est deja associe a ce tour.",
    };
  }

  if (!template.startTime) {
    return {
      ok: false,
      message: `Horaire manquant pour le template ${template.name}.`,
    };
  }

  const startTime = buildTableauStartTime(tour.date, template.startTime);
  if (!startTime) {
    return { ok: false, message: "Horaire invalide sur le template." };
  }

  await prisma.tableau.create({
    data: {
      templateId: parsed.data.templateId,
      tourId: parsed.data.tourId,
      startTime,
    },
  });

  revalidatePath("/admin/tableaux");
  revalidatePath(`/admin/tours/${parsed.data.tourId}`);

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
    seasonId: string;
    season: { year: number };
    status: "DRAFT" | "OPEN" | "CLOSED" | "DONE";
  };
  type TemplateItem = {
    id: string;
    name: string;
    minPoints: number | null;
    maxPoints: number | null;
    startTime: string | null;
    seasonId: string | null;
    season: { year: number; name: string } | null;
  };
  type TableauItem = {
    id: string;
    startTime: Date;
    template: TemplateItem;
    tour: {
      id: string;
      name: string;
      status: "DRAFT" | "OPEN" | "CLOSED" | "DONE";
    };
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
      include: { season: true },
      orderBy: [
        { season: { year: "desc" } },
        { name: "asc" },
        { startTime: "asc" },
      ],
    }),
    prisma.tableau.findMany({
      include: {
        template: { include: { season: true } },
        tour: { include: { season: true } },
      },
      orderBy: [
        { tour: { date: "asc" } },
        { template: { name: "asc" } },
        { startTime: "asc" },
      ],
    }),
  ]);

  const formatter = new Intl.DateTimeFormat("fr-FR", {
    timeStyle: "short",
  });
  const dateFormatter = new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const tourOptions = tours
    .filter((tour: TourItem) => tour.date >= today)
    .map((tour: TourItem) => ({
      id: tour.id,
      label: `${tour.name} - ${tour.season.year}`,
      seasonId: tour.seasonId,
    }));

  const templateOptions = templates.map((template: TemplateItem) => ({
    id: template.id,
    name: template.name,
    minPoints: template.minPoints,
    maxPoints: template.maxPoints,
    startTime: template.startTime,
    seasonId: template.seasonId,
  }));

  const readyTemplates = templates.filter((template) => Boolean(template.startTime));
  const templatesWithoutTime = templates.filter((template) => !template.startTime);
  const tableauxByTour = new Map<string, TableauItem[]>();
  for (const tableau of tableaux) {
    const current = tableauxByTour.get(tableau.tour.id) ?? [];
    current.push(tableau);
    tableauxByTour.set(tableau.tour.id, current);
  }

  const tourCards = tours.map((tour) => {
    const items = sortByTableauNaturalOrder(
      tableauxByTour.get(tour.id) ?? [],
      (tableau) => tableau.template.name,
      (tableau) => tableau.startTime,
    );
    const configuredTemplateIds = new Set(items.map((tableau) => tableau.template.id));
    const seasonReadyTemplates = readyTemplates.filter(
      (template) => template.seasonId === tour.seasonId,
    );
    const missingTemplates = seasonReadyTemplates.filter(
      (template) => !configuredTemplateIds.has(template.id),
    );
    const coverageBase = seasonReadyTemplates.length;
    const coverage =
      coverageBase > 0
        ? Math.round((items.length / coverageBase) * 100)
        : 0;

    return {
      ...tour,
      tableaux: items,
      missingTemplates,
      readyTemplateCount: seasonReadyTemplates.length,
      coverage,
      isUpcoming: tour.date >= today,
    };
  });

  const configuredTours = tourCards.filter((tour) => tour.tableaux.length > 0).length;
  const completeTours = tourCards.filter(
    (tour) => tour.readyTemplateCount > 0 && tour.missingTemplates.length === 0,
  ).length;
  const upcomingTours = tourCards.filter((tour) => tour.isUpcoming);
  const highlightedTours = upcomingTours.length > 0 ? upcomingTours : tourCards;
  const stats = [
    {
      label: "Tableaux crees",
      value: tableaux.length.toString(),
      hint: "Instances rattachees aux tours",
      icon: Layers3,
    },
    {
      label: "Tours configures",
      value: configuredTours.toString(),
      hint: `${completeTours} tour(s) complets`,
      icon: CalendarDays,
    },
    {
      label: "Templates prets",
      value: readyTemplates.length.toString(),
      hint: `${templates.length} template(s) au total`,
      icon: Sparkles,
    },
    {
      label: "Horaires manquants",
      value: templatesWithoutTime.length.toString(),
      hint: "A corriger cote templates",
      icon: Clock3,
    },
  ];

  return (
    <section className="page">
      <AdminPageHeader
        title="Tableaux"
        description="Pilotez les tableaux par tour, reperez ce qui manque et ajoutez une configuration en un clic."
        actions={
          <AdminTableauDialog
            action={createTableau}
            tours={tourOptions}
            templates={templateOptions}
          />
        }
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label} className="border-border/70">
              <CardContent className="flex items-start justify-between gap-4 pt-6">
                <div className="space-y-1">
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    {stat.label}
                  </p>
                  <p className="text-3xl font-semibold text-foreground">
                    {stat.value}
                  </p>
                  <p className="text-xs text-muted-foreground">{stat.hint}</p>
                </div>
                <div className="rounded-2xl border border-border/60 bg-muted/40 p-3 text-muted-foreground">
                  <Icon className="h-5 w-5" />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {tours.length === 0 || templates.length === 0 ? (
        <Alert>
          <AlertDescription>
            Creez d&apos;abord un tour et un template pour ajouter un tableau.
          </AlertDescription>
        </Alert>
      ) : null}

      {templates.length > 0 ? (
        <Card className="border-border/70 bg-muted/20">
          <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <CardTitle>Referentiel de templates</CardTitle>
              <CardDescription>
                Les horaires viennent des templates. Si un template n&apos;a pas
                d&apos;horaire, il ne pourra pas etre ajoute automatiquement.
              </CardDescription>
            </div>
            <Button asChild size="sm" variant="secondary">
              <Link href="/admin/tableau-templates">Gerer les templates</Link>
            </Button>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {templates.map((template) => (
              <Card key={template.id} size="sm" className="border-border/60 bg-background">
                <CardContent className="space-y-1 pt-3 text-sm">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-medium text-foreground">
                      {template.name}
                    </span>
                    <Badge
                      variant={template.startTime ? "secondary" : "destructive"}
                    >
                      {formatTemplateTime(template.startTime)}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {formatRange(template.minPoints, template.maxPoints)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {template.season
                      ? `Saison ${template.season.year}`
                      : "Saison non rattachee"}
                  </p>
                </CardContent>
              </Card>
            ))}
          </CardContent>
        </Card>
      ) : null}

      {templatesWithoutTime.length > 0 ? (
        <Card className="border-destructive/30 bg-destructive/5">
          <CardHeader>
            <CardTitle>Templates incomplets</CardTitle>
            <CardDescription>
              Ajoutez un horaire aux templates suivants pour activer
              l&apos;ajout automatique sur les tours.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {templatesWithoutTime.map((template) => (
              <Badge key={template.id} variant="destructive">
                {template.name}
              </Badge>
            ))}
          </CardContent>
        </Card>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-2">
        {highlightedTours.length === 0 ? (
          <Card className="border-border/70 xl:col-span-2">
            <CardContent className="pt-6">
              <EmptyState
                title="Aucun tour a configurer"
                description="Creez un tour puis ajoutez les tableaux necessaires."
              />
            </CardContent>
          </Card>
        ) : (
          highlightedTours.map((tour) => {
            const statusVariant =
              tour.status === "OPEN"
                ? "default"
                : tour.status === "CLOSED"
                  ? "secondary"
                  : "outline";

            return (
              <Card key={tour.id} className="border-border/70">
                <CardHeader className="space-y-3">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <CardTitle>{tour.name}</CardTitle>
                        <Badge variant={statusVariant}>{tour.status}</Badge>
                        {tour.missingTemplates.length === 0 &&
                        tour.readyTemplateCount > 0 ? (
                          <Badge variant="secondary">Complet</Badge>
                        ) : null}
                      </div>
                      <CardDescription>
                        {dateFormatter.format(tour.date)} - Saison {tour.season.year}
                      </CardDescription>
                    </div>
                    <div className="rounded-2xl border border-border/60 bg-muted/30 px-3 py-2 text-right">
                      <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
                        Couverture
                      </p>
                      <p className="text-xl font-semibold text-foreground">
                        {tour.readyTemplateCount > 0
                          ? `${tour.tableaux.length}/${tour.readyTemplateCount}`
                          : tour.tableaux.length}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {tour.readyTemplateCount > 0
                          ? `${tour.coverage}% pret`
                          : "Aucun template horaire"}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Button asChild size="sm" variant="secondary">
                      <Link href={`/admin/tours/${tour.id}`}>Voir le dashboard</Link>
                    </Button>
                    {tour.missingTemplates.length > 0 ? (
                      <Badge variant="outline">
                        {tour.missingTemplates.length} template(s) manquant(s)
                      </Badge>
                    ) : null}
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {tour.tableaux.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-border/70 bg-muted/20 px-4 py-5 text-sm text-muted-foreground">
                      Aucun tableau cree pour ce tour.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {tour.tableaux.map((tableau) => (
                        <div
                          key={tableau.id}
                          className="flex flex-col gap-3 rounded-xl border border-border/60 bg-background px-4 py-4 sm:flex-row sm:items-center sm:justify-between"
                        >
                          <div className="space-y-2">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="text-sm font-semibold text-foreground">
                                {tableau.template.name}
                              </span>
                              <Badge variant="secondary">
                                {formatter.format(tableau.startTime)}
                              </Badge>
                            </div>
                            <p className="text-xs text-muted-foreground">
                              {formatRange(
                                tableau.template.minPoints,
                                tableau.template.maxPoints,
                              )}
                            </p>
                          </div>
                          <AdminDeleteDialog
                            id={tableau.id}
                            action={deleteTableau}
                            triggerLabel="Retirer"
                            confirmLabel="Retirer"
                            title="Retirer ce tableau ?"
                            description={`Cette action retirera ${tableau.template.name} de ce tour.`}
                          />
                        </div>
                      ))}
                    </div>
                  )}

                  {tour.missingTemplates.length > 0 ? (
                    <div className="rounded-xl border border-dashed border-border/70 bg-muted/20 px-4 py-4">
                      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                        Templates encore absents
                      </p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {tour.missingTemplates.map((template) => (
                          <Badge key={template.id} variant="outline">
                            {template.name} - {formatTemplateTime(template.startTime)}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  ) : null}
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </section>
  );
}
