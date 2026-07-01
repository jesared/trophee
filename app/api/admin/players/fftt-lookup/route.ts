import { NextResponse } from "next/server";

import { fetchFfttClubDetail, fetchFfttLicence, isFfttEnabled } from "@/lib/fftt";
import { requireAdminApi } from "@/lib/require-admin-api";

export async function POST(request: Request) {
  const auth = await requireAdminApi();
  if (auth.response) return auth.response;

  if (!isFfttEnabled()) {
    return NextResponse.json(
      { ok: false, message: "FFTT non configuree." },
      { status: 400 },
    );
  }

  const body = (await request.json()) as { licence?: string };
  const licence = String(body.licence ?? "").trim();
  if (!licence) {
    return NextResponse.json(
      { ok: false, message: "Licence requise." },
      { status: 400 },
    );
  }

  try {
    const payload = await fetchFfttLicence(licence);
    let clubDetails = null as null | Awaited<ReturnType<typeof fetchFfttClubDetail>>;

    if (payload.clubId) {
      try {
        clubDetails = await fetchFfttClubDetail(payload.clubId);
      } catch {
        clubDetails = null;
      }
    }

    return NextResponse.json({
      ok: true,
      message: "FFTT ok.",
      payload: {
        ...payload,
        clubDetails,
      },
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
