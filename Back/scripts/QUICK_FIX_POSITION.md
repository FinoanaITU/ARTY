# 🔧 Correction Rapide : Colonne position manquante

## ⚡ Solution la plus rapide (1 commande)

```bash
docker exec -i arty-postgres psql -U artizaho_user -d artizaho_db -c "ALTER TABLE artisan_photos ADD COLUMN IF NOT EXISTS position INTEGER NOT NULL DEFAULT 0;"
```

## ✅ Vérification

```bash
docker exec -i arty-postgres psql -U artizaho_user -d artizaho_db -c "\d artisan_photos"
```

Vous devriez voir la colonne `position` dans la liste.

## 📋 Autres solutions

### Solution 2 : Script Shell (avec vérifications)

```bash
cd /Users/finoanaandriatsilavo/Documents/ARTY
./Back/scripts/fix_position_column_docker.sh
```

### Solution 3 : Script Python

```bash
cd Back
source env/bin/activate
python scripts/fix_position_column_python.py
```

### Solution 4 : Alembic (depuis le conteneur backend)

```bash
docker exec -it arty-backend alembic upgrade head
```

## 🚨 Si le conteneur n'est pas démarré

```bash
# Démarrer PostgreSQL
docker-compose up -d postgres

# Vérifier qu'il est démarré
docker ps | grep arty-postgres
```

## 📖 Documentation complète

Voir `Back/scripts/FIX_POSITION_COLUMN_DOCKER.md` pour plus de détails.

