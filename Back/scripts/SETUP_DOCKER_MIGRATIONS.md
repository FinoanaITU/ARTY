# 🔄 Configuration des migrations automatiques Docker

## ✅ Modifications effectuées

### 1. Script d'entrypoint Docker
**Fichier**: `Back/scripts/docker-entrypoint.sh`

Le script :
- ✅ Attend que PostgreSQL soit prêt (avec retry)
- ✅ Exécute automatiquement les migrations Alembic au démarrage
- ✅ Continue même si les migrations échouent (pour éviter de bloquer le démarrage)
- ✅ Démarre l'application FastAPI

### 2. Script de vérification de connexion
**Fichier**: `Back/scripts/check_db_connection.py`

Script Python pour vérifier la connexion à PostgreSQL de manière robuste.

### 3. Dockerfile modifié
**Fichier**: `Back/Dockerfile`

- ✅ Copie le script d'entrypoint
- ✅ Rend les scripts exécutables
- ✅ Configure l'entrypoint pour exécuter les migrations

### 4. Migration pour la colonne position
**Fichier**: `Back/alembic/versions/002_add_position_to_artisan_photos.py`

Migration idempotente qui ajoute la colonne `position` si elle n'existe pas.

## 🚀 Utilisation

### Rebuild et démarrage

```bash
# 1. Rebuild toutes les images
docker-compose build

# 2. Démarrer les services
docker-compose up -d

# 3. Vérifier les logs pour voir les migrations
docker-compose logs backend | grep -i migration
```

### Vérification

```bash
# Vérifier que la colonne position existe
docker exec -i arty-postgres psql -U artizaho_user -d artizaho_db -c "\d artisan_photos"

# Voir les logs du backend
docker-compose logs -f backend
```

## 📋 Ce qui se passe au démarrage

1. **Démarrage du conteneur backend**
2. **Script d'entrypoint s'exécute** :
   - Attend que PostgreSQL soit prêt
   - Exécute `alembic upgrade head`
   - Les migrations s'appliquent automatiquement
3. **Application démarre** :
   - FastAPI démarre
   - L'application est prête à recevoir des requêtes

## 🔍 Vérification des migrations

### Voir l'état des migrations

```bash
# Depuis le conteneur backend
docker exec -it arty-backend alembic current

# Voir l'historique des migrations
docker exec -it arty-backend alembic history
```

### Vérifier que la colonne position existe

```bash
docker exec -i arty-postgres psql -U artizaho_user -d artizaho_db <<EOF
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'artisan_photos'
AND column_name = 'position';
EOF
```

## ⚠️ Notes importantes

### Migrations idempotentes

Les migrations sont conçues pour être **idempotentes** :
- ✅ Peuvent être exécutées plusieurs fois
- ✅ Vérifient si les colonnes/tables existent avant de les créer
- ✅ Utilisent `IF NOT EXISTS` pour éviter les erreurs

### Volumes Docker

Les données PostgreSQL sont dans un volume persistant :
- ✅ Les données **persistent** après un rebuild
- ✅ La structure de la DB **persiste** après un rebuild
- ⚠️ Pour réinitialiser complètement : `docker-compose down -v` (⚠️ supprime TOUTES les données)

### En cas d'erreur

Si les migrations échouent :
1. Vérifier les logs : `docker-compose logs backend`
2. Exécuter manuellement : `docker exec -it arty-backend alembic upgrade head`
3. Vérifier la connexion : `docker exec -it arty-backend python scripts/check_db_connection.py`

## 🎯 Résultat

Après un rebuild, les migrations s'exécutent **automatiquement** :
- ✅ Plus besoin d'exécuter manuellement les migrations
- ✅ La base de données est toujours à jour
- ✅ Fonctionne pour toutes les futures migrations

## 📖 Documentation

- Guide complet : `Back/scripts/AUTOMATIC_MIGRATIONS_SETUP.md`
- Pourquoi rebuild ne fonctionne pas : `Back/scripts/WHY_REBUILD_WONT_WORK.md`
- Fix Docker : `Back/scripts/FIX_POSITION_COLUMN_DOCKER.md`

