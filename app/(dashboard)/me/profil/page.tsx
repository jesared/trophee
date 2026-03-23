import { revalidatePath } from "next/cache";
import Link from "next/link";

import { authOptions } from "@/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";

async function updateProfile(formData: FormData) {
  "use server";

  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;

  if (!userId) {
    return;
  }

  const name = String(formData.get("name") ?? "").trim();

  if (!name) {
    return;
  }

  await prisma.user.update({
    where: { id: userId },
    data: { name },
  });

  revalidatePath("/me/profil");
}

export default async function UserProfilePage() {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;

  if (!userId) {
    return (
    <section className="page">
      <div className="page-header">
        <h1 className="page-title">Mon profil</h1>
        <p className="page-subtitle">
          Connectez-vous pour modifier votre profil.
        </p>
      </div>
        <div className="surface p-6 text-sm text-muted-foreground">
          <p>Vous devez être connecté pour accéder à votre profil.</p>
          <Button asChild size="sm" className="mt-4">
            <Link href="/api/auth/signin">Se connecter</Link>
          </Button>
        </div>
      </section>
    );
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { name: true, email: true },
  });

  const player = user?.email
    ? await prisma.player.findFirst({
        where: { email: user.email },
        select: { club: true, points: true, licence: true },
      })
    : null;

  return (
    <section className="page">
      <div className="page-header">
        <h1 className="page-title">Mon profil</h1>
        <p className="page-subtitle">
          Mettez à jour vos informations personnelles.
        </p>
      </div>

      <div className="surface p-6">
        <form action={updateProfile} className="space-y-5">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Nom</Label>
              <Input id="name" name="name" defaultValue={user?.name ?? ""} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                defaultValue={user?.email ?? ""}
                disabled
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="club">Club</Label>
              <Input
                id="club"
                defaultValue={player?.club ?? "Non renseigné"}
                disabled
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="points">Points</Label>
              <Input
                id="points"
                type="number"
                defaultValue={player?.points ?? ""}
                placeholder="Non renseigné"
                disabled
              />
            </div>
          </div>

          <div className="flex flex-col gap-2 text-xs text-muted-foreground">
            <span>
              Le club et les points proviennent du profil joueur FFTT associé à
              votre email.
            </span>
            {player?.licence ? (
              <span>Licence : {player.licence}</span>
            ) : (
              <span>
                Licence non trouvée. Contactez l’organisation si besoin.
              </span>
            )}
          </div>

          <div className="flex justify-end">
            <Button type="submit">Enregistrer</Button>
          </div>
        </form>
      </div>
    </section>
  );
}
