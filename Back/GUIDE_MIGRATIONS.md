# Guide d'exécution des migrations

Ce guide explique où et comment exécuter les migrations Alembic pour le projet Artizaho.

## 📍 Où exécuter les migrations ?

Les migrations peuvent être exécutées dans différents contextes selon votre environnement.

---

## 🐳 Option 1 : Avec Docker (Recommandé)

### Automatique (déjà configuré)

Les migrations s'exécutent **automatiquement** au démarrage du conteneur backend via le script `docker-entrypoint.sh`.

**Aucune action requise** - Les migrations sont exécutées automatiquement quand vous démarrez les conteneurs :

```bash
# Démarre tous les services (migrations exécutées automatiquement)
docker-compose up -d

# Ou avec le Makefile
make up
```

### Manuelle (si nécessaire)

Si vous devez exécuter les migrations manuellement :

#### Méthode 1 : Via Makefile (recommandé)

```bash
# Exécuter les migrations
make db-migrate

# Voir les autres commandes disponibles
make help
```

#### Méthode 2 : Via Docker Compose directement

```bash
# Exécuter les migrations
docker-compose exec backend alembic upgrade head

# Voir l'état des migrations
docker-compose exec backend alembic current

# Voir l'historique des migrations
docker-compose exec backend alembic history
```

#### Méthode 3 : Accéder au shell du conteneur

```bash
# Accéder au shell du conteneur backend
docker-compose exec backend bash

# Une fois dans le conteneur
cd /app
alembic upgrade head
```

---

## 💻 Option 2 : Environnement local (sans Docker)

### Prérequis

1. **Python 3.11+** installé
2. **PostgreSQL** installé et démarré (ou SQLite pour le développement)
3. **Variables d'environnement** configurées (fichier `.env`)

### Installation des dépendances

```bash
# Aller dans le répertoire Back
cd Back

# Créer un environnement virtuel (recommandé)
python3 -m venv venv

# Activer l'environnement virtuel
# Sur macOS/Linux:
source venv/bin/activate
# Sur Windows:
# venv\Scripts\activate

# Installer les dépendances
pip install -r requirements.txt
```

### Configuration de la base de données

1. **Créer le fichier `.env`** à partir de `env.example` :

```bash
cp env.example .env
```

2. **Configurer la connexion à la base de données** dans `.env` :

```env
DATABASE_URL=postgresql://user:password@localhost:5432/artizaho_db
```

Ou pour SQLite (développement local) :

```env
DATABASE_URL=sqlite:///./artizaho.db
```

### Exécution des migrations

```bash
# Aller dans le répertoire Back
cd Back

# Vérifier la configuration Alembic
alembic current

# Exécuter toutes les migrations
alembic upgrade head

# Voir l'historique des migrations
alembic history

# Voir les migrations en attente
alembic heads
```

---

## 🚀 Scénarios d'utilisation

### Scénario 1 : Nouveau projet (première installation)

#### Avec Docker :

```bash
# 1. Cloner le projet
git clone <repository-url>
cd ARTY

# 2. Configurer les variables d'environnement (si nécessaire)
cp Back/env.example Back/.env
# Éditer Back/.env si nécessaire

# 3. Démarrer les services
docker-compose up -d

# Les migrations s'exécutent automatiquement !
# Le seed data est également exécuté automatiquement
```

#### Sans Docker :

```bash
# 1. Aller dans le répertoire Back
cd Back

# 2. Installer les dépendances
pip install -r requirements.txt

# 3. Configurer la base de données dans .env
cp env.example .env
# Éditer .env avec vos paramètres de base de données

# 4. Exécuter les migrations
alembic upgrade head

# 5. Exécuter le seed data (catégories, admin)
python scripts/seed_initial_data.py

# 6. Démarrer l'application
uvicorn app.main:app --reload
```

### Scénario 2 : Après avoir récupéré du code (nouvelles migrations)

#### Avec Docker :

```bash
# 1. Récupérer le code
git pull

# 2. Reconstruire les images (si nécessaire)
docker-compose build

# 3. Redémarrer les services
docker-compose up -d

# Les migrations s'exécutent automatiquement !
```

#### Sans Docker :

