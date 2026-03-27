import Link from "next/link";
import { revalidatePath } from "next/cache";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
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

  const footerSettings = await prisma.footerSettings
    .findUnique({ where: { id: "footer" } })
    .then((data) => ({
      contactEmail: data?.contactEmail ?? FALLBACK_FOOTER.contactEmail,
      contactPhone: data?.contactPhone ?? FALLBACK_FOOTER.contactPhone,
      facebookUrl: data?.facebookUrl ?? FALLBACK_FOOTER.facebookUrl,
      instagramUrl: data?.instagramUrl ?? FALLBACK_FOOTER.instagramUrl,
      youtubeUrl: data?.youtubeUrl ?? FALLBACK_FOOTER.youtubeUrl,
    }))
    .catch(() => FALLBACK_FOOTER);

  return (
    <section className="page">
      <div className="page-header">
        <h1 className="page-title">Settings</h1>
        <p className="page-subtitle">Configuration du dashboard admin.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Général</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="site-name">Nom du trophée</Label>
              <Input id="site-name" defaultValue="Trophée François Grieder" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="site-tagline">Slogan</Label>
              <Input
                id="site-tagline"
                defaultValue="Challenge régional de tennis de table"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="site-logo">Logo</Label>
              <Input id="site-logo" type="file" />
            </div>
            <Button size="sm">Enregistrer</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Saison active</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="surface bg-muted/40 px-3 py-2 text-sm">
              Saison active : <strong>2026</strong>
            </div>
            <Button asChild size="sm" variant="secondary">
              <Link href="/admin/seasons">Gérer les saisons</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Contact & Réseaux (Footer)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <form action={updateFooterSettings} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="contact-email">Email</Label>
                <Input
                  id="contact-email"
                  name="contactEmail"
                  defaultValue={footerSettings.contactEmail}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contact-phone">Téléphone</Label>
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
              <div className="space-y-2">
                <Label htmlFor="contact-youtube">YouTube</Label>
                <Input
                  id="contact-youtube"
                  name="youtubeUrl"
                  defaultValue={footerSettings.youtubeUrl}
                />
              </div>
              <Button size="sm">Enregistrer</Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Email & Notifications</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="surface flex items-center justify-between px-3 py-2">
              <div>
                <p className="text-sm font-medium">Emails automatiques</p>
                <p className="text-xs text-muted-foreground">
                  Confirmation d’inscription et rappels.
                </p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email-sender">Adresse expéditeur</Label>
              <Input id="email-sender" defaultValue="no-reply@tropheefg.fr" />
            </div>
            <Button size="sm">Enregistrer</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Google Maps</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="surface bg-muted/40 px-3 py-2 text-sm">
              Clé API : <strong>Configurée</strong>
            </div>
            <Button size="sm" variant="secondary">
              Configurer la clé API
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Sécurité</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <div>Admins actifs : 2</div>
            <div>Dernière connexion admin : aujourd’hui</div>
            <Button size="sm" variant="secondary">
              Voir les utilisateurs
            </Button>
          </CardContent>
        </Card>

        <Card className="border-destructive/50">
          <CardHeader>
            <CardTitle className="text-destructive">Danger Zone</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <p>
              Les actions ci-dessous sont irréversibles. Elles sont désactivées
              par défaut.
            </p>
            <Button size="sm" variant="destructive" disabled>
              Reset de la base
            </Button>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
