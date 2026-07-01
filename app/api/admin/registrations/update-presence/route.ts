import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { requireAdminApi } from "@/lib/require-admin-api";

type Payload = {
  ids: string[];
  presence: "UNKNOWN" | "PRESENT" | "ABSENT";
};

export async function POST(req: Request) {
  const auth = await requireAdminApi();
  if (auth.response) return auth.response;

  const body = (await req.json()) as Partial<Payload>;
  const ids = Array.isArray(body.ids)
    ? body.ids.map((id) => String(id)).filter(Boolean)
    : [];
  const presence = String(body.presence ?? "").trim() as Payload["presence"];

  if (!ids.length || !["UNKNOWN", "PRESENT", "ABSENT"].includes(presence)) {
    return NextResponse.json(
      { ok: false, message: "Donnees invalides." },
      { status: 400 },
    );
  }

  await prisma.registration.updateMany({
    where: { id: { in: ids } },
    data: { presence },
  });

  return NextResponse.json({
    ok: true,
    message: "Presence mise a jour.",
  });
}
