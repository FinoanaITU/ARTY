# Intégration Frontend-Backend

## Vue d'ensemble

Ce document décrit l'intégration entre le frontend (React/TypeScript) et le backend (FastAPI/Python) pour le projet ARTY.

## Endpoints intégrés

### 1. Authentification (`/api/v1/auth`)

#### ✅ Endpoints connectés

- **POST `/auth/register/buyer`** - Inscription acheteur
  - Frontend: `apiService.registerBuyer()`
  - Utilisé dans: `Signup.tsx`
  - Status: ✅ Fonctionnel

- **POST `/auth/register/artisan`** - Inscription artisan
  - Frontend: `apiService.registerArtisan()`
  - Utilisé dans: `Signup.tsx`
  - Status: ✅ Fonctionnel
  - Supporte l'upload de photos (multipart/form-data)

- **POST `/auth/login`** - Connexion
  - Frontend: `apiService.login()`
  - Utilisé dans: `Login.tsx`, `UserContext.tsx`
  - Status: ✅ Fonctionnel

- **GET `/auth/me`** - Informations utilisateur actuel
  - Frontend: `apiService.getCurrentUser()`
  - Utilisé dans: `UserContext.tsx`
  - Status: ✅ Fonctionnel

- **POST `/auth/refresh`** - Rafraîchissement du token
  - Frontend: `apiService.refreshToken()`
  - Utilisé dans: Intercepteur axios (auto-refresh)
  - Status: ✅ Fonctionnel

- **POST `/auth/logout`** - Déconnexion
  - Frontend: `apiService.logout()`
  - Utilisé dans: `UserContext.tsx`
  - Status: ✅ Fonctionnel

### 2. Produits (`/api/v1/products`)

#### ✅ Endpoints connectés

- **GET `/products/`** - Liste des produits
  - Frontend: `apiService.getProducts()`
  - Utilisé dans: `Products.tsx`
  - Status: ✅ Fonctionnel
  - Paramètres supportés:
    - `category`: Filtrer par catégorie
    - `subcategory`: Filtrer par sous-catégorie
    - `search`: Recherche textuelle
    - `artisan_id`: Filtrer par artisan
    - `min_price` / `max_price`: Filtrer par prix
    - `in_stock`: Filtrer par disponibilité
    - `page`: Numéro de page
    - `limit`: Nombre d'éléments par page

- **GET `/products/{product_id}`** - Détails d'un produit
  - Frontend: `apiService.getProduct()`
  - Utilisé dans: `ProductDetail.tsx`
  - Status: ✅ Fonctionnel

- **GET `/products/categories/list`** - Liste des catégories
  - Frontend: `apiService.getCategories()`
  - Utilisé dans: `Products.tsx`
  - Status: ✅ Fonctionnel

- **POST `/products/`** - Créer un produit (Artisan seulement)
  - Frontend: `apiService.createProduct()`
  - Status: ✅ Méthode API créée (à utiliser dans les dashboards artisan)

- **PATCH `/products/{product_id}`** - Mettre à jour un produit (Artisan seulement)
  - Frontend: `apiService.updateProduct()`
  - Status: ✅ Méthode API créée (à utiliser dans les dashboards artisan)

- **DELETE `/products/{product_id}`** - Supprimer un produit (Artisan seulement)
  - Frontend: `apiService.deleteProduct()`
  - Status: ✅ Méthode API créée (à utiliser dans les dashboards artisan)

## Fichiers modifiés

### Frontend

1. **`Front/src/services/api.ts`**
   - ✅ Ajout des méthodes pour les produits
   - ✅ Gestion des tokens JWT
   - ✅ Intercepteur pour refresh token automatique
   - ✅ Support multipart/form-data pour les uploads

2. **`Front/src/pages/Products.tsx`**
   - ✅ Remplacement des données statiques par des appels API
   - ✅ Gestion du chargement et des erreurs
   - ✅ Pagination
   - ✅ Filtres par catégorie et sous-catégorie
   - ✅ Recherche textuelle

3. **`Front/src/pages/ProductDetail.tsx`**
   - ✅ Remplacement des données statiques par des appels API
   - ✅ Gestion du chargement et des erreurs
   - ✅ Affichage dynamique des données produit
   - ✅ Gestion du stock et de la disponibilité

