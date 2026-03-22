import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { requireAdmin } from "@/lib/require-admin";
import { prisma } from "@/lib/prisma";

export default async function AdminUsersPage() {
  await requireAdmin();

  type UserItem = {
    id: string;
    name: string | null;
    email: string | null;
    role: string | null;
    createdAt: Date;
  };

  const users: UserItem[] = await prisma.user.findMany({
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
    <section className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Utilisateurs</h1>
        <p className="text-sm text-muted-foreground">
          Gestion des utilisateurs de la plateforme.
        </p>
      </div>

      <div className="rounded-lg border border-border bg-background">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nom</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Rôle</TableHead>
              <TableHead>Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="py-10 text-center">
                  Aucun utilisateur pour le moment.
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
                    <span className="inline-flex rounded-full bg-muted px-2.5 py-1 text-xs font-semibold text-muted-foreground ring-1 ring-inset ring-border">
                      {user.role ?? "USER"}
                    </span>
                  </TableCell>
                  <TableCell>{formatter.format(user.createdAt)}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </section>
  );
}
