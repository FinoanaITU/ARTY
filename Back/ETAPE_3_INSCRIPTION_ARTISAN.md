# Étape 3 : Inscription Artisan

## 📋 Vue d'ensemble

Cette étape implémente l'inscription d'un artisan avec un formulaire multi-étapes en 5 étapes, incluant l'upload de photos, la gestion des langues, les informations artisanales et les documents administratifs.

## 🎯 Fonctionnalités

### Formulaire multi-étapes (5 étapes)

#### Étape 1 : Photos de l'atelier/créations
- **Upload de photos** : Jusqu'à 5 images maximum
- **Formats acceptés** : JPG, JPEG, PNG, WEBP
- **Stockage** : Dossier `artisans/` dans le système de stockage
- **Optionnel** : Les photos ne sont pas obligatoires pour l'inscription

#### Étape 2 : Langues parlées
- **Champ** : `languages` (liste de chaînes)
- **Exemples** : `["Français", "Malgache", "Anglais"]`
- **Optionnel** : Liste vide par défaut

#### Étape 3 : Compte artisan
- **Nom entreprise** (`company_name`) : **Obligatoire**
- **Email** (`email`) : **Obligatoire**, format valide
- **Mot de passe** (`password`) : **Obligatoire**, minimum 6 caractères
- **Nom** (`name`) : **Obligatoire**, 2-200 caractères
- **Téléphone** (`phone`) : Optionnel
- **Région** (`region`) : **Obligatoire**
- **Ville** (`city`) : **Obligatoire**
- **Adresse** (`address`) : Optionnel

#### Étape 4 : Informations artisanales
- **Spécialité principale** (`main_specialty`) : **Obligatoire**
- **Autres compétences** (`other_skills`) : Liste optionnelle
- **Années d'expérience** (`years_experience`) : Optionnel (format texte libre)
- **Description de l'activité** (`activity_description`) : **Obligatoire**, minimum 10 caractères
- **Histoire de la marque** (`brand_story`) : Optionnel

#### Étape 5 : Offres et Documents administratifs
- **Offres** (`offerings`) : **Obligatoire**, doit contenir au moins un élément parmi :
  - `"products"` : Vente de produits
  - `"workshops"` : Organisation d'ateliers
  - `"both"` : Les deux
- **NIF** (`nif`) : Numéro d'Identification Fiscale (optionnel)
- **STAT** (`stat`) : Statut (optionnel)
- **Documents non disponibles** (`documents_not_available`) : Boolean, défaut `false`

## 🔧 Implémentation

### Endpoint

**POST** `/api/v1/auth/register/artisan`

