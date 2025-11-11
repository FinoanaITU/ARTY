# Fix: Ajouter la colonne position à artisan_photos

## Problème

La table `artisan_photos` dans PostgreSQL n'a pas la colonne `position`, ce qui cause l'erreur :
```
column "position" of relation "artisan_photos" does not exist
```

## Solution

### Option 1: Exécuter le script SQL directement (Recommandé pour une correction rapide)

```bash
# Se connecter à la base de données PostgreSQL
psql -h localhost -U your_user -d artizaho_db -f scripts/add_position_column.sql

# Ou si vous utilisez une URL de connexion
psql $DATABASE_URL -f scripts/add_position_column.sql
```

### Option 2: Exécuter la migration Alembic

```bash
cd Back
source env/bin/activate
alembic upgrade head
```

### Option 3: Exécuter manuellement dans psql

```sql
-- Se connecter à la base de données
psql -h localhost -U your_user -d artizaho_db

-- Exécuter la commande SQL
ALTER TABLE artisan_photos 
ADD COLUMN IF NOT EXISTS position INTEGER NOT NULL DEFAULT 0;
```

## Vérification

Pour vérifier que la colonne a été ajoutée :

```sql
-- Lister les colonnes de la table artisan_photos
\d artisan_photos

-- Ou avec une requête SQL
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'artisan_photos'
ORDER BY ordinal_position;
```

## Migration Alembic

Une migration Alembic a été créée dans `alembic/versions/002_add_position_to_artisan_photos.py` qui ajoutera automatiquement la colonne si elle n'existe pas.

Pour l'exécuter :

```bash
cd Back
source env/bin/activate
alembic upgrade head
```

## Notes

- La colonne `position` est définie avec une valeur par défaut de `0`
- La colonne est `NOT NULL`, donc tous les enregistrements existants recevront la valeur `0`
- La migration est idempotente : elle vérifie si la colonne existe avant de l'ajouter

