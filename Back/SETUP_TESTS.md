# Configuration des tests unitaires

## Problème avec l'environnement virtuel

L'environnement virtuel `env/` semble avoir été créé avec un ancien chemin de projet. Pour résoudre ce problème, vous avez deux options :

## Option 1 : Recréer l'environnement virtuel (Recommandé)

```bash
cd Back

# Supprimer l'ancien environnement virtuel
rm -rf env

# Créer un nouvel environnement virtuel
python3 -m venv env

# Activer l'environnement virtuel
source env/bin/activate

# Installer les dépendances
pip install -r requirements.txt

# Vérifier l'installation
pytest --version
```

## Option 2 : Utiliser Docker (Recommandé pour la production)

Les tests peuvent être exécutés dans Docker, ce qui garantit un environnement cohérent :

```bash
# Depuis la racine du projet
docker-compose up -d postgres
docker-compose exec backend pytest tests/test_auth*.py -v
```

## Option 3 : Installation globale (Non recommandé)

Si vous ne pouvez pas utiliser un environnement virtuel, vous pouvez installer pytest globalement :

```bash
# Installation avec break-system-packages (non recommandé)
python3 -m pip install --break-system-packages pytest pytest-asyncio pytest-cov
```

⚠️ **Attention** : Cette méthode n'est pas recommandée car elle peut interférer avec d'autres projets Python.

## Exécution des tests

Une fois l'environnement configuré, vous pouvez exécuter les tests avec :

```bash
# Avec le script
cd Back
./run_tests.sh

# Ou directement
pytest tests/test_auth*.py -v

# Avec couverture
pytest tests/test_auth*.py -v --cov=app.services.auth --cov=app.api.v1.endpoints.auth --cov-report=html
```

## Vérification de l'installation

Pour vérifier que tout est correctement installé :

```bash
# Activer l'environnement virtuel
source env/bin/activate

# Vérifier Python
python --version

# Vérifier pytest
pytest --version

# Vérifier les dépendances
pip list | grep pytest
```

## Dépannage

### Erreur : "pytest: command not found"

1. Vérifiez que l'environnement virtuel est activé : `which pytest` doit pointer vers `env/bin/pytest`
2. Réinstallez pytest : `pip install pytest pytest-asyncio pytest-cov`

### Erreur : "No module named pytest"

1. Vérifiez que vous êtes dans le bon environnement virtuel
2. Réinstallez les dépendances : `pip install -r requirements.txt`

### Erreur : "bad interpreter"

L'environnement virtuel a été créé avec un ancien chemin. Recréez-le avec l'option 1.

## Tests disponibles

Les tests sont organisés en plusieurs fichiers :

- `test_auth_service.py` : Tests du service d'authentification
- `test_auth_schemas.py` : Tests des schémas Pydantic
- `test_auth_api.py` : Tests des endpoints API
- `test_auth_security.py` : Tests de sécurité (hash, JWT)

Pour plus de détails, consultez `tests/README_TESTS.md`.

