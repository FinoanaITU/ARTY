# ✅ Correction de l'erreur : colonne "order" dans artisan_photos

## ❌ Erreur

```
null value in column "order" of relation "artisan_photos" violates not-null constraint
```

## 🔍 Cause

La table `artisan_photos` avait **deux colonnes** :
- `order` (integer, NOT NULL) - ancienne colonne
- `position` (integer, NOT NULL, default 0) - nouvelle colonne

Le code SQLAlchemy utilisait seulement `position`, mais la colonne `order` était toujours présente et NOT NULL, causant l'erreur.

## ✅ Solution

### Migration créée : `003_remove_order_column_from_artisan_photos.py`

Cette migration :
1. ✅ Copie les valeurs de `order` vers `position` si nécessaire
2. ✅ Supprime la colonne `order`
3. ✅ Garde uniquement la colonne `position`

### Script SQL direct : `scripts/remove_order_column.sql`

Script SQL pour appliquer la correction directement si nécessaire.

## 🚀 Application

La migration a été appliquée automatiquement via l'entrypoint Docker :

```bash
# La migration s'exécute automatiquement au démarrage
docker-compose up -d backend

# Ou manuellement
docker exec arty-backend alembic upgrade head
```

## ✅ Vérification

```bash
# Vérifier la structure de la table
docker exec -i arty-postgres psql -U artizaho_user -d artizaho_db -c "\d artisan_photos"
```

La table devrait maintenant avoir uniquement la colonne `position`, sans `order`.

## 📋 Résultat

- ✅ La colonne `order` a été supprimée
- ✅ Seule la colonne `position` existe maintenant
- ✅ L'inscription artisan devrait fonctionner correctement

## 📖 Fichiers

- Migration : `Back/alembic/versions/003_remove_order_column_from_artisan_photos.py`
- Script SQL : `Back/scripts/remove_order_column.sql`

