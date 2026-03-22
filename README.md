# Trophée FG

Plateforme SaaS moderne pour la gestion d’un tournoi annuel de tennis de table (Trophée François Grieder).

## Aperçu

- Site public : accueil, trophée, agenda & salles, classement, inscription
- Espace admin : saisons, tours, tableaux, templates, joueurs, inscriptions, clubs
- Espace joueur : dashboard, inscriptions, profil
- Auth Google via NextAuth
- Base PostgreSQL via Prisma

## Stack

- Next.js (App Router)
- TypeScript
- Tailwind CSS + shadcn/ui
- Prisma + PostgreSQL
- NextAuth (Google)

## Démarrage rapide

```bash
pnpm install
pnpm dev
```

Ouvre `http://localhost:3000`.

## Variables d’environnement

Crée un fichier `.env` :

```env
DATABASE_URL="postgresql://user:pass@host:5432/db"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="change-me"
GOOGLE_CLIENT_ID="..."
GOOGLE_CLIENT_SECRET="..."
GOOGLE_MAPS_API_KEY="..."
```

## Prisma

```bash
pnpm prisma migrate dev
pnpm prisma generate
```

## Scripts utiles

```bash
pnpm dev
pnpm build
pnpm start
```

## Structure

- `app/` : routes (public, admin, me)
- `components/` : UI & layout
- `lib/` : helpers (auth, prisma, requireAdmin, etc.)
- `prisma/` : schema & migrations

## Notes

- La saison active pilote l’affichage de l’agenda.
- Les tableaux sont basés sur des templates globaux.
- Les inscriptions sont liées à un tour + tableau + joueur.

---

Projet interne, prêt pour production.
