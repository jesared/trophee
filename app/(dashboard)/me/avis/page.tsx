import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";

import { authOptions } from "@/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CharacterCountTextarea } from "@/components/forms/CharacterCountTextarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { prisma } from "@/lib/prisma";

const MAX_TESTIMONIAL_LENGTH = 280;

type PageProps = {
  searchParams: Promise<{ sent?: string }>;
};

async function createTestimonial(formData: FormData) {
  "use server";

  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    redirect("/login");
  }

  const authorName = String(formData.get("authorName") ?? "").trim();
  const authorRole = String(formData.get("authorRole") ?? "").trim();
  const content = String(formData.get("content") ?? "").trim();

  if (!authorName || !content) {
    redirect("/me/avis?sent=0");
  }

  await prisma.testimonial.create({
    data: {
      authorName,
      authorRole: authorRole || null,
      content,
      userId: session.user.id,
      isApproved: false,
    },
  });

  redirect("/me/avis?sent=1");
}

export default async function UserReviewPage({ searchParams }: PageProps) {
  const { sent } = await searchParams;
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/login");
  }

  return (
    <section className="page">
      <div className="page-header">
        <p className="badge-pill w-fit">Avis</p>
        <h1 className="page-title">Laisser un avis</h1>
        <p className="page-subtitle">
          Aide-nous à valoriser le trophée avec un retour authentique.
        </p>
      </div>

      <Card className="surface max-w-2xl">
        <CardHeader>
          <CardTitle>Ton retour compte</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {sent === "1" ? (
            <p className="text-sm text-emerald-600">
              Merci ! Ton avis a bien été enregistré et sera publié après
              validation.
            </p>
          ) : sent === "0" ? (
            <p className="text-sm text-destructive">
              Merci de renseigner ton nom et ton avis.
            </p>
          ) : null}

          <form action={createTestimonial} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="authorName">Nom affiché</Label>
              <Input
                id="authorName"
                name="authorName"
                defaultValue={session.user.name ?? ""}
                placeholder="Ex : Julien Martin"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="authorRole">Rôle / Club (optionnel)</Label>
              <Input
                id="authorRole"
                name="authorRole"
                placeholder="Joueur licencié, Responsable club..."
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="content">Ton avis</Label>
              <CharacterCountTextarea
                id="content"
                name="content"
                maxLength={MAX_TESTIMONIAL_LENGTH}
                placeholder="Quelques phrases sur ton expérience du trophée..."
              />
            </div>
            <div className="flex flex-wrap gap-3">
              <Button type="submit">Publier mon avis</Button>
              <Button asChild variant="secondary">
                <a href="/me">Retour au dashboard</a>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </section>
  );
}
