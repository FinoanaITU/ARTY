# Analyse des écarts entre Frontend et Backend - Plateforme Artizaho

**Date d'analyse:** 8 février 2026  
**Analyste:** Senior Developer & QA Tester

## Table des matières
1. [Fonctionnalités critiques manquantes (Priorité 1)](#priorité-1---critique)
2. [Fonctionnalités importantes manquantes (Priorité 2)](#priorité-2---importante)
3. [Fonctionnalités secondaires manquantes (Priorité 3)](#priorité-3---secondaire)
4. [Résumé des endpoints disponibles](#résumé-des-endpoints-backend-disponibles)
5. [Recommandations](#recommandations)

---

## PRIORITÉ 1 - CRITIQUE
**Ces fonctionnalités doivent être implémentées en priorité pour que l'application soit fonctionnelle**

### 1.1 Système d'abonnements aux ateliers ⚠️ TOTALEMENT MANQUANT
**Statut:** Entièrement mocké dans le Frontend, AUCUN endpoint backend

**Frontend:**
- Contexte complet: `/Front/src/contexts/SubscriptionContext.tsx`
- Composant de gestion: `/Front/src/components/SubscriptionManager.tsx`
- Formulaire d'inscription: `/Front/src/components/SubscriptionRegistrationForm.tsx`
- 3 plans définis: Explorateur (3 crédits), Apprenti (4 crédits), Créateur (6 crédits)

**Backend manquant:**
- ❌ Aucun endpoint `/api/v1/subscriptions`
- ❌ Aucun modèle de données pour les abonnements
- ❌ Aucun système de gestion des crédits
- ❌ Aucun système de renouvellement automatique

**Impact:** Les utilisateurs ne peuvent pas:
- Souscrire à un abonnement
- Utiliser des crédits pour réserver des ateliers
- Voir leur historique d'abonnements

**Données mockées:**
```typescript
// Plans d'abonnement actuellement en dur
const subscriptionPlans = [
  { id: 'explorateur', credits: 3, price: 75000, duration: '1 mois' },
  { id: 'apprenti', credits: 4, price: 120000, duration: '2 mois' },
  { id: 'createur', credits: 6, price: 180000, duration: '3 mois' }
];
```

---

### 1.2 Système de paiements et tracking ⚠️ TOTALEMENT MANQUANT
**Statut:** Entièrement mocké dans le Frontend, AUCUN endpoint backend

**Frontend:**
- Composant: `/Front/src/components/PaymentTracker.tsx`
- Fonctionnalités UI:
  - Suivi des paiements partiels
  - Distinction artisan Artizaho vs Uber
  - Historique des paiements
  - Méthodes: cash, mobile money, bank transfer

**Backend manquant:**
- ❌ Aucun endpoint `/api/v1/payments/*` (sauf placeholder vide)
- ❌ Aucune gestion des paiements partiels
- ❌ Aucune intégration avec MVola, Orange Money, etc.
- ❌ Aucun système de tracking des paiements artisan

**Impact:** 
- Impossible de gérer les paiements réels
- Pas de suivi des commissions Artizaho
- Pas de paiements aux artisans
- Système de cash flow non fonctionnel

---

### 1.3 Système de validation/approbation des contenus ⚠️ PARTIELLEMENT MANQUANT
**Statut:** UI complète, logique backend partielle

**Frontend:**
- Composant: `/Front/src/components/ValidationManager.tsx`
- Fonctionnalités:
  - Validation produits
  - Validation ateliers
  - Validation profils artisans
  - Système de notes admin

**Backend:**
- ✅ Produits: statut draft/pending/approved/rejected existe
- ✅ Ateliers: statut draft/published/archived existe
- ⚠️ Profils artisans: manque workflow d'approbation
- ❌ Manque endpoint dédié pour lister tous les contenus en attente
- ❌ Manque système de notifications aux artisans

**Endpoints manquants:**
- `GET /api/v1/admin/pending-validations` (liste tous les contenus à valider)
- `POST /api/v1/admin/validate-profile/{artisan_id}` (approuver/rejeter profil)
- `GET /api/v1/admin/validation-stats` (statistiques de validation)

---

### 1.4 Système de messages/chat ⚠️ TOTALEMENT MANQUANT
**Statut:** Endpoint vide dans le Backend

**Frontend:**
- Fonctionnalité non encore implémentée dans l'UI

**Backend:**
- ⚠️ Endpoint placeholder: `/Back/app/api/v1/endpoints/messages.py` (vide)
- ❌ Aucun modèle de données
- ❌ Aucune logique de messaging
- ❌ Pas de WebSocket pour messages en temps réel

**Besoin:**
- Messagerie acheteur ↔ artisan
- Notifications de nouveaux messages
- Historique des conversations

---

## PRIORITÉ 2 - IMPORTANTE
**Ces fonctionnalités améliorent significativement l'expérience utilisateur**

### 2.1 Système de recommandations ⚠️ TOTALEMENT MOCKÉ
**Statut:** Données statiques dans le Frontend

**Frontend:**
- Hook: `/Front/src/hooks/useRecommendations.ts`
- Composants:
  - `/Front/src/components/ProductRecommendations.tsx`
  - `/Front/src/components/WorkshopRecommendations.tsx`
  - `/Front/src/components/SimilarProducts.tsx`

**Backend:**
- ✅ Endpoint existe: `GET /api/v1/products/{product_id}/similar`
- ❌ Pas d'endpoint pour recommandations personnalisées basées sur l'historique
- ❌ Pas de recommandations d'ateliers
- ❌ Pas d'algorithme de recommandation ML

**Données mockées:**
```typescript
// Produits et ateliers recommandés sont en dur dans le code
const mockRecommendations = [
  { id: 3, name: 'Lamba Mena traditionnel', relevanceScore: 0.8 },
  { id: 4, name: 'Châle en soie sauvage', relevanceScore: 0.7 }
];
```

**Endpoints manquants:**
- `GET /api/v1/users/me/recommended-products` (basé sur historique)
- `GET /api/v1/users/me/recommended-workshops` (basé sur intérêts)
- `GET /api/v1/workshops/{workshop_id}/similar`

---

### 2.2 Variations de prix et codes promo ⚠️ PARTIELLEMENT MOCKÉ
**Statut:** Logique frontend uniquement

**Frontend:**
- Hook: `/Front/src/hooks/usePriceVariations.ts`
- Composants:
  - `/Front/src/components/PriceVariationSelector.tsx`
  - `/Front/src/components/PaymentPlanSelector.tsx`

**Types de clients définis:**
- Tourist: 0% discount
- Local: 15% discount
- Business: 20% discount
- Tour operator: 25% discount
- Travel agency: 30% discount

**Codes promo mockés:**
```typescript
const availablePromoCodes = [
  { code: 'LOCAL15', type: 'percentage', value: 15 },
  { code: 'BUSINESS20', type: 'percentage', value: 20 },
  { code: 'WELCOME5000', type: 'fixed', value: 5000 }
];
```

**Backend manquant:**
- ❌ Aucune gestion des codes promo
- ❌ Pas de variations de prix par type de client
- ❌ Pas de système de réductions personnalisées
- ⚠️ Cart a un endpoint `/api/v1/carts/coupon` mais implémentation inconnue

**Endpoints manquants:**
- `POST /api/v1/promo-codes/validate` (vérifier un code promo)
- `GET /api/v1/promo-codes/active` (codes promo actifs)
- `POST /api/v1/admin/promo-codes` (créer code promo)

---

### 2.3 Système de devis personnalisés ⚠️ TOTALEMENT MANQUANT
**Statut:** UI complète, zéro backend

**Frontend:**
- Composant: `/Front/src/components/QuoteRequestManager.tsx`
- Formulaire: `/Front/src/components/QuoteRequestForm.tsx`
- Fonctionnalités:
  - Demande de devis pour ateliers personnalisés
  - Workflow: pending → quoted → approved/rejected → completed
  - Notes admin
  - Prix final manuel

**Backend manquant:**
- ❌ Aucun endpoint `/api/v1/quotes/*`
- ❌ Aucun modèle de données pour les devis
- ❌ Pas de notifications aux artisans
- ❌ Pas de système de conversion devis → commande

**Impact:** 
- Impossible de gérer les demandes d'ateliers personnalisés
- Pas de suivi client pour les demandes spéciales
- Perte de business potentiel

---

### 2.4 Statistiques Admin et Analytics ⚠️ PARTIELLEMENT IMPLÉMENTÉ
**Statut:** Endpoints backend existent mais données mockées en frontend

**Frontend:**
- Page: `/Front/src/pages/AdminPanel.tsx`
- Données mockées:
  ```typescript
  const adminStats = {
    totalProductSales: 2450000,
    totalWorkshopSales: 890000,
    totalArtisans: 23,
    totalOrders: 89,
    pendingQuotes: 7,
    activeSubscriptions: 45
  };
  ```

**Backend:**
- ✅ Endpoint existe: `GET /api/v1/analytics/artisan/stats`
- ✅ Endpoint existe: `GET /api/v1/analytics/artisan/dashboard`
- ❌ Manque stats globales admin:
  - Total ventes plateforme
  - Nombre total artisans actifs/pending
  - Revenue par catégorie
  - Taux de conversion

**Endpoints manquants:**
- `GET /api/v1/admin/analytics/overview` (vue d'ensemble plateforme)
- `GET /api/v1/admin/analytics/revenue` (revenus détaillés)
- `GET /api/v1/admin/analytics/artisans` (stats artisans)
- `GET /api/v1/admin/analytics/conversion` (taux de conversion)

---

### 2.5 Système de notifications ⚠️ TOTALEMENT MANQUANT
**Statut:** Endpoint vide

**Frontend:**
- Pas encore implémenté dans l'UI

**Backend:**
- ⚠️ Endpoint placeholder: `/Back/app/api/v1/endpoints/notifications.py` (vide)
- ❌ Aucun système de notifications
- ❌ Pas de notifications email
- ❌ Pas de notifications push
- ❌ Pas de notifications in-app

**Besoin:**
- Notif nouvelle commande (artisan)
- Notif changement statut commande (acheteur)
- Notif atelier réservé/annulé
- Notif nouveau message
- Notif approbation/rejet contenu

---

## PRIORITÉ 3 - SECONDAIRE
**Fonctionnalités qui améliorent l'expérience mais non critiques**

### 3.1 Système de crédits utilisateur
**Statut:** UI complète, backend absent

**Frontend:**
- Composant: `/Front/src/components/CreditTracker.tsx`
- Data dans Dashboard: historique des transactions de crédits
- Types: earned (bonus, avis) / spent (achats, ateliers)

**Backend manquant:**
- ❌ Aucun système de points/crédits
- ❌ Pas de gamification
- ❌ Pas de rewards pour actions utilisateur

---

### 3.2 Gestion avancée des commandes
**Statut:** Backend existe, frontend partiellement mocké

**Frontend:**
- Composant: `/Front/src/components/DetailedOrderManager.tsx`
- Composant: `/Front/src/components/ArtisanOrderManager.tsx`
- Dashboard avec données mockées

**Backend:**
- ✅ CRUD commandes existe: `/api/v1/orders/*`
- ✅ Mise à jour statut existe
- ⚠️ Manque détails de livraison
- ⚠️ Manque système de tracking

**Amélioration possible:**
- Ajouter tracking livraison
- Notifications automatiques changement statut
- Estimation dates de livraison

---

### 3.3 Avis et évaluations
**Statut:** Backend complet, frontend à vérifier

**Frontend:**
- Composant: `/Front/src/components/ProductReviews.tsx`
- Appels API dans service: `getProductReviews`, `createReview`, `voteReviewHelpful`

**Backend:**
- ✅ Endpoints complets: `/Back/app/api/v1/endpoints/reviews.py`
- ✅ CRUD reviews produits
- ✅ Vote helpful/not helpful
- ✅ Stats reviews

**Statut:** ✅ **FONCTIONNEL** (à tester)

---

### 3.4 Ateliers événementiels
**Statut:** UI existe, backend à améliorer

**Frontend:**
- Composant: `/Front/src/components/EventWorkshopsComponent.tsx`
- Type d'ateliers: inscription vs uber

**Backend:**
- ✅ Workshops avec types
- ⚠️ Manque gestion spécifique événements
- ⚠️ Manque workflow inscription événement

**Amélioration:**
- Liste d'attente
- Événements récurrents
- Gestion invitations

---

### 3.5 Formulaires de réservation personnalisés
**Statut:** UI complète, backend à adapter

**Frontend:**
- `/Front/src/components/CustomBookingRequest.tsx`
- `/Front/src/components/AvailabilityAwareBooking.tsx`

**Backend:**
- ✅ Booking workshops existe
- ⚠️ Manque champs personnalisés dans booking
- ⚠️ Pas de formulaires dynamiques

---

## Résumé des endpoints Backend disponibles

### ✅ Endpoints fonctionnels
```
Auth:
POST /api/v1/auth/register/buyer
POST /api/v1/auth/register/artisan
POST /api/v1/auth/login
GET  /api/v1/auth/me
POST /api/v1/auth/refresh
POST /api/v1/auth/logout

Products:
GET    /api/v1/products/
GET    /api/v1/products/{product_id}
POST   /api/v1/products/
PATCH  /api/v1/products/{product_id}
DELETE /api/v1/products/{product_id}
GET    /api/v1/products/categories
GET    /api/v1/products/{product_id}/similar
POST   /api/v1/products/{product_id}/bulk-order-request

Workshops:
GET    /api/v1/workshops
GET    /api/v1/workshops/{workshop_id}
POST   /api/v1/workshops
PATCH  /api/v1/workshops/{workshop_id}
DELETE /api/v1/workshops/{workshop_id}
POST   /api/v1/workshops/{workshop_id}/publish
POST   /api/v1/workshops/{workshop_id}/unpublish
GET    /api/v1/workshops/{workshop_id}/availability
GET    /api/v1/workshops/{workshop_id}/sessions
POST   /api/v1/workshops/{workshop_id}/sessions
POST   /api/v1/workshops/{workshop_id}/book
GET    /api/v1/workshops/bookings/user

Orders:
POST   /api/v1/orders/
GET    /api/v1/orders/
GET    /api/v1/orders/{order_id}
PATCH  /api/v1/orders/{order_id}/status

Carts:
GET    /api/v1/carts/
POST   /api/v1/carts/items
PUT    /api/v1/carts/items/{item_id}
DELETE /api/v1/carts/items/{item_id}
DELETE /api/v1/carts/
POST   /api/v1/carts/coupon

Unavailabilities:
POST   /api/v1/unavailabilities
GET    /api/v1/unavailabilities
DELETE /api/v1/unavailabilities/{id}

Analytics:
GET    /api/v1/analytics/artisan/dashboard
GET    /api/v1/analytics/artisan/stats

Reviews:
POST   /api/v1/products/{product_id}/reviews
GET    /api/v1/products/{product_id}/reviews
POST   /api/v1/reviews/{review_id}/vote

Users:
GET    /api/v1/users/me
PUT    /api/v1/users/me
PUT    /api/v1/users/me/artisan
```

### ⚠️ Endpoints placeholders (vides ou incomplets)
```
GET /api/v1/admin/         (vide)
GET /api/v1/messages/      (vide)
GET /api/v1/notifications/ (vide)
GET /api/v1/payments/      (vide)
GET /api/v1/categories/    (vide)
```

### ❌ Endpoints complètement manquants
```
Subscriptions:
GET    /api/v1/subscriptions/plans
POST   /api/v1/subscriptions/
GET    /api/v1/subscriptions/me
POST   /api/v1/subscriptions/{id}/cancel
GET    /api/v1/subscriptions/credits/history

Quotes:
POST   /api/v1/quotes/request
GET    /api/v1/quotes/
PATCH  /api/v1/quotes/{id}
POST   /api/v1/quotes/{id}/approve

Recommendations:
GET    /api/v1/users/me/recommended-products
GET    /api/v1/users/me/recommended-workshops

Promo Codes:
POST   /api/v1/promo-codes/validate
GET    /api/v1/promo-codes/active
POST   /api/v1/admin/promo-codes

Admin Analytics:
GET    /api/v1/admin/analytics/overview
GET    /api/v1/admin/analytics/revenue
GET    /api/v1/admin/analytics/artisans

Validation:
GET    /api/v1/admin/pending-validations
POST   /api/v1/admin/validate-profile/{artisan_id}

Credits:
GET    /api/v1/users/me/credits
POST   /api/v1/users/me/credits/use
GET    /api/v1/users/me/credits/history

Payments (real):
POST   /api/v1/payments/initiate
POST   /api/v1/payments/confirm
GET    /api/v1/payments/status/{id}
POST   /api/v1/payments/mvola/callback
POST   /api/v1/payments/orange/callback
```

---

## Recommandations

### Phase 1 - Fonctionnalités critiques (2-3 semaines)
1. **Implémentation Backend Abonnements** (Priorité #1)
   - Créer modèles: Subscription, SubscriptionPlan, CreditUsage
   - Endpoints CRUD abonnements
   - Logique de gestion des crédits
   - Tests unitaires et intégration

2. **Système Paiements de base** (Priorité #1)
   - Modèle Payment, PaymentHistory
   - Intégration MVola (commencer par un)
   - Tracking paiements artisans
   - Webhooks paiements

3. **Workflow Validation Admin** (Priorité #1)
   - Endpoint approbation profils artisans
   - Endpoint liste contenus en attente
   - Système de notifications basique

### Phase 2 - Amélioration expérience (2 semaines)
1. **Système Devis**
   - Modèle Quote, QuoteRequest
   - Endpoints gestion devis
   - Conversion devis vers commande

2. **Recommandations basiques**
   - Algorithme simple basé sur catégorie
   - Historique utilisateur
   - Produits/ateliers similaires

3. **Codes Promo**
   - Modèle PromoCode
   - Validation et application
   - Interface admin création codes

### Phase 3 - Features avancées (1-2 semaines)
1. **Analytics Admin complet**
   - Dashboard plateforme
   - KPIs business
   - Exports données

2. **Système Notifications**
   - Notifications email
   - Notifications in-app
   - Templates personnalisables

3. **Messagerie**
   - Chat simple
   - Historique conversations
   - Notifications nouveaux messages

### Tests à effectuer immédiatement
- ✅ Vérifier fonctionnement Reviews (backend complet)
- ✅ Tester workflow complet Workshop booking
- ✅ Tester paiement via cart/coupon existant
- ⚠️ Identifier bugs dans orders management
- ⚠️ Tester analytics artisan stats

---

## Statistiques finales

**Fonctionnalités Frontend totales analysées:** ~45  
**Fonctionnalités entièrement mockées:** ~12 (27%)  
**Fonctionnalités partiellement implémentées:** ~8 (18%)  
**Fonctionnalités fonctionnelles:** ~25 (55%)

**Endpoints Backend manquants critiques:** ~18  
**Endpoints Backend placeholders vides:** 5  
**Endpoints Backend fonctionnels:** ~40

**Effort estimé pour combler les gaps:**
- Priorité 1: 120-160 heures (3-4 semaines)
- Priorité 2: 80-100 heures (2 semaines)
- Priorité 3: 40-60 heures (1 semaine)
**Total:** ~240-320 heures (6-8 semaines développement)

---

**Document généré le:** 8 février 2026  
**Dernière mise à jour:** 8 février 2026  
**Version:** 1.0
