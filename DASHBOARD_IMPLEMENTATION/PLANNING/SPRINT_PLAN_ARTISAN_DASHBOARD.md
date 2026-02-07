# 🎯 Plan d'Action - Dashboard Artisan - Sprint Préparatoire

**Date de création:** 7 février 2026
**Scrum Master:** Claude Copilot
**Objectif:** Rendre fonctionnel le `/artisan-dashboard` complet

---

## 📋 Vue d'Ensemble - Prochaines 3 Semaines

| Semaine | Focus | Résultat |
|---------|-------|----------|
| **Semaine 1** | Fondations (Profil + Panier) | ✅ Profil éditable, panier persistant |
| **Semaine 2** | Transactions (Commandes + Stats) | ✅ Commandes créables, stats visibles |
| **Semaine 3** | Compléments (Indisponibilités + Avis) | ✅ Dashboard complètement fonctionnel |

---

## 🔧 SEMAINE 1: Fondations

### Objectif
Permettre aux artisans d'éditer leur profil et de gérer un panier persistant complètement opérationnel.

### User Stories à Développer

---

#### US #1.1: Édition du Profil Artisan

**Acceptance Criteria:**
- [ ] Un artisan peut modifier son email, téléphone, nom, bio
- [ ] Un artisan peut modifier ses spécialités, expérience, location
- [ ] Un artisan peut uploader/changer sa photo de profil
- [ ] Validation des données côté backend
- [ ] Confirmation lors de sauvegarde

**Tâches Techniques:**

1. **Créer schémas Pydantic** (`Back/app/schemas/user.py`)
   ```python
   class UserUpdate(BaseModel):
       email: Optional[str]
       phone: Optional[str]
       first_name: Optional[str]
       last_name: Optional[str]
       bio: Optional[str]
       profile_image: Optional[str]  # UUID or None
   
   class ArtisanUpdate(UserUpdate):
       specialty: Optional[str]
       experience_years: Optional[int]
       location: Optional[str]
       description: Optional[str]
       documents: Optional[dict]  # NIF, STAT files
   ```
   **Assigné à:** Developer 1
   **Durée:** 1h
   **Deadline:** Lundi

2. **Créer service utilisateur** (`Back/app/services/user_service.py`)
   ```python
   class UserService:
       async def update_profile(user_id: UUID, update: UserUpdate) -> UserOut:
           # Validate email uniqueness
           # Upload photo si fourni
           # Update user record
       
       async def update_artisan_profile(artisan_id: UUID, update: ArtisanUpdate) -> UserOut:
           # Verify user is artisan
           # Update artisan fields
           # Save documents si fourni
   ```
   **Assigné à:** Developer 1
   **Durée:** 2h
   **Deadline:** Lundi

3. **Implémenter endpoints PUT** (`Back/app/api/v1/endpoints/users.py`)
   ```python
   @router.put("/me", response_model=UserOut)
   async def update_current_user(
       user_update: UserUpdate,
       current_user = Depends(get_current_user),
       db: Session = Depends(get_db)
   ):
       service = UserService()
       return await service.update_profile(current_user.id, user_update, db)
   
   @router.put("/me/artisan", response_model=UserOut)
   async def update_artisan_profile(
       artisan_update: ArtisanUpdate,
       current_user = Depends(get_current_user),
       db: Session = Depends(get_db)
   ):
       # Vérifier que c'est un artisan
       service = UserService()
       return await service.update_artisan_profile(current_user.id, artisan_update, db)
   ```
   **Assigné à:** Developer 1
   **Durée:** 1.5h
   **Deadline:** Mardi

4. **Tester les endpoints**
   ```bash
   pytest Back/tests/test_users.py -v
   # Tester manuellement sur Swagger
   ```
   **Assigné à:** Developer 1
   **Durée:** 1h
   **Deadline:** Mardi

5. **Frontend: tester avec la vraie API**
   - Remplacer les mock data
   - Tester les appels API réels
   **Assigné à:** Frontend Dev
   **Durée:** 1h
   **Deadline:** Mardi soir

