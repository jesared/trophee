import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function InscriptionPage() {
  return (
    <section className="page">
      <div className="grid gap-6 lg:grid-cols-[1.3fr_1fr]">
        <div className="space-y-4">
          <div className="badge-pill">
            Inscription joueurs
          </div>
          <h1 className="page-title sm:text-4xl">
            Inscrivez-vous au trophée
          </h1>
          <p className="page-subtitle">
            Choisissez votre tour, votre tableau et validez votre participation
            en quelques clics. Les inscriptions sont centralisées et mises à jour
            en temps réel.
          </p>
          <div className="flex flex-wrap gap-3">
            <Button asChild size="sm">
              <Link href="/me/inscriptions">Accéder à mon espace</Link>
            </Button>
            <Button asChild size="sm" variant="secondary">
              <Link href="/agenda">Voir les prochains tours</Link>
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Informations clés</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <div className="flex items-center justify-between">
              <span>Saison active</span>
              <span className="font-medium text-foreground">2026</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Statut</span>
              <span className="font-medium text-emerald-500">Ouvert</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Règlement</span>
              <Link href="/trophee" className="font-medium text-primary">
                Voir le trophée
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>1. Choisir un tour</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Sélectionnez le tour qui vous convient dans l’agenda. Les lieux et
            horaires sont indiqués pour chaque tournoi.
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>2. Sélectionner un tableau</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Les tableaux sont basés sur votre niveau. Choisissez celui qui
            correspond à vos points.
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>3. Valider l’inscription</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Confirmez votre participation et suivez vos inscriptions depuis votre
            espace joueur.
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Conditions d’inscription</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>Licence FFTT valide requise.</p>
            <p>Respect du règlement et des horaires de convocation.</p>
            <p>Tableaux attribués selon le classement officiel.</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Besoin d’aide ?</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <p>
              Contactez l’organisation pour toute question ou demande de
              modification.
            </p>
            <Button asChild size="sm" variant="secondary">
              <Link href="/contact">Contacter l’organisation</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
