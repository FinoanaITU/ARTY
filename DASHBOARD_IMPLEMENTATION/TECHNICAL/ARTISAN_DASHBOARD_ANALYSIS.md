# Analyse du Dashboard Artisan - État Actuel vs Attendu

## 📊 Résumé Exécutif

Le dashboard artisan (`/artisan-dashboard`) est **structuré côté Frontend** avec 6 onglets principaux. Cependant, **le Backend est largement non implémenté** - les endpoints sont des stubs vides.

### État de réadiness:
- ✅ Frontend: 85% implémenté (UI et logique de base)
- ❌ Backend: ~10% implémenté (modèles créés, services/endpoints manquants)
- 🟠 Interaction Front-Back: 0% (aucun appel API fonctionnel)

---

## 📱 Structure du Frontend

### Les 6 onglets du Dashboard Artisan

| Onglet | Composant | État | Dépendance Backend |
|--------|-----------|------|-------------------|
| **Vue d'ensemble** | Overview cards + mock data | ✅ Complet (UI) | ❌ API GET /artisans/{id}/stats |
| **Commandes** | ArtisanOrderManager | ✅ Complet (UI) | ❌ API GET /orders/?artisan_id=... |
| **Produits** | ArtisanProductManager | ✅ Complet (UI+CRUD) | ⚠️ Partiellement (GET fonctionne) |
| **Profil** | ArtisanProfileEditor | ✅ Complet (UI) | ❌ API PUT /users/me |
| **Ateliers** | ArtisanWorkshopManager | ✅ Complet (UI+CRUD) | ⚠️ Partiellement (GET fonctionne) |
| **Disponibilité** | ArtisanAvailabilityCalendar | ✅ Complet (UI) | ❌ API pour indisponibilités |

---

## 🔍 Analyse par Onglet

### 1️⃣ VUE D'ENSEMBLE (Overview)

**Ce que le Frontend affiche:**
```
- Carte Stats (ArtisanStats):
  * totalSales: 450,000 Ar (MOCK)
  * ordersThisMonth: 12 (MOCK)
  * rating: 4.8 (MOCK)
  * totalProducts: 24 (MOCK)

- Commandes récentes (2 cartes mock)
- Conseils du jour (hardcodés)
- Livraisons à effectuer (mock)
- Ateliers à venir (mock)
```

**Appels API attendus:**
```
GET /api/artisans/{artisan_id}/stats
Response {
  totalSales: number,
  ordersThisMonth: number,
  rating: number,
  totalProducts: number,
  totalWorkshops?: number,
  totalRevenue?: number
}

GET /api/orders/?artisan_id={id}&status=pending,ready_for_pickup
Response {
  items: [{
    id, order_number, customer_name, items[], total, date, status
  }],
  total, page, limit
}

GET /api/workshops/{workshop_id}
GET /api/workshops?artisan_id={id}
```

**État Backend:**
- ❌ Endpoint `/api/artisans/{id}/stats` → **N'existe pas**
- ❌ Service `artisan_stats_service.py` → **N'existe pas**
- ❌ Schéma Pydantic ArtisanStatsResponse → **Vide**
- ⚠️ Modèle `ArtisanStats` → Existe mais pas lié à User

**Tâches manquantes:**
1. Créer service `artisan_stats_service.py` avec logique de calcul
2. Implémenter endpoint `GET /api/artisans/{id}/stats`
3. Écrire schémas Pydantic pour la réponse
4. Créer migration Alembic si nécessaire pour mettre à jour `ArtisanStats`

---

### 2️⃣ COMMANDES (Orders Tab)

**Ce que le Frontend affiche:**
```
Deux sous-onglets:
- Commandes Produits (avec détails:  client, adresse, items, montant, statuts)
- Commandes Ateliers (réservations d'ateliers)

Mock data inclus (2 commandes d'exemple)
```

**Appels API attendus:**
```
GET /api/orders/?artisan_id={id}
GET /api/orders/{order_id}
GET /api/orders/{order_id}/items
PATCH /api/orders/{order_id}/status
```

**État Backend:**
- ❌ `orders.py` → Contient **uniquement des stubs**:
  ```python
  @router.get("/")
  async def get_orders():
      return {"message": "Get orders"}
  ```
- ❌ Service `order_service.py` → **N'existe pas**
- ❌ CRUD operations → **N'existe pas**
- ✅ Modèles créés: `Order`, `OrderItem`, `OrderStatusHistory`
- ❌ Schémas Pydantic → **Fichier vide**

**Tâches manquantes:**
1. Créer `app/services/order_service.py` avec:
   - Logique de création de commande (depuis le panier)
   - Logique de mise à jour de statut
   - Logique de récupération des commandes par artisan
   - Gestion des commissionnements artisan