**Dépendances:** Aucune
**Blockers connus:** Aucun
**Risk:** Faible

---

#### US #1.2: Panier Backend Complet

**Acceptance Criteria:**
- [ ] Créer/récupérer panier pour utilisateur connecté
- [ ] Ajouter items au panier (valider stock)
- [ ] Supprimer items du panier
- [ ] Modifier quantité d'un item
- [ ] Calcul automatique des totaux
- [ ] Persistance en base de données

**Tâches Techniques:**

1. **Créer schémas Pydantic** (`Back/app/schemas/cart.py`)
   ```python
   class CartItemCreate(BaseModel):
       product_id: UUID
       quantity: int = 1
       customization_notes: Optional[str] = None
   
   class CartItemOut(BaseModel):
       id: UUID
       product_id: UUID
       product_name: str
       quantity: int
       unit_price: Decimal
       total_price: Decimal
       customization_notes: Optional[str]
   
   class CartOut(BaseModel):
       id: UUID
       user_id: UUID
       items: list[CartItemOut]
       total_items: int
       subtotal: Decimal
       discount_amount: Decimal
       total_amount: Decimal
       currency: str = "MGA"
   ```
   **Assigné à:** Developer 2
   **Durée:** 1.5h
   **Deadline:** Lundi

2. **Créer service panier** (`Back/app/services/cart_service.py`)
   ```python
   class CartService:
       async def get_or_create_cart(user_id: UUID, db: Session) -> Cart:
           # Récupérer ou créer panier
       
       async def add_item(
           user_id: UUID,
           product_id: UUID,
           quantity: int,
           customization_notes: str = None,
           db: Session = None
       ) -> CartOut:
           # Valider stock
           # Ajouter ou augmenter quantity si déjà dans le panier
           # Recalculer totals
       
       async def remove_item(user_id: UUID, item_id: UUID, db: Session) -> CartOut:
           # Supprimer item
           # Recalculer totals
       
       async def update_item_quantity(
           user_id: UUID,
           item_id: UUID,
           quantity: int,
           db: Session
       ) -> CartOut:
           # Valider stock
           # Mettre à jour quantity
       
       async def get_cart(user_id: UUID, db: Session) -> CartOut:
           # Récupérer panier avec items
       
       def _calculate_totals(cart: Cart) -> dict:
           # Calculer subtotal, taxes, total
   ```
   **Assigné à:** Developer 2
   **Durée:** 3h
   **Deadline:** Mardi

3. **Implémenter endpoints** (`Back/app/api/v1/endpoints/carts.py`)
   ```python
   @router.get("/me", response_model=CartOut)
   async def get_current_cart(
       current_user = Depends(get_current_user),
       db: Session = Depends(get_db)
   ):
       return await cart_service.get_cart(current_user.id, db)
   
   @router.post("/items", response_model=CartOut, status_code=201)
   async def add_to_cart(
       item: CartItemCreate,
       current_user = Depends(get_current_user),
       db: Session = Depends(get_db)
   ):
       return await cart_service.add_item(current_user.id, item.product_id, item.quantity, item.customization_notes, db)
   
   @router.patch("/items/{item_id}", response_model=CartOut)
   async def update_cart_item(
       item_id: UUID,
       update: CartItemUpdate,
       current_user = Depends(get_current_user),
       db: Session = Depends(get_db)
   ):
       return await cart_service.update_item_quantity(current_user.id, item_id, update.quantity, db)
   
   @router.delete("/items/{item_id}", response_model=CartOut)
   async def remove_from_cart(
       item_id: UUID,
       current_user = Depends(get_current_user),
       db: Session = Depends(get_db)
   ):
       return await cart_service.remove_item(current_user.id, item_id, db)
   
   @router.delete("/", status_code=204)
   async def clear_cart(
       current_user = Depends(get_current_user),
       db: Session = Depends(get_db)
   ):
       await cart_service.clear_cart(current_user.id, db)
   ```
   **Assigné à:** Developer 2
   **Durée:** 1.5h
   **Deadline:** Mardi