4. **`Front/src/pages/Login.tsx`**
   - ✅ Utilise `apiService.login()`
   - ✅ Redirection selon le rôle utilisateur

5. **`Front/src/pages/Signup.tsx`**
   - ✅ Utilise `apiService.registerBuyer()` et `apiService.registerArtisan()`
   - ✅ Support upload de photos pour artisans

6. **`Front/src/contexts/UserContext.tsx`**
   - ✅ Utilise `apiService.getCurrentUser()` et `apiService.login()`
   - ✅ Gestion de l'état utilisateur

## Configuration

### Variables d'environnement

Le frontend utilise la variable d'environnement `VITE_API_URL` pour définir l'URL du backend :

```env
VITE_API_URL=http://localhost:8000/api/v1
```

Par défaut, si non définie, utilise `http://localhost:8000/api/v1`.

### Gestion des tokens

- Les tokens JWT sont stockés dans `localStorage`
- `access_token`: Token d'accès (court terme)
- `refresh_token`: Token de rafraîchissement (long terme)
- Auto-refresh: Si une requête retourne 401, le système tente automatiquement de rafraîchir le token

## Endpoints non encore intégrés

### Endpoints backend disponibles mais non connectés

1. **Workshops** (`/api/v1/workshops`)
   - Endpoints disponibles dans le backend
   - À connecter: `Workshops.tsx`, `WorkshopDetail.tsx`

2. **Orders** (`/api/v1/orders`)
   - Endpoints disponibles dans le backend
   - À connecter: Dashboard utilisateur, gestion des commandes

3. **Carts** (`/api/v1/carts`)
   - Endpoints disponibles dans le backend
   - À connecter: `CartContext.tsx`

4. **Reviews** (`/api/v1/reviews`)
   - Endpoints disponibles dans le backend
   - À connecter: `ProductReviews.tsx`

5. **Users** (`/api/v1/users`)
   - Endpoints disponibles dans le backend
   - À connecter: Profil utilisateur, édition de profil

6. **Categories** (`/api/v1/categories`)
   - Endpoints disponibles dans le backend
   - Déjà partiellement utilisé via `/products/categories/list`

## Prochaines étapes

1. ✅ Intégrer les endpoints produits (fait)
2. ⏳ Intégrer les endpoints workshops
3. ⏳ Intégrer les endpoints orders
4. ⏳ Intégrer les endpoints carts
5. ⏳ Intégrer les endpoints reviews
6. ⏳ Intégrer les endpoints users
7. ⏳ Intégrer les endpoints payments
8. ⏳ Intégrer les endpoints notifications

## Tests

Pour tester l'intégration :

1. Démarrer le backend :
```bash
cd Back
source env/bin/activate
uvicorn app.main:app --reload
```

2. Démarrer le frontend :
```bash
cd Front
npm run dev
```

3. Tester les fonctionnalités :
   - Inscription acheteur/artisan
   - Connexion
   - Liste des produits
   - Détails d'un produit
   - Filtres et recherche

## Notes techniques

### Gestion des erreurs

- Les erreurs API sont gérées via `toast.error()` pour l'utilisateur
- Les erreurs sont loggées dans la console pour le développement
- Gestion automatique des erreurs 401 (refresh token)

### Format des données

- Les données sont formatées automatiquement par le backend
- Le frontend utilise les types TypeScript pour la validation
- Les images sont gérées via des URLs (stockage à configurer)

### Performance

- Pagination implémentée pour les listes
- Chargement lazy des données
- Cache des tokens dans localStorage
- Intercepteurs axios pour optimiser les requêtes

## Problèmes connus

1. **Images produits** : Les URLs d'images doivent être configurées dans le backend (service de stockage)
2. **CORS** : Assurez-vous que CORS est configuré correctement dans le backend pour accepter les requêtes du frontend
3. **Variables d'environnement** : Vérifier que `VITE_API_URL` est définie correctement

## Support

Pour toute question ou problème, référez-vous à :
- Documentation backend : `Back/README.md`
- Documentation frontend : `Front/README.md`
- Tests backend : `Back/tests/`
- Tests frontend : À créer

