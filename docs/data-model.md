# Modèle de données (Prisma)

## Season
- `name`
- `year`
- `isActive`

## Tour
- `name`
- `date`
- `seasonId`
- `clubId`
- `venue`
- `city`
- `status` (`OPEN` | `CLOSED`)

## TableauTemplate
- `name`
- `minPoints`
- `maxPoints`

## Tableau
- `tourId`
- `templateId`
- `startTime`

## Player
- `firstName`
- `lastName`
- `email` (optionnel)
- `club` (optionnel)
- `points` (optionnel)

## Registration
- `playerId`
- `tourId`
- `tableauId`
- `presence` (`UNKNOWN` | `PRESENT` | `ABSENT`)

## Club
- `name`
- `city` (optionnel)
