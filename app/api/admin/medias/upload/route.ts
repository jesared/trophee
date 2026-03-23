import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

import { getCurrentUser } from "@/lib/current-user";
import { getSupabaseAdmin, getSupabaseBucket } from "@/lib/supabase-admin";

const ALLOWED_FOLDERS = ["logos", "affiches", "photos", "autres"] as const;

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
    !process.env.SUPABASE_URL ||
    !process.env.SUPABASE_SERVICE_ROLE_KEY ||
    !process.env.SUPABASE_STORAGE_BUCKET
  ) {
    return NextResponse.json(
      { ok: false, message: "Variables Supabase manquantes." },
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
  const safeFolder = ALLOWED_FOLDERS.includes(folder as never)
    ? folder
    : "autres";
  const path = `${safeFolder}/${Date.now()}-${cleanName}`;
  const buffer = Buffer.from(await file.arrayBuffer());

  const supabase = getSupabaseAdmin();
  const bucket = getSupabaseBucket();
  const { error } = await supabase.storage.from(bucket).upload(path, buffer, {
    contentType: file.type,
    upsert: false,
  });

  if (error) {
    return NextResponse.json(
      { ok: false, message: "Upload echoue. " + error.message },
      { status: 500 },
    );
  }

  revalidatePath("/admin/medias");
  return NextResponse.json({ ok: true, message: "Image uploadee." });
}
