# Tests Unitaires - Module d'Authentification

## Structure des tests

```
tests/
├── conftest.py          # Fixtures partagées (base de données, client, données de test)
├── test_auth.py         # Tests pour l'authentification
└── README.md           # Ce fichier
```

## Installation des dépendances

Les dépendances de test sont déjà incluses dans `requirements.txt`:
- `pytest>=7.4.3`
- `pytest-asyncio>=0.21.1`
- `pytest-cov>=4.1.0`
- `httpx>=0.25.0`

## Exécution des tests

### Tous les tests
```bash
cd Back
pytest
```

### Tests d'authentification uniquement
```bash
pytest tests/test_auth.py
```

### Tests avec couverture de code
```bash
pytest --cov=app --cov-report=html
```

### Tests en mode verbose
```bash
pytest -v
```

### Tests avec sortie détaillée
```bash
pytest -vv
```

### Exécuter un test spécifique
```bash
pytest tests/test_auth.py::TestBuyerRegistration::test_register_buyer_particulier_success
```

## Configuration

Le fichier `pytest.ini` configure:
- Les répertoires de test
- Les options par défaut
- La couverture de code
- Les marqueurs personnalisés

## Fixtures disponibles

### `db`
Base de données de test SQLite en mémoire, créée et nettoyée pour chaque test.

### `client`
Client FastAPI de test avec dépendances override pour utiliser la base de données de test.

### `test_buyer_data`
Données de test pour un acheteur particulier.

### `test_buyer_entreprise_data`
Données de test pour un acheteur entreprise.

### `test_artisan_data`
Données de test pour un artisan.

### `created_buyer`
Crée un acheteur dans la base de données de test.

### `created_artisan`
Crée un artisan avec profil dans la base de données de test.

### `auth_headers_buyer`
Headers d'authentification pour un acheteur (token JWT).

### `auth_headers_artisan`
Headers d'authentification pour un artisan (token JWT).

## Tests implémentés

### TestBuyerRegistration
- ✅ Inscription acheteur particulier réussie
- ✅ Inscription acheteur entreprise réussie
- ✅ Inscription avec email dupliqué
- ✅ Inscription avec email invalide
- ✅ Inscription avec champs manquants
- ✅ Inscription avec mot de passe faible

### TestArtisanRegistration
- ✅ Inscription artisan réussie
- ✅ Inscription artisan avec email dupliqué

### TestLogin
- ✅ Connexion réussie
- ✅ Connexion avec mot de passe incorrect
- ✅ Connexion avec utilisateur inexistant
- ✅ Connexion avec utilisateur inactif

### TestGetCurrentUser
- ✅ Récupération utilisateur courant avec token valide
- ✅ Récupération sans token
- ✅ Récupération avec token invalide

### TestRefreshToken
- ✅ Rafraîchissement de token avec refresh token valide
- ✅ Rafraîchissement avec token invalide
- ✅ Rafraîchissement sans token

### TestPasswordHashing
- ✅ Hachage de mot de passe
- ✅ Vérification de mot de passe
- ✅ Salts différents pour le même mot de passe

### TestUserRoles
- ✅ Rôle buyer assigné correctement
- ✅ Rôle artisan assigné correctement

### TestNationalityDetection
- ✅ Madagascar détecté comme local
- ✅ Pays étranger détecté comme foreign

## Base de données de test

Les tests utilisent SQLite en mémoire pour:
- ✅ Rapidité d'exécution
- ✅ Isolation complète entre les tests
- ✅ Pas de dépendance externe (PostgreSQL)

La base de données est créée avant chaque test et supprimée après.

## Coverage

Le rapport de couverture est généré dans:
- Terminal: `pytest --cov=app`
- HTML: `htmlcov/index.html`
- XML: `coverage.xml`

Objectif de couverture: **70% minimum**

## Intégration CI/CD

Les tests peuvent être intégrés dans un pipeline CI/CD:

```yaml
# Exemple GitHub Actions
- name: Run tests
  run: |
    cd Back
    pytest --cov=app --cov-report=xml

- name: Upload coverage
  uses: codecov/codecov-action@v3
  with:
    file: ./Back/coverage.xml
```

## Débogage

### Mode verbose
```bash
pytest -vv
```

### Afficher les prints
```bash
pytest -s
```

### Arrêter au premier échec
```bash
pytest -x
```

### Exécuter les derniers tests échoués
```bash
pytest --lf
```

## Bonnes pratiques

1. ✅ Chaque test est indépendant
2. ✅ Utilisation de fixtures pour éviter la duplication
3. ✅ Noms de tests descriptifs
4. ✅ Tests des cas d'erreur
5. ✅ Tests des cas limites
6. ✅ Isolation complète avec SQLite en mémoire

## Ajouter de nouveaux tests

1. Créer une nouvelle classe de test dans `test_auth.py`
2. Utiliser les fixtures existantes
3. Suivre les conventions de nommage: `test_<fonctionnalité>_<scénario>`
4. Ajouter des assertions claires
5. Documenter avec des docstrings

## Exemples

```python
def test_my_new_feature(client: TestClient, db: Session):
    """Test ma nouvelle fonctionnalité"""
    response = client.post("/api/v1/auth/my-endpoint", json={...})
    assert response.status_code == 200
    assert response.json()["key"] == "value"
```

