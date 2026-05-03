# Medias (Cloudinary)

## Configuration `.env`

- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`
- `CLOUDINARY_MEDIA_FOLDER` (optionnel)

## Page admin

`/admin/medias`

Fonctions :
- upload (images)
- suppression simple / bulk
- tri (date / nom / taille)
- vue compacte

## Recommandations

- Creer des dossiers logiques : `logos`, `affiches`, `photos`.
- Utiliser `CLOUDINARY_MEDIA_FOLDER` pour isoler les assets du projet dans Cloudinary.
