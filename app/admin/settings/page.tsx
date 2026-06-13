import Link from "next/link";
import { revalidatePath } from "next/cache";

import { AdminPageHeader } from "@/components/admin-page-header";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { requireAdmin } from "@/lib/require-admin";
import { prisma } from "@/lib/prisma";

type FooterSettingsValues = {
  contactEmail: string;
  contactPhone: string;
  facebookUrl: string;
  instagramUrl: string;
  youtubeUrl: string;
};

const FALLBACK_FOOTER: FooterSettingsValues = {
  contactEmail: "contact@tropheefg.fr",
  contactPhone: "03 00 00 00 00",
  facebookUrl: "https://facebook.com",
  instagramUrl: "https://instagram.com",
  youtubeUrl: "",
};

async function updateFooterSettings(formData: FormData) {
  "use server";

  await requireAdmin();

  const contactEmail = String(formData.get("contactEmail") ?? "").trim();
  const contactPhone = String(formData.get("contactPhone") ?? "").trim();
  const facebookUrl = String(formData.get("facebookUrl") ?? "").trim();
  const instagramUrl = String(formData.get("instagramUrl") ?? "").trim();
  const youtubeUrl = String(formData.get("youtubeUrl") ?? "").trim();

  await prisma.footerSettings.upsert({
    where: { id: "footer" },
    update: {
      contactEmail: contactEmail || null,
      contactPhone: contactPhone || null,
      facebookUrl: facebookUrl || null,
      instagramUrl: instagramUrl || null,
      youtubeUrl: youtubeUrl || null,
    },
    create: {
      id: "footer",
      contactEmail: contactEmail || null,
      contactPhone: contactPhone || null,
      facebookUrl: facebookUrl || null,
      instagramUrl: instagramUrl || null,
      youtubeUrl: youtubeUrl || null,
    },
  });

  revalidatePath("/");
  revalidatePath("/admin/settings");
}

