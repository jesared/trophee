# Documentation Admin - Vue d'ensemble

Cette documentation couvre **uniquement l'espace admin**.
L'objectif est d'expliquer comment gerer une saison, un tour, les tableaux et les inscriptions.

## Roles et acces

- Seuls les comptes `ADMIN` accedent a `/admin`.
- L'acces est controle par `requireAdmin()`.

## Pages admin (principales)

- `/admin` : page d'accueil admin + hierarchie des actions.
- `/admin/seasons` : creation + activation de la saison.
- `/admin/clubs` : gestion des clubs organisateurs.
- `/admin/tours` : creation/gestion des tours (statut OPEN/CLOSED).
- `/admin/tableau-templates` : creation des templates de tableaux.
- `/admin/tableaux` : tableaux lies aux tours.
- `/admin/inscriptions` : inscriptions et gestion des tableaux associes.
- `/admin/users` : utilisateurs + gestion des roles.
- `/admin/medias` : gestion des medias (Cloudinary).

## Flux global recommande

1. **Creer une saison** et l'activer.
2. **Creer les clubs** organisateurs.
3. **Creer les tours** (avec saison + club).
4. **Creer les templates de tableau**.
5. **Creer les tableaux** pour chaque tour, individuellement ou en ajoutant tous les templates.
6. **Ouvrir les inscriptions** (status OPEN).
7. **Gerer les inscriptions / presence / exports**.

Pour le detail complet, voir `docs/admin.md`.
