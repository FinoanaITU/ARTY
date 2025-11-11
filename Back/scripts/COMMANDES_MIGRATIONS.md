# 📋 Commandes pour lancer les migrations Alembic

## 🐳 Depuis Docker (Recommandé)

### Option 1 : Automatique (via entrypoint)
Les migrations s'exécutent **automatiquement** au démarrage du conteneur backend :

```bash
# Redémarrer le conteneur backend
docker-compose restart backend

# Ou reconstruire et redémarrer
docker-compose build backend
docker-compose up -d backend
```

### Option 2 : Manuelle depuis le conteneur backend

```bash
# Exécuter toutes les migrations en attente
docker exec arty-backend alembic upgrade head

# Voir l'état actuel des migrations
docker exec arty-backend alembic current

# Voir l'historique des migrations
docker exec arty-backend alembic history

# Revenir à une version précédente (downgrade)
docker exec arty-backend alembic downgrade -1  # Une version en arrière
docker exec arty-backend alembic downgrade base  # Toutes les migrations
```

## 💻 Depuis la machine locale (sans Docker)

### Prérequis
```bash
cd Back
source env/bin/activate  # Activer l'environnement virtuel
# ou
python -m venv env
source env/bin/activate
pip install -r requirements.txt
```

### Commandes

```bash
# Exécuter toutes les migrations en attente
alembic upgrade head

# Voir l'état actuel
alembic current

# Voir l'historique
alembic history

# Revenir en arrière
alembic downgrade -1
alembic downgrade base
```

## 🔍 Vérification

### Vérifier que les migrations sont appliquées

```bash
# Depuis Docker
docker exec arty-backend alembic current

# Vérifier la structure de la table
docker exec -i arty-postgres psql -U artizaho_user -d artizaho_db -c "\d artisan_photos"
```

### Voir les logs de migration

```bash
# Logs du backend (les migrations s'affichent au démarrage)
docker-compose logs backend | grep -i migration
```

## 📝 Créer une nouvelle migration

```bash
# Depuis Docker
docker exec arty-backend alembic revision --autogenerate -m "description de la migration"

# Depuis la machine locale
alembic revision --autogenerate -m "description de la migration"
```

## 🎯 Commandes rapides

```bash
# Migration complète (recommandé)
docker-compose restart backend

# Migration manuelle si nécessaire
docker exec arty-backend alembic upgrade head

# Vérifier l'état
docker exec arty-backend alembic current
```

## ⚠️ Notes importantes

1. **Les migrations s'exécutent automatiquement** au démarrage grâce au script d'entrypoint
2. **Pas besoin de lancer manuellement** sauf en cas de problème
3. **Vérifier les logs** si une migration échoue : `docker-compose logs backend`