export default async function AdminSettingsPage() {
  await requireAdmin();

  const [footerSettings, activeSeason, adminCount] = await Promise.all([
    prisma.footerSettings
      .findUnique({ where: { id: "footer" } })
      .then((data) => ({
        contactEmail: data?.contactEmail ?? FALLBACK_FOOTER.contactEmail,
        contactPhone: data?.contactPhone ?? FALLBACK_FOOTER.contactPhone,
        facebookUrl: data?.facebookUrl ?? FALLBACK_FOOTER.facebookUrl,
        instagramUrl: data?.instagramUrl ?? FALLBACK_FOOTER.instagramUrl,
        youtubeUrl: data?.youtubeUrl ?? FALLBACK_FOOTER.youtubeUrl,
      }))
      .catch(() => FALLBACK_FOOTER),
    prisma.season.findFirst({
      where: { isActive: true },
      select: { name: true, year: true },
      orderBy: { year: "desc" },
    }),
    prisma.user.count({ where: { role: "ADMIN" } }),
  ]);

  return (
    <section className="space-y-8">
      <AdminPageHeader
        badge="Parametres admin"
        title="Parametres"
        description="Centralisez les reglages relies a la saison active, au footer public et aux integrations techniques."
      />

      <Alert>
        <AlertTitle>Portee de cette page</AlertTitle>
        <AlertDescription>
          Le footer public est deja connecte a la base. Les autres zones sont
          presentees comme des points de pilotage ou des passerelles vers les
          pages metier existantes.
        </AlertDescription>
      </Alert>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-border/70">
          <CardHeader>
            <CardDescription>Saison active</CardDescription>
            <CardTitle className="text-2xl">
              {activeSeason ? activeSeason.year : "-"}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0 text-sm text-muted-foreground">
            {activeSeason ? activeSeason.name : "Aucune saison active definie."}
          </CardContent>
        </Card>

        <Card className="border-border/70">
          <CardHeader>
            <CardDescription>Admins actifs</CardDescription>
            <CardTitle className="text-2xl">{adminCount}</CardTitle>
          </CardHeader>
          <CardContent className="pt-0 text-sm text-muted-foreground">
            Comptes capables de piloter la plateforme.
          </CardContent>
        </Card>

        <Card className="border-border/70">
          <CardHeader>
            <CardDescription>Footer public</CardDescription>
            <CardTitle className="text-2xl">Configure</CardTitle>
          </CardHeader>
          <CardContent className="pt-0 text-sm text-muted-foreground">
            Email, telephone et reseaux sont geres ici.
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="footer">
        <TabsList>
          <TabsTrigger value="footer">Footer</TabsTrigger>
          <TabsTrigger value="operations">Pilotage</TabsTrigger>
          <TabsTrigger value="technical">Technique</TabsTrigger>
        </TabsList>

        <TabsContent value="footer" className="space-y-6">
          <Card className="border-border/70">
            <CardHeader>
              <CardTitle>Contact et reseaux du footer</CardTitle>
              <CardDescription>
                Reglages affiches dans le footer public du site.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form action={updateFooterSettings} className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="contact-email">Email</Label>
                    <Input
                      id="contact-email"
                      name="contactEmail"
                      defaultValue={footerSettings.contactEmail}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="contact-phone">Telephone</Label>
                    <Input
                      id="contact-phone"
                      name="contactPhone"
                      defaultValue={footerSettings.contactPhone}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="contact-facebook">Facebook</Label>
                    <Input
                      id="contact-facebook"
                      name="facebookUrl"
                      defaultValue={footerSettings.facebookUrl}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="contact-instagram">Instagram</Label>
                    <Input
                      id="contact-instagram"
                      name="instagramUrl"
                      defaultValue={footerSettings.instagramUrl}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contact-youtube">YouTube</Label>
                  <Input
                    id="contact-youtube"
                    name="youtubeUrl"
                    defaultValue={footerSettings.youtubeUrl}
                  />
                </div>

                <div className="flex justify-end">
                  <Button size="sm" type="submit">
                    Enregistrer le footer
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="operations" className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <Card className="border-border/70">
            <CardHeader>
              <CardTitle>Pilotage rapide</CardTitle>
              <CardDescription>
                Liens courts vers les zones qui pilotent vraiment la plateforme.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3 text-sm">
                <div className="space-y-1">
                  <p className="font-medium text-foreground">Saisons</p>
                  <p className="text-muted-foreground">
                    Activez la bonne saison avant de creer ou modifier les tours.
                  </p>
                </div>
                <Separator />
                <div className="space-y-1">
                  <p className="font-medium text-foreground">Utilisateurs</p>
                  <p className="text-muted-foreground">
                    Controlez les roles admin, organizer et user depuis
                    l&apos;annuaire.
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button asChild size="sm" variant="secondary">
                  <Link href="/admin/seasons">Gerer les saisons</Link>
                </Button>
                <Button asChild size="sm" variant="secondary">
                  <Link href="/admin/users">Voir les utilisateurs</Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/70">
            <CardHeader>
              <CardTitle>Danger zone</CardTitle>
              <CardDescription>
                Actions sensibles a isoler derriere des confirmations explicites.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Les operations destructives globales ne sont pas exposees ici tant
                qu&apos;elles ne sont pas portees par un vrai flux securise.
              </p>
              <Button size="sm" variant="destructive" disabled>
                Reset de la base
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="technical" className="grid gap-6 xl:grid-cols-[1fr_1fr]">
          <Card className="border-border/70">
            <CardHeader>
              <CardTitle>Email et notifications</CardTitle>
              <CardDescription>
                Etat actuel des reglages techniques lies a la messagerie.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Card size="sm" className="border-border/60 bg-muted/20">
                <CardContent className="flex items-center justify-between gap-4 pt-3">
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-foreground">
                      Emails automatiques
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Confirmation d&apos;inscription et rappels.
                    </p>
                  </div>
                  <Switch defaultChecked />
                </CardContent>
              </Card>
              <div className="space-y-2">
                <Label htmlFor="email-sender">Adresse expediteur</Label>
                <Input
                  id="email-sender"
                  defaultValue="no-reply@tropheefg.fr"
                  disabled
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Cette zone est informative pour le moment et pourra etre reliee a
                une vraie configuration plus tard.
              </p>
            </CardContent>
          </Card>

          <Card className="border-border/70">
            <CardHeader>
              <CardTitle>Integrations</CardTitle>
              <CardDescription>
                Resume court des points techniques visibles par l&apos;admin.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Card size="sm" className="border-border/60 bg-muted/20">
                <CardContent className="pt-3 text-sm text-muted-foreground">
                  Google Maps: cle API a connecter via l&apos;environnement du projet.
                </CardContent>
              </Card>
              <Card size="sm" className="border-border/60 bg-muted/20">
                <CardContent className="pt-3 text-sm text-muted-foreground">
                  Emails: expediteur configure en lecture seule sur cette page.
                </CardContent>
              </Card>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </section>
  );
}
