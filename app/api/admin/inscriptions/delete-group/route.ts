import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/prisma";
import { requireAdminApi } from "@/lib/require-admin-api";

export async function POST(request: Request) {
  const auth = await requireAdminApi();
  if (auth.response) return auth.response;

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
