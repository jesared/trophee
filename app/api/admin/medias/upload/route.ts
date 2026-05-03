import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

import {
  isCloudinaryConfigured,
  isMediaFolderValue,
  uploadCloudinaryImage,
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

  const formData = await request.formData();
  const file = formData.get("file");

  if (
    !isCloudinaryConfigured()
  ) {
    return NextResponse.json(
      { ok: false, message: "Variables Cloudinary manquantes." },
      { status: 400 },
    );
  }

  if (!(file instanceof File)) {
    return NextResponse.json(
      { ok: false, message: "Aucun fichier selectionne." },
      { status: 400 },
    );
  }

  if (!file.type.startsWith("image/")) {
    return NextResponse.json(
      { ok: false, message: "Uniquement des images sont autorisees." },
      { status: 400 },
    );
  }

  const cleanName = file.name.replace(/[^a-zA-Z0-9.\-_]/g, "-");
  const folder =
    typeof formData.get("folder") === "string"
      ? String(formData.get("folder"))
      : "autres";
  const safeFolder = isMediaFolderValue(folder) ? folder : "autres";

  try {
    await uploadCloudinaryImage(
      new File([file], cleanName, { type: file.type }),
      safeFolder,
    );
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        message:
          "Upload echoue. " +
          (error instanceof Error ? error.message : "Erreur Cloudinary."),
      },
      { status: 500 },
    );
  }

  revalidatePath("/admin/medias");
  return NextResponse.json({ ok: true, message: "Image uploadee." });
}
