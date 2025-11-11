# 🔄 Rebuild Docker avec Migrations Automatiques

## ✅ Configuration complète

Toutes les modifications nécessaires ont été effectuées pour que les migrations s'exécutent automatiquement lors du rebuild des images Docker.

## 📋 Fichiers modifiés

### 1. `Back/Dockerfile`
- ✅ Ajoute le script d'entrypoint
- ✅ Rend les scripts exécutables
- ✅ Configure l'ENTRYPOINT pour exécuter les migrations

### 2. `Back/scripts/docker-entrypoint.sh`
- ✅ Attend que PostgreSQL soit prêt
- ✅ Exécute `alembic upgrade head` automatiquement
- ✅ Démarre l'application FastAPI

### 3. `Back/scripts/check_db_connection.py`
- ✅ Vérifie la connexion à PostgreSQL
- ✅ Utilisé par le script d'entrypoint

### 4. `Back/alembic/versions/002_add_position_to_artisan_photos.py`
- ✅ Migration pour ajouter la colonne `position`
- ✅ Idempotente (peut être exécutée plusieurs fois)

## 🚀 Utilisation

### Rebuild complet

```bash
# 1. Arrêter les conteneurs (optionnel)
docker-compose down

# 2. Rebuild toutes les images
docker-compose build

# 3. Démarrer les services
docker-compose up -d

# 4. Vérifier les logs pour voir les migrations
docker-compose logs backend | grep -E "migration|Migration|PostgreSQL"
```

### Vérification

```bash
# Vérifier que la colonne position existe
docker exec -i arty-postgres psql -U artizaho_user -d artizaho_db -c "\d artisan_photos"

# Voir tous les logs du backend
docker-compose logs -f backend
```

## 🔍 Ce qui se passe

### Au démarrage du conteneur backend

1. **Script d'entrypoint s'exécute**
2. **Attente de PostgreSQL** (max 60 secondes)
3. **Exécution des migrations** : `alembic upgrade head`
   - Migration 001 : Crée les tables (si elles n'existent pas)
   - Migration 002 : Ajoute la colonne `position` (si elle n'existe pas)
4. **Démarrage de l'application** : `uvicorn app.main:app`

### Logs attendus

```
🚀 Starting Artizaho Backend...
⏳ Waiting for PostgreSQL to be ready...
✅ PostgreSQL is ready!
📦 Running database migrations...
INFO  [alembic.runtime.migration] Context impl PostgresqlImpl.
INFO  [alembic.runtime.migration] Will assume transactional DDL.
INFO  [alembic.runtime.migration] Running upgrade  -> 001, Add user authentication tables with artisan profiles
INFO  [alembic.runtime.migration] Running upgrade 001 -> 002, Add position column to artisan_photos table
✅ Database migrations completed successfully!
🎉 Starting FastAPI application...
```

## ⚠️ Important

### Les migrations sont idempotentes

- ✅ Peuvent être exécutées plusieurs fois
- ✅ Vérifient l'existence avant de créer/modifier
- ✅ N'échouent pas si les changements sont déjà appliqués

### Volumes Docker

Les données PostgreSQL sont dans un volume persistant :
- ✅ Les données **persistent** après un rebuild
- ✅ La structure de la DB **persiste** après un rebuild
- ✅ Les migrations **s'appliquent** aux données existantes

## 🎯 Résultat

Après un rebuild, vous n'avez **plus besoin** de :
- ❌ Exécuter manuellement les migrations
- ❌ Ajouter manuellement les colonnes
- ❌ Modifier la structure de la base de données manuellement

Tout est **automatique** ! 🎉

## 📖 Documentation

- Setup automatique : `Back/scripts/AUTOMATIC_MIGRATIONS_SETUP.md`
- Pourquoi rebuild ne fonctionne pas : `Back/scripts/WHY_REBUILD_WONT_WORK.md`
- Fix Docker : `Back/scripts/FIX_POSITION_COLUMN_DOCKER.md`
- Guide rapide : `Back/scripts/QUICK_FIX_POSITION.md`