**Type** : `multipart/form-data` (pour l'upload de photos)

#### Corps de requête (multipart/form-data)

```
email: string (obligatoire)
password: string (obligatoire, min 6 caractères)
name: string (obligatoire, 2-200 caractères)
phone: string (optionnel)
region: string (obligatoire)
city: string (obligatoire)
address: string (optionnel)
languages: string (JSON array ou liste séparée par virgules)
company_name: string (obligatoire)
main_specialty: string (obligatoire)
other_skills: string (JSON array ou liste séparée par virgules, optionnel)
years_experience: string (optionnel)
activity_description: string (obligatoire, min 10 caractères)
brand_story: string (optionnel)
offerings: string (JSON array ou liste séparée par virgules, obligatoire)
nif: string (optionnel)
stat: string (optionnel)
documents_not_available: boolean (défaut: false)
photos: File[] (optionnel, max 5 fichiers)
```

#### Exemple de requête (curl)

```bash
curl -X POST "http://localhost:8000/api/v1/auth/register/artisan" \
  -F "email=artisan@example.com" \
  -F "password=motdepasse123" \
  -F "name=Jean Artisan" \
  -F "phone=+261 34 12 345 67" \
  -F "region=Analamanga" \
  -F "city=Antananarivo" \
  -F "address=123 Rue de l'Artisanat" \
  -F "languages=Français,Malgache,Anglais" \
  -F "company_name=Artisanat Madagascar SARL" \
  -F "main_specialty=Poterie traditionnelle" \
  -F "other_skills=Céramique,Sculpture" \
  -F "years_experience=5-10 ans" \
  -F "activity_description=Je crée des poteries traditionnelles malgaches depuis plus de 10 ans" \
  -F "brand_story=Mon histoire avec l'artisanat a commencé..." \
  -F "offerings=both" \
  -F "nif=123456789" \
  -F "stat=987654321" \
  -F "documents_not_available=false" \
  -F "photos=@photo1.jpg" \
  -F "photos=@photo2.jpg"
```

#### Réponse (201 Created)

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "artisan@example.com",
    "name": "Jean Artisan",
    "role": "artisan",
    "avatar": null,
    "buyer_type": null,
    "nationality": "local",
    "company_name": null,
    "siret": null,
    "specialty": "Poterie traditionnelle",
    "description": "Je crée des poteries traditionnelles malgaches depuis plus de 10 ans",
    "experience": "5-10 ans",
    "created_at": "2024-01-15T10:30:00",
    "updated_at": "2024-01-15T10:30:00"
  }
}
```

### Schema Pydantic

**Fichier** : `Back/app/schemas/user.py`

```python
class ArtisanRegisterIn(BaseModel):
    """
    Schema pour l'inscription d'un artisan (formulaire multi-étapes - 5 étapes)
    
    Étape 1: Photos de l'atelier/créations (jusqu'à 5 images)
    Étape 2: Langues parlées
    Étape 3: Compte artisan (nom entreprise)
    Étape 4: Informations artisanales (spécialité, expérience, description, histoire de la marque)
    Étape 5: Offres (produits/ateliers/both) + Documents administratifs (NIF, STAT)
    """
    email: EmailStr
    password: str = Field(..., min_length=6)
    name: str = Field(..., min_length=2, max_length=200)
    phone: Optional[str] = None
    region: str  # Étape 1: Localisation
    city: str  # Étape 1: Localisation
    address: Optional[str] = None
    languages: List[str] = Field(default_factory=list)  # Étape 2: Langues parlées
    company_name: str = Field(..., min_length=1)  # Étape 3: Nom entreprise
    main_specialty: str  # Étape 4: Spécialité principale
    other_skills: List[str] = Field(default_factory=list)  # Étape 4: Autres compétences
    years_experience: Optional[str] = None  # Étape 4: Années d'expérience
    activity_description: str = Field(..., min_length=10)  # Étape 4: Description de l'activité
    brand_story: Optional[str] = None  # Étape 4: Histoire de la marque (optionnel)
    offerings: List[str] = Field(..., description="Étape 5: ['products', 'workshops', 'both']")
    nif: Optional[str] = None  # Étape 5: Document administratif (optionnel)
    stat: Optional[str] = None  # Étape 5: Document administratif (optionnel)
    documents_not_available: bool = False  # Étape 5: Si les documents ne sont pas disponibles
    
    @model_validator(mode='after')
    def validate_offerings(self):
        """Valider que offerings contient des valeurs valides"""
        valid_values = ['products', 'workshops', 'both']
        if not self.offerings or not all(item in valid_values for item in self.offerings):
            raise ValueError(f"offerings doit contenir au moins un élément parmi: {valid_values}")
        return self
