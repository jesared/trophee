import type { Prisma, PrismaClient } from "@prisma/client";

import { sortByTableauNaturalOrder } from "@/lib/tableau-order";

type PrismaTransaction = Omit<
  PrismaClient,
  "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends"
>;

export function buildTableauStartTime(date: Date, rawTime: string) {
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

export async function buildSeasonTemplateTableauxData(
  prisma: PrismaTransaction,
  params: {
    seasonId: string;
    tourId: string;
    tourDate: Date;
    excludeTemplateIds?: Set<string>;
  },
): Promise<{
  data: Prisma.TableauCreateManyInput[];
  skippedWithoutTime: string[];
}> {
  const templates = await prisma.tableauTemplate.findMany({
    where: { seasonId: params.seasonId },
    orderBy: [{ name: "asc" }, { startTime: "asc" }],
    select: { id: true, name: true, startTime: true },
  });
  const orderedTemplates = sortByTableauNaturalOrder(
    templates,
    (template) => template.name,
    (template) => template.startTime,
  );

  const data: Prisma.TableauCreateManyInput[] = [];
  const skippedWithoutTime: string[] = [];

  for (const template of orderedTemplates) {
    if (params.excludeTemplateIds?.has(template.id)) {
      continue;
    }

    if (!template.startTime) {
      skippedWithoutTime.push(template.name);
      continue;
    }

    const startTime = buildTableauStartTime(params.tourDate, template.startTime);
    if (!startTime) {
      skippedWithoutTime.push(template.name);
      continue;
    }

    data.push({
      templateId: template.id,
      tourId: params.tourId,
      startTime,
    });
  }

  return { data, skippedWithoutTime };
}
