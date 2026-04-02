"use client";

import Link from "next/link";
import * as React from "react";

import { Container } from "@/components/container";

type FooterSettings = {
  contactEmail: string;
  contactPhone: string;
  facebookUrl: string;
  instagramUrl: string;
  youtubeUrl: string;
};

const FALLBACK_SETTINGS: FooterSettings = {
  contactEmail: "contact@tropheefg.fr",
  contactPhone: "03 00 00 00 00",
  facebookUrl: "https://facebook.com",
  instagramUrl: "https://instagram.com",
  youtubeUrl: "",
};

export function SiteFooter() {
  const [settings, setSettings] = React.useState<FooterSettings>(
    FALLBACK_SETTINGS,
  );

  React.useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const res = await fetch("/api/footer-settings");
        if (!res.ok) return;
        const data = (await res.json()) as FooterSettings;
        if (active) {
          setSettings({
            contactEmail: data.contactEmail || FALLBACK_SETTINGS.contactEmail,
            contactPhone: data.contactPhone || FALLBACK_SETTINGS.contactPhone,
            facebookUrl: data.facebookUrl || FALLBACK_SETTINGS.facebookUrl,
            instagramUrl: data.instagramUrl || FALLBACK_SETTINGS.instagramUrl,
            youtubeUrl: data.youtubeUrl || FALLBACK_SETTINGS.youtubeUrl,
          });
        }
      } catch {
        // ignore
      }
    };
    load();
    return () => {
      active = false;
    };
  }, []);

  const socialLinks = [
    settings.facebookUrl
      ? { label: "Facebook", href: settings.facebookUrl }
      : null,
    settings.instagramUrl
      ? { label: "Instagram", href: settings.instagramUrl }
      : null,
    settings.youtubeUrl ? { label: "YouTube", href: settings.youtubeUrl } : null,
  ].filter(Boolean) as { label: string; href: string }[];

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
            <p>{settings.contactEmail}</p>
            <p>{settings.contactPhone}</p>
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
          {socialLinks.length > 0 ? (
            <div className="flex flex-col gap-2">
              {socialLinks.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  target="_blank"
                  rel="noreferrer"
                  className="transition-colors hover:text-foreground"
                >
                  {item.label}
                </a>
              ))}
            </div>
          ) : (
            <p>Aucun réseau renseigné.</p>
          )}
        </div>
      </Container>

      <div className="border-t border-border/60 py-4 text-center text-xs text-muted-foreground">
        (c) {new Date().getFullYear()} Trophée François Grieder. Tous droits
        réservés · Créateur{" "}
        <a
          href="https://jesared.fr"
          target="_blank"
          rel="noreferrer"
          className="text-foreground/80 hover:text-foreground"
        >
          Jerome HENRY
        </a>
        .
      </div>
    </footer>
  );
}
