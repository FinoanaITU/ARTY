"""
Schémas Pydantic pour les ateliers (Workshops)
Correspond aux modèles SQLAlchemy dans app.models.workshop
"""

from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field, validator
from decimal import Decimal
from datetime import datetime
from enum import Enum
from uuid import UUID


# ============ ENUMS ============

class WorkshopType(str, Enum):
    """Type d'atelier"""
    INSCRIPTION = "inscription"  # Dates fixes
    RESERVATION = "reservation"  # Dates flexibles


class WorkshopStatus(str, Enum):
    """Statut de l'atelier"""
    DRAFT = "draft"
    PENDING_APPROVAL = "pending_approval"
    PUBLISHED = "published"
    REJECTED = "rejected"
    ARCHIVED = "archived"


class SkillLevel(str, Enum):
    """Niveau de compétence"""
    BEGINNER = "Débutant"
    INTERMEDIATE = "Intermédiaire"
    ADVANCED = "Avancé"


class SessionStatus(str, Enum):
    """Statut d'une session"""
    SCHEDULED = "scheduled"
    CONFIRMED = "confirmed"
    CANCELLED = "cancelled"
    COMPLETED = "completed"


class BookingStatus(str, Enum):
    """Statut d'une réservation"""
    PENDING = "pending"
    CONFIRMED = "confirmed"
    CANCELLED = "cancelled"
    ATTENDED = "attended"
    NO_SHOW = "no_show"


class PaymentStatus(str, Enum):
    """Statut du paiement"""
    PENDING = "pending"
    PAID = "paid"
    PARTIAL = "partial"
    FAILED = "failed"


# ============ INPUT SCHEMAS ============

class PrivatizationOptions(BaseModel):
    """Options de privatisation d'un atelier"""
    min_participants: int = Field(..., ge=2)
    max_participants: int = Field(..., ge=2)
    base_price: Decimal = Field(..., gt=0)
    price_per_participant: Decimal = Field(..., gt=0)

    @validator("max_participants")
    def max_greater_than_min(cls, v, values):
        if "min_participants" in values and v < values["min_participants"]:
            raise ValueError("max_participants doit être >= min_participants")
        return v


class ProgramItem(BaseModel):
    """Item du programme de l'atelier"""
    time: str = Field(..., description="Format HH:MM")
    activity: str = Field(..., min_length=3)


class WorkshopCreate(BaseModel):
    """Schéma pour créer un atelier"""
    title: str = Field(..., min_length=3, max_length=200)
    description: str = Field(..., min_length=10)
    short_description: Optional[str] = Field(None, max_length=500)
    category: str = Field(..., min_length=2)
    workshop_type: WorkshopType = Field(...)
    skill_level: SkillLevel = Field(default=SkillLevel.BEGINNER)
    base_price: Decimal = Field(..., gt=0)
    foreign_price: Optional[Decimal] = Field(None, gt=0)
    max_participants: int = Field(..., ge=2)
    min_participants: int = Field(default=1, ge=1)
    duration_minutes: int = Field(..., ge=30)
    location: str = Field(..., min_length=2)
    room_details: Optional[str] = None
    materials_included: Optional[List[str]] = None
    materials_to_bring: Optional[List[str]] = None
    prerequisites: Optional[str] = None
    what_you_will_learn: List[str] = Field(..., min_items=1)
    program: Optional[List[ProgramItem]] = None
    privatization_enabled: bool = Field(default=False)
    privatization_options: Optional[PrivatizationOptions] = None
    tags: Optional[List[str]] = None
    featured_image_url: Optional[str] = None
    gallery_images: Optional[List[str]] = None
    video_preview_url: Optional[str] = None

    @validator("max_participants")
    def max_greater_than_min(cls, v, values):
        if "min_participants" in values and v < values["min_participants"]:
            raise ValueError("max_participants doit être >= min_participants")
        return v

    @validator("foreign_price")
    def foreign_price_greater_than_base(cls, v, values):
        if v and "base_price" in values and v < values["base_price"]:
            raise ValueError("foreign_price doit être >= base_price")
        return v

    @validator("privatization_options")
    def privatization_requires_enabled(cls, v, values):
        if v and not values.get("privatization_enabled"):
            raise ValueError("privatization_enabled doit être True si privatization_options est fourni")
        return v


class WorkshopUpdate(BaseModel):
    """Schéma pour mettre à jour un atelier"""
    title: Optional[str] = Field(None, min_length=3, max_length=200)
    description: Optional[str] = Field(None, min_length=10)
    short_description: Optional[str] = Field(None, max_length=500)
    category: Optional[str] = Field(None, min_length=2)
    base_price: Optional[Decimal] = Field(None, gt=0)
    foreign_price: Optional[Decimal] = Field(None, gt=0)
    max_participants: Optional[int] = Field(None, ge=2)
    min_participants: Optional[int] = Field(None, ge=1)
    duration_minutes: Optional[int] = Field(None, ge=30)
    location: Optional[str] = Field(None, min_length=2)
    room_details: Optional[str] = None
    materials_included: Optional[List[str]] = None
    materials_to_bring: Optional[List[str]] = None
    prerequisites: Optional[str] = None
    what_you_will_learn: Optional[List[str]] = Field(None, min_items=1)
    program: Optional[List[ProgramItem]] = None
    privatization_enabled: Optional[bool] = None
    privatization_options: Optional[PrivatizationOptions] = None
    tags: Optional[List[str]] = None
    featured_image_url: Optional[str] = None
    gallery_images: Optional[List[str]] = None
    video_preview_url: Optional[str] = None
    status: Optional[WorkshopStatus] = None


