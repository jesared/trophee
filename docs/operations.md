# Operations / Runbook

## Démarrage local

1. Installer les dépendances
2. Configurer `.env`
3. `pnpm dev`

## Prisma

- Migrations : `pnpm prisma migrate dev`
- Génération client : `pnpm prisma generate`

## Déploiement

Déploiement sur Vercel via GitHub.

## Dépannage rapide

### Erreur Prisma `Unknown argument`
-> lancer `pnpm prisma generate` (après avoir stoppé le serveur dev).

### Build Vercel échoue sur DB
-> vérifier variables d’environnement DB sur Vercel.
