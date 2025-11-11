# Étape 4 : Produits Artisanaux

## 📋 Vue d'ensemble

Cette étape implémente la gestion complète des produits artisanaux avec catalogue, filtres, CRUD pour les artisans, et gestion des images.

## 🎯 Fonctionnalités implémentées

### 1. Catalogue produits
- ✅ Liste paginée avec filtres multiples
- ✅ Filtres par catégorie/sous-catégorie
- ✅ Recherche textuelle
- ✅ Filtres par prix (min/max)
- ✅ Filtres par disponibilité (stock)
- ✅ Filtres par artisan
- ✅ Pagination (page, limit)

### 2. Détail produit
- ✅ Informations complètes du produit
- ✅ Galerie d'images (plusieurs photos)
- ✅ Informations artisan
- ✅ Matériaux et couleurs disponibles
- ✅ Dimensions et poids
- ✅ Note moyenne et nombre d'avis

### 3. Gestion produits (Artisan)
- ✅ Création de produit avec upload d'images (max 10)
- ✅ Mise à jour de produit
- ✅ Suppression de produit
- ✅ Vérification de propriété (artisan ne peut modifier que ses produits)
- ✅ Statuts: draft, pending_approval, published, rejected

### 4. Catégories
- ✅ Liste des catégories avec sous-catégories
- ✅ Création automatique des catégories si elles n'existent pas

## 🔧 Implémentation

### Endpoints REST

#### GET `/api/v1/products`
Liste des produits avec filtres et pagination

**Query params**:
- `category`: string (optionnel) - Filtrer par catégorie
- `subcategory`: string (optionnel) - Filtrer par sous-catégorie
- `search`: string (optionnel) - Recherche textuelle
- `artisan_id`: UUID (optionnel) - Filtrer par artisan
- `min_price`: float (optionnel) - Prix minimum
- `max_price`: float (optionnel) - Prix maximum
- `in_stock`: boolean (optionnel) - Filtrer par disponibilité
- `page`: int = 1 - Numéro de page
- `limit`: int = 20 - Nombre d'éléments par page (max 100)

**Réponse**: `200 OK`
```json
{
  "items": [
    {
      "id": "uuid",
      "name": "Masque traditionnel",
      "price": 45000,
      "images": ["url1"],
      "artisan": {
        "id": "uuid",
        "name": "Jean Artisan"
      },
      "stock": 3,
      "status": "published",
      "rating": 4.8,
      "review_count": 24,
      "created_at": "2024-01-15T10:30:00"
    }
  ],
  "total": 100,
  "page": 1,
  "pages": 5,
  "limit": 20
}
```

#### GET `/api/v1/products/{product_id}`
Détails complets d'un produit

**Réponse**: `200 OK`
```json
{
  "id": "uuid",
  "name": "Masque traditionnel",
  "description": "Masque en bois sculpté...",
  "category": "Sculpture et Bois",
  "subcategory": "Masques traditionnels",
  "price": 45000,
  "images": ["url1", "url2"],
  "artisan": {
    "id": "uuid",
    "name": "Jean Artisan"
  },
  "materials": ["Bois", "Peinture naturelle"],
  "available_colors": ["Rouge", "Bleu"],
  "dimensions": {
    "length": 25,
    "width": 18,
    "height": 8,
    "weight": 0.6
  },
  "stock": 3,
  "customizable": true,
  "production_time_days": 15,
  "bulk_order_enabled": true,
  "min_bulk_quantity": 5,
  "status": "published",
  "rating": 4.8,
  "review_count": 24,
  "created_at": "2024-01-15T10:30:00",
  "updated_at": "2024-01-15T10:30:00"
}
```

#### POST `/api/v1/products` (Artisan seulement)
Création d'un nouveau produit

**Headers**: `Authorization: Bearer <token>`

**Type**: `multipart/form-data`

**Champs**:
- `name`: string (obligatoire)
- `description`: string (obligatoire, min 10 caractères)
- `category`: string (obligatoire)
- `subcategory`: string (optionnel)
- `price`: Decimal (obligatoire, > 0)
- `materials`: string (JSON array ou liste séparée par virgules)
- `available_colors`: string (JSON array ou liste séparée par virgules)
- `stock`: int (défaut: 0)
- `customizable`: boolean (défaut: false)
- `production_time_days`: int (obligatoire, >= 1)
- `bulk_order_enabled`: boolean (défaut: false)
- `min_bulk_quantity`: int (optionnel)
- `dimensions_length`: float (optionnel)
- `dimensions_width`: float (optionnel)
- `dimensions_height`: float (optionnel)
- `dimensions_weight`: float (optionnel)
- `photos`: File[] (optionnel, max 10 fichiers)

**Réponse**: `201 Created` (même structure que GET /products/{id})

#### PATCH `/api/v1/products/{product_id}` (Artisan seulement)
Mise à jour d'un produit

**Headers**: `Authorization: Bearer <token>`

**Type**: `multipart/form-data`

**Champs**: Tous optionnels (seuls les champs fournis seront mis à jour)

**Réponse**: `200 OK` (même structure que GET /products/{id})

#### DELETE `/api/v1/products/{product_id}` (Artisan seulement)
Suppression d'un produit

