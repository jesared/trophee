import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function TropheePage() {
  return (
    <section className="space-y-10">
      <header className="space-y-4">
        <p className="text-sm font-medium text-muted-foreground">Le Troph&eacute;e</p>
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          Troph&eacute;e Fran&ccedil;ois Grieder
        </h1>
        <p className="max-w-3xl text-base text-foreground/80">
          Le Troph&eacute;e Fran&ccedil;ois Grieder est un challenge r&eacute;gional de tennis
          de table organis&eacute; autour des tournois homologu&eacute;s du d&eacute;partement de la Marne
          et des Ardennes.
        </p>
        <p className="max-w-3xl text-base text-foreground/80">
          Cr&eacute;&eacute; en hommage &agrave; Fran&ccedil;ois Grieder, fid&egrave;le participant du circuit,
          ce troph&eacute;e r&eacute;compense la r&eacute;gularit&eacute; et la performance des joueurs tout
          au long de la saison.
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="bg-card">
          <CardHeader>
            <CardTitle>Le principe</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-muted-foreground">
            <p>
              Chaque tournoi du circuit propose les m&ecirc;mes tableaux par cat&eacute;gories de points.
              Les joueurs accumulent des points en fonction de leurs r&eacute;sultats afin d&rsquo;&eacute;tablir
              un classement g&eacute;n&eacute;ral sur l&rsquo;ensemble de la saison.
            </p>
            <ul className="list-disc space-y-2 pl-5">
              <li>Des tableaux r&eacute;partis par niveaux de points</li>
              <li>Un bar&egrave;me identique sur chaque tournoi</li>
              <li>Un classement g&eacute;n&eacute;ral par tableau</li>
              <li>Une remise de r&eacute;compenses en fin de saison</li>
            </ul>
          </CardContent>
        </Card>

        <Card className="bg-card">
          <CardHeader>
            <CardTitle>Fonctionnement</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-muted-foreground">
            <p>
              Les points sont attribu&eacute;s selon la performance r&eacute;alis&eacute;e dans chaque tableau.
              En cas d&rsquo;&eacute;galit&eacute; au classement g&eacute;n&eacute;ral, le d&eacute;partage s&rsquo;effectue selon
              plusieurs crit&egrave;res successifs :
            </p>
            <ul className="list-disc space-y-2 pl-5">
              <li>Nombre de tournois disput&eacute;s</li>
              <li>Nombre de victoires</li>
              <li>Nombre de places de finaliste, puis demi-finaliste, etc.</li>
              <li>&Acirc;ge du joueur en dernier crit&egrave;re</li>
            </ul>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-card">
        <CardHeader>
          <CardTitle>R&eacute;compenses</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm text-muted-foreground">
          <p>
            Chaque club participant contribue &agrave; la dotation du challenge afin de r&eacute;compenser
            les trois premiers de chaque classement g&eacute;n&eacute;ral.
          </p>
          <p>
            La c&eacute;r&eacute;monie officielle de remise des r&eacute;compenses a lieu &agrave; l&rsquo;issue du dernier
            tournoi de la saison.
          </p>
          <p>
            Pour consulter le d&eacute;tail des tableaux, le bar&egrave;me pr&eacute;cis des points ou la liste compl&egrave;te
            des r&eacute;compenses, rendez-vous dans les sections d&eacute;di&eacute;es du site.
          </p>
        </CardContent>
      </Card>
    </section>
  );
}
