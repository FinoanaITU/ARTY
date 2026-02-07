from pydantic import BaseModel, EmailStr, Field, model_validator
from typing import Optional, List
from uuid import UUID
from datetime import datetime
from app.models.user import UserRole, BuyerType, Nationality, ProfileStatus


# ============ INPUT SCHEMAS ============

class BuyerRegisterIn(BaseModel):
    """
    Schema pour l'inscription d'un acheteur (particulier ou entreprise)
    
    Formulaire multi-étapes pour particuliers et entreprises:
    - Informations: nom, email, password, téléphone, adresse, ville, pays
    - Pour entreprises: nom entreprise, SIRET
    - Détection automatique du type de tarif (local/étranger) basée sur le pays
    """
    email: EmailStr
    password: str = Field(..., min_length=6, description="Mot de passe minimum 6 caractères")
    name: str = Field(..., min_length=2, max_length=200)
    phone: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    country: str = Field(default="madagascar", description="Pays de l'acheteur (détermine la nationalité)")
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
    offerings: List[str] = Field(..., description="Étape 5: ['products', 'workshops', 'both']")  # Étape 5: Offres
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


class LoginIn(BaseModel):
    """Schema pour la connexion"""
    email: EmailStr
    password: str = Field(..., min_length=1, description="Le mot de passe ne peut pas être vide")


class UserUpdate(BaseModel):
    """
    Schema pour la mise à jour du profil utilisateur.
    Tous les champs sont optionnels (mise à jour partielle).
    """
    email: Optional[EmailStr] = None
    phone: Optional[str] = Field(None, max_length=20)
    name: Optional[str] = Field(None, min_length=2, max_length=200)
    address: Optional[str] = None
    city: Optional[str] = Field(None, max_length=100)
    country: Optional[str] = Field(None, max_length=100)
    avatar: Optional[str] = Field(None, description="URL or UUID de l'avatar")
    company_name: Optional[str] = Field(None, max_length=200, description="Pour acheteurs entreprise")
    siret: Optional[str] = Field(None, max_length=50, description="Pour acheteurs entreprise")
    
    class Config:
        from_attributes = True


class ArtisanProfileUpdate(BaseModel):
    """
    Schema pour la mise à jour du profil artisan.
    Tous les champs sont optionnels.
    """
    region: Optional[str] = Field(None, max_length=100)
    languages: Optional[List[str]] = None
    company_name: Optional[str] = Field(None, min_length=1, max_length=200)
    main_specialty: Optional[str] = Field(None, max_length=100)
    other_skills: Optional[List[str]] = None
    years_experience: Optional[str] = Field(None, max_length=50)
    activity_description: Optional[str] = Field(None, min_length=10)
    brand_story: Optional[str] = None
    offerings: Optional[List[str]] = Field(None, description="['products', 'workshops', 'both']")
    nif: Optional[str] = Field(None, max_length=50)
    stat: Optional[str] = Field(None, max_length=50)
    documents_not_available: Optional[bool] = None
    about: Optional[str] = None
    location_region: Optional[str] = Field(None, max_length=100)
    location_city: Optional[str] = Field(None, max_length=100)
    location_address: Optional[str] = Field(None, max_length=200)
    experience: Optional[str] = Field(None, max_length=200)
    certifications: Optional[List[str]] = None
    awards: Optional[List[str]] = None
    social_media: Optional[dict] = None
    
    class Config:
        from_attributes = True


class UserWithArtisanUpdate(BaseModel):
    """
    Schema combiné pour mettre à jour User + ArtisanProfile en une seule requête.
    Utilisé pour l'endpoint PUT /users/me/artisan
    """
    user: Optional[UserUpdate] = None
    artisan_profile: Optional[ArtisanProfileUpdate] = None
    
    class Config:
        from_attributes = True


# ============ OUTPUT SCHEMAS ============

class ArtisanBasic(BaseModel):
    """Schema basique pour un artisan (utilisé dans d'autres schemas)"""
    id: UUID
    name: str
    specialty: Optional[str] = None
    
    class Config:
        from_attributes = True


class UserOut(BaseModel):
    """Schema de sortie pour un utilisateur"""
    id: UUID
    email: EmailStr
    name: str
    role: str  # String pour compatibilité JSON
    avatar: Optional[str] = None
    buyer_type: Optional[str] = None  # String pour compatibilité
    nationality: Optional[str] = None  # String pour compatibilité
    company_name: Optional[str] = None
    siret: Optional[str] = None
    specialty: Optional[str] = None  # Pour artisans
    description: Optional[str] = None  # Pour artisans
    experience: Optional[str] = None  # Pour artisans
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


class TokenOut(BaseModel):
    """Schema de réponse avec token JWT"""
    access_token: str
    token_type: str = "bearer"
    refresh_token: Optional[str] = None  # Optionnel pour compatibilité
    user: UserOut


class RefreshTokenIn(BaseModel):
    """Schema pour refresh token"""
    refresh_token: str


# ============ ARTISAN PROFILE SCHEMAS ============

class ArtisanProfileOut(BaseModel):
    """Schema de sortie pour le profil artisan"""
    id: UUID
    user_id: UUID
    company_name: str
    main_specialty: str
    other_skills: Optional[List[str]] = None
    years_experience: Optional[str] = None
    activity_description: str
    brand_story: Optional[str] = None
    offerings: Optional[List[str]] = None
    status: ProfileStatus
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


# ============ LEGACY SCHEMAS (pour compatibilité) ============

class UserBase(BaseModel):
    email: EmailStr
    name: str
    first_name: Optional[str] = None
    last_name: Optional[str] = None


class UserCreate(UserBase):
    password: str


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class Token(BaseModel):
    access_token: str
    token_type: str


class User(UserBase):
    id: UUID
    is_active: bool
    
    class Config:
        from_attributes = True
