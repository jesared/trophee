import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

import { getCurrentUser } from "@/lib/current-user";
import { getSupabaseAdmin, getSupabaseBucket } from "@/lib/supabase-admin";

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") {
    return NextResponse.json(
      { ok: false, message: "Acces interdit." },
      { status: 401 },
    );
  }

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

  const formData = await request.formData();
  const name = formData.get("name");
  if (typeof name !== "string" || !name) {
    return NextResponse.json(
      { ok: false, message: "Fichier invalide." },
      { status: 400 },
    );
  }

  const supabase = getSupabaseAdmin();
  const bucket = getSupabaseBucket();
  const { error } = await supabase.storage.from(bucket).remove([name]);

  if (error) {
    return NextResponse.json(
      { ok: false, message: "Suppression echouee. " + error.message },
      { status: 500 },
    );
  }

  revalidatePath("/admin/medias");
  return NextResponse.json({ ok: true, message: "Image supprimee." });
}
