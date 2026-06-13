import { revalidatePath } from "next/cache";
import type { Prisma, Role } from "@prisma/client";
import { getServerSession } from "next-auth";

import { authOptions } from "@/auth";
import { AdminPageHeader } from "@/components/admin-page-header";
import { AdminUserRowActions } from "@/components/admin-user-row-actions";
import { AdminUsersFilters } from "@/components/admin-users-filters";
import { AdminUserRole } from "@/components/admin-user-role";
import { EmptyState } from "@/components/empty-state";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { requireAdmin } from "@/lib/require-admin";
import { prisma } from "@/lib/prisma";

const roles = ["USER", "ORGANIZER", "ADMIN"] as const satisfies ReadonlyArray<Role>;

type PageProps = {
  searchParams: Promise<{ q?: string; role?: string }>;
};

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

  const [users, totalUsers, adminUsers, organizerUsers] = await Promise.all([
    prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    }) as Promise<UserItem[]>,
    prisma.user.count(),
    prisma.user.count({ where: { role: "ADMIN" } }),
    prisma.user.count({ where: { role: "ORGANIZER" } }),
  ]);

  const formatter = new Intl.DateTimeFormat("fr-FR", {
    dateStyle: "medium",
  });

  return (
    <section className="space-y-8">
      <AdminPageHeader
        title="Utilisateurs"
        description="Gere les comptes, les roles et les suppressions sensibles depuis un annuaire unique."
      />

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-border/70">
          <CardHeader>
            <CardDescription>Utilisateurs</CardDescription>
            <CardTitle className="text-3xl">{totalUsers}</CardTitle>
          </CardHeader>
          <CardContent className="pt-0 text-sm text-muted-foreground">
            Tous les comptes actuellement enregistres.
          </CardContent>
        </Card>
        <Card className="border-border/70">
          <CardHeader>
            <CardDescription>Admins</CardDescription>
            <CardTitle className="text-3xl">{adminUsers}</CardTitle>
          </CardHeader>
          <CardContent className="pt-0 text-sm text-muted-foreground">
            Comptes avec acces complet a l&apos;administration.
          </CardContent>
        </Card>
        <Card className="border-border/70">
          <CardHeader>
            <CardDescription>Organisateurs</CardDescription>
            <CardTitle className="text-3xl">{organizerUsers}</CardTitle>
          </CardHeader>
          <CardContent className="pt-0 text-sm text-muted-foreground">
            Comptes intermediaires pour la gestion des operations.
          </CardContent>
        </Card>
      </div>

      <Alert>
        <AlertTitle>Garde-fous actifs</AlertTitle>
        <AlertDescription>
          La page empeche l&apos;auto-suppression du compte courant et bloque la
          suppression du dernier administrateur.
        </AlertDescription>
      </Alert>

      <Card className="border-border/70">
        <CardHeader className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-1">
            <CardTitle>Annuaire utilisateurs</CardTitle>
            <CardDescription>
              Filtrez, ajustez les roles puis confirmez les suppressions
              critiques.
            </CardDescription>
          </div>
          <AdminUsersFilters
            query={query}
            roleFilter={roleFilter}
            roles={roles}
          />
        </CardHeader>
        <CardContent className="pt-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nom</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
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
                      description="Invitez un utilisateur pour demarrer."
                    />
                  </TableCell>
                </TableRow>
              ) : (
                users.map((user: UserItem) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.name ?? "-"}</TableCell>
                    <TableCell>{user.email ?? "-"}</TableCell>
                    <TableCell>
                      <AdminUserRole id={user.id} role={user.role} />
                    </TableCell>
                    <TableCell>{formatter.format(user.createdAt)}</TableCell>
                    <TableCell className="text-right">
                      <AdminUserRowActions
                        id={user.id}
                        label={user.name ?? user.email ?? "cet utilisateur"}
                        action={async (_prevState, formData) => {
                          "use server";

                          await deleteUser(formData);
                          return { ok: true, message: "Utilisateur supprime." };
                        }}
                      />
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </section>
  );
}
