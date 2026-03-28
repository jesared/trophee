import Link from "next/link";
import { revalidatePath } from "next/cache";

import { AdminDeleteForm } from "@/components/admin-delete-form";
import { EmptyState } from "@/components/empty-state";
import { Button } from "@/components/ui/button";
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
  return { ok: true, message: "Avis supprimé." };
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
      <div className="page-header">
        <h1 className="page-title">Avis</h1>
        <p className="page-subtitle">
          Validez ou masquez les témoignages affichés sur l’accueil.
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
          <Link href="/admin/testimonials?status=approved">Publiés</Link>
        </Button>
      </div>

      <div className="surface">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nom</TableHead>
              <TableHead>Rôle</TableHead>
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
                    description="Les avis déposés apparaîtront ici."
                  />
                </TableCell>
              </TableRow>
            ) : (
              testimonials.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">
                    {item.authorName}
                  </TableCell>
                  <TableCell>{item.authorRole ?? "-"}</TableCell>
                  <TableCell className="max-w-md">
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                      {item.content}
                    </p>
                  </TableCell>
                  <TableCell>
                    <span className="badge-pill">
                      {item.isApproved ? "Publié" : "En attente"}
                    </span>
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
                      <AdminDeleteForm id={item.id} action={deleteTestimonial} />
                    </div>
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
