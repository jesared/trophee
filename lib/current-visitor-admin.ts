import { cookies } from "next/headers";

import { getCurrentUser } from "@/lib/current-user";
import { prisma } from "@/lib/prisma";

function readAuthSessionToken(
  entries: { name: string; value: string }[],
): string | null {
  const bases = [
    "next-auth.session-token",
    "__Secure-next-auth.session-token",
    "authjs.session-token",
    "__Secure-authjs.session-token",
  ];

  for (const base of bases) {
    const direct = entries.find((entry) => entry.name === base);

    if (direct?.value) {
      return direct.value;
    }

    const chunks = entries
      .filter((entry) => entry.name.startsWith(`${base}.`))
      .sort((left, right) => left.name.localeCompare(right.name));

    if (chunks.length > 0) {
      return chunks.map((entry) => entry.value).join("");
    }
  }

  return null;
}

export async function getIsCurrentVisitorAdmin() {
  const user = await getCurrentUser();

  if (user?.role === "ADMIN") {
    return true;
  }

  if (user?.email) {
    const dbUser = await prisma.user.findFirst({
      where: {
        email: {
          equals: user.email,
          mode: "insensitive",
        },
      },
      select: { role: true },
    });

    if (dbUser?.role === "ADMIN") {
      return true;
    }
  }

  const cookieStore = await cookies();
  const sessionToken = readAuthSessionToken(cookieStore.getAll());

  if (!sessionToken) {
    return false;
  }

  const session = await prisma.session.findUnique({
    where: { sessionToken },
    select: {
      user: {
        select: { role: true },
      },
    },
  });

  return session?.user.role === "ADMIN";
}
