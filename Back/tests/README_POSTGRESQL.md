# Guide d'utilisation des tests avec PostgreSQL

## 🎯 Pourquoi PostgreSQL pour les tests ?

Le projet utilise **PostgreSQL** en production. Utiliser PostgreSQL pour les tests garantit :
- ✅ **Cohérence** : Même environnement que la production
- ✅ **Fiabilité** : Pas de problèmes de conversion UUID/ARRAY
- ✅ **Confiance** : Les tests reflètent le comportement réel

## 🚀 Configuration rapide

### Option 1 : Docker (recommandé - le plus simple)

```bash
# Démarrer PostgreSQL dans Docker
docker-compose -f docker-compose.test.yml up -d

# Les tests utiliseront automatiquement PostgreSQL
pytest
```

### Option 2 : PostgreSQL local

```bash
# 1. Installer PostgreSQL (si pas déjà installé)
# macOS: brew install postgresql
# Ubuntu: sudo apt-get install postgresql

# 2. Créer la base de données de test
./scripts/setup_test_db.sh

# 3. Configurer l'URL de test dans .env
export TEST_DATABASE_URL=postgresql://test_user:test_password@localhost:5432/artizaho_test_db

# 4. Lancer les tests
pytest
```

### Option 3 : SQLite (fallback automatique)

Si PostgreSQL n'est pas disponible, les tests utiliseront automatiquement SQLite en mémoire :

```bash
# Pas de configuration nécessaire
pytest
# ⚠️  Utilisation de SQLite pour les tests (PostgreSQL recommandé)
```

## 📋 Configuration détaillée

### Variables d'environnement

```bash
# .env ou export
TEST_DATABASE_URL=postgresql://user:password@localhost:5432/artizaho_test_db
```

Si `TEST_DATABASE_URL` n'est pas définie, le système utilise :
1. `DATABASE_TEST_URL` depuis `config.py`
2. SQLite en mémoire si PostgreSQL n'est pas disponible

### Docker Compose pour les tests

Créer `docker-compose.test.yml` :

```yaml
version: '3.8'

services:
  postgres-test:
    image: postgres:15
    environment:
      POSTGRES_DB: artizaho_test_db
      POSTGRES_USER: test_user
      POSTGRES_PASSWORD: test_password
    ports:
      - "5433:5432"  # Port différent pour éviter les conflits
    volumes:
      - postgres_test_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U test_user"]
      interval: 5s
      timeout: 5s
      retries: 5

volumes:
  postgres_test_data:
```

Puis :

```bash
docker-compose -f docker-compose.test.yml up -d
export TEST_DATABASE_URL=postgresql://test_user:test_password@localhost:5433/artizaho_test_db
pytest
```

## ✅ Vérification

Pour vérifier quelle base de données est utilisée :

```bash
pytest -v
# Vous verrez au début :
# ✅ Utilisation de PostgreSQL pour les tests: localhost:5432/artizaho_test_db
# ou
# ⚠️  Utilisation de SQLite pour les tests (PostgreSQL recommandé)
```

## 🔧 Dépannage

### Erreur : "could not connect to server"

```bash
# Vérifier que PostgreSQL est démarré
# Docker:
docker ps | grep postgres

# Local:
pg_isready
```

### Erreur : "database does not exist"

```bash
# Créer la base de données
./scripts/setup_test_db.sh
```

### Forcer SQLite (pour développement rapide)

```bash
# Désactiver PostgreSQL temporairement
unset TEST_DATABASE_URL
pytest
```

## 📊 Comparaison des performances

| Base de données | Temps d'exécution | Fiabilité |
|----------------|-------------------|-----------|
| PostgreSQL     | ~10-15s          | ⭐⭐⭐⭐⭐ |
| SQLite         | ~5-8s            | ⭐⭐⭐ |

**Recommandation** : Utiliser PostgreSQL pour les tests CI/CD et les tests avant commit. SQLite peut être utilisé pour le développement rapide.

## 🎯 Bonnes pratiques

1. **CI/CD** : Toujours utiliser PostgreSQL
2. **Développement local** : PostgreSQL recommandé, SQLite acceptable
3. **Avant commit** : Tester avec PostgreSQL au moins une fois
4. **Tests de régression** : Toujours PostgreSQL

## 📝 Notes

- Les tests nettoient automatiquement la base de données après chaque test
- Chaque test utilise une transaction qui est rollback après le test
- Pas besoin de nettoyer manuellement la base de données

