export default function AdminPage() {
  return (
    <section className="page">
      <div className="page-header">
        <h1 className="page-title">Dashboard</h1>
        <p className="page-subtitle">
          Vue d&apos;ensemble de l&apos;administration du trophée.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
        <div className="surface p-6">
          <h2 className="text-base font-semibold">Hiérarchie des actions</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Suivez cet ordre pour initialiser une saison proprement.
          </p>
          <div className="mt-5 space-y-4 text-sm">
            <div className="flex gap-3">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                1
              </span>
              <div>
                <p className="font-medium">Saisons</p>
                <p className="text-muted-foreground">
                  Créer et activer la saison en cours.
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                2
              </span>
              <div>
                <p className="font-medium">Clubs</p>
                <p className="text-muted-foreground">
                  Ajouter les clubs organisateurs.
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                3
              </span>
              <div>
                <p className="font-medium">Templates de tableaux</p>
                <p className="text-muted-foreground">
                  Définir les plages de points globales.
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                4
              </span>
              <div>
                <p className="font-medium">Tours</p>
                <p className="text-muted-foreground">
                  Créer les tours liés à la saison et au club.
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                5
              </span>
              <div>
                <p className="font-medium">Tableaux</p>
                <p className="text-muted-foreground">
                  Associer les tableaux aux tours.
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                6
              </span>
              <div>
                <p className="font-medium">Joueurs</p>
                <p className="text-muted-foreground">
                  Créer ou importer les joueurs.
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                7
              </span>
              <div>
                <p className="font-medium">Inscriptions</p>
                <p className="text-muted-foreground">
                  Inscrire les joueurs dans les tableaux.
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                8
              </span>
              <div>
                <p className="font-medium">Vérifications</p>
                <p className="text-muted-foreground">
                  Contrôler l'agenda, les salles et la cohérence globale.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="surface p-6">
          <h2 className="text-base font-semibold">Conseils rapides</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Pour un démarrage fluide.
          </p>
          <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
            <li>Gardez une seule saison active à la fois.</li>
            <li>Utilisez les templates pour uniformiser les tableaux.</li>
            <li>Vérifiez les horaires des tableaux avant d’inscrire.</li>
            <li>Utilisez l’import CSV pour gagner du temps.</li>
          </ul>
        </div>
      </div>
    </section>
  );
}
