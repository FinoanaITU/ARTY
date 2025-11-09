# Correction de la colonne "order" → "position"

## Problème

La colonne `order` dans la table `artisan_photos` causait une erreur SQL car `ORDER` est un mot-clé réservé en SQL (utilisé dans `ORDER BY`).

## Solution

La colonne a été renommée en `position` dans le modèle `ArtisanPhoto` pour éviter ce conflit.

## Fichiers modifiés

1. **`Back/app/models/user.py`** : Le modèle `ArtisanPhoto` utilise maintenant `position` au lieu de `order`
2. **`Back/app/services/auth.py`** : Correction de `order=index` → `position=index`
3. **`Back/tests/conftest.py`** : La création manuelle de table utilise `position` au lieu de `order`
4. **`Back/alembic/versions/001_add_user_auth_tables.py`** : La migration utilise `position` au lieu de `order`

## Migration de base de données

Si vous avez déjà une base de données avec la colonne `order`, vous devez créer une migration pour la renommer :

```sql
ALTER TABLE artisan_photos RENAME COLUMN "order" TO position;
```

Ou créer une nouvelle migration Alembic :

```python
def upgrade():
    op.alter_column('artisan_photos', 'order', new_column_name='position')

def downgrade():
    op.alter_column('artisan_photos', 'position', new_column_name='order')
```

## Tests

Les tests devraient maintenant fonctionner sans l'erreur `near "order": syntax error`.

