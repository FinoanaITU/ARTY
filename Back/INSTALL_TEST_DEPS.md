# Installation des dépendances pour les tests

## Problème

Si vous rencontrez l'erreur `pip: command not found` ou `pytest: command not found`, suivez ces étapes.

## Solution

### 1. Activer l'environnement virtuel

```bash
cd Back
source env/bin/activate
```

### 2. Installer les dépendances depuis requirements.txt

```bash
python -m pip install -r requirements.txt
```

Cette commande installera toutes les dépendances, y compris `pytest`, `pytest-asyncio`, et `pytest-cov`.

### 3. Vérifier l'installation

```bash
python -m pytest --version
```

Vous devriez voir la version de pytest affichée.

### 4. Exécuter les tests

```bash
# Avec le script
./run_tests.sh

# Ou directement
python -m pytest tests/test_auth*.py -v
```

## Alternative : Utiliser pip3 directement

Si l'environnement virtuel ne fonctionne pas correctement, vous pouvez installer pytest avec pip3 :

```bash
pip3 install pytest pytest-asyncio pytest-cov
```

Puis exécuter les tests avec :

```bash
python3 -m pytest tests/test_auth*.py -v
```

## Note importante

L'environnement virtuel `env/` doit être activé pour que les dépendances soient disponibles. Si vous rencontrez des problèmes, vérifiez que :

1. L'environnement virtuel est correctement créé
2. L'activation fonctionne (`which python` doit pointer vers `env/bin/python`)
3. Les dépendances sont installées dans l'environnement virtuel (pas globalement)