**Headers**: `Authorization: Bearer <token>`

**Réponse**: `204 No Content`

#### GET `/api/v1/products/categories/list`
Liste des catégories avec sous-catégories

**Réponse**: `200 OK`
```json
{
  "categories": [
    {
      "name": "Sculpture et Bois",
      "subcategories": ["Masques traditionnels", "Figurines", "Objets décoratifs"]
    }
  ]
}
```

## 📊 Modèles de données

### Table `products`
- `id`: UUID
- `title`: String (nom du produit)
- `slug`: String (unique, généré automatiquement)
- `description`: Text
- `price`: Numeric(10, 2)
- `category_id`: UUID (FK vers categories)
- `artisan_id`: UUID (FK vers users)
- `stock_quantity`: Integer
- `materials`: ARRAY(Text)
- `colors`: ARRAY(Text)
- `dimensions`: JSON
- `customizable`: Boolean
- `production_time_days`: Integer
- `status`: String (draft, pending_approval, published, rejected)
- `rating_average`: Numeric(3, 2)
- `rating_count`: Integer

### Table `product_images`
- `id`: UUID
- `product_id`: UUID (FK vers products)
- `image_url`: String
- `sort_order`: Integer
- `is_primary`: Boolean

### Table `categories`
- `id`: UUID
- `name`: String
- `slug`: String (unique)
- `parent_id`: UUID (FK vers categories, pour sous-catégories)
- `is_active`: Boolean

## ✅ Validation et sécurité

1. **Permissions** :
   - GET endpoints : Public (sauf produits non publiés)
   - POST/PATCH/DELETE : Artisan seulement
   - Vérification de propriété pour PATCH/DELETE

2. **Validation** :
   - Nom : 1-200 caractères
   - Description : minimum 10 caractères
   - Prix : > 0
   - Stock : >= 0
   - Production time : >= 1 jour
   - Images : max 10 fichiers, formats JPG/PNG/WEBP

3. **Statuts produits** :
   - `draft` : Brouillon (non visible publiquement)
   - `pending_approval` : En attente de validation admin
   - `published` : Publié (visible publiquement)
   - `rejected` : Rejeté par l'admin

## 🚀 Utilisation

### Exemple : Créer un produit

```python
import requests

# Authentification
login_response = requests.post(
    "http://localhost:8000/api/v1/auth/login",
    json={"email": "artisan@example.com", "password": "password"}
)
token = login_response.json()["access_token"]

# Créer un produit
form_data = {
    "name": "Masque traditionnel",
    "description": "Masque en bois sculpté à la main",
    "category": "Sculpture et Bois",
    "subcategory": "Masques traditionnels",
    "price": "45000",
    "materials": "Bois,Peinture naturelle",
    "available_colors": "Rouge,Bleu",
    "stock": "3",
    "customizable": "true",
    "production_time_days": "15",
    "bulk_order_enabled": "true",
    "min_bulk_quantity": "5"
}

files = [
    ("photos", ("photo1.jpg", open("photo1.jpg", "rb"), "image/jpeg")),
    ("photos", ("photo2.jpg", open("photo2.jpg", "rb"), "image/jpeg"))
]

response = requests.post(
    "http://localhost:8000/api/v1/products",
    headers={"Authorization": f"Bearer {token}"},
    data=form_data,
    files=files
)

print(response.json())
```

### Exemple : Lister les produits avec filtres

```python
import requests

response = requests.get(
    "http://localhost:8000/api/v1/products",
    params={
        "category": "Sculpture et Bois",
        "min_price": 30000,
        "max_price": 50000,
        "in_stock": True,
        "page": 1,
        "limit": 20
    }
)

data = response.json()
print(f"Total: {data['total']} produits")
for product in data['items']:
    print(f"- {product['name']}: {product['price']} Ar")
```

## 📝 Notes importantes

1. **Catégories** : Les catégories sont créées automatiquement si elles n'existent pas lors de la création d'un produit.

2. **Slug** : Généré automatiquement à partir du nom du produit. Si le slug existe déjà, un suffixe unique est ajouté.

3. **Images** : Maximum 10 images par produit. La première image est marquée comme `is_primary`.

4. **Statut par défaut** : Les nouveaux produits sont créés avec le statut `draft`. L'artisan doit les soumettre pour validation (`pending_approval`).

5. **Filtres** : Par défaut, seuls les produits avec le statut `published` sont retournés dans les listes publiques.

## ✅ Checklist de validation

- [x] Schemas Pydantic créés
- [x] CRUD operations implémentées
- [x] GET /products avec filtres et pagination
- [x] GET /products/{id} pour détails
- [x] POST /products (création avec upload images)
- [x] PATCH /products/{id} (mise à jour)
- [x] DELETE /products/{id} (suppression)
- [x] GET /products/categories/list
- [x] Vérification de propriété pour artisans
- [x] Gestion des catégories automatique
- [ ] Tests unitaires (à créer)
- [x] Documentation API (Swagger)

---

**Date de création** : 2024-01-15  
**Dernière mise à jour** : 2024-01-15  
**Statut** : ✅ Implémenté (tests à créer)

