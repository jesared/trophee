# Trophée FG

Plateforme SaaS moderne pour la gestion d’un tournoi annuel de tennis de table
(Trophée François Grieder).

## Aperçu

- Site public : accueil, trophée, agenda & salles, classement, inscription
- Espace admin : saisons, tours, tableaux, templates, joueurs, inscriptions, clubs, médias
- Espace joueur : dashboard, inscriptions, profil
- Auth Google via NextAuth
- Base PostgreSQL via Prisma

## Stack

- Next.js (App Router)
- TypeScript
- Tailwind CSS + shadcn/ui
- Prisma + PostgreSQL
- NextAuth (Google)

## Documentation (Admin)

Documentation admin détaillée dans `/docs` :

- `docs/overview.md`
- `docs/admin.md`
- `docs/data-model.md`
- `docs/media.md`
- `docs/operations.md`

## Démarrage rapide

```bash
pnpm install
pnpm dev
```

Ouvre `http://localhost:3000`.

## Variables d’environnement

Copiez `.env.example` vers `.env`.

### Minimum pour une mise en ligne "vitrine"

```env
DATABASE_URL="postgresql://user:pass@host:5432/db?sslmode=require"
GOOGLE_DRIVE_FOLDER_ID="..."
GOOGLE_SERVICE_ACCOUNT_KEY='{"type":"service_account", ... }'
```

Ces variables couvrent :

- les pages publiques basées sur Prisma (`accueil`, `agenda`, `tours`, `footer`)
- les classements PDF via Google Drive

### Variables optionnelles si vous gardez l’admin / l’auth en ligne

```env
NEXTAUTH_URL="https://votre-domaine.tld"
NEXTAUTH_SECRET="change-me"
GOOGLE_CLIENT_ID="..."
GOOGLE_CLIENT_SECRET="..."
EMAIL_SERVER="smtp://..."
EMAIL_FROM="Trophée FG <noreply@example.com>"
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY="..."
CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="..."
CLOUDINARY_API_SECRET="..."
CLOUDINARY_MEDIA_FOLDER="tfg-media"
FFTT_APP_ID="..."
FFTT_APP_PASSWORD="..."
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
- `docs/` : documentation admin

## Notes

- La saison active pilote l’affichage de l’agenda.
- Les tableaux sont basés sur des templates globaux.
- Les inscriptions sont liées à un tour + tableau + joueur.

---

Projet interne, prêt pour production.
