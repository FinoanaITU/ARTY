# Stratégie de Tests - PostgreSQL vs SQLite

## 🎯 Recommandation : **PostgreSQL pour les tests**

### Pourquoi PostgreSQL pour les tests ?

1. **Cohérence avec la production**
   - Même moteur de base de données = moins de surprises
   - Types natifs PostgreSQL (UUID, ARRAY, JSON) fonctionnent correctement
   - Pas de conversion/adaptation nécessaire

2. **Problèmes actuels avec SQLite**
   - ❌ UUID : Conversion problématique (string vs UUID)
   - ❌ ARRAY : Non supporté nativement, nécessite des conversions JSON
   - ❌ Types spécifiques PostgreSQL : Nécessitent des workarounds
   - ❌ Comportements différents : Contraintes, transactions, etc.

3. **Avantages PostgreSQL**
   - ✅ Tests plus réalistes
   - ✅ Détection précoce des problèmes de compatibilité
   - ✅ Support natif de tous les types utilisés
   - ✅ Meilleure confiance dans les tests

### ⚖️ Comparaison des approches

| Critère | SQLite | PostgreSQL |
|---------|--------|------------|
| **Vitesse** | ⚡ Très rapide | 🐢 Plus lent |
| **Simplicité** | ✅ Pas de setup | ❌ Nécessite une DB |
| **Cohérence** | ❌ Différent de prod | ✅ Identique à prod |
| **Types natifs** | ❌ Conversions nécessaires | ✅ Support natif |
| **Fiabilité** | ⚠️ Tests peuvent passer mais échouer en prod | ✅ Tests fiables |

## 🏗️ Solution recommandée : Approche hybride

### Option 1 : PostgreSQL par défaut (recommandé)

**Avantages** :
- Tests fiables et cohérents avec la production
- Détection précoce des problèmes
- Pas de code de conversion nécessaire

**Configuration** :
```python
# Utiliser DATABASE_TEST_URL depuis la config
# Fallback vers SQLite si PostgreSQL non disponible
```

### Option 2 : SQLite avec option PostgreSQL

**Avantages** :
- Rapide pour les développeurs sans PostgreSQL
- Option de tester avec PostgreSQL quand nécessaire

**Configuration** :
```bash
# Variable d'environnement pour choisir
TEST_DB_TYPE=postgresql pytest
# ou
TEST_DB_TYPE=sqlite pytest  # par défaut
```

## 📋 Implémentation recommandée

### 1. Utiliser PostgreSQL par défaut

Modifier `conftest.py` pour utiliser `DATABASE_TEST_URL` :

```python
from app.core.config import settings
import os

# Utiliser PostgreSQL si disponible, sinon SQLite
TEST_DB_URL = os.getenv("TEST_DATABASE_URL", settings.DATABASE_TEST_URL)

# Si PostgreSQL non disponible, fallback vers SQLite
if "postgresql" not in TEST_DB_URL.lower():
    TEST_DB_URL = "sqlite:///:memory:"
```

### 2. Script de setup pour PostgreSQL de test

Créer un script pour initialiser la base de test :

```bash
# scripts/setup_test_db.sh
createdb artizaho_test_db
# ou via Docker
docker-compose up -d postgres-test
```

### 3. CI/CD avec PostgreSQL

Dans votre pipeline CI/CD, utiliser PostgreSQL :

```yaml
# .github/workflows/tests.yml
services:
  postgres:
    image: postgres:15
    env:
      POSTGRES_DB: artizaho_test_db
      POSTGRES_USER: test
      POSTGRES_PASSWORD: test
```

## ✅ Plan d'action

1. **Modifier `conftest.py`** pour utiliser PostgreSQL
2. **Créer un script de setup** pour la base de test
3. **Mettre à jour la documentation** des tests
4. **Ajouter une option de fallback** vers SQLite si nécessaire

## 🚀 Avantages pour votre projet

1. **Pas de problèmes de conversion UUID/ARRAY**
2. **Tests plus fiables** qui reflètent la production
3. **Moins de code de workaround** dans les tests
4. **Meilleure confiance** dans les tests avant déploiement

---

**Recommandation finale** : Utiliser PostgreSQL pour les tests avec un fallback optionnel vers SQLite pour les développeurs qui n'ont pas PostgreSQL installé localement.

