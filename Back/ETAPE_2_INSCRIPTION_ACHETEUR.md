# Étape 2 : Inscription Acheteur

## 📋 Vue d'ensemble

Cette étape implémente l'inscription d'un acheteur (particulier ou entreprise) avec détection automatique du type de tarif selon la nationalité.

## 🎯 Fonctionnalités

### 1. Formulaire multi-étapes
- **Particuliers** : Informations personnelles de base
- **Entreprises** : Informations supplémentaires (nom entreprise, SIRET)

### 2. Champs requis
- **Communs** :
  - Nom (`name`)
  - Email (`email`)
  - Mot de passe (`password`) - minimum 6 caractères
  - Téléphone (`phone`) - optionnel
  - Adresse (`address`) - optionnel
  - Ville (`city`) - optionnel
  - Pays (`country`) - par défaut "madagascar"

- **Entreprises uniquement** :
  - Nom entreprise (`company_name`) - **requis** si `buyer_type = "entreprise"`
  - SIRET (`siret`) - optionnel

### 3. Détection automatique de la nationalité
- **Local** : Si `country === "madagascar"` → `nationality = "local"`
- **Étranger** : Si `country !== "madagascar"` → `nationality = "foreign"`

Cette détection détermine automatiquement le type de tarif appliqué lors des achats.

## 🔧 Implémentation

### Endpoint

**POST** `/api/v1/auth/register/buyer`

#### Corps de requête

```json
{
  "email": "acheteur@example.com",
  "password": "motdepasse123",
  "name": "Jean Dupont",
  "phone": "+261 34 12 345 67",
  "address": "123 Rue de l'Indépendance",
  "city": "Antananarivo",
  "country": "madagascar",
  "buyer_type": "particulier",
  "company_name": null,
  "siret": null
}
```

**Pour une entreprise** :
```json
{
  "email": "contact@entreprise.mg",
  "password": "motdepasse123",
  "name": "Marie Martin",
  "phone": "+261 34 12 345 67",
  "address": "456 Avenue de la République",
  "city": "Antananarivo",
  "country": "madagascar",
  "buyer_type": "entreprise",
  "company_name": "Artisanat Madagascar SARL",
  "siret": "12345678901234"
}
```

#### Réponse (201 Created)

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "acheteur@example.com",
    "name": "Jean Dupont",
    "role": "buyer",
    "avatar": null,
    "buyer_type": "particulier",
    "nationality": "local",
    "company_name": null,
    "siret": null,
    "specialty": null,
    "description": null,
    "experience": null,
    "created_at": "2024-01-15T10:30:00",
    "updated_at": "2024-01-15T10:30:00"
  }
}
```

### Schema Pydantic

**Fichier** : `Back/app/schemas/user.py`

```python
class BuyerRegisterIn(BaseModel):
    """
    Schema pour l'inscription d'un acheteur (particulier ou entreprise)
    
    Formulaire multi-étapes pour particuliers et entreprises:
    - Informations: nom, email, password, téléphone, adresse, ville, pays
    - Pour entreprises: nom entreprise, SIRET
    - Détection automatique du type de tarif (local/étranger) basée sur le pays
    """
    email: EmailStr
    password: str = Field(..., min_length=6)
    name: str = Field(..., min_length=2, max_length=200)
    phone: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    country: str = Field(default="madagascar")
    buyer_type: BuyerType = BuyerType.PARTICULIER
    company_name: Optional[str] = None
    siret: Optional[str] = None
    
    @model_validator(mode='after')
    def validate_company_fields(self):
        """Valide que les champs entreprise sont remplis si buyer_type est ENTREPRISE"""
        if self.buyer_type == BuyerType.ENTREPRISE:
            if not self.company_name or not self.company_name.strip():
                raise ValueError("company_name est requis pour les entreprises")
        return self
```

### Service d'authentification

**Fichier** : `Back/app/services/auth.py`

```python
@staticmethod
def detect_nationality(country: str) -> Nationality:
    """Détecte la nationalité selon le pays"""
    if country.lower() == "madagascar":
        return Nationality.LOCAL
    return Nationality.FOREIGN

@staticmethod
def create_buyer(db: Session, buyer_data: BuyerRegisterIn) -> User:
    """Crée un utilisateur acheteur"""
    # Vérifier si l'email existe déjà
    existing_user = db.query(User).filter(User.email == buyer_data.email).first()
    if existing_user:
        raise ValueError("Un compte avec cet email existe déjà")
    
    # Détecter la nationalité automatiquement
    nationality = AuthService.detect_nationality(buyer_data.country)
    
    # Créer l'utilisateur
    user = User(
        email=buyer_data.email,
        password_hash=get_password_hash(buyer_data.password),
        name=buyer_data.name,
        phone=buyer_data.phone,
        address=buyer_data.address,
        city=buyer_data.city,
        country=buyer_data.country,
        role=UserRole.BUYER,
        buyer_type=buyer_data.buyer_type,
        nationality=nationality,  # Détection automatique
        company_name=buyer_data.company_name if buyer_data.buyer_type == BuyerType.ENTREPRISE else None,
        siret=buyer_data.siret if buyer_data.buyer_type == BuyerType.ENTREPRISE else None,
        is_active=True,
        is_email_verified=False
    )
    
    db.add(user)
    db.commit()
    db.refresh(user)
    
    return user
