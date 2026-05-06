import { revalidatePath } from "next/cache";
import Link from "next/link";

import { authOptions } from "@/auth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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

function buildInitials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
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
            Connectez-vous pour consulter et modifier vos informations.
          </p>
        </div>

        <Card className="surface max-w-xl">
          <CardContent className="space-y-4 p-6 text-sm text-muted-foreground">
            <p>Vous devez etre connecte pour acceder a votre profil.</p>
            <Button asChild size="sm">
              <Link href="/login">Connexion</Link>
            </Button>
          </CardContent>
        </Card>
      </section>
    );
  }

  const [user, player] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: { name: true, email: true },
    }),
    session.user.email
      ? prisma.player.findFirst({
          where: { email: session.user.email },
          select: { club: true, points: true, licence: true },
        })
      : Promise.resolve(null),
  ]);

  const displayName = user?.name?.trim() || "Utilisateur";
  const email = user?.email ?? "Email non renseigne";
  const initials = buildInitials(displayName);

  return (
    <section className="page">
      <div className="page-header">
        <h1 className="page-title">Mon profil</h1>
        <p className="page-subtitle">
          Gere vos informations de compte et verifiez les donnees FFTT liees a
          votre email.
        </p>
      </div>

      <div className="grid gap-6 xl:grid-cols-[320px_minmax(0,1fr)]">
        <Card className="surface h-fit overflow-hidden">
          <CardContent className="space-y-6 p-0">
            <div className="px-6 py-8">
              <div className="flex flex-col items-center text-center">
                <Avatar className="h-28 w-28 ring-4 ring-background shadow-sm">
                  <AvatarImage
                    src={session.user.image ?? ""}
                    alt={displayName}
                  />
                  <AvatarFallback className="text-xl">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div className="mt-4 space-y-1">
                  <p className="text-lg font-semibold text-foreground">
                    {displayName}
                  </p>
                  <p className="text-sm text-muted-foreground">{email}</p>
                </div>
                <div className="mt-4 flex flex-wrap justify-center gap-2">
                  <span className="badge-pill">Compte actif</span>
                  {player?.licence ? (
                    <span className="badge-pill bg-primary/10 text-primary">
                      Licence FFTT liee
                    </span>
                  ) : (
                    <span className="badge-pill">Licence non trouvee</span>
                  )}
                </div>
              </div>
            </div>

            <div className="grid gap-3 px-6 pb-6 sm:grid-cols-3 xl:grid-cols-1">
              <div className="rounded-2xl border border-border/60 bg-muted/20 p-4">
                <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
                  Club
                </p>
                <p className="pt-2 text-sm font-medium text-foreground">
                  {player?.club ?? "Non renseigne"}
                </p>
              </div>
              <div className="rounded-2xl border border-border/60 bg-muted/20 p-4">
                <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
                  Points
                </p>
                <p className="pt-2 text-sm font-medium text-foreground">
                  {player?.points ?? "Non renseigne"}
                </p>
              </div>
              <div className="rounded-2xl border border-border/60 bg-muted/20 p-4">
                <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
                  Licence
                </p>
                <p className="pt-2 text-sm font-medium text-foreground">
                  {player?.licence ?? "Non renseignee"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="surface">
          <CardHeader className="border-b border-border/60 pb-4">
            <CardTitle>Informations personnelles</CardTitle>
            <p className="text-sm text-muted-foreground">
              Le nom ci-dessous est celui utilise dans votre espace personnel.
            </p>
          </CardHeader>
          <CardContent className="space-y-6 p-6">
            <form action={updateProfile} className="space-y-6">
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
              </div>

              <div className="rounded-2xl border border-border/60 bg-muted/20 p-4">
                <div className="space-y-1">
                  <h3 className="text-sm font-semibold text-foreground">
                    Donnees FFTT associees
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Ces informations sont reliees automatiquement a votre email
                    joueur lorsqu&apos;un profil FFTT correspondant existe.
                  </p>
                </div>

                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="club">Club</Label>
                    <Input
                      id="club"
                      defaultValue={player?.club ?? "Non renseigne"}
                      disabled
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="points">Points</Label>
                    <Input
                      id="points"
                      type="text"
                      defaultValue={
                        player?.points !== null && player?.points !== undefined
                          ? String(player.points)
                          : "Non renseigne"
                      }
                      disabled
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="licence">Licence</Label>
                    <Input
                      id="licence"
                      defaultValue={player?.licence ?? "Non renseignee"}
                      disabled
                    />
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-dashed border-border/70 bg-background/70 p-4 text-xs text-muted-foreground">
                {player?.licence ? (
                  <p>
                    Votre profil FFTT est bien relie. Si vos points ou votre club
                    paraissent incorrects, contactez l&apos;organisation pour une
                    verification.
                  </p>
                ) : (
                  <p>
                    Aucun profil FFTT n&apos;a ete trouve pour cet email. Si besoin,
                    contactez l&apos;organisation pour faire le rapprochement.
                  </p>
                )}
              </div>

              <div className="flex flex-col-reverse gap-3 border-t border-border/60 pt-4 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-xs text-muted-foreground">
                  Les champs FFTT sont informatifs et ne se modifient pas ici.
                </p>
                <Button type="submit">Enregistrer</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
