import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

export default function AdminSettingsPage() {
  return (
    <section className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
        <p className="text-sm text-muted-foreground">
          Configuration du dashboard admin.
        </p>
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
            <div className="rounded-lg border border-border bg-muted/40 px-3 py-2 text-sm">
              Saison active : <strong>2026</strong>
            </div>
            <Button asChild size="sm" variant="secondary">
              <Link href="/admin/seasons">Gérer les saisons</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Contact & Réseaux</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="contact-email">Email</Label>
              <Input id="contact-email" defaultValue="contact@tropheefg.fr" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contact-phone">Téléphone</Label>
              <Input id="contact-phone" defaultValue="03 00 00 00 00" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contact-facebook">Facebook</Label>
              <Input id="contact-facebook" defaultValue="facebook.com/tropheefg" />
            </div>
            <Button size="sm">Enregistrer</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Email & Notifications</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between rounded-lg border border-border px-3 py-2">
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
            <div className="rounded-lg border border-border bg-muted/40 px-3 py-2 text-sm">
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
