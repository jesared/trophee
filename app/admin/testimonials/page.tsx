import Link from "next/link";
import { revalidatePath } from "next/cache";

import { AdminDeleteDialog } from "@/components/admin-delete-dialog";
import { EmptyState } from "@/components/empty-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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

type ActionState = {
  ok: boolean;
  message: string;
};

async function approveTestimonial(formData: FormData): Promise<void> {
  "use server";

  await requireAdmin();

  const id = String(formData.get("id") ?? "").trim();
  if (!id) return;

  await prisma.testimonial.update({
    where: { id },
    data: { isApproved: true },
  });

  revalidatePath("/");
  revalidatePath("/admin/testimonials");
}

async function rejectTestimonial(formData: FormData): Promise<void> {
  "use server";

  await requireAdmin();

  const id = String(formData.get("id") ?? "").trim();
  if (!id) return;

  await prisma.testimonial.update({
    where: { id },
    data: { isApproved: false },
  });

  revalidatePath("/");
  revalidatePath("/admin/testimonials");
}

async function deleteTestimonial(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  "use server";

  await requireAdmin();

  const id = String(formData.get("id") ?? "").trim();
  if (!id) return { ok: false, message: "Avis introuvable." };

  await prisma.testimonial.delete({ where: { id } });
  revalidatePath("/");
  revalidatePath("/admin/testimonials");
  return { ok: true, message: "Avis supprime." };
}

type PageProps = {
  searchParams: Promise<{ status?: string }>;
};

export default async function AdminTestimonialsPage({ searchParams }: PageProps) {
  await requireAdmin();

  const { status } = await searchParams;
  const normalized = status === "pending" || status === "approved" ? status : "";

  const testimonials = await prisma.testimonial.findMany({
    where:
      normalized === "pending"
        ? { isApproved: false }
        : normalized === "approved"
          ? { isApproved: true }
          : undefined,
    orderBy: { createdAt: "desc" },
  });

  return (
    <section className="page">
      <div className="space-y-2">
        <h1 className="font-heading text-3xl font-bold tracking-[-0.045em] text-foreground sm:text-4xl">
          Avis
        </h1>
        <p className="max-w-2xl text-[0.95rem] leading-7 text-muted-foreground sm:text-base">
          Validez ou masquez les temoignages affiches sur l&apos;accueil.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button
          asChild
          variant={normalized === "" ? "default" : "outline"}
          size="sm"
        >
          <Link href="/admin/testimonials">Tous</Link>
        </Button>
        <Button
          asChild
          variant={normalized === "pending" ? "default" : "outline"}
          size="sm"
        >
          <Link href="/admin/testimonials?status=pending">En attente</Link>
        </Button>
        <Button
          asChild
          variant={normalized === "approved" ? "default" : "outline"}
          size="sm"
        >
          <Link href="/admin/testimonials?status=approved">Publies</Link>
        </Button>
      </div>

      <Card className="border-border/70">
        <CardHeader>
          <CardTitle>Moderation des avis</CardTitle>
          <CardDescription>
            Filtrez, approuvez ou retirez les temoignages publies sur l&apos;accueil.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nom</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Avis</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {testimonials.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="py-6">
                    <EmptyState
                      title="Aucun avis"
                      description="Les avis deposes apparaitront ici."
                    />
                  </TableCell>
                </TableRow>
              ) : (
                testimonials.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.authorName}</TableCell>
                    <TableCell>{item.authorRole ?? "-"}</TableCell>
                    <TableCell className="max-w-md">
                      <p className="whitespace-pre-wrap text-sm text-muted-foreground">
                        {item.content}
                      </p>
                    </TableCell>
                    <TableCell>
                      <Badge variant={item.isApproved ? "secondary" : "outline"}>
                        {item.isApproved ? "Publie" : "En attente"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex flex-wrap justify-end gap-2">
                        {item.isApproved ? (
                          <form action={rejectTestimonial}>
                            <input type="hidden" name="id" value={item.id} />
                            <Button size="sm" variant="secondary">
                              Mettre en attente
                            </Button>
                          </form>
                        ) : (
                          <form action={approveTestimonial}>
                            <input type="hidden" name="id" value={item.id} />
                            <Button size="sm">Approuver</Button>
                          </form>
                        )}
                        <AdminDeleteDialog
                          id={item.id}
                          action={deleteTestimonial}
                          title="Supprimer cet avis ?"
                          description={`Cette action supprimera l'avis de ${item.authorName}.`}
                        />
                      </div>
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
