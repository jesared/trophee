import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";

function escapeCsv(value: string) {
  if (value.includes("\"") || value.includes(",") || value.includes("\n")) {
    return `"${value.replace(/"/g, "\"\"")}"`;
  }
  return value;
}

export async function GET() {
  await requireAdmin();

  const registrations = await prisma.registration.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      player: { select: { firstName: true, lastName: true, email: true } },
      tour: { select: { name: true, date: true } },
      tableau: { include: { template: { select: { name: true } } } },
    },
  });

  const header = [
    "date_inscription",
    "joueur",
    "email",
    "tour",
    "date_tour",
    "tableau",
  ];

  const rows = registrations.map((registration) => [
    registration.createdAt.toISOString(),
    `${registration.player.firstName} ${registration.player.lastName}`.trim(),
    registration.player.email ?? "",
    registration.tour.name,
    registration.tour.date.toISOString(),
    registration.tableau.template.name,
  ]);

  const csv = [header, ...rows]
    .map((row) => row.map((cell) => escapeCsv(String(cell))).join(","))
    .join("\n");

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": "attachment; filename=\"inscriptions.csv\"",
    },
  });
}
