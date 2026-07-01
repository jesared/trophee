import { NextResponse } from "next/server";

import { getCurrentUser } from "@/lib/current-user";

export async function requireAdminApi() {
  const user = await getCurrentUser();

  if (!user) {
    return {
      user: null,
      response: NextResponse.json(
        { ok: false, message: "Authentification requise." },
        { status: 401 },
      ),
    };
  }

  if (user.role !== "ADMIN") {
    return {
      user: null,
      response: NextResponse.json(
        { ok: false, message: "Acces interdit." },
        { status: 403 },
      ),
    };
  }

  return { user, response: null };
}
