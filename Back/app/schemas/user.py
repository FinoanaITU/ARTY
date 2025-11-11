from pydantic import BaseModel, EmailStr, Field, validator
from typing import Optional, List
from uuid import UUID
from datetime import datetime
from app.models.user import UserRole, BuyerType, Nationality, ProfileStatus


# ============ INPUT SCHEMAS ============

class BuyerRegisterIn(BaseModel):
    """Schema pour l'inscription d'un acheteur"""
    email: EmailStr
    password: str = Field(..., min_length=6, description="Mot de passe minimum 6 caractères")
    name: str = Field(..., min_length=2, max_length=200)
    phone: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    country: str = Field(default="madagascar")
    buyer_type: BuyerType = BuyerType.PARTICULIER
    company_name: Optional[str] = None
    siret: Optional[str] = None
    
    @validator('company_name', 'siret')
    def validate_company_fields(cls, v, values):
        """Si buyer_type est entreprise, company_name est requis"""
        if 'buyer_type' in values and values['buyer_type'] == BuyerType.ENTREPRISE:
            if not v:
                raise ValueError("company_name est requis pour les entreprises")
        return v


class ArtisanRegisterIn(BaseModel):
    """Schema pour l'inscription d'un artisan"""
    email: EmailStr
    password: str = Field(..., min_length=6)
    name: str = Field(..., min_length=2, max_length=200)
    phone: Optional[str] = None
    region: str
    city: str
    address: Optional[str] = None
    languages: List[str] = Field(default_factory=list)
    company_name: str = Field(..., min_length=1)
    main_specialty: str
    other_skills: List[str] = Field(default_factory=list)
    years_experience: Optional[str] = None
    activity_description: str = Field(..., min_length=10)
    brand_story: Optional[str] = None
    offerings: List[str] = Field(..., description="Liste: ['products', 'workshops', 'both']")
    nif: Optional[str] = None
    stat: Optional[str] = None
    documents_not_available: bool = False
    
    @validator('offerings')
    def validate_offerings(cls, v):
        """Valider que offerings contient des valeurs valides"""
        valid_values = ['products', 'workshops', 'both']
        if not v or not all(item in valid_values for item in v):
            raise ValueError(f"offerings doit contenir au moins un élément parmi: {valid_values}")
        return v


class LoginIn(BaseModel):
    """Schema pour la connexion"""
    email: EmailStr
    password: str = Field(..., min_length=1, description="Le mot de passe ne peut pas être vide")


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
