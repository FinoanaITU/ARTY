# Correction de l'erreur SQL "near 'order': syntax error"

## Problème

Tous les tests échouaient avec l'erreur :
```
sqlalchemy.exc.OperationalError: (sqlite3.OperationalError) near "order": syntax error
```

## Cause

Le mot `order` est un mot-clé réservé en SQL (utilisé dans `ORDER BY`). Quand SQLite essaie de créer la table `artisan_photos` avec une colonne nommée `order`, cela cause une erreur de syntaxe.

## Solution appliquée

### 1. Modèle ArtisanPhoto
Le modèle `ArtisanPhoto` dans `Back/app/models/user.py` utilise déjà `position` au lieu de `order` :
```python
position = Column(Integer, default=0, nullable=False)
```

### 2. Service d'authentification
Corrigé dans `Back/app/services/auth.py` :
- Avant : `order=index`
- Après : `position=index`

### 3. Migration Alembic
La migration `001_add_user_auth_tables.py` utilise déjà `position` :
```python
sa.Column('position', sa.Integer(), nullable=False, server_default='0'),
```

### 4. Tests (conftest.py)
Corrigé dans `Back/tests/conftest.py` pour la création manuelle de table :
- Avant : `order INTEGER NOT NULL DEFAULT 0`
- Après : `position INTEGER NOT NULL DEFAULT 0`

## Vérification

Tous les fichiers ont été vérifiés pour s'assurer qu'ils utilisent `position` au lieu de `order` :
- ✅ `Back/app/models/user.py` - Utilise `position`
- ✅ `Back/app/services/auth.py` - Utilise `position=index`
- ✅ `Back/alembic/versions/001_add_user_auth_tables.py` - Utilise `position`
- ✅ `Back/tests/conftest.py` - Utilise `position`

## Résultat attendu

Les tests devraient maintenant fonctionner sans l'erreur `near "order": syntax error`.

Pour tester :
```bash
cd Back
python3 -m pytest tests/test_auth*.py -v
```

