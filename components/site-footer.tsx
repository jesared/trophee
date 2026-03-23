import Link from "next/link";

import { Container } from "@/components/container";

export function SiteFooter() {
  return (
    <footer className="border-t border-border/60 bg-background">
      <Container className="grid gap-8 py-10 text-sm text-muted-foreground sm:grid-cols-2 lg:grid-cols-4">
        <div className="space-y-3">
          <p className="text-sm font-semibold text-foreground">Trophée FG</p>
          <p>
            Challenge régional de tennis de table autour des clubs de la Marne
            et des Ardennes.
          </p>
        </div>

        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-foreground">
            Contact
          </p>
          <div className="space-y-2">
            <p>contact@tropheefg.fr</p>
            <p>03 00 00 00 00</p>
          </div>
        </div>

        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-foreground">
            Liens utiles
          </p>
          <div className="flex flex-col gap-2">
            <Link
              href="/agenda"
              className="transition-colors hover:text-foreground"
            >
              Agenda & salles
            </Link>
            <Link
              href="/classement"
              className="transition-colors hover:text-foreground"
            >
              Classements
            </Link>
          </div>
        </div>

        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-foreground">
            Réseaux
          </p>
          <div className="flex flex-col gap-2">
            <a
              href="https://facebook.com"
              target="_blank"
              rel="noreferrer"
              className="transition-colors hover:text-foreground"
            >
              Facebook
            </a>
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noreferrer"
              className="transition-colors hover:text-foreground"
            >
              Instagram
            </a>
          </div>
        </div>
      </Container>

      <div className="border-t border-border/60 py-4 text-center text-xs text-muted-foreground">
        (c) {new Date().getFullYear()} Trophée François Grieder. Tous droits
        réservés.
      </div>
    </footer>
  );
}
