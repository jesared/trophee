import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

import { getCurrentUser } from "@/lib/current-user";
import { prisma } from "@/lib/prisma";

const roles = ["USER", "ORGANIZER", "ADMIN"] as const;

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") {
    return NextResponse.json(
      { ok: false, message: "Acces interdit." },
      { status: 401 },
    );
  }

  const body = (await request.json()) as { id?: string; role?: string };
  const id = body.id ?? "";
  const role = body.role ?? "";

  if (!id || !roles.includes(role as never)) {
    return NextResponse.json(
      { ok: false, message: "Donnees invalides." },
      { status: 400 },
    );
  }

  if (role !== "ADMIN") {
    const adminCount = await prisma.user.count({ where: { role: "ADMIN" } });
    const target = await prisma.user.findUnique({
      where: { id },
      select: { role: true },
    });

    if (target?.role === "ADMIN" && adminCount <= 1) {
      return NextResponse.json(
        { ok: false, message: "Au moins un admin est requis." },
        { status: 400 },
      );
    }
  }

  await prisma.user.update({
    where: { id },
    data: { role: role as "USER" | "ORGANIZER" | "ADMIN" },
  });

  revalidatePath("/admin/users");
  return NextResponse.json({ ok: true, message: "Role mis a jour." });
}