4. **Tests**
   ```bash
   pytest Back/tests/test_carts.py -v
   # Manuel: POST /api/carts/items, GET /api/carts/me, etc.
   ```
   **Assigné à:** Developer 2
   **Durée:** 1.5h
   **Deadline:** Mercredi

5. **Frontend: intégration**
   - Remplacer localStorage par API calls
   - Tester persistence et synchronization
   **Assigné à:** Frontend Dev
   **Durée:** 2h
   **Deadline:** Mercredi soir

**Dépendances:** Aucune
**Blockers connus:** Modèles Cart/CartItem existent déjà (bon!)
**Risk:** Moyen (calculs de totaux peuvent être tricky avec TVA)

**Estimation Semaine 1:** 15-18 heures

---

## 🔧 SEMAINE 2: Transactions

### Objectif
Permettre aux utilisateurs de créer des commandes et aux artisans de les gérer avec visibilité complète sur leurs stats.

### User Stories à Développer

---

#### US #2.1: Création et Gestion de Commandes

**Acceptance Criteria:**
- [ ] Créer une commande depuis le panier
- [ ] Générer un numéro de commande unique
- [ ] Sauvegarder l'adresse de livraison
- [ ] Créer snapshot des produits au moment de la commande
- [ ] Calculer les commissions artisan
- [ ] Vider le panier après création
- [ ] Mettre à jour le stock

**Tâches Techniques:**

1. **Créer schémas** (`Back/app/schemas/order.py`)
   ```python
   class OrderCreate(BaseModel):
       cart_id: UUID
       shipping_address: dict  # {"street": "", "city": "", "postal_code": "", ...}
       billing_address: Optional[dict]
       shipping_method: Optional[str] = "standard"
       notes: Optional[str]
   
   class OrderItemOut(BaseModel):
       id: UUID
       product_id: UUID
       title: str
       quantity: int
       unit_price: Decimal
       total_price: Decimal
       commission_amount: Decimal
       artisan_payout: Decimal
   
   class OrderOut(BaseModel):
       id: UUID
       order_number: str
       user_id: UUID
       status: str
       payment_status: str
       subtotal: Decimal
       discount_amount: Decimal
       shipping_amount: Decimal
       tax_amount: Decimal
       total_amount: Decimal
       shipping_address: dict
       items: list[OrderItemOut]
       created_at: datetime
       estimated_delivery_date: Optional[date]
   
   class OrderStatusUpdate(BaseModel):
       status: str  # pending, in_production, ready_for_pickup, shipped, delivered
       comment: Optional[str]
   ```
   **Assigné à:** Developer 1
   **Durée:** 2h
   **Deadline:** Lundi

2. **Créer service commandes** (`Back/app/services/order_service.py`)
   ```python
   class OrderService:
       COMMISSION_RATE = 0.10  # 10%
       
       async def create_order(
           user_id: UUID,
           cart_id: UUID,
           shipping_address: dict,
           billing_address: dict = None,
           db: Session = None
       ) -> OrderOut:
           # 1. Récupérer panier avec items
           # 2. Valider stock pour chaque produit
           # 3. Générer order_number unique (ex: ORD-2026-001234)
           # 4. Créer Order record
           # 5. Pour chaque cart_item:
           #    - Créer OrderItem
           #    - Calculer commission (10%)
           #    - Créer product snapshot (JSON de prix, description, etc.)
           #    - Diminuer stock du produit
           #    - Augmenter artisan's total_sales
           # 6. Créer OrderStatusHistory (initial status = pending)
           # 7. Vider le panier
           # 8. Return order
       
       async def get_order(order_id: UUID, user_id: UUID, db: Session) -> OrderOut:
           # Récupérer order
           # Vérifier permissions (buyer ou artisan ayant items)
       
       async def get_artisan_orders(
           artisan_id: UUID,
           status: str = None,
           page: int = 1,
           limit: int = 20,
           db: Session = None
       ) -> PaginatedResponse[OrderOut]:
           # Récupérer les orders où artisan_id a au moins 1 item
           # Filtrer par status si fourni
       
       async def update_order_status(
           order_id: UUID,
           artisan_id: UUID,
           new_status: str,
           comment: str = None,
           db: Session = None
       ) -> OrderOut:
           # Vérifier que artisan_id a items dans cette commande
           # Mettre à jour status
           # Créer OrderStatusHistory
           # Si status=delivered: créer notification au client
   ```
   **Assigné à:** Developer 1
   **Durée:** 4h
   **Deadline:** Lundi-Mardi

