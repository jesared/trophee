import { revalidateTag } from "next/cache";
import { NextResponse } from "next/server";

import { classementDriveCacheTag } from "@/lib/classement-cache";
import { requireAdminApi } from "@/lib/require-admin-api";

export async function POST() {
  const auth = await requireAdminApi();
  if (auth.response) return auth.response;

  revalidateTag(classementDriveCacheTag, { expire: 0 });

  return NextResponse.json({
    ok: true,
    message: "Cache des classements invalide.",
  });
}
