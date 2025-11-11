# 🚀 Démarrage Rapide - Migrations

## ⚡ Méthode la plus simple (Docker)

```bash
# 1. Aller à la racine du projet
cd /Users/finoanaandriatsilavo/Documents/ARTY

# 2. Démarrer tous les services
docker-compose up -d

# C'est tout ! Les migrations s'exécutent automatiquement.
```

Les migrations et le seed data sont exécutés automatiquement au démarrage.

---

## 📝 Exécution manuelle (si nécessaire)

### Avec Docker

```bash
# Via Makefile (recommandé)
make db-migrate

# Ou directement
docker-compose exec backend alembic upgrade head
```

### Sans Docker (environnement local)

#### Méthode 1 : Script automatique (recommandé)

```bash
# 1. Aller dans le répertoire Back
cd Back

# 2. Activer l'environnement virtuel (si vous en avez un)
source venv/bin/activate  # macOS/Linux
# ou
venv\Scripts\activate     # Windows

# 3. Exécuter le script de migration
./scripts/run_migrations.sh
```

#### Méthode 2 : Commandes manuelles

```bash
# 1. Aller dans le répertoire Back
cd Back

# 2. Activer l'environnement virtuel (si vous en avez un)
source venv/bin/activate  # macOS/Linux
# ou
venv\Scripts\activate     # Windows

# 3. Exécuter les migrations
alembic upgrade head

# 4. Exécuter le seed data
python scripts/seed_initial_data.py
```

---

## 🔍 Vérification

```bash
# Vérifier que les migrations sont à jour
docker-compose exec backend alembic current

# Vérifier que les catégories sont créées
curl http://localhost:8000/api/v1/products/categories
```

---

## 📍 Où se trouvent les fichiers ?

- **Migrations** : `Back/alembic/versions/`
- **Script de seed** : `Back/scripts/seed_initial_data.py`
- **Configuration Alembic** : `Back/alembic.ini`
- **Script d'entrée Docker** : `Back/scripts/docker-entrypoint.sh`

---

## ⚠️ Important

- Les migrations s'exécutent **automatiquement** avec Docker
- Le seed data (catégories, admin) est créé **automatiquement**
- Vous n'avez généralement **rien à faire manuellement**

## 🔧 Problème de révision ?

Si vous voyez l'erreur `Can't locate revision identified by '004'`, exécutez :

```bash
# Corriger la révision dans la base de données
docker-compose exec backend python scripts/fix_migration_revision.py

# Puis réexécuter les migrations
docker-compose exec backend alembic upgrade head
```

Pour plus de détails, voir [GUIDE_MIGRATIONS.md](./GUIDE_MIGRATIONS.md)