3. **Implémenter endpoints** (`Back/app/api/v1/endpoints/orders.py`)
   ```python
   @router.post("/", response_model=OrderOut, status_code=201)
   async def create_order(
       order_in: OrderCreate,
       current_user = Depends(get_current_user),
       db: Session = Depends(get_db)
   ):
       return await order_service.create_order(
           user_id=current_user.id,
           cart_id=order_in.cart_id,
           shipping_address=order_in.shipping_address,
           billing_address=order_in.billing_address,
           db=db
       )
   
   @router.get("/{order_id}", response_model=OrderOut)
   async def get_order(
       order_id: UUID,
       current_user = Depends(get_current_user),
       db: Session = Depends(get_db)
   ):
       return await order_service.get_order(order_id, current_user.id, db)
   
   @router.get("/", response_model=PaginatedResponse[OrderOut])
   async def get_user_orders(
       status: Optional[str] = None,
       artisan_id: Optional[UUID] = None,
       page: int = Query(1, ge=1),
       limit: int = Query(20, ge=1, le=100),
       current_user = Depends(get_current_user),
       db: Session = Depends(get_db)
   ):
       # Si current_user est buyer: voir ses propres commandes
       # Si current_user est artisan: voir commandes où il a items (ignorar artisan_id param)
       # Si admin: voir toutes les commandes
   
   @router.patch("/{order_id}/status", response_model=OrderOut)
   async def update_order_status(
       order_id: UUID,
       status_update: OrderStatusUpdate,
       current_user = Depends(get_current_user),
       db: Session = Depends(get_db)
   ):
       # Vérifier que current_user est artisan ayant items dans cet order
       return await order_service.update_order_status(
           order_id=order_id,
           artisan_id=current_user.id,
           new_status=status_update.status,
           comment=status_update.comment,
           db=db
       )
   ```
   **Assigné à:** Developer 1
   **Durée:** 2h
   **Deadline:** Mardi

4. **Tests complets**
   ```bash
   pytest Back/tests/test_orders.py -v
   # Tester: create_order, update_status, permissions, stock validation
   ```
   **Assigné à:** Developer 1
   **Durée:** 2h
   **Deadline:** Mercredi

**Dépendances:** CartService doit être fait (Semaine 1)
**Blockers connus:** Aucun
**Risk:** Moyen (logic commissions, snapshots)

---

#### US #2.2: Statistiques Artisan

**Acceptance Criteria:**
- [ ] Afficher le chiffre d'affaires total
- [ ] Afficher le nombre de commandes ce mois-ci
- [ ] Afficher la notation moyenne
- [ ] Afficher le nombre de produits actifs
- [ ] Stats mises à jour quasi en temps réel

**Tâches Techniques:**

1. **Créer schémas** (déjà dans `Back/app/schemas/`)
   ```python
   class ArtisanStatsResponse(BaseModel):
       totalSales: int  # total revenue in MGA
       ordersThisMonth: int
       rating: float  # 4.8
       totalProducts: int
       totalWorkshops: int
       totalBookings: int
       lastUpdated: datetime
   ```
   **Assigné à:** Developer 2
   **Durée:** 0.5h
   **Deadline:** Lundi

2. **Créer service stats** (`Back/app/services/artisan_stats_service.py`)
   ```python
   class ArtisanStatsService:
       async def get_stats(artisan_id: UUID, db: Session) -> ArtisanStatsResponse:
           # Query 1: SUM(order_item.total_price) WHERE order_item.artisan_id = {id}
           # Query 2: COUNT(orders) WHERE order.created_at >= this_month_start AND artisan_id has items
           # Query 3: AVG(review.rating) WHERE review.artisan_id = {id}
           # Query 4: COUNT(products) WHERE product.artisan_id = {id} AND status = 'published'
           # Query 5: COUNT(workshops) WHERE workshop.artisan_id = {id}
           # Query 6: COUNT(bookings) WHERE workshop.artisan_id = {id}
   ```
   **Assigné à:** Developer 2
   **Durée:** 2h
   **Deadline:** Lundi