```

### Endpoint API

**Fichier** : `Back/app/api/v1/endpoints/auth.py`

```python
@router.post("/register/buyer", response_model=TokenOut, status_code=status.HTTP_201_CREATED)
async def register_buyer(
    buyer_data: BuyerRegisterIn,
    db: Session = Depends(get_db)
):
    """
    Inscription d'un nouvel acheteur (particulier ou entreprise)
    
    - Détection automatique de la nationalité selon le pays
    - Validation des champs entreprise si buyer_type = "entreprise"
    - Génération automatique des tokens JWT
    """
    try:
        user = auth_service.create_buyer(db, buyer_data)
        tokens = auth_service.generate_tokens(user)
        
        # Préparer la réponse avec les données utilisateur
        user_dict = {
            "id": str(user.id),
            "email": user.email,
            "name": user.name,
            "role": user.role.value,
            "avatar": user.avatar,
            "buyer_type": user.buyer_type.value if user.buyer_type else None,
            "nationality": user.nationality.value if user.nationality else None,
            "company_name": user.company_name,
            "siret": user.siret,
            "specialty": None,
            "description": None,
            "experience": None,
            "created_at": user.created_at,
            "updated_at": user.updated_at,
        }
        
        user_out = UserOut(**user_dict)
        
        return TokenOut(
            access_token=tokens["access_token"],
            refresh_token=tokens.get("refresh_token"),
            token_type=tokens.get("token_type", "bearer"),
            user=user_out
        )
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
```

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

4. **Entreprise** :
   - Si `buyer_type = "entreprise"`, `company_name` est **obligatoire**
   - `siret` reste optionnel même pour les entreprises

5. **Nationalité** :
   - Détectée automatiquement selon le pays
   - Pas de validation manuelle requise

### Gestion des erreurs

| Code | Description |
|------|-------------|
| 201 | Inscription réussie |
| 400 | Email déjà existant ou validation échouée |
| 422 | Données invalides (format email, champs manquants, etc.) |

## 🧪 Tests

### Tests unitaires

**Fichier** : `Back/tests/test_auth_api.py`

- ✅ Inscription particulier réussie
- ✅ Inscription entreprise réussie
- ✅ Détection nationalité locale (Madagascar)
- ✅ Détection nationalité étrangère
- ✅ Validation champs entreprise
- ✅ Email dupliqué
- ✅ Champs requis manquants
- ✅ Format email invalide

### Exemple de test

```python
def test_register_buyer_particulier_success(
    self, client: TestClient, db: Session, test_buyer_data: dict
):
    """Test d'inscription réussie d'un acheteur particulier"""
    response = client.post(
        "/api/v1/auth/register/buyer",
        json=test_buyer_data
    )
    
    assert response.status_code == status.HTTP_201_CREATED
    data = response.json()
    
    assert "access_token" in data
    assert "user" in data
    assert data["user"]["nationality"] == "local"
    
    # Vérifier dans la base de données
    user = db.query(User).filter(User.email == test_buyer_data["email"]).first()
    assert user.nationality == Nationality.LOCAL
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
| `city` | String | Ville (optionnel) |
| `country` | String | Pays (défaut: "madagascar") |
| `role` | Enum | "buyer" |
| `buyer_type` | Enum | "particulier" ou "entreprise" |
| `nationality` | Enum | "local" ou "foreign" (détecté automatiquement) |
| `company_name` | String | Nom entreprise (si entreprise) |
| `siret` | String | SIRET (si entreprise) |
| `is_active` | Boolean | Compte actif |
| `is_email_verified` | Boolean | Email vérifié |

## 🔐 Sécurité

1. **Hashage des mots de passe** : Utilisation de `bcrypt` via `passlib`
2. **Validation email** : Format et unicité vérifiés
3. **Tokens JWT** : Génération automatique avec expiration
4. **Validation des données** : Pydantic pour la validation des schémas

## 🚀 Utilisation

### Exemple avec curl

```bash
curl -X POST "http://localhost:8000/api/v1/auth/register/buyer" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "acheteur@example.com",
    "password": "motdepasse123",
    "name": "Jean Dupont",
    "phone": "+261 34 12 345 67",
    "city": "Antananarivo",
    "country": "madagascar",
    "buyer_type": "particulier"
  }'
```

### Exemple avec Python

```python
import requests

response = requests.post(
    "http://localhost:8000/api/v1/auth/register/buyer",
    json={
        "email": "acheteur@example.com",
        "password": "motdepasse123",
        "name": "Jean Dupont",
        "phone": "+261 34 12 345 67",
        "city": "Antananarivo",
        "country": "madagascar",
        "buyer_type": "particulier"
    }
)

if response.status_code == 201:
    data = response.json()
    access_token = data["access_token"]
    user = data["user"]
    print(f"Utilisateur créé : {user['name']}")
    print(f"Nationalité détectée : {user['nationality']}")
```

## 📝 Notes importantes

1. **Détection automatique** : La nationalité est toujours détectée automatiquement selon le pays. Pas besoin de la spécifier manuellement.

2. **Champs entreprise** : Si `buyer_type = "entreprise"`, le champ `company_name` devient obligatoire. Le système valide automatiquement cette condition.

3. **Pays par défaut** : Si le pays n'est pas spécifié, il est défini à "madagascar" par défaut, ce qui donne `nationality = "local"`.

4. **Tokens** : Les tokens JWT sont générés automatiquement lors de l'inscription. L'utilisateur est immédiatement authentifié.

5. **Compatibilité** : Le système fonctionne avec SQLite (tests) et PostgreSQL (production).

## ✅ Checklist de validation

- [x] Endpoint `/api/v1/auth/register/buyer` implémenté
- [x] Schema `BuyerRegisterIn` avec validation
- [x] Détection automatique de la nationalité
- [x] Validation des champs entreprise
- [x] Génération des tokens JWT
- [x] Tests unitaires complets
- [x] Gestion des erreurs
- [x] Documentation API (Swagger)
- [x] Compatibilité SQLite/PostgreSQL

---

**Date de création** : 2024-01-15  
**Dernière mise à jour** : 2024-01-15  
**Statut** : ✅ Implémenté et testé

