# 🔗 Documentation d'Intégration Frontend-Backend

**Date:** 7 février 2026  
**Status:** ✅ Intégration complétée  
**Version:** 1.0

---

## 📋 Résumé Exécutif

L'intégration du dashboard artisan frontend (React/TypeScript) avec le backend (FastAPI) a été **complétée avec succès**. Toutes les fonctionnalités utilisent maintenant les vraies API au lieu des mock data.

### Modifications Apportées

| Fichier Modifié | Lignes Ajoutées | Description |
|-----------------|-----------------|-------------|
| `Front/src/services/api.ts` | ~150 | Ajout de toutes les méthodes API manquantes |
| `Front/src/pages/ArtisanDashboard.tsx` | ~120 | Remplacement mock data par appels API réels |

---

## 🎯 Fonctionnalités Intégrées

### ✅ 1. Statistiques Artisan
**Endpoint:** `GET /api/v1/artisans/{id}/stats`

**Méthode API:**
```typescript
await apiService.getArtisanStats(user.id)
```

**Données retournées:**
- `totalSales`: Chiffre d'affaires total (MGA)
- `ordersThisMonth`: Nombre de commandes ce mois-ci
- `rating`: Note moyenne (0-5)
- `totalProducts`: Nombre de produits actifs

**État de chargement:** `statsLoading`

---

### ✅ 2. Gestion des Commandes
**Endpoints:**
- `GET /api/v1/orders/` - Liste des commandes
- `GET /api/v1/orders/{id}` - Détails d'une commande
- `POST /api/v1/orders/` - Créer une commande
- `PATCH /api/v1/orders/{id}/status` - Mettre à jour le statut

**Méthodes API:**
```typescript
// Récupérer les commandes
await apiService.getOrders({ limit: 10 })

// Mettre à jour le statut
await apiService.updateOrderStatus(orderId, 'shipped', 'Commande expédiée')
```

**État de chargement:** `ordersLoading`

---

### ✅ 3. Indisponibilités
**Endpoints:**
- `GET /api/v1/artisans/{id}/unavailabilities` - Liste des indisponibilités
- `POST /api/v1/artisans/{id}/unavailabilities` - Créer une indisponibilité
- `DELETE /api/v1/artisans/{id}/unavailabilities/{unavailability_id}` - Supprimer

**Méthodes API:**
```typescript
// Récupérer les indisponibilités
const response = await apiService.getUnavailabilities(user.id)

// Créer une nouvelle période
await apiService.createUnavailability(user.id, {
  start_date: '2026-06-20',
  end_date: '2026-06-25',
  reason: 'Vacances familiales',
  type: 'range'
})

// Supprimer
await apiService.deleteUnavailability(user.id, unavailabilityId)
```

**Transformation des données:**
Les dates sont converties de ISO string (backend) → Date objects (frontend)

**État de chargement:** `unavailabilitiesLoading`

---

### ✅ 4. Profil Artisan
**Endpoint:** `PUT /api/v1/users/me/artisan`

**Méthode API:**
```typescript
await apiService.updateArtisanProfile({
  first_name: 'Hery',
  last_name: 'Rakoto',
  bio: 'Artisan passionné...',
  specialty: 'Vannerie',
  location: 'Antananarivo, Analamanga',
  description: 'Description professionnelle...'
})
```

**Champs modifiables:**
- Nom et prénom
- Bio/À propos
- Spécialité principale
- Localisation
- Description professionnelle
- Expérience (années)
- Documents (NIF, STAT)

---

### ✅ 5. Panier (Cart)
**Endpoints:**
- `GET /api/v1/carts/me` - Récupérer le panier
- `POST /api/v1/carts/items` - Ajouter un item
- `PATCH /api/v1/carts/items/{id}` - Mettre à jour la quantité
- `DELETE /api/v1/carts/items/{id}` - Supprimer un item
- `DELETE /api/v1/carts/` - Vider le panier

**Méthodes API:**
```typescript
// Récupérer le panier
const cart = await apiService.getCart()

// Ajouter un produit
await apiService.addToCart({
  product_id: '123e4567-e89b-12d3-a456-426614174000',
  quantity: 2,
  customization_notes: 'Gravure personnalisée'
})

// Mettre à jour la quantité
await apiService.updateCartItem(itemId, 5)

// Supprimer un item
await apiService.removeFromCart(itemId)

// Vider le panier
await apiService.clearCart()
```

---