3. **Endpoint GET /artisans/{id}/stats**
   ```python
   @router.get("/artisans/{artisan_id}/stats", response_model=ArtisanStatsResponse)
   async def get_artisan_stats(
       artisan_id: UUID,
       current_user = Depends(get_current_user),
       db: Session = Depends(get_db)
   ):
       # Vérifier permissions (own artisan ou admin)
       return await artisan_stats_service.get_stats(artisan_id, db)
   ```
   **Assigné à:** Developer 2
   **Durée:** 1h
   **Deadline:** Mardi

4. **Tests**
   ```bash
   pytest tests/test_artisan_stats.py -v
   ```
   **Assigné à:** Developer 2
   **Durée:** 1h
   **Deadline:** Mardi

**Dépendances:** OrderService (pour les ventes)
**Blockers connus:** Aucun
**Risk:** Bas

**Estimation Semaine 2:** 14-16 heures

---

## 🔧 SEMAINE 3: Compléments

### Objectif
Finaliser le dashboard avec les fonctionnalités de disponibilité et avis.

### User Stories à Développer

---

#### US #3.1: Indisponibilités Artisan

**Acceptance Criteria:**
- [ ] Artisan peut marquer des périodes d'indisponibilité (uniques ou plages)
- [ ] Calendrier visuel de ces indisponibilités
- [ ] Raison optionnelle
- [ ] Supprimer les indisponibilités

**Tâches Techniques:**

1. **Créer schémas** (`Back/app/schemas/unavailability.py`)
   ```python
   class UnavailabilityCreate(BaseModel):
       start_date: date
       end_date: Optional[date]  # None si single day
       reason: Optional[str]
       type: str  # "single" ou "range"
   
   class UnavailabilityOut(BaseModel):
       id: UUID
       artisan_id: UUID
       start_date: date
       end_date: Optional[date]
       reason: Optional[str]
       type: str
       created_at: datetime
   ```
   **Assigné à:** Developer 3
   **Durée:** 0.5h
   **Deadline:** Lundi

2. **Créer service**
   ```python
   async def create_unavailability(
       artisan_id: UUID,
       create_in: UnavailabilityCreate,
       db: Session
   ) -> UnavailabilityOut:
       # Créer indisponibilité
       # Mettre à jour workshops availability si nécessaire
   
   async def delete_unavailability(
       artisan_id: UUID,
       unavailability_id: UUID,
       db: Session
   ) -> None:
       # Supprimer et mettre à jour workshops
   
   async def get_unavailabilities(
       artisan_id: UUID,
       db: Session
   ) -> list[UnavailabilityOut]:
       # Récupérer toutes les indisponibilités
   ```
   **Assigné à:** Developer 3
   **Durée:** 1.5h
   **Deadline:** Lundi

3. **Endpoints**
   ```python
   @router.get("/artisans/{artisan_id}/unavailabilities")
   async def get_unavailabilities(...):
       ...
   
   @router.post("/artisans/{artisan_id}/unavailabilities", status_code=201)
   async def create_unavailability(...):
       ...
   
   @router.delete("/artisans/{artisan_id}/unavailabilities/{unavailability_id}")
   async def delete_unavailability(...):
       ...
   ```
   **Assigné à:** Developer 3
   **Durée:** 1h
   **Deadline:** Mardi

4. **Tests**
   **Assigné à:** Developer 3
   **Durée:** 1h
   **Deadline:** Mardi

**Risk:** Bas

---

#### US #3.2: Avis et Notations

**Acceptance Criteria:**
- [ ] Utilisateur peut laisser un avis après achat
- [ ] Note de 1 à 5 étoiles
- [ ] Commentaire texte
- [ ] Photos optionnelles
- [ ] Une seule review par user/product
- [ ] Average rating calculée automatiquement

