export default function Home() {
  return (
    <div className="space-y-16">
      <section className="grid items-center gap-10 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-6">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            Trophée François Grieder
          </p>
          <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
            Challenge régional de tennis de table
          </h1>
          <p className="max-w-2xl text-base text-muted-foreground">
            Le Trophée François Grieder réunit les clubs de la région autour
            d&apos;un challenge convivial, rythmé par des rencontres sportives
            et une ambiance associative.
          </p>
          <div className="flex flex-wrap gap-3">
            <button className="h-11 rounded-full bg-primary px-6 text-sm font-medium text-primary-foreground shadow-sm transition hover:bg-primary/90">
              Voir tournois
            </button>
            <button className="h-11 rounded-full border border-border bg-background px-6 text-sm font-medium text-foreground transition hover:bg-muted">
              Classements
            </button>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-muted/30 p-6">
          <div className="space-y-4">
            <div className="space-y-1">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                Mise en avant saison en cours
              </p>
              <h2 className="text-lg font-semibold">Suivez la progression</h2>
              <p className="text-sm text-muted-foreground">
                Découvrez les prochaines dates et les résultats les plus
                récents.
              </p>
            </div>

            <div className="rounded-xl border border-border bg-background p-4">
              <p className="text-xs font-medium text-muted-foreground">
                Journée clé
              </p>
              <p className="text-base font-semibold">
                12 avril 2023 - 7 Tour régional
              </p>
            </div>

            <div className="rounded-xl border border-border bg-background p-4">
              <p className="text-xs font-medium text-muted-foreground">
                Score à suivre
              </p>
              <p className="text-base font-semibold">
                Classement provisoire mis à jour
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-2xl border border-border bg-background p-6">
          <h3 className="text-lg font-semibold">En résumé</h3>
          <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
            <li>Tournois qualificatifs ouverts jusqu&apos;à fin mars.</li>
            <li>Classements mis à jour après chaque rencontre.</li>
            <li>Focus sur la finale régionale de mai.</li>
          </ul>
        </div>
        <div className="rounded-2xl border border-border bg-muted/30 p-6">
          <h3 className="text-lg font-semibold">Ressources rapides</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Consultez les tableaux, r\u00e8glements et informations pratiques
            pour pr\u00e9parer votre prochaine rencontre.
          </p>
          <div className="mt-6 flex flex-col gap-3">
            <button className="h-10 rounded-full border border-border bg-background px-5 text-sm font-medium text-foreground transition hover:bg-muted">
              Tableaux & réglement
            </button>
            <button className="h-10 rounded-full border border-border bg-background px-5 text-sm font-medium text-foreground transition hover:bg-muted">
              Récompenses
            </button>
            <button className="h-10 rounded-full border border-border bg-background px-5 text-sm font-medium text-foreground transition hover:bg-muted">
              Contact
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