### ✅ 6. Avis (Reviews)
**Endpoints:**
- `GET /api/v1/products/{id}/reviews` - Liste des avis
- `POST /api/v1/products/{id}/reviews` - Créer un avis
- `POST /api/v1/reviews/{id}/vote` - Voter utile/pas utile

**Méthodes API:**
```typescript
// Récupérer les avis d'un produit
const reviews = await apiService.getProductReviews(productId, { page: 1, limit: 10 })

// Créer un avis
await apiService.createReview({
  product_id: productId,
  order_item_id: orderItemId,
  rating: 5,
  title: 'Excellent produit !',
  comment: 'Très satisfait de la qualité...',
  images: []
})

// Voter un avis comme utile
await apiService.voteReviewHelpful(reviewId, true)
```

---

## 🏗️ Architecture de l'Intégration

### Flux de Données

```
┌─────────────────┐         ┌──────────────┐         ┌─────────────┐
│  React          │ ──────> │  API Service │ ──────> │  FastAPI    │
│  Components     │ <────── │  (axios)     │ <────── │  Backend    │
└─────────────────┘         └──────────────┘         └─────────────┘
        ↓                           ↓                        ↓
    useState()              JWT Token Auth            PostgreSQL
    useEffect()            Refresh on 401              SQLAlchemy
```

### Gestion de l'Authentification

1. **Login:**
   - User entre email/password
   - `apiService.login(email, password)` → Backend
   - Backend retourne `{ access_token, refresh_token, user }`
   - Tokens sauvegardés dans localStorage
   - User sauvegardé dans Context + localStorage

2. **Requêtes Authentifiées:**
   - Axios interceptor ajoute automatiquement `Authorization: Bearer {token}`
   - Sur erreur 401 → tentative de refresh automatique
   - Si refresh échoue → redirect vers `/login`

3. **Logout:**
   - `apiService.logout()` → Backend
   - Nettoyage localStorage
   - Reset UserContext

---

## 🧪 Tests d'Intégration

### Prérequis

1. **Backend démarré:**
   ```bash
   cd Back
   uvicorn app.main:app --reload
   ```
   Vérifier: http://localhost:8000/docs

2. **Base de données migrée:**
   ```bash
   cd Back
   alembic upgrade head
   ```

3. **Frontend démarré:**
   ```bash
   cd Front
   npm run dev
   # ou
   bun dev
   ```
   Vérifier: http://localhost:5173

### Scénarios de Test

#### Test 1: Login & Stats
1. Aller sur http://localhost:5173/login
2. Se connecter avec un compte artisan
3. Vérifier redirection vers `/artisan-dashboard`
4. Voir les stats réelles charger (spinner → données)

**Vérifications:**
- ✓ Stats affichent des données réelles (pas 450,000 Ar mock)
- ✓ Nombre de commandes correspond à la DB
- ✓ Note moyenne calculée correctement
- ✓ Nombre de produits actifs exact

#### Test 2: Indisponibilités
1. Aller sur l'onglet "Disponibilité"
2. Ajouter une période d'indisponibilité
3. Sauvegarder
4. Recharger la page

**Vérifications:**
- ✓ Période sauvegardée en base (vérifier DB ou API)
- ✓ Réapparaît après rechargement
- ✓ Peut être supprimée

#### Test 3: Profil Artisan
1. Onglet "Profil"
2. Modifier nom, bio, spécialité
3. Sauvegarder
4. Recharger la page

**Vérifications:**
- ✓ Modifications sauvegardées
- ✓ Réapparaissent après rechargement
- ✓ UserContext mis à jour

#### Test 4: Commandes
1. Onglet "Commandes"
2. Voir liste des commandes réelles
3. (Si applicable) Changer statut d'une commande

**Vérifications:**
- ✓ Commandes réelles affichées (pas mock Marie L.)
- ✓ Statuts corrects
- ✓ Totaux calculés

---

## 🔧 Configuration

### Variables d'Environnement Frontend

Créer `/Front/.env`:
```bash
VITE_API_URL=http://localhost:8000/api/v1
```

### CORS Backend

Le backend doit autoriser le frontend (déjà configuré dans `Back/app/core/config.py`):
```python
CORS_ORIGINS = [
    "http://localhost:5173",  # Vite dev server
    "http://localhost:3000",  # Alternative
]
```

---

## ⚠️ Points d'Attention

### 1. Gestion des Erreurs

Tous les appels API sont wrappés dans try/catch avec toast notifications:
```typescript
try {
  const stats = await apiService.getArtisanStats(user.id);
  setArtisanStats(stats);
} catch (error) {
  toast({
    title: "Erreur",
    description: "Impossible de charger les statistiques",
    variant: "destructive"
  });
}
```

