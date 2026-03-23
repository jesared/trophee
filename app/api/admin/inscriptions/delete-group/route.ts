import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

import { getCurrentUser } from "@/lib/current-user";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") {
    return NextResponse.json(
      { ok: false, message: "Acces interdit." },
      { status: 401 },
    );
  }

  const body = (await request.json()) as { ids?: string[] };
  const ids = body.ids ?? [];
  if (ids.length === 0) {
    return NextResponse.json(
      { ok: false, message: "Aucune inscription selectionnee." },
      { status: 400 },
    );
  }

  await prisma.registration.deleteMany({
    where: { id: { in: ids } },
  });

  revalidatePath("/admin/inscriptions");
  return NextResponse.json({
    ok: true,
    message: `${ids.length} inscription(s) supprimee(s).`,
  });
}
