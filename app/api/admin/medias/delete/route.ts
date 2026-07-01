import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

import {
  deleteCloudinaryResources,
  isCloudinaryConfigured,
} from "@/lib/cloudinary-admin";
import { requireAdminApi } from "@/lib/require-admin-api";

export async function POST(request: Request) {
  const auth = await requireAdminApi();
  if (auth.response) return auth.response;

  if (
    !isCloudinaryConfigured()
  ) {
    return NextResponse.json(
      { ok: false, message: "Variables Cloudinary manquantes." },
      { status: 400 },
    );
  }

  const formData = await request.formData();
  const name = formData.get("name");
  if (typeof name !== "string" || !name) {
    return NextResponse.json(
      { ok: false, message: "Fichier invalide." },
      { status: 400 },
    );
  }

  try {
    await deleteCloudinaryResources([name]);
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        message:
          "Suppression echouee. " +
          (error instanceof Error ? error.message : "Erreur Cloudinary."),
      },
      { status: 500 },
    );
  }

  revalidatePath("/admin/medias");
  return NextResponse.json({ ok: true, message: "Image supprimee." });
}
