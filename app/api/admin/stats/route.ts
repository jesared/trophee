import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { requireAdminApi } from "@/lib/require-admin-api";

export async function GET() {
  const auth = await requireAdminApi();
  if (auth.response) return auth.response;

  const [
    tours,
    tableaux,
    templates,
    clubs,
    players,
    registrations,
    users,
  ] = await Promise.all([
    prisma.tour.count(),
    prisma.tableau.count(),
    prisma.tableauTemplate.count(),
    prisma.club.count(),
    prisma.player.count(),
    prisma.registration.count(),
    prisma.user.count(),
  ]);

  return NextResponse.json({
    tours,
    tableaux,
    templates,
    clubs,
    players,
    registrations,
    users,
  });
}
