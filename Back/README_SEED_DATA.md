# Données Initiales (Seed Data)

Ce document décrit le système de données initiales pour l'application Artizaho.

## 📋 Données créées

### 1. Catégories de produits

Le script crée **12 catégories principales** avec leurs sous-catégories :

1. **Sculpture et Bois**
   - Masques traditionnels
   - Figurines
   - Objets décoratifs
   - Sculptures animalières
   - Statuettes religieuses

2. **Textile et Tissage**
   - Lambas
   - Nappes et sets de table
   - Coussins
   - Sacs et paniers en tissu
   - Tapis et tapisseries

3. **Poterie et Céramique**
   - Vases et pots
   - Assiettes et bols
   - Objets décoratifs
   - Jardinage
   - Cuisine traditionnelle

4. **Bijouterie artisanale**
   - Colliers
   - Bracelets
   - Boucles d'oreilles
   - Bagues
   - Accessoires de cheveux

5. **Vannerie**
   - Paniers
   - Sacs
   - Objets de décoration
   - Mobilier
   - Accessoires

6. **Maroquinerie**
   - Sacs à main
   - Portefeuilles
   - Ceintures
   - Chaussures
   - Accessoires

7. **Broderie et Couture**
   - Nappes brodées
   - Coussins
   - Vêtements traditionnels
   - Accessoires
   - Décoration murale

8. **Instruments de musique**
   - Valiha
   - Kabosy
   - Jejy voatavo
   - Tambours
   - Accessoires

9. **Peinture et Art**
   - Peintures sur toile
   - Peintures sur bois
   - Aquarelles
   - Croquis
   - Art contemporain

10. **Cuisine et Gastronomie**
    - Épices
    - Miels
    - Fruits secs
    - Conserves
    - Boissons

11. **Décoration intérieure**
    - Luminaires
    - Miroirs
    - Cadres
    - Vases
    - Objets décoratifs

12. **Autres**
    - (Pas de sous-catégories)

### 2. Utilisateur Admin

Un utilisateur administrateur par défaut est créé :
- **Email**: `admin@artizaho.com`
- **Mot de passe**: `admin123`
- **Rôle**: `admin`
- **Statut**: Actif, email vérifié

⚠️ **IMPORTANT**: Changez le mot de passe en production !

## 🚀 Exécution

### Automatique (recommandé)

Les données sont créées automatiquement :

1. **Lors des migrations Alembic** : La migration `005_seed_initial_data.py` exécute le script de seed
2. **Au démarrage de l'application** : Le script est appelé dans le `lifespan` de FastAPI (avec gestion d'erreur)
3. **Dans Docker** : Le script est exécuté après les migrations dans `docker-entrypoint.sh`

### Manuelle

Pour exécuter le script manuellement :

```bash
# Depuis le répertoire Back
python scripts/seed_initial_data.py
```

Ou depuis Docker :

```bash
docker-compose exec backend python scripts/seed_initial_data.py
```

## 🔧 Configuration

### Script de seed

Le script principal est dans `Back/scripts/seed_initial_data.py`.

### Migration Alembic

La migration `005_seed_initial_data.py` appelle le script de seed après création des tables.

### Docker Entrypoint

Le script `docker-entrypoint.sh` exécute le seed après les migrations Alembic.

## 📝 Comportement

### Idempotence

Le script est **idempotent** : il peut être exécuté plusieurs fois sans créer de doublons.
- Les catégories existantes sont détectées et ignorées
- L'utilisateur admin existant est détecté et ignoré

### Gestion d'erreurs

- Si les tables n'existent pas encore, le script affiche un avertissement et se termine sans erreur
- Si une catégorie ou l'admin existe déjà, elle est ignorée (pas d'erreur)
- Les erreurs sont loggées mais n'empêchent pas le démarrage de l'application

## 🧪 Tests

Pour tester le seed data :

```bash
# Exécuter les tests
pytest Back/tests/test_products.py -v

# Vérifier que les catégories sont créées
curl http://localhost:8000/api/v1/products/categories
```

## 📦 Déploiement

### Développement local

1. Créer les tables : `alembic upgrade head`
2. Le seed s'exécute automatiquement via la migration ou au démarrage

### Production

1. Les migrations Alembic créent les tables
2. La migration 005 exécute le seed
3. Les données sont présentes après le déploiement

### Docker

1. `docker-compose up` crée les conteneurs
2. Les migrations s'exécutent automatiquement
3. Le seed s'exécute après les migrations
4. Les données sont disponibles immédiatement

## 🔍 Vérification

Pour vérifier que les données sont créées :

```bash
# Vérifier les catégories
curl http://localhost:8000/api/v1/products/categories

# Vérifier l'admin (nécessite une connexion à la base de données)
docker-compose exec backend python -c "from app.core.database import SessionLocal; from app.models.user import User; db = SessionLocal(); admin = db.query(User).filter(User.email == 'admin@artizaho.com').first(); print('Admin exists:', admin is not None); db.close()"
```

## 🛠️ Modification

Pour modifier les données initiales :

1. Modifier `Back/scripts/seed_initial_data.py`
2. La fonction `create_categories()` contient les catégories
3. La fonction `create_admin_user()` contient les informations de l'admin
4. Les modifications seront appliquées lors de la prochaine exécution du script

## ⚠️ Notes importantes

1. **Mot de passe admin** : Changez le mot de passe par défaut en production
2. **Catégories** : Les catégories sont nécessaires pour créer des produits
3. **Idempotence** : Le script peut être exécuté plusieurs fois sans problème
4. **Migration** : La migration 005 doit être exécutée après que les tables categories et users existent