**Tâches Techniques:**

1. **Créer schémas**
   ```python
   class ReviewCreate(BaseModel):
       product_id: UUID
       order_item_id: UUID  # Pour vérifier verified purchase
       rating: int  # 1-5
       title: str
       comment: str
       images: Optional[list[str]]  # URLs
   
   class ReviewOut(BaseModel):
       id: UUID
       product_id: UUID
       user_id: UUID
       rating: int
       title: str
       comment: str
       images: list[str]
       verified_purchase: bool
       helpful_count: int
       created_at: datetime
   ```
   **Assigné à:** Developer 3
   **Durée:** 1h
   **Deadline:** Mercredi

2. **Créer service**
   ```python
   async def create_review(
       user_id: UUID,
       order_item_id: UUID,
       review_in: ReviewCreate,
       db: Session
   ) -> ReviewOut:
       # Vérifier que user owned ce order_item
       # Vérifier no duplicate review
       # Créer review
       # Recalculer product.average_rating
   
   async def get_product_reviews(
       product_id: UUID,
       page: int = 1,
       db: Session = None
   ) -> PaginatedResponse[ReviewOut]:
       # Récupérer reviews du produit
   ```
   **Assigné à:** Developer 3
   **Durée:** 2h
   **Deadline:** Mercredi

3. **Endpoints**
   ```python
   @router.post("/products/{product_id}/reviews", status_code=201)
   async def create_review(...):
       ...
   
   @router.get("/products/{product_id}/reviews")
   async def get_product_reviews(...):
       ...
   ```
   **Assigné à:** Developer 3
   **Durée:** 1h
   **Deadline:** Jeudi

4. **Tests**
   **Assigné à:** Developer 3
   **Durée:** 1h
   **Deadline:** Jeudi

**Risk:** Moyen

**Estimation Semaine 3:** 10-12 heures

---

## 📅 Timeline Proposée

```
SEMAINE 1 (Lun-Ven 10-14 fév)
├─ Lundi: US#1.1 (schémas + service)
├─ Lundi: US#1.2 (schémas)
├─ Mardi: US#1.1 (endpoints + tests)
├─ Mardi: US#1.2 (service + endpoints)
├─ Mercredi: US#1.2 (tests)
├─ Mercredi/Jeudi: Frontend integration
└─ Vendredi: Sprint Review + Retro

SEMAINE 2 (Lun-Ven 17-21 fév)
├─ Lundi-Mardi: US#2.1 (schémas + service)
├─ Mardi: US#2.2 (schémas + service)
├─ Mardi-Mercredi: US#2.1 (endpoints + tests)
├─ Mercredi: US#2.2 (endpoints + tests)
├─ Jeudi: Frontend integration (orders + stats)
└─ Vendredi: Sprint Review + Retro

SEMAINE 3 (Lun-Ven 24-28 fév)
├─ Lundi: US#3.1 (schémas + service)
├─ Lundi-Mercredi: US#3.2 (schémas + service)
├─ Mercredi: US#3.1 (endpoints + tests)
├─ Jeudi: US#3.2 (endpoints + tests)
├─ Jeudi: Frontend integration
└─ Vendredi: Sprint Review + Dashboard Complet ✅
```

---

## 👥 Assignations d'Équipe Proposée

Pour parallélisation efficace, recommander **3 développeurs**:

| Developer | Semaine 1 | Semaine 2 | Semaine 3 |
|-----------|-----------|-----------|-----------|
| **Dev 1** | US#1.1 Profil | US#2.1 Orders | Support/review |
| **Dev 2** | US#1.2 Cart | US#2.2 Stats | US#3.1 Indisponibilités |
| **Dev 3** | Support/review | Support/testing | US#3.2 Avis |
| **Frontend** | Intégrer Profil | Intégrer Orders/Stats | Intégrer Indisponibilités/Avis |

---

## 🧪 Stratégie de Tests

### Tests à Écrire pour Chaque US

