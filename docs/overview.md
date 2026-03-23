# Documentation Admin — Vue d'ensemble

Cette documentation couvre **uniquement l'espace admin**.  
L'objectif est d'expliquer comment gérer une saison, un tour, les tableaux et les inscriptions.

## Rôles et accès

- Seuls les comptes `ADMIN` accèdent à `/admin`.
- L'accès est contrôlé par `requireAdmin()`.

## Pages admin (principales)

- `/admin` : page d'accueil admin + hiérarchie des actions.
- `/admin/seasons` : création + activation de la saison.
- `/admin/clubs` : gestion des clubs organisateurs.
- `/admin/tours` : création/gestion des tours (statut OPEN/CLOSED).
- `/admin/tableau-templates` : création des templates de tableaux.
- `/admin/tableaux` : tableaux liés aux tours.
- `/admin/inscriptions` : inscriptions et gestion des tableaux associés.
- `/admin/users` : utilisateurs + gestion des rôles.
- `/admin/medias` : gestion des médias (Supabase).

## Flux global recommandé

1. **Créer une saison** et l’activer.
2. **Créer les clubs** organisateurs.
3. **Créer les tours** (avec saison + club).
4. **Créer les templates de tableau**.
5. **Créer les tableaux** pour chaque tour.
6. **Ouvrir les inscriptions** (status OPEN).
7. **Gérer les inscriptions / présence / exports**.

Pour le détail complet, voir `docs/admin.md`.