```bash
# 1. Aller dans le répertoire Back
cd Back

# 2. Récupérer le code
git pull

# 3. Installer les nouvelles dépendances (si nécessaire)
pip install -r requirements.txt

# 4. Exécuter les nouvelles migrations
alembic upgrade head
```

### Scénario 3 : Créer une nouvelle migration

```bash
# Avec Docker
docker-compose exec backend alembic revision --autogenerate -m "Description de la migration"

# Sans Docker
cd Back
alembic revision --autogenerate -m "Description de la migration"
```

### Scénario 4 : Rollback (annuler une migration)

```bash
# Avec Docker
docker-compose exec backend alembic downgrade -1

# Ou via Makefile
make db-rollback

# Sans Docker
cd Back
alembic downgrade -1
```

### Scénario 5 : Réinitialiser la base de données

```bash
# Avec Docker (ATTENTION: supprime toutes les données)
make db-reset

# Ou manuellement
docker-compose down -v  # Supprime les volumes
docker-compose up -d    # Recrée tout
```

---

## 🔍 Vérification

### Vérifier que les migrations ont été exécutées

```bash
# Avec Docker
docker-compose exec backend alembic current

# Sans Docker
cd Back
alembic current
```

### Vérifier que les données initiales sont créées

```bash
# Vérifier les catégories via l'API
curl http://localhost:8000/api/v1/products/categories

# Vérifier l'admin (nécessite une connexion à la DB)
docker-compose exec backend python -c "
from app.core.database import SessionLocal
from app.models.user import User
from app.models.product import Category

db = SessionLocal()
admin = db.query(User).filter(User.email == 'admin@artizaho.com').first()
categories_count = db.query(Category).count()

print(f'Admin exists: {admin is not None}')
print(f'Categories count: {categories_count}')
db.close()
"
```

---

## 📋 Commandes utiles

### Commandes Alembic

```bash
# Voir l'état actuel
alembic current

# Voir l'historique
alembic history

# Voir les migrations en attente
alembic heads

# Exécuter jusqu'à une version spécifique
alembic upgrade <revision>

# Rollback d'une version
alembic downgrade -1

# Rollback jusqu'à une version spécifique
alembic downgrade <revision>

# Créer une nouvelle migration
alembic revision --autogenerate -m "Description"

# Créer une migration vide
alembic revision -m "Description"
```

### Commandes Makefile

```bash
# Voir toutes les commandes disponibles
make help

# Exécuter les migrations
make db-migrate

# Rollback
make db-rollback

# Réinitialiser la base de données
make db-reset

# Accéder au shell du backend
make backend-shell

# Voir les logs
make backend-logs
```

---

## ⚠️ Troubleshooting

### Problème : Les migrations ne s'exécutent pas automatiquement

**Solution** : Vérifier que le script `docker-entrypoint.sh` est exécutable :

```bash
chmod +x Back/scripts/docker-entrypoint.sh
```

### Problème : Erreur de connexion à la base de données

**Solution** : Vérifier que PostgreSQL est démarré et que les variables d'environnement sont correctes :

```bash
# Vérifier que PostgreSQL est démarré (Docker)
docker-compose ps postgres

# Vérifier la connexion
docker-compose exec backend python scripts/check_db_connection.py
```

### Problème : Conflit de révisions de migration

**Solution** : Vérifier l'ordre des migrations :

```bash
docker-compose exec backend alembic history
```

Si nécessaire, corriger l'ordre dans les fichiers de migration.

### Problème : Les tables existent déjà

**Solution** : Les migrations vérifient si les tables existent avant de les créer. C'est normal si vous voyez des messages "already exists".

---

## 📚 Ressources

- [Documentation Alembic](https://alembic.sqlalchemy.org/)
- [README Seed Data](./README_SEED_DATA.md)
- [Scripts de migration](./scripts/COMMANDES_MIGRATIONS.md)

---

## 🎯 Résumé rapide

**Pour la plupart des cas, vous n'avez rien à faire !**

Les migrations s'exécutent automatiquement :
- ✅ Au démarrage de Docker (`docker-compose up`)
- ✅ Via le script `docker-entrypoint.sh`
- ✅ Le seed data est également exécuté automatiquement

**Commandes manuelles (si nécessaire) :**
- `make db-migrate` : Exécuter les migrations manuellement
- `make db-rollback` : Annuler la dernière migration
- `docker-compose exec backend alembic upgrade head` : Alternative manuelle

