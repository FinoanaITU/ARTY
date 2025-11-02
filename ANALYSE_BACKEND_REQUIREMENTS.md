# 📋 Analyse complète des besoins Backend FastAPI pour Artizaho

**Date**: Analyse du Frontend React  
**Projet**: Artizaho - Plateforme d'artisanat malgache

---

## 📌 Table des matières

1. [Authentification & Utilisateurs](#1-authentification--utilisateurs)
2. [Produits Artisanaux](#2-produits-artisanaux)
3. [Ateliers](#3-ateliers)
4. [Commandes & Paiements](#4-commandes--paiements)
5. [Panier](#5-panier)
6. [Profils Artisans](#6-profils-artisans)
7. [Abonnements & Crédits](#7-abonnements--crédits)
8. [Devis & Réservations](#8-devis--réservations)
9. [Administration](#9-administration)
10. [Recommandations](#10-recommandations)
11. [Avis & Notes](#11-avis--notes)
12. [Notifications & Contact](#12-notifications--contact)

---

## 1. Authentification & Utilisateurs

### 🎯 Fonctionnalités Frontend détectées

**Pages concernées**: `Login.tsx`, `Signup.tsx`, `UserContext.tsx`

1. **Connexion utilisateur**
   - Formulaire avec email/password
   - Sélection du type d'acheteur (particulier/entreprise)
   - Sélection de la nationalité (local/étranger)
   - Gestion du rôle (buyer, artisan, admin)

2. **Inscription Acheteur**
   - Formulaire multi-étapes pour particuliers et entreprises
   - Informations: nom, email, password, téléphone, adresse, ville, pays
   - Pour entreprises: nom entreprise, SIRET
   - Détection automatique du type de tarif (local/étranger)

3. **Inscription Artisan**
   - Formulaire multi-étapes (5 étapes)
   - Étape 1: Photos de l'atelier/créations (jusqu'à 5 images)
   - Étape 2: Langues parlées
   - Étape 3: Compte artisan (nom entreprise)
   - Étape 4: Informations artisanales (spécialité, expérience, description, histoire de la marque)
   - Étape 5: Offres (produits/ateliers/both) + Documents administratifs (NIF, STAT)

### 🔧 Besoins Backend à implémenter

#### Endpoints REST

**POST `/api/auth/register/buyer`**
- **Corps de requête**:
```json
{
  "email": "string",
  "password": "string",
  "name": "string",
  "phone": "string",
  "address": "string",
  "city": "string",
  "country": "string",
  "buyer_type": "particulier" | "entreprise",
  "company_name": "string (optional)",
  "siret": "string (optional)"
}
```
- **Réponse**: `201 Created`
```json
{
  "user": {
    "id": "uuid",
    "email": "string",
    "name": "string",
    "role": "buyer",
    "buyer_type": "particulier" | "entreprise",
    "nationality": "local" | "foreign",
    "created_at": "datetime"
  },
  "token": "jwt_token"
}
```

**POST `/api/auth/register/artisan`**
- **Corps de requête** (multi-part form):
```json
{
  "email": "string",
  "password": "string",
  "name": "string",
  "phone": "string",
  "region": "string",
  "city": "string",
  "address": "string",
  "languages": ["string"],
  "company_name": "string",
  "main_specialty": "string",
  "other_skills": ["string"],
  "years_experience": "string",
  "activity_description": "text",
  "brand_story": "text (optional)",
  "offerings": ["products", "workshops", "both"],
  "nif": "string (optional)",
  "stat": "string (optional)",
  "documents_not_available": "boolean",
  "photos": ["File"] (max 5 images)
}
```
- **Réponse**: `201 Created`
```json
{
  "user": {
    "id": "uuid",
    "email": "string",
    "role": "artisan",
    "artisan_profile_id": "uuid",
    "status": "pending_approval"
  },
  "token": "jwt_token"
}
```

**POST `/api/auth/login`**
- **Corps de requête**:
```json
{
  "email": "string",
  "password": "string"
}
```
- **Réponse**: `200 OK`
```json
{
  "access_token": "jwt_token",
  "token_type": "bearer",
  "user": {
    "id": "uuid",
    "email": "string",
    "name": "string",
    "role": "buyer" | "artisan" | "admin",
    "avatar": "string (url)",
    "buyer_type": "particulier" | "entreprise" (if buyer),
    "nationality": "local" | "foreign" (if buyer),
    "specialty": "string" (if artisan)
  }
}
```

**GET `/api/auth/me`**
- **Headers**: `Authorization: Bearer <token>`
- **Réponse**: `200 OK` (même structure que login)

**POST `/api/auth/refresh`**
- **Réponse**: Nouveau token

#### Schemas Pydantic

```python
# Input schemas
class BuyerRegisterIn(BaseModel):
    email: EmailStr
    password: str  # min 6 chars
    name: str
    phone: str
    address: Optional[str] = None
    city: str
    country: str
    buyer_type: Literal["particulier", "entreprise"]
    company_name: Optional[str] = None
    siret: Optional[str] = None

class ArtisanRegisterIn(BaseModel):
    email: EmailStr
    password: str
    name: str
    phone: str
    region: str
    city: str
    address: Optional[str] = None
    languages: List[str]
    company_name: str
    main_specialty: str
    other_skills: List[str]
    years_experience: str
    activity_description: str
    brand_story: Optional[str] = None
    offerings: List[Literal["products", "workshops", "both"]]
    nif: Optional[str] = None
    stat: Optional[str] = None
    documents_not_available: bool = False

class LoginIn(BaseModel):
    email: EmailStr
    password: str

# Output schemas
class UserOut(BaseModel):
    id: UUID
    email: EmailStr
    name: str
    role: Literal["buyer", "artisan", "admin"]
    avatar: Optional[str] = None
    buyer_type: Optional[Literal["particulier", "entreprise"]] = None
    nationality: Optional[Literal["local", "foreign"]] = None
    specialty: Optional[str] = None
    created_at: datetime
    updated_at: datetime

class TokenOut(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut
```

#### Modèles SQLAlchemy

```python
class User(Base):
    __tablename__ = "users"
    
    id = Column(UUID, primary_key=True)
    email = Column(String, unique=True, nullable=False, index=True)
    password_hash = Column(String, nullable=False)
    name = Column(String, nullable=False)
    role = Column(Enum(UserRole), nullable=False)
    avatar = Column(String, nullable=True)
    phone = Column(String, nullable=True)
    address = Column(String, nullable=True)
    city = Column(String, nullable=True)
    country = Column(String, nullable=True)
    buyer_type = Column(Enum(BuyerType), nullable=True)
    nationality = Column(Enum(Nationality), nullable=True)
    company_name = Column(String, nullable=True)
    siret = Column(String, nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relations
    artisan_profile = relationship("ArtisanProfile", back_populates="user", uselist=False)
    orders = relationship("Order", back_populates="buyer")
    cart_items = relationship("CartItem", back_populates="user")

class ArtisanProfile(Base):
    __tablename__ = "artisan_profiles"
    
    id = Column(UUID, primary_key=True)
    user_id = Column(UUID, ForeignKey("users.id"), unique=True, nullable=False)
    region = Column(String, nullable=True)
    languages = Column(ARRAY(String), nullable=True)
    company_name = Column(String, nullable=False)
    main_specialty = Column(String, nullable=False)
    other_skills = Column(ARRAY(String), nullable=True)
    years_experience = Column(String, nullable=True)
    activity_description = Column(Text, nullable=False)
    brand_story = Column(Text, nullable=True)
    offerings = Column(ARRAY(String), nullable=True)  # ["products", "workshops", "both"]
    nif = Column(String, nullable=True)
    stat = Column(String, nullable=True)
    documents_not_available = Column(Boolean, default=False)
    status = Column(Enum(ProfileStatus), default="pending_approval")
    admin_notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relations
    user = relationship("User", back_populates="artisan_profile")
    products = relationship("Product", back_populates="artisan")
    workshops = relationship("Workshop", back_populates="artisan")
    unavailability_periods = relationship("UnavailabilityPeriod", back_populates="artisan")
    artisan_photos = relationship("ArtisanPhoto", back_populates="artisan_profile")
```

#### Logique métier

- **Hashage des mots de passe**: Utiliser `passlib` avec bcrypt
- **Validation email**: Vérifier format et unicité
- **Génération JWT**: Token avec expiration (access: 15min, refresh: 7 jours)
- **Détection nationalité**: Si `country === "madagascar"` → `nationality = "local"`, sinon `"foreign"`
- **Upload photos artisan**: Stocker dans S3/local storage, max 5 images, formats acceptés: jpg, png, webp
- **Workflow validation artisan**: Statut `pending_approval` → admin valide/rejette → `published` ou `rejected`

---

## 2. Produits Artisanaux

### 🎯 Fonctionnalités Frontend détectées

**Pages concernées**: `Products.tsx`, `ProductDetail.tsx`, `ArtisanProductManager.tsx`

1. **Catalogue produits**
   - Liste avec filtres (catégorie, sous-catégorie, recherche)
   - Affichage: nom, artisan, prix, image, note, stock
   - Navigation par catégories hiérarchiques

2. **Détail produit**
   - Informations complètes (description, matériaux, dimensions, temps de fabrication)
   - Galerie d'images (plusieurs photos)
   - Variations de prix selon profil utilisateur (local/étranger/touriste/entreprise)
   - Gestion stock et disponibilité
   - Produits similaires
   - Recommandations d'ateliers liés
   - Avis et notes

3. **Gestion produits (Artisan)**
   - CRUD complet des produits
   - Upload multiple d'images
   - Statuts: draft, pending_approval, published, rejected
   - Gestion stock et prix
   - Options de personnalisation

4. **Commande en gros**
   - Formulaire pour commandes importantes
   - Calcul remises progressives (5-9: -5%, 10-19: -10%, 20-49: -15%, 50+: -25%)
   - Informations client

### 🔧 Besoins Backend à implémenter

#### Endpoints REST

**GET `/api/products`**
- **Query params**: 
  - `category`: string (optional)
  - `subcategory`: string (optional)
  - `search`: string (optional)
  - `artisan_id`: uuid (optional)
  - `min_price`: float (optional)
  - `max_price`: float (optional)
  - `in_stock`: boolean (optional)
  - `page`: int = 1
  - `limit`: int = 20
- **Réponse**: `200 OK`
```json
{
  "items": [
    {
      "id": "uuid",
      "name": "string",
      "description": "text",
      "category": "string",
      "subcategory": "string",
      "price": 45000,
      "images": ["url1", "url2"],
      "artisan": {
        "id": "uuid",
        "name": "string"
      },
      "materials": ["string"],
      "available_colors": ["string"],
      "dimensions": {
        "length": 25,
        "width": 18,
        "height": 8,
        "weight": 0.6
      },
      "stock": 3,
      "customizable": true,
      "production_time_days": 15,
      "status": "published",
      "rating": 4.8,
      "review_count": 24,
      "created_at": "datetime"
    }
  ],
  "total": 100,
  "page": 1,
  "pages": 5
}
```

**GET `/api/products/{product_id}`**
- **Réponse**: `200 OK` (détails complets du produit)

**POST `/api/products`** (Artisan seulement)
- **Headers**: `Authorization: Bearer <token>`
- **Corps**: Multi-part form data
```json
{
  "name": "string",
  "description": "text",
  "category": "string",
  "subcategory": "string",
  "price": 45000,
  "materials": ["string"],
  "available_colors": ["string"],
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
  "images": ["File"] (max 10)
}
```
- **Réponse**: `201 Created`

**PATCH `/api/products/{product_id}`** (Artisan - son produit seulement)
- **Réponse**: `200 OK`

**DELETE `/api/products/{product_id}`** (Artisan - son produit seulement)
- **Réponse**: `204 No Content`

**GET `/api/products/{product_id}/similar`**
- **Réponse**: `200 OK` (liste de produits similaires)

**POST `/api/products/{product_id}/bulk-order-request`**
- **Corps**:
```json
{
  "quantity": 50,
  "customer_name": "string",
  "customer_email": "string",
  "customer_phone": "string",
  "company": "string (optional)",
  "message": "string (optional)"
}
```
- **Réponse**: `201 Created`

**GET `/api/products/categories`**
- **Réponse**: `200 OK`
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

#### Schemas Pydantic

```python
class ProductCreate(BaseModel):
    name: str
    description: str
    category: str
    subcategory: str
    price: float
    materials: List[str]
    available_colors: List[str]
    dimensions: Optional[ProductDimensions] = None
    stock: int
    customizable: bool = False
    production_time_days: int
    bulk_order_enabled: bool = False
    min_bulk_quantity: Optional[int] = None

class ProductOut(BaseModel):
    id: UUID
    name: str
    description: str
    category: str
    subcategory: str
    price: float
    images: List[str]
    artisan: ArtisanBasic
    materials: List[str]
    available_colors: List[str]
    dimensions: Optional[ProductDimensions] = None
    stock: int
    customizable: bool
    production_time_days: int
    status: ProductStatus
    rating: Optional[float] = None
    review_count: int = 0
    created_at: datetime
    updated_at: datetime

class BulkOrderRequestIn(BaseModel):
    quantity: int
    customer_name: str
    customer_email: EmailStr
    customer_phone: str
    company: Optional[str] = None
    message: Optional[str] = None
```

#### Modèles SQLAlchemy

```python
class Product(Base):
    __tablename__ = "products"
    
    id = Column(UUID, primary_key=True)
    artisan_id = Column(UUID, ForeignKey("artisan_profiles.id"), nullable=False)
    name = Column(String, nullable=False)
    description = Column(Text, nullable=False)
    category = Column(String, nullable=False)
    subcategory = Column(String, nullable=False)
    price = Column(Numeric(10, 2), nullable=False)
    materials = Column(ARRAY(String), nullable=True)
    available_colors = Column(ARRAY(String), nullable=True)
    length_cm = Column(Float, nullable=True)
    width_cm = Column(Float, nullable=True)
    height_cm = Column(Float, nullable=True)
    weight_kg = Column(Float, nullable=True)
    stock = Column(Integer, default=0)
    customizable = Column(Boolean, default=False)
    production_time_days = Column(Integer, nullable=False)
    bulk_order_enabled = Column(Boolean, default=False)
    min_bulk_quantity = Column(Integer, nullable=True)
    status = Column(Enum(ProductStatus), default="draft")
    admin_notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relations
    artisan = relationship("ArtisanProfile", back_populates="products")
    images = relationship("ProductImage", back_populates="product")
    order_items = relationship("OrderItem", back_populates="product")
    reviews = relationship("ProductReview", back_populates="product")
    cart_items = relationship("CartItem", back_populates="product")

class ProductImage(Base):
    __tablename__ = "product_images"
    
    id = Column(UUID, primary_key=True)
    product_id = Column(UUID, ForeignKey("products.id"), nullable=False)
    image_url = Column(String, nullable=False)
    order = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    product = relationship("Product", back_populates="images")

class BulkOrderRequest(Base):
    __tablename__ = "bulk_order_requests"
    
    id = Column(UUID, primary_key=True)
    product_id = Column(UUID, ForeignKey("products.id"), nullable=False)
    quantity = Column(Integer, nullable=False)
    customer_name = Column(String, nullable=False)
    customer_email = Column(String, nullable=False)
    customer_phone = Column(String, nullable=False)
    company = Column(String, nullable=True)
    message = Column(Text, nullable=True)
    status = Column(Enum(RequestStatus), default="pending")
    estimated_price = Column(Numeric(10, 2), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    product = relationship("Product")
```

#### Logique métier

- **Calcul remise gros**: Appliquer selon grille (5-9: 5%, 10-19: 10%, 20-49: 15%, 50+: 25%)
- **Gestion stock**: Décrémenter lors de commande, vérifier disponibilité avant ajout panier
- **Workflow validation**: `draft` → artisan soumet → `pending_approval` → admin valide → `published`
- **Recommandations produits similaires**: Basé sur catégorie, artisan, matériaux similaires
- **Variation prix**: Calculer selon profil utilisateur (local: prix base, étranger: +X%, entreprise: -Y%)

---

## 3. Ateliers

### 🎯 Fonctionnalités Frontend détectées

**Pages concernées**: `Workshops.tsx`, `WorkshopDetail.tsx`, `WorkshopManager.tsx`, `WorkshopCreationForm.tsx`

1. **Catalogue ateliers**
   - 4 types d'ateliers:
     - **Sur Réservation**: Catalogue filtrable, personnalisables (dates/horaires flexibles)
     - **Sur Inscription**: Événements programmés avec dates fixes
     - **Par Abonnement**: Ateliers inclus dans formules d'abonnement
     - **Artikidz**: Ateliers enfants (6-15 ans)

2. **Détail atelier**
   - Informations complètes (description, programme, matériel inclus, instructeur)
   - Calendrier de disponibilité
   - Gestion participants
   - Option privatisation (pour groupes)
   - Prix variables (locaux/étrangers)

3. **Réservation/Inscription**
   - Réservation avec sélection date/heure
   - Inscription à événement fixe
   - Gestion indisponibilités artisan
   - Demande personnalisée (dates alternatives)

4. **Gestion ateliers (Artisan)**
   - CRUD complet
   - Gestion calendrier
   - Suivi participants

### 🔧 Besoins Backend à implémenter

#### Endpoints REST

**GET `/api/workshops`**
- **Query params**:
  - `type`: "reservation" | "inscription" | "subscription" | "artikidz"
  - `category`: string
  - `difficulty`: string
  - `search`: string
  - `artisan_id`: uuid
  - `min_date`: date
  - `max_date`: date
  - `page`: int
  - `limit`: int
- **Réponse**: `200 OK`

**GET `/api/workshops/{workshop_id}`**
- **Réponse**: `200 OK` (détails complets)

**POST `/api/workshops`** (Artisan)
- **Corps**:
```json
{
  "title": "string",
  "category": "string",
  "description": "text",
  "type": "reservation" | "inscription",
  "duration_hours": 3,
  "base_price": 25000,
  "foreign_price": 35000,
  "max_participants": 12,
  "min_participants": 4,
  "location": "string",
  "difficulty": "Débutant" | "Intermédiaire" | "Avancé",
  "learning_objectives": ["string"],
  "included_materials": ["string"],
  "program": ["string"],
  "important_info": ["string"],
  "privatization_enabled": true,
  "privatization_options": {
    "min_participants": 5,
    "max_participants": 15,
    "base_price": 50000,
    "price_per_participant": 35000
  },
  "date": "datetime (if inscription type)",
  "artikidz_specific": {
    "min_age": 6,
    "max_age": 12,
    "group_size": "4-8 enfants"
  }
}
```

**GET `/api/workshops/{workshop_id}/availability`**
- **Query params**: `start_date`, `end_date`
- **Réponse**: Calendrier avec créneaux disponibles/indisponibles

**POST `/api/workshops/{workshop_id}/book`**
- **Corps**:
```json
{
  "date": "datetime",
  "time": "string (HH:MM)",
  "participants": 5,
  "is_private": false,
  "special_requirements": "string (optional)"
}
```

**POST `/api/workshops/{workshop_id}/register`** (Pour inscription type)
- **Corps**:
```json
{
  "participants": 2
}
```

**GET `/api/workshops/{workshop_id}/participants`** (Artisan)
- **Réponse**: Liste des participants

#### Schemas Pydantic

```python
class WorkshopCreate(BaseModel):
    title: str
    category: str
    description: str
    type: Literal["reservation", "inscription"]
    duration_hours: int
    base_price: float
    foreign_price: Optional[float] = None
    max_participants: int
    min_participants: int
    location: Optional[str] = None
    difficulty: str
    learning_objectives: List[str]
    included_materials: List[str]
    program: List[str]
    important_info: List[str]
    privatization_enabled: bool = False
    privatization_options: Optional[PrivatizationOptions] = None
    date: Optional[datetime] = None  # Required if type == "inscription"
    artikidz_specific: Optional[ArtikidzSpecific] = None

class WorkshopOut(BaseModel):
    id: UUID
    title: str
    category: str
    artisan: ArtisanBasic
    type: Literal["reservation", "inscription", "subscription", "artikidz"]
    date: Optional[datetime] = None
    duration_hours: int
    description: str
    learning_objectives: List[str]
    included_materials: List[str]
    program: List[str]
    important_info: List[str]
    base_price: float
    foreign_price: Optional[float] = None
    privatization_enabled: bool
    privatization_options: Optional[PrivatizationOptions] = None
    max_participants: int
    current_participants: int
    status: WorkshopStatus
    location: Optional[str] = None
    created_at: datetime
    updated_at: datetime
```

#### Modèles SQLAlchemy

```python
class Workshop(Base):
    __tablename__ = "workshops"
    
    id = Column(UUID, primary_key=True)
    artisan_id = Column(UUID, ForeignKey("artisan_profiles.id"), nullable=False)
    title = Column(String, nullable=False)
    category = Column(String, nullable=False)
    description = Column(Text, nullable=False)
    type = Column(Enum(WorkshopType), nullable=False)
    date = Column(DateTime, nullable=True)  # Required for inscription type
    duration_hours = Column(Integer, nullable=False)
    base_price = Column(Numeric(10, 2), nullable=False)
    foreign_price = Column(Numeric(10, 2), nullable=True)
    max_participants = Column(Integer, nullable=False)
    min_participants = Column(Integer, nullable=False)
    current_participants = Column(Integer, default=0)
    location = Column(String, nullable=True)
    difficulty = Column(String, nullable=True)
    learning_objectives = Column(ARRAY(String), nullable=True)
    included_materials = Column(ARRAY(String), nullable=True)
    program = Column(JSON, nullable=True)  # Array of {time, activity}
    important_info = Column(ARRAY(String), nullable=True)
    privatization_enabled = Column(Boolean, default=False)
    privatization_min_participants = Column(Integer, nullable=True)
    privatization_max_participants = Column(Integer, nullable=True)
    privatization_base_price = Column(Numeric(10, 2), nullable=True)
    privatization_price_per_participant = Column(Numeric(10, 2), nullable=True)
    status = Column(Enum(WorkshopStatus), default="draft")
    admin_notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relations
    artisan = relationship("ArtisanProfile", back_populates="workshops")
    bookings = relationship("WorkshopBooking", back_populates="workshop")
    registrations = relationship("WorkshopRegistration", back_populates="workshop")

class WorkshopBooking(Base):
    __tablename__ = "workshop_bookings"
    
    id = Column(UUID, primary_key=True)
    workshop_id = Column(UUID, ForeignKey("workshops.id"), nullable=False)
    user_id = Column(UUID, ForeignKey("users.id"), nullable=False)
    date = Column(DateTime, nullable=False)
    time = Column(String, nullable=True)  # HH:MM format
    participants = Column(Integer, nullable=False)
    is_private = Column(Boolean, default=False)
    special_requirements = Column(Text, nullable=True)
    status = Column(Enum(BookingStatus), default="pending")
    payment_status = Column(Enum(PaymentStatus), default="pending")
    created_at = Column(DateTime, default=datetime.utcnow)
    
    workshop = relationship("Workshop", back_populates="bookings")
    user = relationship("User")

class WorkshopRegistration(Base):
    __tablename__ = "workshop_registrations"
    
    id = Column(UUID, primary_key=True)
    workshop_id = Column(UUID, ForeignKey("workshops.id"), nullable=False)
    user_id = Column(UUID, ForeignKey("users.id"), nullable=False)
    participants = Column(Integer, default=1)
    status = Column(Enum(RegistrationStatus), default="confirmed")
    payment_status = Column(Enum(PaymentStatus), default="pending")
    created_at = Column(DateTime, default=datetime.utcnow)
    
    workshop = relationship("Workshop", back_populates="registrations")
    user = relationship("User")
```

#### Logique métier

- **Validation disponibilité**: Vérifier indisponibilités artisan avant confirmation
- **Gestion participants**: Incrémenter `current_participants`, vérifier limites
- **Prix selon profil**: Calculer prix selon nationalité utilisateur (local = base_price, foreign = foreign_price)
- **Ateliers Artikidz**: Validation âge min/max, groupes spéciaux
- **Workflow validation**: Même principe que produits (draft → pending_approval → published)

---

## 4. Commandes & Paiements

### 🎯 Fonctionnalités Frontend détectées

**Pages concernées**: `Dashboard.tsx`, `ArtisanDashboard.tsx`, `PaymentTracker.tsx`, `DetailedOrderManager.tsx`

1. **Suivi commandes (Acheteur)**
   - Liste des commandes
   - Statuts: delivered, shipped, pending, in_production, ready_for_pickup
   - Modification dates (pickup, production end, delivery)

2. **Gestion commandes (Artisan)**
   - Liste commandes produits
   - Liste réservations ateliers
   - Mise à jour statuts
   - Informations livraison

3. **Suivi paiements (Admin)**
   - Historique paiements
   - Statuts: paid, partial, unpaid, pending_collection
   - Méthodes: Mobile Money, Virement, Espèces
   - Gestion acomptes et soldes

### 🔧 Besoins Backend à implémenter

#### Endpoints REST

**GET `/api/orders`**
- **Headers**: `Authorization: Bearer <token>`
- **Query params**: `status`, `page`, `limit`
- **Réponse**: Liste commandes utilisateur

**GET `/api/orders/{order_id}`**
- **Réponse**: Détails complets commande

**POST `/api/orders`** (Créer depuis panier)
- **Corps**:
```json
{
  "items": [
    {
      "product_id": "uuid (optional)",
      "workshop_id": "uuid (optional)",
      "quantity": 2,
      "price": 45000,
      "price_variation": {
        "type": "tourist",
        "discounted_price": 38000
      }
    }
  ],
  "payment_plan": {
    "type": "full" | "installment",
    "deposit_amount": 22500,
    "remaining_amount": 22500
  },
  "delivery_address": {
    "street": "string",
    "city": "string",
    "region": "string",
    "phone": "string"
  }
}
```

**PATCH `/api/orders/{order_id}`** (Artisan/Admin - dates)
- **Corps**:
```json
{
  "pickup_date": "datetime",
  "production_end_date": "datetime",
  "estimated_delivery_date": "datetime"
}
```

**PATCH `/api/orders/{order_id}/status`** (Artisan)
- **Corps**:
```json
{
  "status": "in_production" | "ready_for_pickup" | "shipped" | "delivered"
}
```

**GET `/api/orders/artisan/{artisan_id}`** (Artisan)
- **Réponse**: Commandes de l'artisan

**POST `/api/payments`**
- **Corps**:
```json
{
  "order_id": "uuid",
  "amount": 22500,
  "method": "mobile_money" | "bank_transfer" | "cash",
  "reference": "string (optional)",
  "note": "string (optional)"
}
```

**GET `/api/payments`** (Admin)
- **Query params**: `status`, `type` (product/workshop)
- **Réponse**: Liste paiements

**PATCH `/api/payments/{payment_id}`** (Admin)
- **Corps**:
```json
{
  "payment_status": "paid" | "partial" | "unpaid",
  "paid_amount": 50000,
  "remaining_amount": 25000
}
```

#### Schemas Pydantic

```python
class OrderCreate(BaseModel):
    items: List[OrderItemCreate]
    payment_plan: PaymentPlanCreate
    delivery_address: DeliveryAddress

class OrderOut(BaseModel):
    id: UUID
    buyer_id: UUID
    items: List[OrderItemOut]
    total_amount: float
    status: OrderStatus
    pickup_date: Optional[datetime] = None
    production_end_date: Optional[datetime] = None
    estimated_delivery_date: Optional[datetime] = None
    payment_status: PaymentStatus
    created_at: datetime
    updated_at: datetime

class PaymentOut(BaseModel):
    id: UUID
    order_id: Optional[UUID] = None
    workshop_booking_id: Optional[UUID] = None
    amount: float
    method: PaymentMethod
    status: PaymentStatus
    reference: Optional[str] = None
    note: Optional[str] = None
    created_at: datetime
```

#### Modèles SQLAlchemy

```python
class Order(Base):
    __tablename__ = "orders"
    
    id = Column(UUID, primary_key=True)
    buyer_id = Column(UUID, ForeignKey("users.id"), nullable=False)
    total_amount = Column(Numeric(10, 2), nullable=False)
    status = Column(Enum(OrderStatus), default="pending")
    pickup_date = Column(DateTime, nullable=True)
    production_end_date = Column(DateTime, nullable=True)
    estimated_delivery_date = Column(DateTime, nullable=True)
    payment_status = Column(Enum(PaymentStatus), default="pending")
    delivery_street = Column(String, nullable=True)
    delivery_city = Column(String, nullable=True)
    delivery_region = Column(String, nullable=True)
    delivery_phone = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    buyer = relationship("User", back_populates="orders")
    items = relationship("OrderItem", back_populates="order")
    payments = relationship("Payment", back_populates="order")

class OrderItem(Base):
    __tablename__ = "order_items"
    
    id = Column(UUID, primary_key=True)
    order_id = Column(UUID, ForeignKey("orders.id"), nullable=False)
    product_id = Column(UUID, ForeignKey("products.id"), nullable=True)
    workshop_id = Column(UUID, ForeignKey("workshops.id"), nullable=True)
    quantity = Column(Integer, nullable=False)
    unit_price = Column(Numeric(10, 2), nullable=False)
    total_price = Column(Numeric(10, 2), nullable=False)
    price_variation_type = Column(String, nullable=True)
    discount_applied = Column(Numeric(10, 2), nullable=True)
    
    order = relationship("Order", back_populates="items")
    product = relationship("Product", back_populates="order_items")

class Payment(Base):
    __tablename__ = "payments"
    
    id = Column(UUID, primary_key=True)
    order_id = Column(UUID, ForeignKey("orders.id"), nullable=True)
    workshop_booking_id = Column(UUID, ForeignKey("workshop_bookings.id"), nullable=True)
    amount = Column(Numeric(10, 2), nullable=False)
    method = Column(Enum(PaymentMethod), nullable=False)
    status = Column(Enum(PaymentStatus), default="pending")
    reference = Column(String, nullable=True)
    note = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    order = relationship("Order", back_populates="payments")
```

#### Logique métier

- **Calcul total commande**: Somme items avec variations prix
- **Gestion stock**: Décrémenter lors confirmation commande
- **Plans de paiement**: Installment (acompte + solde) ou full payment
- **Statuts commande**: Workflow `pending` → `in_production` → `ready_for_pickup` → `shipped` → `delivered`
- **Notifications**: Envoyer email/SMS lors changements statut

---

## 5. Panier

### 🎯 Fonctionnalités Frontend détectées

**Composants**: `CartContext.tsx`, `CartIcon.tsx`

1. **Gestion panier**
   - Ajout/suppression produits
   - Mise à jour quantités
   - Gestion variations prix
   - Plans de paiement
   - Calcul total
   - Groupement par artisan

2. **Types d'items**
   - Produits
   - Ateliers (avec date sélectionnée)
   - Abonnements

### 🔧 Besoins Backend à implémenter

#### Endpoints REST

**GET `/api/cart`**
- **Headers**: `Authorization: Bearer <token>`
- **Réponse**: `200 OK`
```json
{
  "items": [
    {
      "id": "uuid",
      "type": "product" | "workshop" | "subscription",
      "product_id": "uuid (optional)",
      "workshop_id": "uuid (optional)",
      "subscription_plan_id": "string (optional)",
      "name": "string",
      "artisan": "string",
      "price": 45000,
      "quantity": 2,
      "image": "url",
      "selected_date": "datetime (optional)",
      "price_variation": {
        "type": "tourist",
        "discounted_price": 38000
      }
    }
  ],
  "total": 90000
}
```

**POST `/api/cart/items`**
- **Corps**:
```json
{
  "type": "product",
  "product_id": "uuid",
  "quantity": 2,
  "price_variation": {
    "type": "local"
  }
}
```

**PATCH `/api/cart/items/{item_id}`**
- **Corps**:
```json
{
  "quantity": 3,
  "price_variation": {...},
  "payment_plan": {...}
}
```

**DELETE `/api/cart/items/{item_id}`**

**DELETE `/api/cart`** (Vider panier)

**POST `/api/cart/checkout`**
- **Réponse**: `201 Created` (Création commande)

#### Modèles SQLAlchemy

```python
class CartItem(Base):
    __tablename__ = "cart_items"
    
    id = Column(UUID, primary_key=True)
    user_id = Column(UUID, ForeignKey("users.id"), nullable=False)
    product_id = Column(UUID, ForeignKey("products.id"), nullable=True)
    workshop_id = Column(UUID, ForeignKey("workshops.id"), nullable=True)
    subscription_plan_id = Column(String, nullable=True)
    item_type = Column(Enum(CartItemType), nullable=False)
    quantity = Column(Integer, nullable=False)
    price = Column(Numeric(10, 2), nullable=False)
    price_variation_type = Column(String, nullable=True)
    selected_date = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    user = relationship("User", back_populates="cart_items")
    product = relationship("Product", back_populates="cart_items")
```

#### Logique métier

- **Persistance**: Sauvegarder panier en DB (pas seulement localStorage)
- **Synchronisation**: Mettre à jour prix/stock si changements produits
- **Expiration**: Nettoyer panier après X jours d'inactivité
- **Validation**: Vérifier disponibilité avant checkout

---

## 6. Profils Artisans

### 🎯 Fonctionnalités Frontend détectées

**Pages**: `ArtisanProfile.tsx`, `ArtisanProfileEditor.tsx`, `ArtisanStats.tsx`, `ArtisanAvailabilityCalendar.tsx`

1. **Profil public**
   - Informations artisan (nom, spécialité, localisation)
   - Produits
   - Ateliers
   - Avis clients

2. **Édition profil (Artisan)**
   - Mise à jour informations
   - Photos portfolio
   - Spécialités
   - Réseaux sociaux

3. **Statistiques (Artisan)**
   - Ventes totales
   - Commandes du mois
   - Note moyenne
   - Nombre produits

4. **Calendrier disponibilité**
   - Périodes d'indisponibilité
   - Raisons (congés, formations, etc.)
   - Validation admin

### 🔧 Besoins Backend à implémenter

#### Endpoints REST

**GET `/api/artisans`**
- **Query params**: `specialty`, `location`, `search`, `page`, `limit`
- **Réponse**: Liste artisans publiés

**GET `/api/artisans/{artisan_id}`**
- **Réponse**: Profil complet avec produits/ateliers/avis

**GET `/api/artisans/me`** (Artisan)
- **Réponse**: Son profil complet

**PATCH `/api/artisans/me`** (Artisan)
- **Corps**: Mise à jour profil

**GET `/api/artisans/me/stats`** (Artisan)
- **Réponse**:
```json
{
  "total_sales": 450000,
  "orders_this_month": 12,
  "rating": 4.8,
  "total_products": 24,
  "total_workshops": 8
}
```

**GET `/api/artisans/{artisan_id}/unavailability`**
- **Réponse**: Périodes indisponibilité

**POST `/api/artisans/me/unavailability`** (Artisan)
- **Corps**:
```json
{
  "start_date": "datetime",
  "end_date": "datetime (optional)",
  "reason": "string",
  "type": "single" | "range"
}
```

**DELETE `/api/artisans/me/unavailability/{period_id}`** (Artisan)

#### Modèles SQLAlchemy

```python
class UnavailabilityPeriod(Base):
    __tablename__ = "unavailability_periods"
    
    id = Column(UUID, primary_key=True)
    artisan_id = Column(UUID, ForeignKey("artisan_profiles.id"), nullable=False)
    start_date = Column(DateTime, nullable=False)
    end_date = Column(DateTime, nullable=True)  # None if type == "single"
    reason = Column(String, nullable=False)
    type = Column(Enum(UnavailabilityType), nullable=False)
    status = Column(Enum(PeriodStatus), default="pending_approval")
    admin_notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    artisan = relationship("ArtisanProfile", back_populates="unavailability_periods")
```

---

## 7. Abonnements & Crédits

### 🎯 Fonctionnalités Frontend détectées

**Composants**: `SubscriptionContext.tsx`, `SubscriptionManager.tsx`, `SubscriptionRegistrationForm.tsx`, `CreditTracker.tsx`

1. **Formules d'abonnement**
   - Explorateur: 1 mois, 3 crédits, 75,000 Ar
   - Artisan Apprenti: 2 mois, 4 crédits, 120,000 Ar (recommandé)
   - Créateur Curieux: 3 mois, 6 crédits, 180,000 Ar

2. **Gestion crédits**
   - Suivi crédits utilisés/disponibles
   - Historique utilisations
   - Utilisation pour ateliers inclus

3. **Inscription abonnement**
   - Sélection formule
   - Paiement
   - Activation crédits

### 🔧 Besoins Backend à implémenter

#### Endpoints REST

**GET `/api/subscriptions/plans`**
- **Réponse**: Liste formules disponibles

**GET `/api/subscriptions/me`** (User)
- **Réponse**: Abonnement actif si existe

**POST `/api/subscriptions`**
- **Corps**:
```json
{
  "plan_id": "explorateur" | "apprenti" | "createur"
}
```

**GET `/api/subscriptions/me/credits`** (User)
- **Réponse**:
```json
{
  "total": 3,
  "used": 1,
  "remaining": 2,
  "usages": [
    {
      "workshop_id": "uuid",
      "workshop_name": "string",
      "artisan": "string",
      "credits_used": 1,
      "used_date": "datetime"
    }
  ]
}
```

**POST `/api/subscriptions/use-credits`**
- **Corps**:
```json
{
  "workshop_id": "uuid",
  "credits_used": 1
}
```

#### Modèles SQLAlchemy

```python
class SubscriptionPlan(Base):
    __tablename__ = "subscription_plans"
    
    id = Column(String, primary_key=True)  # "explorateur", "apprenti", "createur"
    name = Column(String, nullable=False)
    duration_days = Column(Integer, nullable=False)
    credits = Column(Integer, nullable=False)
    price = Column(Numeric(10, 2), nullable=False)
    description = Column(Text, nullable=False)
    features = Column(ARRAY(String), nullable=True)
    recommended = Column(Boolean, default=False)

class Subscription(Base):
    __tablename__ = "subscriptions"
    
    id = Column(UUID, primary_key=True)
    user_id = Column(UUID, ForeignKey("users.id"), nullable=False)
    plan_id = Column(String, ForeignKey("subscription_plans.id"), nullable=False)
    credits_total = Column(Integer, nullable=False)
    credits_used = Column(Integer, default=0)
    start_date = Column(DateTime, nullable=False)
    end_date = Column(DateTime, nullable=False)
    is_active = Column(Boolean, default=True)
    auto_renew = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    user = relationship("User")
    plan = relationship("SubscriptionPlan")
    credit_usages = relationship("CreditUsage", back_populates="subscription")

class CreditUsage(Base):
    __tablename__ = "credit_usages"
    
    id = Column(UUID, primary_key=True)
    subscription_id = Column(UUID, ForeignKey("subscriptions.id"), nullable=False)
    workshop_id = Column(UUID, ForeignKey("workshops.id"), nullable=False)
    credits_used = Column(Integer, nullable=False)
    used_date = Column(DateTime, default=datetime.utcnow)
    
    subscription = relationship("Subscription", back_populates="credit_usages")
    workshop = relationship("Workshop")
```

---

## 8. Devis & Réservations

### 🎯 Fonctionnalités Frontend détectées

**Composants**: `QuoteRequestForm.tsx`, `QuoteRequestManager.tsx`, `QuoteStatusDisplay.tsx`, `CustomBookingRequest.tsx`

1. **Demande de devis**
   - Formulaire pour particuliers et entreprises
   - Informations: nombre participants, lieu, date/heure souhaitée
   - Besoins logistiques (repas, pause, jeux)
   - Calcul prix estimé
   - Gestion par admin (devis manuel)

2. **Gestion devis (Admin)**
   - Liste demandes en attente
   - Création devis avec prix final
   - Statuts: pending, quoted, approved, rejected, completed

### 🔧 Besoins Backend à implémenter

#### Endpoints REST

**POST `/api/quote-requests`**
- **Corps**:
```json
{
  "workshop_id": "uuid",
  "client_type": "particulier" | "entreprise",
  "client_info": {
    "name": "string",
    "email": "string",
    "phone": "string",
    "whatsapp": "string (optional)",
    "company": "string (optional)",
    "siret": "string (optional)"
  },
  "event_details": {
    "participants": 10,
    "location": "string",
    "custom_location": "string (optional)",
    "preferred_date": "datetime",
    "alternative_date": "datetime (optional)",
    "event_type": "string (optional)"
  },
  "special_requirements": "string (optional)",
  "logistical_needs": ["string (optional)"]
}
```

**GET `/api/quote-requests`** (Admin)
- **Query params**: `status`, `page`, `limit`

**GET `/api/quote-requests/{request_id}`** (Admin)

**PATCH `/api/quote-requests/{request_id}`** (Admin)
- **Corps**:
```json
{
  "final_price": 120000,
  "status": "quoted",
  "admin_notes": "string (optional)"
}
```

#### Modèles SQLAlchemy

```python
class QuoteRequest(Base):
    __tablename__ = "quote_requests"
    
    id = Column(UUID, primary_key=True)
    workshop_id = Column(UUID, ForeignKey("workshops.id"), nullable=False)
    client_type = Column(Enum(ClientType), nullable=False)
    client_name = Column(String, nullable=False)
    client_email = Column(String, nullable=False)
    client_phone = Column(String, nullable=False)
    client_whatsapp = Column(String, nullable=True)
    client_company = Column(String, nullable=True)
    client_siret = Column(String, nullable=True)
    participants = Column(Integer, nullable=False)
    location = Column(String, nullable=False)
    custom_location = Column(String, nullable=True)
    preferred_date = Column(DateTime, nullable=False)
    alternative_date = Column(DateTime, nullable=True)
    event_type = Column(String, nullable=True)
    special_requirements = Column(Text, nullable=True)
    estimated_price = Column(Numeric(10, 2), nullable=True)
    final_price = Column(Numeric(10, 2), nullable=True)
    status = Column(Enum(QuoteStatus), default="pending")
    admin_notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    workshop = relationship("Workshop")
```

---

## 9. Administration

### 🎯 Fonctionnalités Frontend détectées

**Page**: `AdminPanel.tsx`, `ValidationManager.tsx`, `WorkshopCalendar.tsx`

1. **Vue d'ensemble**
   - Statistiques (ventes produits/ateliers, artisans, commandes)
   - Activité récente
   - Calendrier ateliers à venir

2. **Validation**
   - Produits en attente
   - Ateliers en attente
   - Profils artisans en attente
   - Actions: approuver/rejeter avec notes

3. **Gestion artisans**
   - Liste artisans
   - Statuts
   - Actions rapides

4. **Gestion commandes**
   - Suivi toutes commandes
   - Paiements
   - Statistiques

5. **Devis manuels**
   - Traitement demandes

6. **Abonnements**
   - Liste abonnements actifs
   - Gestion renouvellements

### 🔧 Besoins Backend à implémenter

#### Endpoints REST

**GET `/api/admin/stats`**
- **Réponse**:
```json
{
  "total_product_sales": 2450000,
  "total_workshop_sales": 890000,
  "total_artisans": 23,
  "total_orders": 89,
  "pending_quotes": 7,
  "active_subscriptions": 45
}
```

**GET `/api/admin/products/pending`**
- **Réponse**: Produits en attente validation

**POST `/api/admin/products/{product_id}/validate`**
- **Corps**:
```json
{
  "action": "approve" | "reject",
  "admin_notes": "string (optional)"
}
```

**GET `/api/admin/workshops/pending`**
**POST `/api/admin/workshops/{workshop_id}/validate`**

**GET `/api/admin/artisans/pending`**
**POST `/api/admin/artisans/{artisan_id}/validate`**

**GET `/api/admin/orders`**
- **Query params**: `status`, `artisan_id`, `buyer_id`, `page`

**GET `/api/admin/payments`**
- **Query params**: `status`, `type`

**GET `/api/admin/subscriptions`**
- **Query params**: `status`, `page`

#### Logique métier

- **Permissions**: Vérifier rôle `admin` sur tous endpoints admin
- **Workflow validation**: Changer statut + notifier artisan
- **Notifications**: Email artisan lors validation/rejet

---

## 10. Recommandations

### 🎯 Fonctionnalités Frontend détectées

**Composants**: `ProductRecommendations.tsx`, `WorkshopRecommendations.tsx`, `SimilarProducts.tsx`, `useRecommendations.ts`

1. **Recommandations produits**
   - Basées sur catégorie, artisan, historique

2. **Recommandations ateliers**
   - Basées sur produits consultés/achetés

### 🔧 Besoins Backend à implémenter

#### Endpoints REST

**GET `/api/products/{product_id}/recommendations`**
- **Query params**: `limit` = 3
- **Réponse**: Produits similaires

**GET `/api/workshops/recommendations`**
- **Query params**: `category`, `user_id`, `limit`
- **Réponse**: Ateliers recommandés

#### Logique métier

- **Algorithmes**: Basé sur catégorie, artisan, matériaux similaires
- **Scoring**: Calculer `relevance_score` pour trier

---

## 11. Avis & Notes

### 🎯 Fonctionnalités Frontend détectées

**Composants**: `ProductReviews.tsx`

1. **Avis produits**
   - Affichage liste avis
   - Note moyenne
   - Détails par avis

### 🔧 Besoins Backend à implémenter

#### Endpoints REST

**GET `/api/products/{product_id}/reviews`**
- **Réponse**: Liste avis avec notes, commentaires, dates

**POST `/api/products/{product_id}/reviews`** (User ayant commandé)
- **Corps**:
```json
{
  "rating": 1-5,
  "comment": "text"
}
```

**GET `/api/products/{product_id}/rating`**
- **Réponse**: Note moyenne + nombre avis

#### Modèles SQLAlchemy

```python
class ProductReview(Base):
    __tablename__ = "product_reviews"
    
    id = Column(UUID, primary_key=True)
    product_id = Column(UUID, ForeignKey("products.id"), nullable=False)
    user_id = Column(UUID, ForeignKey("users.id"), nullable=False)
    rating = Column(Integer, nullable=False)  # 1-5
    comment = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    product = relationship("Product", back_populates="reviews")
    user = relationship("User")
```

#### Logique métier

- **Validation**: Seuls utilisateurs ayant commandé peuvent laisser avis
- **Calcul note**: Moyenne des ratings, mise à jour automatique

---

## 12. Notifications & Contact

### 🎯 Fonctionnalités Frontend détectées

**Pages**: `Contact.tsx`

1. **Formulaire contact**
   - Informations utilisateur
   - Type de demande
   - Message

### 🔧 Besoins Backend à implémenter

#### Endpoints REST

**POST `/api/contact`**
- **Corps**:
```json
{
  "name": "string",
  "email": "string",
  "phone": "string (optional)",
  "subject": "string",
  "inquiry_type": "string",
  "message": "text"
}
```

**Réponse**: `201 Created`

#### Logique métier

- **Email**: Envoyer notification admin
- **Stockage**: Sauvegarder message en DB pour historique

---

## 📊 Récapitulatif des modèles de base de données

### Relations principales

```
User
├── ArtisanProfile (OneToOne)
│   ├── Product (OneToMany)
│   ├── Workshop (OneToMany)
│   └── UnavailabilityPeriod (OneToMany)
├── Order (OneToMany)
│   └── OrderItem (OneToMany)
├── CartItem (OneToMany)
├── Subscription (OneToMany)
└── ProductReview (OneToMany)

Product
├── ProductImage (OneToMany)
├── OrderItem (OneToMany)
└── ProductReview (OneToMany)

Workshop
├── WorkshopBooking (OneToMany)
├── WorkshopRegistration (OneToMany)
└── QuoteRequest (OneToMany)

Subscription
└── CreditUsage (OneToMany)
```

---

## 🔐 Authentification & Autorisation

### JWT Configuration

- **Access Token**: 15 minutes
- **Refresh Token**: 7 jours
- **Algorithm**: HS256
- **Secret**: Variable d'environnement

### Permissions

1. **Public**: Catalogue produits/ateliers, pages info
2. **Buyer**: Commandes, panier, avis (si commandé)
3. **Artisan**: Gestion produits/ateliers/profil, stats
4. **Admin**: Validation, gestion globale, analytics

### Middleware à créer

- `verify_token`: Validation JWT
- `require_role`: Vérification rôle (buyer/artisan/admin)
- `require_ownership`: Vérification propriétaire ressource

---

## 🚀 Implémentation recommandée

### Structure FastAPI

```
Back/
├── app/
│   ├── main.py
│   ├── config.py
│   ├── database.py
│   ├── models/
│   │   ├── user.py
│   │   ├── product.py
│   │   ├── workshop.py
│   │   ├── order.py
│   │   └── ...
│   ├── schemas/
│   │   ├── user.py
│   │   ├── product.py
│   │   └── ...
│   ├── api/
│   │   ├── routes/
│   │   │   ├── auth.py
│   │   │   ├── products.py
│   │   │   ├── workshops.py
│   │   │   ├── orders.py
│   │   │   └── ...
│   │   └── dependencies.py
│   ├── services/
│   │   ├── auth_service.py
│   │   ├── product_service.py
│   │   └── ...
│   ├── utils/
│   │   ├── security.py
│   │   ├── storage.py
│   │   └── email.py
│   └── middleware.py
├── requirements.txt
└── .env
```

### Priorités d'implémentation

1. **Phase 1 - Base**
   - Authentification (login/register)
   - CRUD Produits
   - CRUD Ateliers
   - Panier basique

2. **Phase 2 - Commandes**
   - Commandes
   - Paiements
   - Notifications

3. **Phase 3 - Avancé**
   - Abonnements
   - Recommandations
   - Validation admin
   - Analytics

---

## ✅ Checklist validation

- [ ] Tous endpoints définis
- [ ] Tous schemas Pydantic créés
- [ ] Tous modèles SQLAlchemy créés
- [ ] Relations DB configurées
- [ ] Authentification JWT implémentée
- [ ] Permissions par rôle
- [ ] Upload fichiers (images)
- [ ] Gestion erreurs complète
- [ ] Tests unitaires
- [ ] Documentation API (Swagger)

---

**Fin du document**

