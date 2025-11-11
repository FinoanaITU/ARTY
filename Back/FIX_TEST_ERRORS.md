# Corrections des erreurs de tests

## Résumé des corrections

### 1. Erreur ARRAY/JSON pour SQLite
**Problème** : `Error binding parameter 3: type 'list' is not supported`
- SQLite ne supporte pas les types ARRAY de PostgreSQL
- Les listes (languages, other_skills, offerings) doivent être converties en JSON

**Solution** :
- Ajout d'une méthode `_is_sqlite()` dans `AuthService` pour détecter SQLite
- Modification de `create_artisan()` pour utiliser SQL brut avec JSON sérialisé pour SQLite
- Les listes sont converties en JSON avec `json.dumps()` avant insertion

### 2. Tests de tokens
**Problème** : Les tests comparaient directement les tokens JWT, qui sont différents à chaque génération
- Les tokens contiennent des timestamps, donc ils sont toujours différents

**Solution** :
- Modification des tests pour vérifier que les tokens existent, sont non vides, et sont différents
- Ne plus comparer les valeurs exactes des tokens

### 3. Validation du mot de passe vide
**Problème** : Le test attendait 422 mais recevait 401
- Le schéma `LoginIn` n'avait pas de validation pour le mot de passe vide

**Solution** :
- Ajout de `min_length=1` au champ `password` dans `LoginIn`
- Le test attend maintenant 422 (validation error) au lieu de 401

### 4. Fixture created_artisan
**Problème** : La fixture utilisait SQLAlchemy ORM qui ne fonctionnait pas avec SQLite pour les types ARRAY

**Solution** :
- Modification de la fixture pour utiliser SQL brut avec JSON sérialisé
- Les listes sont converties en JSON avant insertion

## Fichiers modifiés

1. **`Back/app/services/auth.py`** :
   - Ajout de `_is_sqlite()` pour détecter SQLite
   - Modification de `create_artisan()` pour gérer SQLite avec SQL brut
   - Conversion des listes en JSON pour SQLite

2. **`Back/app/schemas/user.py`** :
   - Ajout de `min_length=1` au champ `password` dans `LoginIn`

3. **`Back/tests/conftest.py`** :
   - Modification de `created_artisan` pour utiliser SQL brut avec JSON

4. **`Back/tests/test_auth.py`** :
   - Correction des tests de tokens pour ne pas comparer les valeurs exactes

5. **`Back/tests/test_auth_api.py`** :
   - Correction des tests de tokens
   - Correction du test de mot de passe vide pour attendre 422

6. **`Back/tests/test_auth_service.py`** :
   - Correction des tests de tokens

## Résultat attendu

Après ces corrections, les tests devraient passer :
- ✅ Pas d'erreur ARRAY/JSON
- ✅ Tests de tokens fonctionnent correctement
- ✅ Validation du mot de passe vide retourne 422
- ✅ Inscription d'artisan fonctionne avec SQLite

## Notes importantes

- Les corrections pour SQLite n'affectent pas PostgreSQL en production
- La détection SQLite est automatique et transparente
- Les listes sont automatiquement converties en JSON pour SQLite
- En production (PostgreSQL), les types ARRAY sont utilisés normalement

