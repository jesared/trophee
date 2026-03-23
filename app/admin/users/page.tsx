import { revalidatePath } from "next/cache";
import type { Prisma, Role } from "@prisma/client";

import { authOptions } from "@/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { EmptyState } from "@/components/empty-state";
import { requireAdmin } from "@/lib/require-admin";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";

const roles = ["USER", "ORGANIZER", "ADMIN"] as const satisfies ReadonlyArray<Role>;

type PageProps = {
  searchParams: Promise<{ q?: string; role?: string }>;
};

async function updateUserRole(formData: FormData): Promise<void> {
  "use server";

  await requireAdmin();

  const id = String(formData.get("id") ?? "").trim();
  const roleValue = String(formData.get("role") ?? "").trim();
  const role = roles.find((item) => item === roleValue);

  if (!id || !role) {
    return;
  }

  if (role !== "ADMIN") {
    const adminCount = await prisma.user.count({ where: { role: "ADMIN" } });
    const target = await prisma.user.findUnique({
      where: { id },
      select: { role: true },
    });

    if (target?.role === "ADMIN" && adminCount <= 1) {
      return;
    }
  }

  await prisma.user.update({
    where: { id },
    data: { role },
  });

  revalidatePath("/admin/users");
}

async function deleteUser(formData: FormData): Promise<void> {
  "use server";

  await requireAdmin();

  const id = String(formData.get("id") ?? "").trim();

  if (!id) {
    return;
  }

  const session = await getServerSession(authOptions);
  const currentUserId = session?.user?.id;

  if (currentUserId && currentUserId === id) {
    return;
  }

  const adminCount = await prisma.user.count({ where: { role: "ADMIN" } });
  const target = await prisma.user.findUnique({
    where: { id },
    select: { role: true },
  });

  if (target?.role === "ADMIN" && adminCount <= 1) {
    return;
  }

  await prisma.user.delete({
    where: { id },
  });

  revalidatePath("/admin/users");
}

export default async function AdminUsersPage({ searchParams }: PageProps) {
  await requireAdmin();

  const { q, role } = await searchParams;
  const query = q?.trim();
  const roleFilter = role?.trim();

  type UserItem = {
    id: string;
    name: string | null;
    email: string | null;
    role: Role | null;
    createdAt: Date;
  };

  const where: Prisma.UserWhereInput = {
    AND: [
      query
        ? {
            OR: [
              { name: { contains: query, mode: "insensitive" as Prisma.QueryMode } },
              { email: { contains: query, mode: "insensitive" as Prisma.QueryMode } },
            ],
          }
        : undefined,
      roleFilter && roles.includes(roleFilter as Role)
        ? { role: roleFilter as Role }
        : undefined,
    ].filter(Boolean) as Prisma.UserWhereInput[],
  };

  const users: UserItem[] = await prisma.user.findMany({
    where,
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
    },
    orderBy: { createdAt: "desc" },
  });

  const formatter = new Intl.DateTimeFormat("fr-FR", {
    dateStyle: "medium",
  });

  return (
    <section className="page">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="page-header">
          <h1 className="page-title">Utilisateurs</h1>
          <p className="page-subtitle">
            Gestion des utilisateurs de la plateforme.
          </p>
        </div>

        <form className="flex flex-wrap items-center gap-2" method="get">
          <Input
            name="q"
            placeholder="Rechercher par nom ou email"
            defaultValue={query ?? ""}
            className="h-9 w-64"
          />
          <select
            name="role"
            defaultValue={roleFilter ?? ""}
            className="h-9 rounded-md border border-border bg-background px-2 text-sm"
          >
            <option value="">Tous les rôles</option>
            {roles.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
          <Button size="sm" variant="secondary" type="submit">
            Filtrer
          </Button>
        </form>
      </div>

      <div className="surface">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nom</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Rôle</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="py-6">
                  <EmptyState
                    title="Aucun utilisateur pour le moment"
                    description="Invitez un utilisateur pour démarrer."
                  />
                </TableCell>
              </TableRow>
            ) : (
              users.map((user: UserItem) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">
                    {user.name ?? "-"}
                  </TableCell>
                  <TableCell>{user.email ?? "-"}</TableCell>
                  <TableCell>
                    <form action={updateUserRole} className="flex items-center gap-2">
                      <input type="hidden" name="id" value={user.id} />
                      <select
                        name="role"
                        defaultValue={user.role ?? "USER"}
                        className="h-9 rounded-md border border-border bg-background px-2 text-sm"
                      >
                        {roles.map((item) => (
                          <option key={item} value={item}>
                            {item}
                          </option>
                        ))}
                      </select>
                      <Button size="sm" variant="secondary">
                        Sauver
                      </Button>
                    </form>
                  </TableCell>
                  <TableCell>{formatter.format(user.createdAt)}</TableCell>
                  <TableCell className="text-right">
                    <form action={deleteUser}>
                      <input type="hidden" name="id" value={user.id} />
                      <Button size="sm" variant="destructive">
                        Supprimer
                      </Button>
                    </form>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </section>
  );
}