2. Créer `app/crud/order.py` ou ajouter dans le service
3. Implémenter les endpoints:
   - `GET /api/orders/` (filtre par artisan_id, statut, etc.)
   - `GET /api/orders/{order_id}`
   - `PATCH /api/orders/{order_id}/status`
   - `GET /api/orders/{order_id}/items`
4. Créer schémas Pydantic complets dans `order.py`
5. Ajouter migrations Alembic si nécessaire

---

### 3️⃣ PRODUITS (Products Tab)

**Ce que le Frontend affiche:**
```
ArtisanProductManager component:
- Liste des produits de l'artisan
- Boutons CRUD (créer, éditer, supprimer)
- Filtres et recherche
```

**État Backend:**
- ✅ CRUD basique implémenté (products.py est bien développé)
- ✅ Upload photos fonctionne
- ✅ Schémas Pydantic complets
- ✅ Service `product_service.py` existe
- ✅ Endpoints pour créer/lister/modifier/supprimer

**Tâches restantes:**
1. Vérifier que le filtre `artisan_id` fonctionne dans `GET /api/products/`
2. Optionnel: ajouter endpoint `GET /api/artisans/{id}/products` (shortcut)

**État: QUASI COMPLET ✅**

---

### 4️⃣ PROFIL (Profile Tab)

**Ce que le Frontend affiche:**
```
ArtisanProfileEditor component:
- Édition informations de base (nom, email, bio, etc.)
- Upload/gestion photos de profil
- Spécialités et expérience (pour artisans)
- Adresse et coordonnées
```

**Appels API attendus:**
```
GET /api/users/me
PUT /api/users/me
PUT /api/artisans/me (artisan-specific fields)
```

**État Backend:**
- ❌ `users.py` → Stubs vides
- ❌ Service pour mise à jour profil → **N'existe pas**
- ✅ Schémas utilisateurs existent (user.py)
- ❌ Endpoint `PUT /api/users/me` → **N'existe pas**
- ✅ Endpoint `GET /api/users/me` → Existe dans `auth.py`

**Tâches manquantes:**
1. Implémenter `PUT /api/users/me` dans `users.py`
2. Implémenter `PUT /api/artisans/me` pour données artisan-spécifiques
3. Gestion upload photos de profil
4. Créer service pour la mise à jour de profil utilisateur

---

### 5️⃣ ATELIERS (Workshops Tab)

**Ce que le Frontend affiche:**
```
ArtisanWorkshopManager component:
- Liste des ateliers de l'artisan
- Créer nouvel atelier (WorkshopCreationForm)
- Éditer, voir, supprimer les ateliers
- États des ateliers (draft, published, archived)
```

**État Backend:**
- ✅ Endpoints CRUD quasi-complets (workshops.py est bien développé)
- ✅ Modèles WorkshopSession, WorkshopBooking, TimeSlots créés
- ✅ Schémas Pydantic complets
- ✅ Upload photos d'ateliers implémenté
- ⚠️ Endpoint `GET /workshops/{id}/time-slots` → Stub non implémenté

**Tâches restantes:**
1. Implémenter complètement `GET /workshops/{id}/time-slots`
2. Tester les endpoints d'édition et suppression
3. Vérifier les permissions (artisan ne voit que ses ateliers)

**État: BON ✅ (80% complet)**

---

### 6️⃣ DISPONIBILITÉ (Availability Tab)

**Ce que le Frontend affiche:**
```
ArtisanAvailabilityCalendar component:
- Calendrier pour marquer les périodes d'indisponibilité
- Raison (vacances, formation, etc.)
- Types: single day ou range
```

**Appels API attendus:**
```
GET /api/artisans/{id}/unavailability
POST /api/artisans/{id}/unavailability
DELETE /api/artisans/{id}/unavailability/{period_id}
```

**État Backend:**
- ❌ Endpoints → **N'existe pas**
- ⚠️ Modèle `ArtisanUnavailability` → Existe dans workshops.py
- ❌ Service → **N'existe pas**
- ❌ Schémas → **N'existe pas**

**Tâches manquantes:**
1. Créer endpoints pour gestion des indisponibilités
2. Créer service `unavailability_service.py`
3. Créer schémas Pydantic
4. Lier à la logique des disponibilités de workshop

---

## 🗂️ État des Fichiers Backend

