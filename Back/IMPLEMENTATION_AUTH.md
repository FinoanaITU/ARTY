# Module Authentification & Utilisateurs - Implémentation

## ✅ Statut: COMPLÉTÉ

### Ce qui a été implémenté

#### 1. **Modèles SQLAlchemy** (`app/models/user.py`)

- ✅ **User** - Modèle utilisateur principal avec:
  - Rôles (buyer, artisan, admin)
  - Champs spécifiques aux acheteurs (buyer_type, nationality, company_name, siret)
  - Relations avec ArtisanProfile, Order, CartItem, UserSession

- ✅ **ArtisanProfile** - Profil détaillé des artisans avec:
  - Informations professionnelles (spécialité, expérience, compétences)
  - Statuts de validation (draft, pending_approval, published, rejected)
  - Documents administratifs (NIF, STAT)
  - Relations avec photos, produits, ateliers, périodes d'indisponibilité

- ✅ **ArtisanPhoto** - Photos des artisans (max 5)

- ✅ **Enums** - UserRole, BuyerType, Nationality, ProfileStatus

#### 2. **Schemas Pydantic** (`app/schemas/user.py`)

- ✅ **BuyerRegisterIn** - Schema d'inscription acheteur
- ✅ **ArtisanRegisterIn** - Schema d'inscription artisan
- ✅ **LoginIn** - Schema de connexion
- ✅ **UserOut** - Schema de sortie utilisateur
- ✅ **TokenOut** - Schema de réponse avec token JWT
- ✅ **RefreshTokenIn** - Schema pour refresh token

#### 3. **Services** 

- ✅ **AuthService** (`app/services/auth.py`):
  - `create_buyer()` - Création utilisateur acheteur
  - `create_artisan()` - Création utilisateur artisan avec photos
  - `authenticate()` - Authentification email/password
  - `generate_tokens()` - Génération tokens JWT (access + refresh)
  - `verify_token()` - Vérification token
  - `get_current_user()` - Récupération utilisateur depuis token
  - `detect_nationality()` - Détection automatique nationalité

- ✅ **StorageService** (`app/services/storage.py`):
  - Upload fichiers (photos artisans)
  - Validation extensions
  - Gestion taille maximale

#### 4. **Endpoints REST** (`app/api/v1/endpoints/auth.py`)

- ✅ **POST `/api/v1/auth/register/buyer`**
  - Inscription acheteur (particulier ou entreprise)
  - Retourne token + données utilisateur

- ✅ **POST `/api/v1/auth/register/artisan`**
  - Inscription artisan avec upload photos (max 5)
  - Formulaire multipart
  - Création profil artisan avec statut `pending_approval`

- ✅ **POST `/api/v1/auth/login`**
  - Connexion email/password
  - Retourne access_token + refresh_token + données utilisateur

- ✅ **GET `/api/v1/auth/me`**
  - Récupère infos utilisateur connecté
  - Nécessite authentification

- ✅ **POST `/api/v1/auth/refresh`**
  - Rafraîchit le token d'accès

- ✅ **POST `/api/v1/auth/logout`**
  - Déconnexion (placeholder pour invalidation future)

#### 5. **Sécurité** (`app/core/security.py`)

- ✅ Hashage mots de passe (bcrypt)
- ✅ Création tokens JWT (access + refresh)
- ✅ Vérification tokens

#### 6. **Dépendances FastAPI** (`app/api/deps.py`)

- ✅ `get_current_user` - Récupère utilisateur depuis token
- ✅ `get_current_active_user` - Vérifie que l'utilisateur est actif
- ✅ `require_role()` - Vérifie le rôle de l'utilisateur
- ✅ `RequireBuyer`, `RequireArtisan`, `RequireAdmin` - Dépendances rapides

### Fonctionnalités clés

1. **Détection automatique de nationalité**
   - Si `country == "madagascar"` → `nationality = "local"`
   - Sinon → `nationality = "foreign"`

2. **Validation workflow artisan**
   - Statut initial: `pending_approval`
   - Admin doit valider pour passer à `published`

3. **Upload photos artisan**
   - Maximum 5 photos
   - Formats: jpg, jpeg, png, webp
   - Stockage dans `static/uploads/artisans/`

4. **Tokens JWT**
   - Access token: 30 minutes (configurable)
   - Refresh token: 7 jours (configurable)
   - Type de token dans payload pour différencier access/refresh

### Structure des URLs

```
POST   /api/v1/auth/register/buyer    - Inscription acheteur
POST   /api/v1/auth/register/artisan  - Inscription artisan
POST   /api/v1/auth/login             - Connexion
GET    /api/v1/auth/me                - Infos utilisateur connecté
POST   /api/v1/auth/refresh           - Rafraîchir token
POST   /api/v1/auth/logout            - Déconnexion
```

### Prochaines étapes

1. **Migration Alembic** - Créer la migration pour les nouvelles tables
2. **Tests** - Tests unitaires et d'intégration
3. **Email verification** - Implémenter vérification email
4. **Password reset** - Implémenter réinitialisation mot de passe
5. **Refresh token storage** - Optionnel: stocker refresh tokens en DB

### Notes

- Les photos sont stockées en local pour l'instant (peut être migré vers S3 plus tard)
- Les tokens refresh ne sont pas invalidés côté serveur (stateless JWT)
- Pour une invalidation complète, il faudrait stocker les tokens en DB

### Fichiers modifiés/créés

- ✅ `Back/app/models/user.py` - Modèles mis à jour
- ✅ `Back/app/schemas/user.py` - Schemas créés
- ✅ `Back/app/services/auth.py` - Service auth créé
- ✅ `Back/app/services/storage.py` - Service storage créé
- ✅ `Back/app/api/v1/endpoints/auth.py` - Endpoints créés
- ✅ `Back/app/api/deps.py` - Dépendances créées
- ✅ `Back/app/core/security.py` - Sécurité améliorée

