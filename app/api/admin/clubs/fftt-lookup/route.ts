import { NextResponse } from "next/server";

import { fetchFfttClubDetail, isFfttEnabled } from "@/lib/fftt";
import { requireAdmin } from "@/lib/require-admin";

export async function POST(request: Request) {
  await requireAdmin();

  if (!isFfttEnabled()) {
    return NextResponse.json(
      { ok: false, message: "FFTT non configuree." },
      { status: 400 },
    );
  }

  const body = (await request.json()) as { clubNumber?: string; clubId?: string };
  const clubNumber = String(body.clubNumber ?? "").trim();
  const clubId = String(body.clubId ?? "").trim();
  const clubParam = clubNumber || clubId;
  if (!clubParam) {
    return NextResponse.json(
      { ok: false, message: "Numero de club requis." },
      { status: 400 },
    );
  }

  try {
    const payload = await fetchFfttClubDetail(clubParam);
    return NextResponse.json({
      ok: true,
      message: "FFTT ok.",
      payload,
    });
  } catch (error) {
    const message =
      error instanceof Error && error.message
        ? `FFTT indisponible: ${error.message}`
        : "FFTT indisponible.";
    return NextResponse.json(
      { ok: false, message },
      { status: 500 },
    );
  }
}