### Services (Back/app/services/)
```
✅ auth.py              - Implémentée
✅ product_service.py   - Implémentée
✅ workshop_service.py  - Implémentée
✅ storage.py           - Implémentée (upload fichiers)
⚠️  payment.py           - Parce que (Stripe config existe pas service)
❌ order_service.py     - MANQUANT
❌ cart_service.py      - MANQUANT
❌ artisan_stats_service.py - MANQUANT
❌ user_service.py      - MANQUANT (pour profil)
❌ unavailability_service.py - MANQUANT
❌ review_service.py    - MANQUANT
❌ notification_service.py - MANQUANT (existe pas, juste un stub)
```

### Endpoints (Back/app/api/v1/endpoints/)
```
✅ auth.py              - Bien implémenté
✅ products.py          - Bien implémenté (CRUD)
✅ workshops.py         - Bien implémenté (CRUD + booking + sessions)
⚠️  categories.py         - Basique, juste des stubs
❌ orders.py            - STUBS VIDES (3 endpoints mock)
❌ carts.py             - STUBS VIDES (3 endpoints mock)
❌ users.py             - STUBS VIDES (4 endpoints mock)
❌ payments.py          - STUB VIDE (1 endpoint mock)
❌ reviews.py           - STUB VIDE (1 endpoint mock)
❌ admin.py             - STUB VIDE (1 endpoint mock)
❌ messages.py          - STUB VIDE
❌ notifications.py     - STUB VIDE
❌ analytics.py         - STUB VIDE
```

### Schémas Pydantic (Back/app/schemas/)
```
✅ user.py              - Bien structuré (UserOut, UserIn, etc.)
✅ product.py           - Bien structuré
✅ workshop.py          - Bien structuré
⚠️  payment.py           - Partiellement
❌ order.py             - FICHIER VIDE
❌ review.py            - FICHIER VIDE
❌ notification.py      - FICHIER VIDE
```

### Modèles Pydantic (Back/app/models/)
```
✅ user.py              - Complet
✅ product.py           - Complet
✅ workshop.py          - Complet
✅ order.py             - Complet (Order, OrderItem, OrderStatusHistory, Payment)
✅ analytics.py         - Complet (ArtisanStats, DailyStats, AnalyticsEvent)
✅ user_favorite.py     - Complet
✅ review.py            - Complet
✅ notification.py      - Complet
✅ cart.py              - Complet (Cart, CartItem)
✅ message.py           - Complet
✅ subscription.py      - Complet
```

---

## ✅ PRIORITÉS D'IMPLÉMENTATION POUR LE DASHBOARD ARTISAN

### 🔴 CRITIQUE (Bloquer le fonctionnement du dashboard)

