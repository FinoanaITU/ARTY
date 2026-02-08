from pydantic import BaseModel, Field, field_validator
from datetime import datetime
from typing import Optional, List, Dict, Any
from uuid import UUID
from enum import Enum


class ValidationType(str, Enum):
    """Type de validation"""
    PROFILE = "profile"
    PRODUCT = "product"
    WORKSHOP = "workshop"
    ALL = "all"


class ValidationStatus(str, Enum):
    """Statut de validation"""
    PENDING = "pending"
    APPROVED = "approved"
    REJECTED = "rejected"


class ValidationAction(str, Enum):
    """Actions de validation"""
    APPROVE = "approve"
    REJECT = "reject"


# ===== Validation Request/Response Schemas =====

class ValidationRequest(BaseModel):
    """Requête de validation (approve/reject)"""
    action: ValidationAction
    notes: Optional[str] = Field(None, description="Notes de l'administrateur")


class ValidationHistoryOut(BaseModel):
    """Historique de validation"""
    id: UUID
    artisan_id: UUID
    validation_type: str
    entity_id: Optional[UUID]
    status: str
    validated_by: Optional[UUID]
    validation_notes: Optional[str]
    validated_at: Optional[datetime]
    created_at: datetime
    
    class Config:
        from_attributes = True


class PendingValidationItem(BaseModel):
    """Item en attente de validation"""
    id: UUID
    type: ValidationType
    entity_id: Optional[UUID]
    artisan_id: UUID
    artisan_name: str
    artisan_email: str
    title: str
    description: Optional[str]
    status: str
    created_at: datetime
    
    # Détails spécifiques selon le type
    details: Optional[Dict[str, Any]] = None
    
    class Config:
        from_attributes = True


class PendingValidationsResponse(BaseModel):
    """Response liste des validations en attente"""
    total: int
    items: List[PendingValidationItem]
    count_by_type: Dict[str, int]


class ValidationStatsOut(BaseModel):
    """Statistiques de validation"""
    period: str
    total_validations: int
    approved_count: int
    rejected_count: int
    pending_count: int
    approval_rate: float
    average_response_time_hours: Optional[float]
    by_type: Dict[str, Dict[str, int]]
    
    class Config:
        from_attributes = True


# ===== Artisan Profile Validation Schemas =====

class ArtisanProfileValidationOut(BaseModel):
    """Détails profil artisan pour validation"""
    user_id: UUID
    email: str
    name: str
    phone: Optional[str]
    company_name: str
    main_specialty: str
    other_skills: Optional[List[str]]
    years_experience: Optional[str]
    activity_description: str
    region: Optional[str]
    languages: Optional[List[str]]
    status: str
    admin_notes: Optional[str]
    created_at: datetime
    
    # Approval fields
    approved_by: Optional[UUID]
    approved_at: Optional[datetime]
    approval_notes: Optional[str]
    
    class Config:
        from_attributes = True


# ===== Product Validation Schemas =====

class ProductValidationOut(BaseModel):
    """Détails produit pour validation"""
    id: UUID
    title: str
    slug: str
    description: str
    price: float
    artisan_id: UUID
    artisan_name: Optional[str]
    category_id: UUID
    status: str
    images: Optional[List[str]] = []
    created_at: datetime
    
    # Approval fields
    approved_by: Optional[UUID]
    approved_at: Optional[datetime]
    approval_notes: Optional[str]
    
    class Config:
        from_attributes = True


# ===== Workshop Validation Schemas =====

class WorkshopValidationOut(BaseModel):
    """Détails atelier pour validation"""
    id: UUID
    title: str
    slug: str
    description: str
    artisan_id: UUID
    artisan_name: Optional[str]
    base_price: float
    duration_minutes: int
    max_participants: int
    location_type: str
    status: str
    featured_image_url: Optional[str]
    created_at: datetime
    
    # Approval fields
    approved_by: Optional[UUID]
    approved_at: Optional[datetime]
    approval_notes: Optional[str]
    
    class Config:
        from_attributes = True
