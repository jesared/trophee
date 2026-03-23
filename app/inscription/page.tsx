import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const steps = [
  {
    title: "Choisir un tour",
    description:
      "Parcourez l'agenda et repérez le tour qui vous convient. Toutes les infos utiles sont visibles.",
  },
  {
    title: "Sélectionner un tableau",
    description:
      "Choisissez le tableau qui correspond à vos points. Les catégories sont homogènes.",
  },
  {
    title: "Valider l'inscription",
    description:
      "Confirmez votre participation et suivez l'état de vos inscriptions dans votre espace.",
  },
];

const faq = [
  {
    question: "Puis-je annuler une inscription ?",
    answer:
      "Oui, l'annulation est possible tant que le tableau n'est pas verrouillé par l'organisation.",
  },
  {
    question: "Comment sont attribués les points ?",
    answer:
      "Les points dépendent de votre performance dans chaque tableau. Le barème est identique sur tous les tours.",
  },
  {
    question: "Quels tableaux puis-je choisir ?",
    answer:
      "Les tableaux sont définis par niveaux de points. Sélectionnez celui qui correspond à votre classement.",
  },
  {
    question: "Qui contacter en cas de problème ?",
    answer:
      "L'organisation est disponible via la page contact pour toute modification ou question.",
  },
];

export default function InscriptionPage() {
  return (
    <section className="page">
      <header className="relative overflow-hidden rounded-3xl border border-border/60 bg-background p-8 sm:p-10">
        <div className="space-y-5">
          <div className="badge-pill w-fit">Inscription joueurs</div>
          <h1 className="page-title sm:text-4xl">Inscrivez-vous au trophée</h1>
          <p className="page-subtitle max-w-2xl text-base">
            Choisissez votre tour, votre tableau et validez votre participation
            en quelques clics. Les inscriptions sont centralisées et mises à jour
            en temps réel.
          </p>
          <div className="flex flex-wrap gap-3">
            <Button asChild size="lg">
              <Link href="/me/inscriptions">S'inscrire</Link>
            </Button>
            <Button asChild size="lg" variant="secondary">
              <Link href="/agenda">Voir l'agenda</Link>
            </Button>
          </div>
        </div>
      </header>

      <section className="rounded-3xl border border-border/60 bg-muted/30 p-6 sm:p-8">
        <div className="page-header">
          <h2 className="page-title text-2xl">Votre inscription en 3 étapes</h2>
          <p className="page-subtitle">
            Un parcours simple pour vous inscrire rapidement.
          </p>
        </div>
        <div className="mt-6 grid gap-4 lg:grid-cols-3">
          {steps.map((step, index) => (
            <Card key={step.title} className="surface border-border/60">
              <CardHeader>
                <div className="badge-pill w-fit">Étape {index + 1}</div>
                <CardTitle className="mt-2">{step.title}</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                {step.description}
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1fr_1fr]">
        <Card className="surface border-border/60">
          <CardHeader>
            <CardTitle>Conditions d'inscription</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>Licence FFTT valide requise.</p>
            <p>Respect du règlement et des horaires de convocation.</p>
            <p>Tableaux attribués selon le classement officiel.</p>
          </CardContent>
        </Card>

        <Card className="surface border-border/60 bg-muted/30">
          <CardHeader>
            <CardTitle>Besoin d'aide ?</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <p>
              Contactez l'organisation pour toute question ou demande de
              modification.
            </p>
            <Button asChild size="sm" variant="secondary">
              <Link href="/contact">Contacter l'organisation</Link>
            </Button>
          </CardContent>
        </Card>
      </section>

      <section className="rounded-3xl border border-border/60 bg-background p-6 sm:p-8">
        <div className="page-header">
          <h2 className="page-title text-2xl">Questions fréquentes</h2>
          <p className="page-subtitle">
            Les réponses aux questions les plus courantes.
          </p>
        </div>
        <div className="mt-6 grid gap-4 lg:grid-cols-2">
          {faq.map((item) => (
            <div key={item.question} className="surface px-5 py-4">
              <p className="text-sm font-semibold text-foreground">
                {item.question}
              </p>
              <p className="mt-2 text-sm text-muted-foreground">
                {item.answer}
              </p>
            </div>
          ))}
        </div>
      </section>
    </section>
  );
}
