import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

import {
  deleteCloudinaryResources,
  isCloudinaryConfigured,
} from "@/lib/cloudinary-admin";
import { getCurrentUser } from "@/lib/current-user";

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") {
    return NextResponse.json(
      { ok: false, message: "Acces interdit." },
      { status: 401 },
    );
  }

  if (
    !isCloudinaryConfigured()
  ) {
    return NextResponse.json(
      { ok: false, message: "Variables Cloudinary manquantes." },
      { status: 400 },
    );
  }

  const body = (await request.json()) as { items?: string[] };
  const items = body.items ?? [];
  if (items.length === 0) {
    return NextResponse.json(
      { ok: false, message: "Aucun fichier selectionne." },
      { status: 400 },
    );
  }

  try {
    await deleteCloudinaryResources(items);
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
  return NextResponse.json({
    ok: true,
    message: `${items.length} fichier(s) supprime(s).`,
  });
}
