"""
Schémas Pydantic pour les indisponibilités d'artisan
"""

from typing import Optional
from pydantic import BaseModel
from datetime import date, datetime
from uuid import UUID
from enum import Enum


class UnavailabilityType(str, Enum):
    """Type d'indisponibilité"""
    SINGLE = "single"
    RANGE = "range"


class UnavailabilityStatus(str, Enum):
    """Statut de l'indisponibilité"""
    PENDING = "pending"
    APPROVED = "approved" 
    REJECTED = "rejected"


class UnavailabilityOut(BaseModel):
    """Schéma de sortie pour une indisponibilité d'artisan"""
    id: UUID
    artisan_id: UUID
    start_date: date
    end_date: Optional[date] = None
    reason: Optional[str] = None
    type: str
    status: str
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True


class UnavailabilityCreate(BaseModel):
    """Schéma pour créer une indisponibilité"""
    start_date: date
    end_date: Optional[date] = None
    reason: Optional[str] = None
    type: UnavailabilityType = UnavailabilityType.SINGLE
    status: UnavailabilityStatus = UnavailabilityStatus.PENDING


class UnavailabilityUpdate(BaseModel):
    """Schéma pour mettre à jour une indisponibilité"""
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    reason: Optional[str] = None
    type: Optional[UnavailabilityType] = None
    status: Optional[UnavailabilityStatus] = None


class UnavailabilityListResponse(BaseModel):
    """Réponse paginée pour liste d'indisponibilités"""
    items: list[UnavailabilityOut]
    total: int
    page: int
    page_size: int
    total_pages: int