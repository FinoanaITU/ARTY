# 📋 Instructions pour Rebuild Docker avec Migrations Automatiques

## ✅ Modifications effectuées

Toutes les modifications nécessaires ont été effectuées pour que votre projet fonctionne correctement après un rebuild Docker.

## 🔧 Fichiers modifiés

### 1. `Back/Dockerfile`
- ✅ Configure l'ENTRYPOINT pour exécuter le script d'entrypoint
- ✅ Rend les scripts exécutables
- ✅ Gère correctement les permissions

### 2. `Back/scripts/docker-entrypoint.sh`
- ✅ Attend que PostgreSQL soit prêt
- ✅ Exécute automatiquement `alembic upgrade head`
- ✅ Démarre l'application FastAPI

### 3. `Back/scripts/check_db_connection.py`
- ✅ Vérifie la connexion à PostgreSQL
- ✅ Utilisé par le script d'entrypoint

### 4. `Back/alembic/versions/002_add_position_to_artisan_photos.py`
- ✅ Migration pour ajouter la colonne `position`
- ✅ Idempotente et sûre

## 🚀 Comment utiliser

### Rebuild complet

```bash
# 1. Rebuild toutes les images
docker-compose build

# 2. Démarrer les services
docker-compose up -d

# 3. Vérifier les logs
docker-compose logs -f backend
```

### Vérification

```bash
# Vérifier que la colonne position existe
docker exec -i arty-postgres psql -U artizaho_user -d artizaho_db -c "\d artisan_photos"
```

## 📋 Ce qui se passe au démarrage

1. **PostgreSQL démarre** (avec healthcheck)
2. **Backend démarre** (attend que PostgreSQL soit prêt)
3. **Script d'entrypoint s'exécute** :
   - Vérifie la connexion à PostgreSQL
   - Exécute `alembic upgrade head`
   - Les migrations s'appliquent automatiquement
4. **Application démarre** :
   - FastAPI démarre
   - Prêt à recevoir des requêtes

## ✅ Résultat

Après un rebuild, vous n'avez **plus besoin** de :
- ❌ Exécuter manuellement les migrations
- ❌ Ajouter manuellement les colonnes
- ❌ Modifier la structure de la base de données

**Tout est automatique !** 🎉

## 📖 Documentation

- Guide de test : `Back/scripts/TEST_DOCKER_REBUILD.md`
- Setup automatique : `Back/scripts/AUTOMATIC_MIGRATIONS_SETUP.md`
- Pourquoi rebuild ne fonctionne pas : `Back/scripts/WHY_REBUILD_WONT_WORK.md`

