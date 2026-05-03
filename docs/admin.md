# Documentation Admin (detaillee)

## Hierarchie des actions (ordre recommande)

1. **Saison**
   - Creer une saison.
   - Activer la saison en cours.
2. **Clubs**
   - Ajouter les clubs organisateurs.
3. **Tours**
   - Creer les tours (saison + club).
   - Ajouter lieu/ville/club.
4. **Templates de tableaux**
   - Definir les categories (plage de points) et l'horaire de reference.
5. **Tableaux**
   - Associer un template a un tour.
   - Ou ajouter tous les templates d'un coup pour un tour.
6. **Ouvrir les inscriptions**
   - Mettre le tour en statut `OPEN`.
7. **Inscriptions**
   - Creer / ajuster / supprimer.
   - Export CSV.
8. **Presence**
   - Marquer les joueurs presents/absents.

---

## Tours

### Statut
- **OPEN** : inscriptions autorisees.
- **CLOSED** : inscriptions bloquees.

### Gestion d'un tour (page `/admin/tours/[id]`)

Fonctionnalites :
- resume (stats)
- liste tableaux
- inscriptions recentes
- presence (auto-save)
- export CSV filtre

### Export CSV
Route : `/api/admin/registrations/export`

Parametres :
- `tourId`
- `tableauId`
- `presence` (`UNKNOWN`, `PRESENT`, `ABSENT`)

---

## Tableaux

### Templates (`/admin/tableau-templates`)
- Definissent les plages de points (min/max).
- Portent l'horaire de reference du tableau.
- Reutilisables sur plusieurs tours.

### Tableaux (`/admin/tableaux`)
- Lies a un tour + template.
- Reprennent automatiquement l'horaire defini sur le template.

---

## Inscriptions (`/admin/inscriptions`)

### Creation guidee
1. Choisir un tour.
2. Les tableaux associes sont filtres.
3. Choisir un joueur.

### Actions
- supprimer une inscription complete (joueur)
- supprimer par tableau
- modifier les tableaux associes

---

## Presence (Tour dashboard)

Chaque joueur a un etat :
- `UNKNOWN`
- `PRESENT`
- `ABSENT`

La mise a jour est **automatique** (pas de bouton).

---

## Utilisateurs (`/admin/users`)

Fonctions :
- recherche par nom/email
- filtre par role
- mise a jour **auto** du role
- protection :
  - impossible de supprimer son propre compte
  - impossible de retirer le dernier ADMIN

---

## Medias (`/admin/medias`)

Fonctions :
- upload d'images
- suppression simple / bulk
- tri et vue compacte

> Utilise Cloudinary (configuration via `.env`).
