import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/prisma";
import { requireAdminApi } from "@/lib/require-admin-api";

export async function POST(request: Request) {
  const auth = await requireAdminApi();
  if (auth.response) return auth.response;

  const body = (await request.json()) as {
    playerId?: string;
    tourId?: string;
    tableauIds?: string[];
  };
  const playerId = body.playerId ?? "";
  const tourId = body.tourId ?? "";
  const tableauIds = body.tableauIds ?? [];

  if (!playerId || !tourId) {
    return NextResponse.json(
      { ok: false, message: "Donnees manquantes." },
      { status: 400 },
    );
  }

  if (tableauIds.length === 0) {
    return NextResponse.json(
      { ok: false, message: "Selectionnez au moins un tableau." },
      { status: 400 },
    );
  }

  const validCount = await prisma.tableau.count({
    where: { id: { in: tableauIds }, tourId },
  });

  if (validCount !== tableauIds.length) {
    return NextResponse.json(
      { ok: false, message: "Tableau invalide pour ce tour." },
      { status: 400 },
    );
  }

  await prisma.$transaction([
    prisma.registration.deleteMany({
      where: { playerId, tourId },
    }),
    prisma.registration.createMany({
      data: tableauIds.map((tableauId) => ({
        playerId,
        tourId,
        tableauId,
      })),
      skipDuplicates: true,
    }),
  ]);

  revalidatePath("/admin/inscriptions");
  return NextResponse.json({ ok: true, message: "Inscriptions mises a jour." });
}
