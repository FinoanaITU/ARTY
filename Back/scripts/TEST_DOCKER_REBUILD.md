# 🧪 Test du Rebuild Docker avec Migrations

## ✅ Checklist avant le rebuild

- [x] Script `docker-entrypoint.sh` existe et est exécutable
- [x] Script `check_db_connection.py` existe et est exécutable
- [x] Migration `002_add_position_to_artisan_photos.py` existe
- [x] Dockerfile configure l'entrypoint
- [x] docker-compose.yml a `depends_on` avec `service_healthy`

## 🚀 Étapes de test

### 1. Vérifier les scripts locaux

```bash
# Vérifier que les scripts sont exécutables
ls -la Back/scripts/docker-entrypoint.sh
ls -la Back/scripts/check_db_connection.py

# Doit afficher -rwxr-xr-x (exécutable)
```

### 2. Rebuild les images

```bash
# Depuis la racine du projet
cd /Users/finoanaandriatsilavo/Documents/ARTY

# Rebuild le backend
docker-compose build backend

# Vérifier que l'image est créée
docker images | grep arty-backend
```

### 3. Démarrer les services

```bash
# Démarrer PostgreSQL d'abord
docker-compose up -d postgres

# Attendre que PostgreSQL soit prêt
docker-compose logs postgres | grep -i "ready"

# Démarrer le backend
docker-compose up -d backend
```

### 4. Vérifier les logs

```bash
# Voir les logs du backend
docker-compose logs -f backend

# Vous devriez voir :
# 🚀 Starting Artizaho Backend...
# ⏳ Waiting for PostgreSQL to be ready...
# ✅ PostgreSQL is ready!
# 📦 Running database migrations...
# ✅ Database migrations completed successfully!
# 🎉 Starting FastAPI application...
```

### 5. Vérifier la colonne position

```bash
# Vérifier que la colonne position existe
docker exec -i arty-postgres psql -U artizaho_user -d artizaho_db -c "\d artisan_photos"
```

Vous devriez voir la colonne `position` dans la liste.

### 6. Tester l'inscription artisan

```bash
# Tester depuis le frontend ou avec curl
curl -X POST http://localhost:8000/api/v1/auth/register/artisan \
  -F "email=test@example.com" \
  -F "password=test123" \
  -F "name=Test Artisan" \
  -F "region=Antananarivo" \
  -F "city=Antananarivo" \
  -F "company_name=Test Company" \
  -F "main_specialty=vannerie" \
  -F "activity_description=Test description" \
  -F "offerings=products"
```

## 🔍 Dépannage

### Le script d'entrypoint ne s'exécute pas

```bash
# Vérifier que le script existe dans le conteneur
docker exec -it arty-backend ls -la /app/scripts/docker-entrypoint.sh

# Vérifier les permissions
docker exec -it arty-backend cat /app/scripts/docker-entrypoint.sh
```

### Les migrations ne s'exécutent pas

```bash
# Exécuter manuellement les migrations
docker exec -it arty-backend alembic upgrade head

# Voir l'état actuel
docker exec -it arty-backend alembic current
```

### Erreur de connexion PostgreSQL

```bash
# Vérifier que PostgreSQL est démarré
docker ps | grep arty-postgres

# Vérifier les logs PostgreSQL
docker-compose logs postgres

# Tester la connexion
docker exec -it arty-backend python scripts/check_db_connection.py
```

## 📋 Résultat attendu

Après le rebuild, vous devriez avoir :

1. ✅ Les migrations s'exécutent automatiquement
2. ✅ La colonne `position` existe dans `artisan_photos`
3. ✅ L'inscription artisan fonctionne
4. ✅ L'upload de photos fonctionne

## 🎯 Commandes rapides

```bash
# Rebuild et démarrage complet
docker-compose build backend && docker-compose up -d

# Voir les logs en temps réel
docker-compose logs -f backend

# Vérifier la colonne position
docker exec -i arty-postgres psql -U artizaho_user -d artizaho_db -c "\d artisan_photos"

# Tester la connexion
docker exec -it arty-backend python scripts/check_db_connection.py
```

