# Tests unitaires pour le module d'authentification

Ce répertoire contient les tests unitaires pour le module d'authentification de l'application ARTY.

## Structure des tests

Les tests sont organisés en plusieurs fichiers :

- **`test_auth_service.py`** : Tests pour le service d'authentification (`AuthService`)
- **`test_auth_schemas.py`** : Tests pour les schémas Pydantic
- **`test_auth_api.py`** : Tests pour les endpoints API FastAPI
- **`test_auth_security.py`** : Tests pour les utilitaires de sécurité (hash de mot de passe, JWT)
- **`conftest.py`** : Configuration et fixtures partagées pour tous les tests

## Configuration

Les tests utilisent une base de données SQLite en mémoire pour des performances optimales. Les types PostgreSQL spécifiques (comme `ARRAY` et `UUID`) sont automatiquement convertis en types SQLite-compatibles.

### Fixtures disponibles

- **`db`** : Session de base de données de test
- **`client`** : Client de test FastAPI
- **`test_buyer_data`** : Données de test pour un acheteur particulier
- **`test_buyer_entreprise_data`** : Données de test pour un acheteur entreprise
- **`test_artisan_data`** : Données de test pour un artisan
- **`created_buyer`** : Utilisateur acheteur créé dans la base de données
- **`created_artisan`** : Utilisateur artisan créé dans la base de données
- **`auth_headers_buyer`** : Headers d'authentification pour un acheteur
- **`auth_headers_artisan`** : Headers d'authentification pour un artisan

## Exécution des tests

### Avec pytest directement

```bash
cd Back
pytest tests/test_auth*.py -v
```

### Avec le script d'aide

```bash
cd Back
./run_tests.sh
```

### Avec couverture de code

```bash
cd Back
pytest tests/test_auth*.py -v --cov=app.services.auth --cov=app.api.v1.endpoints.auth --cov=app.core.security --cov=app.schemas.user --cov-report=html
```

Le rapport de couverture sera généré dans `htmlcov/index.html`.

## Tests disponibles

### Tests du service (`test_auth_service.py`)

- `test_detect_nationality_madagascar` : Détection de la nationalité malgache
- `test_detect_nationality_foreign` : Détection de la nationalité étrangère
- `test_create_buyer_success` : Création d'un acheteur
- `test_create_buyer_entreprise` : Création d'un acheteur entreprise
- `test_create_buyer_duplicate_email` : Gestion des emails dupliqués
- `test_create_artisan_success` : Création d'un artisan
- `test_create_artisan_duplicate_email` : Gestion des emails dupliqués pour les artisans
- `test_authenticate_success` : Authentification réussie
- `test_authenticate_wrong_password` : Authentification avec mot de passe incorrect
- `test_authenticate_nonexistent_user` : Authentification avec utilisateur inexistant
- `test_authenticate_inactive_user` : Authentification avec utilisateur inactif
- `test_generate_tokens` : Génération de tokens JWT
- `test_refresh_access_token` : Rafraîchissement du token d'accès
- `test_refresh_access_token_invalid` : Rafraîchissement avec token invalide
- `test_get_current_user_valid_token` : Récupération d'utilisateur avec token valide
- `test_get_current_user_invalid_token` : Récupération d'utilisateur avec token invalide
- `test_get_current_user_inactive_user` : Récupération d'utilisateur inactif

### Tests des schémas (`test_auth_schemas.py`)

- Tests de validation des schémas Pydantic pour l'inscription et la connexion
- Tests de sérialisation des schémas de sortie

### Tests des endpoints API (`test_auth_api.py`)

- `test_register_buyer_success` : Inscription d'un acheteur
- `test_register_buyer_duplicate_email` : Inscription avec email existant
- `test_register_artisan_success` : Inscription d'un artisan
- `test_register_artisan_duplicate_email` : Inscription d'artisan avec email existant
- `test_login_success` : Connexion réussie
- `test_login_wrong_password` : Connexion avec mot de passe incorrect
- `test_login_nonexistent_user` : Connexion avec utilisateur inexistant
- `test_get_me_success` : Récupération des informations de l'utilisateur connecté
- `test_get_me_unauthorized` : Récupération sans authentification
- `test_refresh_token_success` : Rafraîchissement du token
- `test_refresh_token_invalid` : Rafraîchissement avec token invalide

### Tests de sécurité (`test_auth_security.py`)

- `test_get_password_hash` : Hash de mot de passe
- `test_verify_password` : Vérification de mot de passe
- `test_verify_password_wrong` : Vérification avec mot de passe incorrect
- `test_create_access_token` : Création de token d'accès
- `test_create_refresh_token` : Création de token de refresh
- `test_verify_token` : Vérification de token JWT
- `test_verify_token_invalid` : Vérification avec token invalide
- `test_verify_token_expired` : Vérification avec token expiré

## Notes importantes

1. **Base de données de test** : Les tests utilisent une base de données SQLite en mémoire, donc aucune configuration de base de données externe n'est nécessaire.

2. **Isolation des tests** : Chaque test utilise une nouvelle base de données, donc les tests sont complètement isolés les uns des autres.

3. **Types PostgreSQL** : Les types PostgreSQL spécifiques (comme `ARRAY` et `UUID`) sont automatiquement convertis en types SQLite-compatibles dans les fixtures.

4. **Fixtures** : Les fixtures sont réutilisables et peuvent être combinées pour créer des scénarios de test complexes.

5. **Couverture de code** : Les tests visent une couverture de code élevée pour le module d'authentification. Utilisez `--cov` pour générer des rapports de couverture.

## Dépendances

Les tests nécessitent les packages suivants (déjà inclus dans `requirements.txt`) :

- `pytest` : Framework de test
- `pytest-asyncio` : Support pour les tests asynchrones
- `pytest-cov` : Rapport de couverture de code
- `fastapi[test]` : Client de test FastAPI
- `sqlalchemy` : ORM pour la base de données
- `bcrypt` : Hash de mot de passe
- `python-jose` : Gestion des tokens JWT

## Contribution

Lors de l'ajout de nouveaux tests :

1. Suivez la structure existante
2. Utilisez les fixtures disponibles
3. Assurez-vous que les tests sont isolés
4. Ajoutez des docstrings descriptives
5. Testez les cas de succès ET les cas d'erreur
6. Vérifiez la couverture de code après avoir ajouté des tests