### 2. États de Chargement

Chaque donnée a un état `loading` associé:
- `statsLoading`
- `ordersLoading`
- `unavailabilitiesLoading`
- `productsLoading`
- `workshopsLoading`

Affiche un spinner pendant le chargement.

### 3. Transformation des Données

Certaines données nécessitent une transformation backend → frontend:

**Dates:**
```typescript
// Backend: "2024-06-20" (ISO string)
// Frontend: new Date("2024-06-20") (Date object)

const formattedData = response.map((item: any) => ({
  startDate: new Date(item.start_date),
  endDate: item.end_date ? new Date(item.end_date) : undefined
}))
```

**Montants:**
```typescript
// Backend: 45000 (numeric)
// Frontend: "45,000 Ar" (formatted string)
{stats.totalSales.toLocaleString()} Ar
```

---

## 📊 Statut des Endpoints

| Endpoint | Méthode | Frontend Connecté | Backend Testé |
|----------|---------|-------------------|---------------|
| `/auth/login` | POST | ✅ | ✅ |
| `/auth/me` | GET | ✅ | ✅ |
| `/artisans/{id}/stats` | GET | ✅ | ✅ |
| `/orders/` | GET | ✅ | ✅ |
| `/orders/{id}/status` | PATCH | ✅ | ✅ |
| `/artisans/{id}/unavailabilities` | GET | ✅ | ✅ |
| `/artisans/{id}/unavailabilities` | POST | ✅ | ✅ |
| `/artisans/{id}/unavailabilities/{id}` | DELETE | ✅ | ✅ |
| `/users/me/artisan` | PUT | ✅ | ✅ |
| `/products/{id}/reviews` | GET | ✅ | ⚠️ Non testé |
| `/products/{id}/reviews` | POST | ✅ | ⚠️ Non testé |
| `/carts/me` | GET | ✅ | ⚠️ Non testé |
| `/carts/items` | POST | ✅ | ⚠️ Non testé |

**Légende:**
- ✅ Fonctionnel et testé
- ⚠️ Codé mais non testé manuellement
- ❌ Non implémenté

---

## 🚀 Prochaines Étapes

### Tests Recommandés

1. **Tests E2E avec Playwright/Cypress:**
   - Scénario complet: Login → Dashboard → Modifier profil → Logout
   - Vérifier que les données persistent après rechargement

2. **Tests de couverture backend:**
   - Augmenter de 62% → 70%+
   - Ajouter tests pour services Sprint 1-3

3. **Tests d'intégration continue:**
   - GitHub Actions pour runner tests frontend + backend
   - Vérifier que frontend compile sans erreurs TypeScript

### Améliorations Possibles

1. **Optimisations:**
   - React Query pour cache et refetch automatique
   - Skeleton loaders au lieu de spinners
   - Pagination des commandes/produits

2. **UX:**
   - Confirmation avant suppression d'indisponibilité
   - Validation formulaire profil plus stricte
   - Preview image upload avant sauvegarde

3. **Performance:**
   - Lazy loading des onglets dashboard
   - Debounce sur recherche produits
   - Virtual scrolling pour grandes listes

---

## 📝 Checklist de Déploiement

Avant déploiement en staging/production:

- [ ] Vérifier que `VITE_API_URL` pointe vers le bon backend
- [ ] Configurer CORS backend pour le domaine frontend
- [ ] Tester tous les flows critiques (login, stats, commandes)
- [ ] Vérifier que les tokens expirent et se refreshent correctement
- [ ] Tester sur mobile (responsive)
- [ ] Vérifier que les images s'affichent correctement
- [ ] Tester avec des données réelles (pas de test data)
- [ ] Configurer monitoring (Sentry pour erreurs frontend)
- [ ] Configurer analytics (Google Analytics, Plausible)
- [ ] Documentation API à jour (Swagger)

---

## 🎓 Ressources

### Documentation Backend
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc
- Workshop API Reference: `WORKSHOP_API_REFERENCE.md`

### Code Source
- Frontend Service API: `Front/src/services/api.ts`
- Dashboard Page: `Front/src/pages/ArtisanDashboard.tsx`
- User Context: `Front/src/contexts/UserContext.tsx`
- Backend Services: `Back/app/services/`

---

## 👥 Contacts

**Backend Lead:** developer1@artizaho.mg  
**Frontend Lead:** frontend@artizaho.mg  
**Scrum Master:** scrum@artizaho.mg

---

**Version:** 1.0  
**Dernière mise à jour:** 7 février 2026, 21:00 GMT+3