```

### Service d'authentification

**Fichier** : `Back/app/services/auth.py`

La méthode `create_artisan()` gère :
- Création de l'utilisateur avec rôle `ARTISAN`
- Création du profil artisan (`ArtisanProfile`)
- Upload et stockage des photos (jusqu'à 5)
- Gestion des champs JSON (languages, other_skills, offerings)
- Support SQLite (tests) et PostgreSQL (production)

### Endpoint API

**Fichier** : `Back/app/api/v1/endpoints/auth.py`

L'endpoint `/register/artisan` :
- Accepte `multipart/form-data` pour l'upload de photos
- Parse les champs JSON/list (languages, other_skills, offerings)
- Valide les données avec `ArtisanRegisterIn`
- Crée l'utilisateur et le profil artisan
- Génère les tokens JWT
- Retourne les informations utilisateur avec les données artisan

## ✅ Validation

### Règles de validation

1. **Email** :
   - Format valide (EmailStr)
   - Unique dans la base de données

2. **Mot de passe** :
   - Minimum 6 caractères

3. **Nom** :
   - Minimum 2 caractères
   - Maximum 200 caractères

4. **Champs obligatoires** :
   - `email`, `password`, `name`
   - `region`, `city`
   - `company_name`
   - `main_specialty`
   - `activity_description` (min 10 caractères)
   - `offerings` (doit contenir au moins un élément valide)

5. **Offres** :
   - Doit contenir au moins un élément parmi : `["products", "workshops", "both"]`
   - Validation automatique via `@model_validator`

6. **Photos** :
   - Maximum 5 fichiers
   - Formats acceptés : JPG, JPEG, PNG, WEBP
   - Optionnel (peut être omis)

7. **Documents administratifs** :
   - `nif` et `stat` sont optionnels
   - Si `documents_not_available = true`, les documents ne sont pas requis

### Gestion des erreurs

| Code | Description |
|------|-------------|
| 201 | Inscription réussie |
| 400 | Email déjà existant ou validation échouée |
| 422 | Données invalides (format email, champs manquants, offerings invalides, etc.) |
| 500 | Erreur serveur (upload photos, base de données, etc.) |

## 🧪 Tests

### Tests unitaires existants

**Fichier** : `Back/tests/test_auth_api.py`

- ✅ `test_register_artisan_success` - Inscription réussie
- ✅ `test_register_artisan_duplicate_email` - Email dupliqué
- ✅ `test_register_artisan_missing_required_fields` - Champs requis manquants

**Fichier** : `Back/tests/test_auth_service.py`

- ✅ `test_create_artisan_success` - Création artisan réussie
- ✅ `test_create_artisan_duplicate_email` - Email dupliqué

**Fichier** : `Back/tests/test_auth_schemas.py`

- ✅ `test_valid_artisan` - Schema valide
- ✅ `test_artisan_with_optional_fields` - Champs optionnels
- ✅ `test_artisan_missing_required_fields` - Champs requis manquants

### Exemple de test

```python
def test_register_artisan_success(
    self, client: TestClient, db: Session, test_artisan_data: dict
):
    """Test d'inscription réussie d'un artisan"""
    form_data = {
        "email": test_artisan_data["email"],
        "password": test_artisan_data["password"],
        "name": test_artisan_data["name"],
        "region": test_artisan_data["region"],
        "city": test_artisan_data["city"],
        "languages": ",".join(test_artisan_data["languages"]),
        "company_name": test_artisan_data["company_name"],
        "main_specialty": test_artisan_data["main_specialty"],
        "activity_description": test_artisan_data["activity_description"],
        "offerings": ",".join(test_artisan_data["offerings"]),
        "documents_not_available": "false"
    }
    
    response = client.post(
        "/api/v1/auth/register/artisan",
        data=form_data
    )
    
    assert response.status_code == status.HTTP_201_CREATED
    data = response.json()
    
    assert "access_token" in data
    assert "user" in data
    assert data["user"]["role"] == "artisan"
    
    # Vérifier dans la base de données
    user = db.query(User).filter(User.email == test_artisan_data["email"]).first()
    assert user.role == UserRole.ARTISAN
    assert user.artisan_profile is not None