class WorkshopSessionCreate(BaseModel):
    """Schéma pour créer une session d'atelier"""
    start_datetime: datetime = Field(...)
    end_datetime: datetime = Field(...)
    max_participants: Optional[int] = None
    session_price: Optional[Decimal] = Field(None, gt=0)
    is_private: bool = Field(default=False)
    special_instructions: Optional[str] = None

    @validator("end_datetime")
    def end_after_start(cls, v, values):
        if "start_datetime" in values and v <= values["start_datetime"]:
            raise ValueError("end_datetime doit être après start_datetime")
        return v


class WorkshopBookingCreate(BaseModel):
    """Schéma pour créer une réservation d'atelier"""
    session_id: UUID = Field(...)
    participants_count: int = Field(..., ge=1)
    participant_names: Optional[List[str]] = None
    special_requests: Optional[str] = None
    dietary_restrictions: Optional[str] = None


class WorkshopRegistrationCreate(BaseModel):
    """Schéma pour s'inscrire à un atelier (inscription type)"""
    participants_count: int = Field(..., ge=1, description="Nombre de participants")
    participant_names: Optional[List[str]] = None


# ============ OUTPUT SCHEMAS ============

class ArtisanBasic(BaseModel):
    """Schema basique pour un artisan"""
    id: UUID
    name: str

    class Config:
        from_attributes = True


class WorkshopSessionOut(BaseModel):
    """Schéma de sortie pour une session d'atelier"""
    id: UUID
    workshop_id: UUID
    start_datetime: datetime
    end_datetime: datetime
    max_participants: int
    current_bookings: int
    available_spots: int
    session_price: Optional[Decimal] = None
    is_private: bool
    status: SessionStatus
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class WorkshopBookingOut(BaseModel):
    """Schéma de sortie pour une réservation d'atelier"""
    id: UUID
    booking_number: str
    session_id: UUID
    workshop_id: UUID
    user_id: UUID
    participants_count: int
    total_price: Decimal
    status: BookingStatus
    payment_status: PaymentStatus
    special_requests: Optional[str] = None
    dietary_restrictions: Optional[str] = None
    created_at: datetime
    cancelled_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class WorkshopOut(BaseModel):
    """Schéma de sortie pour un atelier (détails complets)"""
    id: UUID
    title: str
    slug: str
    description: str
    short_description: Optional[str]
    artisan: ArtisanBasic
    category: str
    workshop_type: WorkshopType
    skill_level: SkillLevel
    base_price: Decimal
    foreign_price: Optional[Decimal]
    max_participants: int
    min_participants: int
    duration_minutes: int
    location: str
    room_details: Optional[str]
    materials_included: Optional[List[str]]
    materials_to_bring: Optional[List[str]]
    prerequisites: Optional[str]
    what_you_will_learn: List[str]
    program: Optional[List[Dict[str, str]]]
    privatization_enabled: bool
    privatization_min_participants: Optional[int]
    privatization_max_participants: Optional[int]
    privatization_base_price: Optional[Decimal]
    privatization_price_per_participant: Optional[Decimal]
    featured_image_url: Optional[str]
    gallery_images: Optional[List[str]]
    video_preview_url: Optional[str]
    status: WorkshopStatus
    total_bookings: int
    rating_average: Optional[Decimal]
    rating_count: int
    tags: Optional[List[str]]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class WorkshopListItem(BaseModel):
    """Schéma de sortie pour un item de liste d'ateliers"""
    id: UUID
    title: str
    description: str
    # artisan: ArtisanBasic  # Temporarily disabled - requires join
    workshop_type: Optional[str] = None  # Changed to optional string to match DB
    skill_level: Optional[str] = None  # Changed to optional string to match DB
    base_price: Decimal
    # foreign_price: Optional[Decimal] = None  # Column doesn't exist in DB
    max_participants: int
    duration_minutes: int
    # location: str  # Column doesn't exist in DB
    address: Optional[str] = None  # Use address instead of location
    featured_image_url: Optional[str] = None
    total_bookings: Optional[int] = 0
    rating_average: Optional[Decimal] = None
    rating_count: Optional[int] = 0
    status: Optional[str] = None  # Changed to string to match DB

    class Config:
        from_attributes = True


class WorkshopListResponse(BaseModel):
    """Réponse pour la liste des ateliers"""
    items: List[WorkshopListItem]
    total: int
    page: int
    pages: int
    limit: int


class AvailabilityResponse(BaseModel):
    """Réponse pour la disponibilité d'un atelier"""
    workshop_id: UUID
    available_sessions: List[WorkshopSessionOut]
    booked_dates: List[datetime]
    unavailable_dates: List[datetime]


class BookingConfirmation(BaseModel):
    """Confirmation de réservation"""
    booking_id: UUID
    booking_number: str
    confirmation_code: str
    workshop_title: str
    session_start: datetime
    participants_count: int
    total_price: Decimal
    status: BookingStatus
    created_at: datetime

    class Config:
        from_attributes = True
