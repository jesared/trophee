import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export default function AdminDocumentationPage() {
  return (
    <div className="space-y-8">
      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="secondary">Admin</Badge>
          <Badge variant="outline">Guide complet</Badge>
        </div>
        <h1 className="text-3xl font-semibold text-foreground">
          Documentation d’administration
        </h1>
        <p className="max-w-2xl text-sm text-muted-foreground">
          Cette page rassemble le processus, l’architecture et les flux clés
          pour gérer le trophée. Elle sert de référence opérationnelle pour
          l’équipe organisatrice.
        </p>
      </div>

      <Card>
        <CardHeader className="space-y-1">
          <CardTitle>Liens rapides</CardTitle>
          <p className="text-sm text-muted-foreground">
            Accès direct aux écrans principaux.
          </p>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <Button asChild variant="secondary" size="sm">
            <Link href="/admin/seasons">Saisons</Link>
          </Button>
          <Button asChild variant="secondary" size="sm">
            <Link href="/admin/clubs">Clubs</Link>
          </Button>
          <Button asChild variant="secondary" size="sm">
            <Link href="/admin/tours">Tours</Link>
          </Button>
          <Button asChild variant="secondary" size="sm">
            <Link href="/admin/tableau-templates">Templates</Link>
          </Button>
          <Button asChild variant="secondary" size="sm">
            <Link href="/admin/tableaux">Tableaux</Link>
          </Button>
          <Button asChild variant="secondary" size="sm">
            <Link href="/admin/inscriptions">Inscriptions</Link>
          </Button>
          <Button asChild variant="secondary" size="sm">
            <Link href="/admin/players">Joueurs</Link>
          </Button>
          <Button asChild variant="secondary" size="sm">
            <Link href="/admin/medias">Médias</Link>
          </Button>
          <Button asChild variant="secondary" size="sm">
            <Link href="/admin/users">Utilisateurs</Link>
          </Button>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Processus recommandé</CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="space-y-2 text-sm text-muted-foreground">
              <li>
                1. Créer la saison active dans <b>Saisons</b>.
              </li>
              <li>
                2. Créer ou importer les <b>Clubs</b> (FFTT si disponible).
              </li>
              <li>
                3. Créer les <b>Tours</b> et définir date, lieu et club
                organisateur.
              </li>
              <li>
                4. Définir les <b>Templates</b> (plages de points).
              </li>
              <li>
                5. Créer les <b>Tableaux</b> par tour + horaire.
              </li>
              <li>
                6. Ajouter les <b>Joueurs</b> (FFTT ou saisie manuelle).
              </li>
              <li>
                7. Ouvrir le tour et gérer les <b>Inscriptions</b>.
              </li>
              <li>
                8. Le jour J, marquer la <b>Présence</b> et exporter.
              </li>
            </ol>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Architecture des données</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <div>
              <b>Saison</b> regroupe plusieurs <b>Tours</b>.
            </div>
            <div>
              <b>Tour</b> contient des <b>Tableaux</b> (définis via un Template).
            </div>
            <div>
              <b>TableauTemplate</b> définit une plage de points.
            </div>
            <div>
              <b>Tableau</b> est lié à un Tour et à un Template.
            </div>
            <div>
              <b>Registration</b> lie un <b>Joueur</b> à un <b>Tableau</b> et un{" "}
              <b>Tour</b>.
            </div>
            <div>
              <b>Club</b> organise un ou plusieurs <b>Tours</b>.
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Rôles & permissions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Badge>ADMIN</Badge>
              Accès total, gestion des utilisateurs et paramètres.
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary">ORGANIZER</Badge>
              Gestion des saisons, tours, tableaux et inscriptions.
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline">USER</Badge>
              Accès aux pages publiques et espace joueur.
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Qualité des données</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <p>
              Garder les noms de club, ville et salle cohérents pour un
              affichage clair sur l’agenda et les pages publiques.
            </p>
            <p>
              Vérifier les horaires de tableaux avant ouverture des
              inscriptions.
            </p>
            <p>
              Marquer les présences le jour J pour fiabiliser les exports et le
              suivi sportif.
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Flux opérationnels</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 text-sm text-muted-foreground">
          <div className="space-y-2">
            <h3 className="text-base font-semibold text-foreground">
              Inscriptions
            </h3>
            <p>
              L’admin sélectionne un tour, choisit le tableau associé et
              enregistre l’inscription du joueur. Un même joueur peut être
              inscrit à plusieurs tableaux du tour.
            </p>
          </div>

          <Separator />

          <div className="space-y-2">
            <h3 className="text-base font-semibold text-foreground">Jour J</h3>
            <p>
              Sur le tableau de bord d’un tour, les présences sont mises à jour
              en temps réel. Les exports CSV permettent de transmettre les
              listes aux officiels.
            </p>
          </div>

          <Separator />

          <div className="space-y-2">
            <h3 className="text-base font-semibold text-foreground">
              Classements & résultats
            </h3>
            <p>
              Les documents officiels sont centralisés dans les pages publiques
              et peuvent être mis à jour via le Drive connecté.
            </p>
          </div>

          <Separator />

          <div className="space-y-2">
            <h3 className="text-base font-semibold text-foreground">Médias</h3>
            <p>
              Les logos, affiches et photos sont gérés dans la médiathèque.
              Utiliser des dossiers clairs pour retrouver rapidement les assets.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Glossaire rapide</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-muted-foreground">
          <div>
            <b>Template</b> : modèle d’un tableau (plage de points + nom).
          </div>
          <div>
            <b>Tableau</b> : instance liée à un tour, basée sur un template, avec
            un horaire précis.
          </div>
          <div>
            <b>Inscription</b> : lien entre un joueur, un tour et un tableau.
          </div>
          <div>
            <b>Présence</b> : statut jour J (présent / absent / inconnu).
          </div>
          <div>
            <b>Tour ouvert</b> : autorise les inscriptions et la gestion
            opérationnelle.
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
