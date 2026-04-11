import { revalidatePath } from "next/cache";
import Link from "next/link";
import { z } from "zod";
import { CalendarDays, Clock3, Layers3, Sparkles } from "lucide-react";

import { AdminDeleteForm } from "@/components/admin-delete-form";
import { AdminTableauDialog } from "@/components/admin-tableau-dialog";
import { EmptyState } from "@/components/empty-state";
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

function buildStartTime(date: Date, rawTime: string) {
  if (!/^\d{2}:\d{2}$/.test(rawTime)) {
    return null;
  }

  const [hours, minutes] = rawTime.split(":").map(Number);
  if (Number.isNaN(hours) || Number.isNaN(minutes)) {
    return null;
  }

  const startTime = new Date(date);
  startTime.setHours(hours, minutes, 0, 0);
  return startTime;
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
    select: { date: true },
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
    const templates = await prisma.tableauTemplate.findMany({
      orderBy: [{ startTime: "asc" }, { name: "asc" }],
      select: { id: true, name: true, startTime: true },
    });

    const missingTemplates = templates.filter(
      (template) => !existingTemplateIds.has(template.id),
    );

    if (missingTemplates.length === 0) {
      return {
        ok: false,
        message: "Tous les templates sont déjà ajoutés à ce tour.",
      };
    }

    const templateWithoutTime = missingTemplates.find(
      (template) => !template.startTime,
    );
    if (templateWithoutTime) {
      return {
        ok: false,
        message: `Horaire manquant pour le template ${templateWithoutTime.name}.`,
      };
    }

    const data = missingTemplates.map((template) => ({
      templateId: template.id,
      tourId: parsed.data.tourId,
      startTime: buildStartTime(tour.date, template.startTime!)!,
    }));

    await prisma.tableau.createMany({
      data,
      skipDuplicates: true,
    });

    revalidatePath("/admin/tableaux");
    revalidatePath(`/admin/tours/${parsed.data.tourId}`);

    return {
      ok: true,
      message: `${missingTemplates.length} tableau(x) ajouté(s).`,
    };
  }

  if (existingTemplateIds.has(parsed.data.templateId)) {
    return {
      ok: false,
      message: "Ce template est déjà associé à ce tour.",
    };
  }

  const template = await prisma.tableauTemplate.findUnique({
    where: { id: parsed.data.templateId },
    select: { startTime: true, name: true },
  });

  if (!template) {
    return { ok: false, message: "Template introuvable." };
  }

  if (!template.startTime) {
    return {
      ok: false,
      message: `Horaire manquant pour le template ${template.name}.`,
    };
  }

  const startTime = buildStartTime(tour.date, template.startTime);
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
    season: { year: number };
    status: "DRAFT" | "OPEN" | "CLOSED" | "DONE";
  };
  type TemplateItem = {
    id: string;
    name: string;
    minPoints: number | null;
    maxPoints: number | null;
    startTime: string | null;
  };
  type TableauItem = {
    id: string;
    startTime: Date;
    template: TemplateItem;
    tour: { id: string; name: string; status: "DRAFT" | "OPEN" | "CLOSED" | "DONE" };
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
      orderBy: [{ startTime: "asc" }, { name: "asc" }],
    }),
    prisma.tableau.findMany({
      include: {
        template: true,
        tour: { include: { season: true } },
      },
      orderBy: [{ tour: { date: "asc" } }, { startTime: "asc" }],
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
    }));

  const templateOptions = templates.map((template: TemplateItem) => ({
    id: template.id,
    name: template.name,
    minPoints: template.minPoints,
    maxPoints: template.maxPoints,
    startTime: template.startTime,
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
    const items = tableauxByTour.get(tour.id) ?? [];
    const configuredTemplateIds = new Set(items.map((tableau) => tableau.template.id));
    const missingTemplates = readyTemplates.filter(
      (template) => !configuredTemplateIds.has(template.id),
    );
    const coverageBase = readyTemplates.length;
    const coverage =
      coverageBase > 0
        ? Math.round((items.length / coverageBase) * 100)
        : 0;

    return {
      ...tour,
      tableaux: items,
      missingTemplates,
      coverage,
      isUpcoming: tour.date >= today,
    };
  });

  const configuredTours = tourCards.filter((tour) => tour.tableaux.length > 0).length;
  const completeTours = tourCards.filter(
    (tour) => readyTemplates.length > 0 && tour.missingTemplates.length === 0,
  ).length;
  const upcomingTours = tourCards.filter((tour) => tour.isUpcoming);
  const highlightedTours =
    upcomingTours.length > 0 ? upcomingTours : tourCards;
  const stats = [
    {
      label: "Tableaux créés",
      value: tableaux.length.toString(),
      hint: "Instances rattachées aux tours",
      icon: Layers3,
    },
    {
      label: "Tours configurés",
      value: configuredTours.toString(),
      hint: `${completeTours} tour(s) complets`,
      icon: CalendarDays,
    },
    {
      label: "Templates prêts",
      value: readyTemplates.length.toString(),
      hint: `${templates.length} template(s) au total`,
      icon: Sparkles,
    },
    {
      label: "Horaires manquants",
      value: templatesWithoutTime.length.toString(),
      hint: "À corriger côté templates",
      icon: Clock3,
    },
  ];

  return (
    <section className="page">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="page-header">
          <h1 className="page-title">Tableaux</h1>
          <p className="page-subtitle">
            Pilotez les tableaux par tour, repérez ce qui manque et ajoutez
            toute une configuration en un clic.
          </p>
        </div>
        <AdminTableauDialog
          action={createTableau}
          tours={tourOptions}
          templates={templateOptions}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label} className="surface border-border/60">
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
        <div className="surface p-4 text-sm text-muted-foreground">
          Creez d&apos;abord un tour et un template pour ajouter un tableau.
        </div>
      ) : null}

      {templates.length > 0 ? (
        <Card className="surface border-border/60 bg-muted/20">
          <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <CardTitle>Référentiel de templates</CardTitle>
              <CardDescription>
                Les horaires viennent des templates. Si un template n&apos;a pas
                d&apos;horaire, il ne pourra pas être ajouté automatiquement.
              </CardDescription>
            </div>
            <Button asChild size="sm" variant="secondary">
              <Link href="/admin/tableau-templates">Gérer les templates</Link>
            </Button>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {templates.map((template) => (
              <div
                key={template.id}
                className="rounded-xl border border-border/60 bg-background px-3 py-2 text-sm"
              >
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
                <p className="mt-1 text-xs text-muted-foreground">
                  {formatRange(template.minPoints, template.maxPoints)}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>
      ) : null}

      {templatesWithoutTime.length > 0 ? (
        <Card className="surface border-destructive/30 bg-destructive/5">
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
          <Card className="surface border-border/60 xl:col-span-2">
            <CardContent className="pt-6">
              <EmptyState
                title="Aucun tour à configurer"
                description="Créez un tour puis ajoutez les tableaux nécessaires."
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
              <Card key={tour.id} className="surface border-border/60">
                <CardHeader className="space-y-3">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <CardTitle>{tour.name}</CardTitle>
                        <Badge variant={statusVariant}>{tour.status}</Badge>
                        {tour.missingTemplates.length === 0 &&
                        readyTemplates.length > 0 ? (
                          <Badge variant="secondary">Complet</Badge>
                        ) : null}
                      </div>
                      <CardDescription>
                        {dateFormatter.format(tour.date)} · Saison {tour.season.year}
                      </CardDescription>
                    </div>
                    <div className="rounded-2xl border border-border/60 bg-muted/30 px-3 py-2 text-right">
                      <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
                        Couverture
                      </p>
                      <p className="text-xl font-semibold text-foreground">
                        {readyTemplates.length > 0
                          ? `${tour.tableaux.length}/${readyTemplates.length}`
                          : tour.tableaux.length}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {readyTemplates.length > 0
                          ? `${tour.coverage}% prêt`
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
                      Aucun tableau créé pour ce tour.
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
                          <AdminDeleteForm
                            id={tableau.id}
                            action={deleteTableau}
                            label="Retirer"
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
                            {template.name} · {formatTemplateTime(template.startTime)}
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
