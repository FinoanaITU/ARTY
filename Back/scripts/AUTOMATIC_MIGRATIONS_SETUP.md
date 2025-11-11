# 🔄 Configuration des migrations automatiques avec Docker

## 📋 Vue d'ensemble

Ce guide explique comment configurer les migrations Alembic pour s'exécuter automatiquement au démarrage du conteneur backend.

## 🔍 Pourquoi rebuild Docker ne fonctionne pas

**Rebuild les images Docker ne modifie PAS la structure de la base de données** car :

1. ✅ Les données PostgreSQL sont dans un **volume Docker persistant** (`postgres_data`)
2. ✅ Les volumes persistent même après un rebuild
3. ❌ Les images Docker ne contiennent que le code, pas les données

## ✅ Solution : Script d'entrypoint

J'ai créé un script d'entrypoint qui exécute automatiquement les migrations au démarrage.

### Fichiers créés

1. **`scripts/docker-entrypoint.sh`** - Script qui exécute les migrations
2. **`Dockerfile`** (modifié) - Utilise le script d'entrypoint
3. **`scripts/WHY_REBUILD_WONT_WORK.md`** - Explication détaillée

### Activation

#### Option 1 : Rebuild avec le nouveau Dockerfile (Recommandé)

```bash
# 1. Rebuild l'image backend
docker-compose build backend

# 2. Redémarrer le conteneur
docker-compose up -d backend

# 3. Vérifier les logs pour voir les migrations
docker-compose logs backend | grep -i migration
```

Les migrations s'exécuteront automatiquement à chaque démarrage !

#### Option 2 : Solution immédiate (Sans rebuild)

Pour corriger le problème MAINTENANT :

```bash
# Exécuter la commande SQL directement
docker exec -i arty-postgres psql -U artizaho_user -d artizaho_db -c "ALTER TABLE artisan_photos ADD COLUMN IF NOT EXISTS position INTEGER NOT NULL DEFAULT 0;"
```

## 🔧 Comment ça fonctionne

### Avant (sans entrypoint)

```
docker-compose up -d backend
→ Conteneur démarre
→ Application démarre
→ ❌ Pas de migration
→ ❌ Erreur si la structure DB est obsolète
```

### Après (avec entrypoint)

```
docker-compose up -d backend
→ Conteneur démarre
→ Script d'entrypoint s'exécute
→ ✅ Attend que PostgreSQL soit prêt
→ ✅ Exécute `alembic upgrade head`
→ ✅ Application démarre
→ ✅ Tout fonctionne !
```

## 📝 Structure du script d'entrypoint

```bash
#!/bin/bash
set -e

# 1. Attendre que PostgreSQL soit prêt
# (docker-compose s'en charge avec depends_on)

# 2. Exécuter les migrations
alembic upgrade head

# 3. Démarrer l'application
exec "$@"
```

## 🚀 Workflow de développement

### Créer une nouvelle migration

```bash
cd Back
source env/bin/activate

# Créer une migration
alembic revision --autogenerate -m "add_new_column"

# Tester localement
alembic upgrade head
```

### Déployer avec Docker

```bash
# Rebuild et redémarrer
docker-compose build backend
docker-compose up -d backend

# Les migrations s'exécutent automatiquement
```

## 🔍 Vérification

### Vérifier que les migrations s'exécutent

```bash
# Voir les logs du backend
docker-compose logs backend | grep -i migration

# Ou voir tous les logs
docker-compose logs -f backend
```

Vous devriez voir :
```
📦 Running database migrations...
INFO  [alembic.runtime.migration] Running upgrade ...
```

### Vérifier la structure de la base de données

```bash
# Vérifier que la colonne position existe
docker exec -i arty-postgres psql -U artizaho_user -d artizaho_db -c "\d artisan_photos"
```

## ⚠️ Notes importantes

### Les migrations sont idempotentes

- ✅ Peuvent être exécutées plusieurs fois
- ✅ Ne modifient que ce qui est nécessaire
- ✅ Utilisent `IF NOT EXISTS` pour éviter les erreurs

### En cas d'erreur de migration

Si une migration échoue :
1. Le script continue (ne bloque pas le démarrage)
2. Vérifiez les logs : `docker-compose logs backend`
3. Exécutez manuellement : `docker exec -it arty-backend alembic upgrade head`

### Volumes Docker

Les volumes Docker persistent les données :
- ✅ Les données ne sont **pas perdues** lors d'un rebuild
- ✅ La structure de la DB **persiste** même après rebuild
- ⚠️ Pour réinitialiser complètement, supprimez le volume :
  ```bash
  docker-compose down -v  # ⚠️ Supprime TOUTES les données !
  ```

## 📖 Documentation

- Guide complet : `Back/scripts/WHY_REBUILD_WONT_WORK.md`
- Fix Docker : `Back/scripts/FIX_POSITION_COLUMN_DOCKER.md`
- Guide rapide : `Back/scripts/QUICK_FIX_POSITION.md`

## 🎯 Résumé

| Action | Migrations auto ? | Modifie la DB ? |
|--------|-------------------|-----------------|
| Rebuild sans entrypoint | ❌ Non | ❌ Non |
| Rebuild avec entrypoint | ✅ Oui | ✅ Oui |
| Exécution manuelle | ❌ Non | ✅ Oui |

**Recommandation :** Utiliser le script d'entrypoint pour automatiser les migrations !