1. **Statistiques Artisan** (Vue d'ensemble)
   - Créer: `order_service.py`, endpoint GET `/api/artisans/{id}/stats`
   - Temps estimé: **4 heures**
   - Dépend de: Orders (pour calculs)

2. **Gestion des Commandes** (Onglet Commandes)
   - Créer: `order_service.py`, `order.py` schemas, endpoints CRUD
   - Temps estimé: **16 heures**
   - Dépend de: Cart finalisé

3. **Mise à jour du Profil** (Onglet Profil)
   - Créer: Endpoints PUT `/users/me`, PUT `/artisans/me`
   - Temps estimé: **6 heures**
   - Dépend de: Rien (modèles existent)

---

### 🟠 HAUTE (Compléter les fonctionnalités core)

4. **Gestion du Panier** (Précondition pour les commandes)
   - Créer: `cart_service.py`, endpoints CRUD, logique de fusion
   - Temps estimé: **12 heures**
   - Dépend de: Rien (modèles existent)

5. **Indisponibilités** (Onglet Disponibilité)
   - Créer: Endpoints CRUD pour unavailability
   - Temps estimé: **6 heures**
   - Dépend de: Rien (modèle existe)

6. **Avis & Notations** (Améliorations)
   - Créer: `review_service.py`, endpoints CRUD
   - Temps estimé: **8 heures**
   - Dépend de: Orders (pour verified_purchase)

---

### 🟡 MOYEN (Optimisations)

7. **Paiements** (Intégration Stripe)
   - Créer: `stripe_service.py`, webhooks
   - Temps estimé: **10 heures**
   - Dépend de: Orders

8. **Notifications** (User feedback)
   - Créer: `notification_service.py`, endpoints
   - Temps estimé: **8 heures**
   - Dépend de: Orders

---

## 🎯 Ordre d'Implémentation Recommandé

```
SEMAINE 1:
┌─────────────────────────────────────┐
│ 1. Profil Artisan (6h)              │
│    → PUT /users/me                  │
│    → PUT /artisans/me               │
├─────────────────────────────────────┤
│ 2. Panier Backend (12h)             │
│    → GET/POST/DELETE cart items     │
│    → Calculs totaux                 │
└─────────────────────────────────────┘

SEMAINE 2:
┌─────────────────────────────────────┐
│ 3. Commandes Backend (16h)          │
│    → Créer commande depuis panier   │
│    → Liste commandes artisan        │
│    → Mise à jour statut             │
├─────────────────────────────────────┤
│ 4. Stats Artisan (4h)               │
│    → GET /artisans/{id}/stats       │
│    → Calculs: ventes, revenus, etc. │
└─────────────────────────────────────┘

SEMAINE 3:
┌─────────────────────────────────────┐
│ 5. Indisponibilités (6h)            │
│    → Endpoints CRUD unavailability  │
├─────────────────────────────────────┤
│ 6. Avis Backend (8h)                │
│    → Endpoints CRUD reviews         │
│    → Note moyenne automatique       │
└─────────────────────────────────────┘

BONUS (Si temps):
┌─────────────────────────────────────┐
│ 7. Paiements (10h)                  │
│ 8. Notifications (8h)               │
└─────────────────────────────────────┘
```

---

## 🛠️ Details Techniques par Implémentation

### 1. Statistiques Artisan

**Fichiers à créer:**
- `Back/app/services/artisan_stats_service.py`
- `Back/app/schemas/artisan_stats.py` (schemas)

**Logique:**
```python
def get_artisan_stats(artisan_id: UUID) -> ArtisanStatsResponse:
    # Requêtes à la base:
    - COUNT(orders) WHERE artisan_id in order_items
    - SUM(total_price) WHERE artisan_id in order_items
    - COUNT(DISTINCT products) WHERE artisan_id
    - AVG(review.rating) WHERE artisan_id
    - COUNT(workshops) WHERE artisan_id
    - COUNT(bookings) WHERE workshop.artisan_id
    
    return {
        totalSales: int,
        totalRevenue: Decimal,
        ordersThisMonth: int,
        rating: float,
        totalProducts: int,
        totalWorkshops: int,
        totalBookings: int
    }
```

**Endpoint:**
```python
@router.get("/artisans/{artisan_id}/stats", response_model=ArtisanStatsResponse)
async def get_artisan_stats(artisan_id: UUID, db: Session = Depends(get_db)):
    stats = await artisan_stats_service.get_stats(artisan_id, db)
    return stats
```

---

### 2. Commandes Complètes

**Fichiers à créer:**
- `Back/app/services/order_service.py`
- `Back/app/schemas/order.py`
- `Back/app/crud/order.py` (optionnel)
- Migration Alembic (si changements DB)

**Logique dans order_service.py:**
```python
async def create_order(
    user_id: UUID,
    cart_id: UUID,
    shipping_address: dict,
    billing_address: dict = None
) -> OrderOut:
    # 1. Récupérer le panier
    # 2. Valider stock pour chaque item
    # 3. Créer l'order avec order_number unique
    # 4. Créer les order_items
    #    - Calculer commission artisan
    #    - Créer snapshot produit
    # 5. Mettre à jour le stock
    # 6. Vider le panier
    # 7. Créer OrderStatusHistory (pending)
    return order

async def update_order_status(
    order_id: UUID,
    new_status: str,
    comment: str = None
) -> OrderOut:
    # Vérifier permissions (artisan ou admin)
    # Mettre à jour status
    # Créer OrderStatusHistory
    # Envoyer notification au client
    return order

async def get_artisan_orders(
    artisan_id: UUID,
    status: str = None,
    page: int = 1,
    limit: int = 20
) -> PaginatedResponse[OrderOut]:
    # Récupérer les commandes contenant au moins 1 item de cet artisan
```

**Endpoints:**
```python
@router.post("/", response_model=OrderOut, status_code=201)
async def create_order(order_in: OrderCreate, user = Depends(get_current_user)):
    ...

@router.get("/", response_model=PaginatedResponse[OrderOut])
async def get_orders(
    artisan_id: UUID = None,
    status: str = None,
    user = Depends(get_current_user)
):
    ...

@router.get("/{order_id}", response_model=OrderOut)
async def get_order(order_id: UUID, user = Depends(get_current_user)):
    ...

@router.patch("/{order_id}/status", response_model=OrderOut)
async def update_order_status(
    order_id: UUID,
    status_update: OrderStatusUpdate,
    user = Depends(get_current_user)
):
    ...

@router.get("/{order_id}/items", response_model=list[OrderItemOut])
async def get_order_items(order_id: UUID, user = Depends(get_current_user)):
    ...
```

---

### 3. Profil Utilisateur

**Fichiers à créer/modifier:**
- Ajouter dans `Back/app/schemas/user.py`: `UserUpdate`, `ArtisanUpdate`
- Créer `Back/app/services/user_service.py`

**Service:**
```python
async def update_user_profile(
    user_id: UUID,
    user_update: UserUpdate,
    db: Session
) -> UserOut:
    # Mettre à jour user
    # Valider email uniqueness si email changé
    # Upload photo si fourni
    return updated_user

async def update_artisan_profile(
    artisan_id: UUID,
    artisan_update: ArtisanUpdate,
    db: Session
) -> UserOut:
    # Mettre à jour champs artisan-spécifiques
    # specialty, description, experience, location, etc.
    return updated_artisan
```

**Endpoints:**
```python
@router.put("/me", response_model=UserOut)
async def update_current_user(
    user_update: UserUpdate,
    current_user = Depends(get_current_user)
):
    ...

@router.put("/me/artisan", response_model=UserOut)
async def update_artisan_profile(
    artisan_update: ArtisanUpdate,
    current_user = Depends(get_current_user)
):
    # Vérifier que c'est un artisan
    ...
```

---

### 4. Panier

**Fichiers à créer:**
- `Back/app/services/cart_service.py`
- `Back/app/schemas/cart.py`

**Service:**
```python
async def get_or_create_cart(user_id: UUID, db: Session) -> CartOut:
    # Récupérer ou créer panier utilisateur

async def add_item_to_cart(
    user_id: UUID,
    product_id: UUID,
    quantity: int,
    customization_notes: str = None
) -> CartOut:
    # Ajouter item au panier
    # Calculer unit_price selon user type
    # Mettre à jour total

async def remove_item_from_cart(
    user_id: UUID,
    item_id: UUID
) -> CartOut:
    # Supprimer l'item
    # Recalculer total

async def update_cart_item(
    user_id: UUID,
    item_id: UUID,
    quantity: int
) -> CartOut:
    # Mettre à jour quantité
    # Valider stock

async def clear_cart(user_id: UUID) -> None:
    # Vider le panier
```

**Endpoints:**
```python
@router.get("/me", response_model=CartOut)
async def get_current_cart(current_user = Depends(get_current_user)):
    ...

@router.post("/items", response_model=CartOut, status_code=201)
async def add_to_cart(
    item: CartItemCreate,
    current_user = Depends(get_current_user)
):
    ...

@router.patch("/items/{item_id}", response_model=CartOut)
async def update_cart_item(
    item_id: UUID,
    update: CartItemUpdate,
    current_user = Depends(get_current_user)
):
    ...

@router.delete("/items/{item_id}", response_model=CartOut)
async def remove_from_cart(
    item_id: UUID,
    current_user = Depends(get_current_user)
):
    ...
```

---

## 📝 Checklist d'Implémentation

### Pour chaque User Story:
- [ ] Créer la/les branche(s) Git
- [ ] Créer les modèles SQLAlchemy (si nouveaux)
- [ ] Créer la migration Alembic (`alembic revision --autogenerate`)
- [ ] Créer/remplir les schemas Pydantic
- [ ] Implémenter le service
- [ ] Implémenter les endpoints API
- [ ] Écrire tests unitaires et d'intégration
- [ ] Tester manuellement sur localhost:8000
- [ ] Mettre à jour la documentation API
- [ ] Code review + approbation
- [ ] Merge dans develop/main
- [ ] Tester l'intégration Frontend

---

## 💡 Notes Importantes

1. **Dépendances critiques**: Les commandes dépendent d'un panier fonctionnel. Faire le panier en premier.

2. **Permissions**: Toujours vérifier les rôles (BUYER, ARTISAN, ADMIN) sur chaque endpoint.

3. **Migrations Alembic**: À chaque modification de schéma, créer une migration. Ils deviendront vite complexes - préparer l'équipe à ça.

4. **Tests**: Le répertoire `Back/tests/` existe déjà. Suivre le pattern des tests existants.

5. **SQLite vs PostgreSQL**: L'équipe développe avec SQLite pour tests, PostgreSQL en prod. Le code existant a souvent des chemins différents - attention à la compatibilité.

---

## 📊 Estimation Totale

```
Profil Artisan:           6 heures  ⏱️
Panier:                  12 heures  ⏱️
Commandes:               16 heures  ⏱️⏱️
Stats Artisan:            4 heures
Indisponibilités:         6 heures
Avis:                      8 heures
Paiements:               10 heures  ⏱️
Notifications:            8 heures
─────────────────────────────────
TOTAL:                   70 heures ≈ 2 sprints (2.5 semaines)
                         ~2-3 développeurs working in parallel
```

