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

  const body = (await request.json()) as { items?: string[] };
  const items = body.items ?? [];
  if (items.length === 0) {
    return NextResponse.json(
      { ok: false, message: "Aucun fichier selectionne." },
      { status: 400 },
    );
  }

  const supabase = getSupabaseAdmin();
  const bucket = getSupabaseBucket();
  const { error } = await supabase.storage.from(bucket).remove(items);

  if (error) {
    return NextResponse.json(
      { ok: false, message: "Suppression echouee. " + error.message },
      { status: 500 },
    );
  }

  revalidatePath("/admin/medias");
  return NextResponse.json({
    ok: true,
    message: `${items.length} fichier(s) supprime(s).`,
  });
}