**US#1.1 (Profil):**
```python
def test_update_user_profile_email():
    # Update email
    # Verify POST returns updated user
    # Verify email is unique (can't use existing)

def test_artisan_update_specialty():
    # Update specialty field
    # Verify only artisans can use PUT /artisans/me

def test_update_with_photo():
    # Upload photo + update profile
    # Verify photo stored and linked
```

**US#1.2 (Cart):**
```python
def test_add_item_to_cart():
    # Add item, verify in cart
    
def test_cart_totals_calculation():
    # Add multiple items
    # Verify subtotal, tax calculation
    
def test_remove_item():
    # Add item, remove it
    # Verify cart updated

def test_stock_validation():
    # Try to add more items than stock
    # Should fail with error
```

**US#2.1 (Orders):**
```python
def test_create_order_from_cart():
    # Create order from cart
    # Verify order_number is unique
    # Verify stock decreased
    # Verify cart is empty

def test_commission_calculation():
    # Create order
    # Verify commission_amount = unit_price * 0.10

def test_update_order_status():
    # Create order
    # Update status to "in_production"
    # Verify OrderStatusHistory created
```

**US#2.2 (Stats):**
```python
def test_artisan_stats():
    # Create 2 orders for artisan
    # GET /artisans/{id}/stats
    # Verify totalSales = sum of orders
    # Verify ordersThisMonth updated
```

**US#3.1 (Unavailabilities):**
```python
def test_create_unavailability():
    # Create unavailability period
    # Verify it shows in list
    
def test_delete_unavailability():
    # Create then delete
    # Verify removed
```

**US#3.2 (Reviews):**
```python
def test_create_review():
    # User reviews product they bought
    # Verify marked as verified_purchase
    
def test_duplicate_review_prevented():
    # Try to create 2nd review for same product
    # Should fail
    
def test_average_rating_updated():
    # Create reviews with ratings 5, 3
    # Verify product.average_rating = 4.0
```

---

## ⚠️ Risques et Mitigations

| Risque | Probabilité | Impact | Mitigation |
|--------|------------|--------|-----------|
| Stock calculation errors | Moyen | Altop | Tests exhaustifs, couverture haute |
| Commission math errors | Moyen | Medium | Code review spécialisée |
| Race conditions on stock | Bas | Critque | Locks DB, tests concurrency |
| Auth/permission bugs | Moyen | Medium | Tests de sécurité, code review |
| Performance queries | Bas | Medium | Indexes, tests load |

---

## 🎯 Success Criteria pour le Dashboard

Dashboard est considéré **COMPLET** quand:

- ✅ Toutes les 6 onglets ont des données réelles (pas de mock)
- ✅ Profil artisan peut être mis à jour
- ✅ Panier est synchronisé avec la base de données
- ✅ Commandes peuvent être créées et gérées
- ✅ Statistiques artisan affichent les vrais chiffres
- ✅ Indisponibilités artisan peuvent être gérées
- ✅ Avis peuvent être laissés
- ✅ Tous les tests passent (couverture >80%)
- ✅ Code review approuvé
- ✅ Déployé en staging
- ✅ Tests d'acceptation utilisateur réussis

---

## 📝 Checklist Quotidienne pour le Scrum Master

```
CHAQUE MATIN:
☐ Vérifier les bloqueurs potentiels
☐ S'assurer que tous les devs ont les tâches claires
☐ Vérifier les PRs en attente de review

CHAQUE JOUR:
☐ Standup: chacun parle de ce qu'il a fait, va faire, ses blockers
☐ Débloquer les obstacles immédiatement si possible

CHAQUE SOIR:
☐ Mettre à jour le tracking des tâches
☐ Envoyer recap au team

FIN DE SEMAINE:
☐ Préparer sprint review
☐ Collecter feedback et lessons learned
```

---

## 📞 Contacts et Escalations

- **Blockers techniques:** Developer 1 (Tech Lead)
- **Paiements:** Voir avec le team Stripe (quand vous en saurez plus)
- **Conception database:** Vérifier les migrations Alembic
- **Performance:** Analyser les queries, ajouter indexes si nécessaire