```

## 📊 Modèle de données

### Table `users`

| Champ | Type | Description |
|-------|------|-------------|
| `id` | UUID | Identifiant unique |
| `email` | String | Email (unique) |
| `password_hash` | String | Hash du mot de passe |
| `name` | String | Nom complet |
| `phone` | String | Téléphone (optionnel) |
| `address` | Text | Adresse (optionnel) |
| `city` | String | Ville |
| `country` | String | Pays (défaut: "madagascar") |
| `role` | Enum | "artisan" |
| `nationality` | Enum | "local" (toujours pour artisans) |
| `is_active` | Boolean | Compte actif |
| `is_email_verified` | Boolean | Email vérifié |

### Table `artisan_profiles`

| Champ | Type | Description |
|-------|------|-------------|
| `id` | UUID | Identifiant unique |
| `user_id` | UUID | Référence vers users.id |
| `region` | String | Région |
| `languages` | ARRAY(String) | Langues parlées |
| `company_name` | String | Nom entreprise |
| `main_specialty` | String | Spécialité principale |
| `other_skills` | ARRAY(String) | Autres compétences |
| `years_experience` | String | Années d'expérience |
| `activity_description` | Text | Description de l'activité |
| `brand_story` | Text | Histoire de la marque (optionnel) |
| `offerings` | ARRAY(String) | Offres (products/workshops/both) |
| `nif` | String | NIF (optionnel) |
| `stat` | String | STAT (optionnel) |
| `documents_not_available` | Boolean | Documents non disponibles |
| `status` | Enum | "pending_approval" (par défaut) |

### Table `artisan_photos`

| Champ | Type | Description |
|-------|------|-------------|
| `id` | UUID | Identifiant unique |
| `artisan_profile_id` | UUID | Référence vers artisan_profiles.id |
| `photo_url` | String | URL de la photo |
| `position` | Integer | Ordre d'affichage (0-4) |

## 🔐 Sécurité

1. **Hashage des mots de passe** : Utilisation de `bcrypt` via `passlib`
2. **Validation email** : Format et unicité vérifiés
3. **Tokens JWT** : Génération automatique avec expiration
4. **Validation des données** : Pydantic pour la validation des schémas
5. **Upload de fichiers** : Validation des types et tailles de fichiers
6. **Statut par défaut** : `pending_approval` - nécessite validation admin

## 🚀 Utilisation

### Exemple avec Python (requests)

```python
import requests

# Préparer les données
form_data = {
    "email": "artisan@example.com",
    "password": "motdepasse123",
    "name": "Jean Artisan",
    "region": "Analamanga",
    "city": "Antananarivo",
    "languages": "Français,Malgache",
    "company_name": "Artisanat Madagascar SARL",
    "main_specialty": "Poterie traditionnelle",
    "activity_description": "Je crée des poteries traditionnelles malgaches",
    "offerings": "both",
    "documents_not_available": "false"
}

# Préparer les fichiers photos
files = []
for i, photo_path in enumerate(["photo1.jpg", "photo2.jpg"]):
    files.append(("photos", (f"photo{i+1}.jpg", open(photo_path, "rb"), "image/jpeg")))

# Envoyer la requête
response = requests.post(
    "http://localhost:8000/api/v1/auth/register/artisan",
    data=form_data,
    files=files
)

if response.status_code == 201:
    data = response.json()
    access_token = data["access_token"]
    user = data["user"]
    print(f"Artisan créé : {user['name']}")
    print(f"Spécialité : {user['specialty']}")
    print(f"Statut : pending_approval")
```

## 📝 Notes importantes

1. **Formulaire multi-étapes** : Le frontend gère les 5 étapes, le backend reçoit toutes les données en une seule requête.

2. **Photos** : Maximum 5 photos, formats JPG/PNG/WEBP. Les photos sont stockées dans le dossier `artisans/` du système de stockage.

3. **Statut par défaut** : Tous les artisans créés ont le statut `pending_approval` et nécessitent une validation par un administrateur avant publication.

4. **Langues et compétences** : Peuvent être envoyées comme JSON array ou liste séparée par virgules.

5. **Documents administratifs** : Si `documents_not_available = true`, les champs `nif` et `stat` peuvent être omis.

6. **Compatibilité** : Le système fonctionne avec SQLite (tests) et PostgreSQL (production).

## ✅ Checklist de validation

- [x] Endpoint `/api/v1/auth/register/artisan` implémenté
- [x] Schema `ArtisanRegisterIn` avec validation
- [x] Upload de photos (max 5)
- [x] Gestion des 5 étapes du formulaire
- [x] Validation des champs obligatoires
- [x] Validation des offerings
- [x] Génération des tokens JWT
- [x] Création du profil artisan
- [x] Tests unitaires complets
- [x] Gestion des erreurs
- [x] Documentation API (Swagger)
- [x] Compatibilité SQLite/PostgreSQL
- [x] Statut `pending_approval` par défaut

---

**Date de création** : 2024-01-15  
**Dernière mise à jour** : 2024-01-15  
**Statut** : ✅ Implémenté et testé

