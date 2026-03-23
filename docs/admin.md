# Documentation Admin (détaillée)

## Hiérarchie des actions (ordre recommandé)

1. **Saison**
   - Créer une saison.
   - Activer la saison en cours.
2. **Clubs**
   - Ajouter les clubs organisateurs.
3. **Tours**
   - Créer les tours (saison + club).
   - Ajouter lieu/ville/club.
4. **Templates de tableaux**
   - Définir les catégories (plage de points).
5. **Tableaux**
   - Associer un template à un tour.
   - Définir l’horaire (startTime).
6. **Ouvrir les inscriptions**
   - Mettre le tour en statut `OPEN`.
7. **Inscriptions**
   - Créer / ajuster / supprimer.
   - Export CSV.
8. **Présence**
   - Marquer les joueurs présents/absents.

---

## Tours

### Statut
- **OPEN** : inscriptions autorisées.
- **CLOSED** : inscriptions bloquées.

### Gestion d’un tour (page `/admin/tours/[id]`)

Fonctionnalités :
- résumé (stats)
- liste tableaux
- inscriptions récentes
- présence (auto-save)
- export CSV filtré

### Export CSV
Route : `/api/admin/registrations/export`

Paramètres :
- `tourId`
- `tableauId`
- `presence` (`UNKNOWN`, `PRESENT`, `ABSENT`)

---

## Tableaux

### Templates (`/admin/tableau-templates`)
- Définissent les plages de points (min/max).
- Réutilisables sur plusieurs tours.

### Tableaux (`/admin/tableaux`)
- Liés à un tour + template.
- Contiennent un horaire (startTime).

---

## Inscriptions (`/admin/inscriptions`)

### Création guidée
1. Choisir un tour.
2. Les tableaux associés sont filtrés.
3. Choisir un joueur.

### Actions
- supprimer une inscription complète (joueur)
- supprimer par tableau
- modifier les tableaux associés

---

## Présence (Tour dashboard)

Chaque joueur a un état :
- `UNKNOWN`
- `PRESENT`
- `ABSENT`

La mise à jour est **automatique** (pas de bouton).

---

## Utilisateurs (`/admin/users`)

Fonctions :
- recherche par nom/email
- filtre par rôle
- mise à jour **auto** du rôle
- protection :
  - impossible de supprimer son propre compte
  - impossible de retirer le dernier ADMIN

---

## Médias (`/admin/medias`)

Fonctions :
- upload d’images
- suppression simple / bulk
- tri et vue compacte

> Utilise Supabase (bucket configurable via `.env`).
