"""
Schémas Pydantic pour les avis (reviews) de produits et ateliers
"""

from typing import Optional
from pydantic import BaseModel, Field, field_validator
from datetime import datetime
from uuid import UUID
from enum import Enum


class ReviewableType(str, Enum):
    """Type d'entité à reviewer"""
    PRODUCT = "product"
    WORKSHOP = "workshop"


class ReviewStatus(str, Enum):
    """Statut de modération"""
    PUBLISHED = "published"
    PENDING = "pending"
    REJECTED = "rejected"


class ReviewCreate(BaseModel):
    """Schéma pour créer un avis"""
    reviewable_type: ReviewableType
    reviewable_id: UUID
    order_id: Optional[UUID] = None
    booking_id: Optional[UUID] = None
    rating: int = Field(ge=1, le=5, description="Note de 1 à 5 étoiles")
    title: str = Field(min_length=3, max_length=200)
    comment: str = Field(min_length=10, max_length=2000)
    criteria_ratings: Optional[dict] = None
    images: Optional[list[str]] = None
    videos: Optional[list[str]] = None

    @field_validator("rating")
    @classmethod
    def validate_rating(cls, v):
        if not 1 <= v <= 5:
            raise ValueError("Rating must be between 1 and 5")
        return v

    @field_validator("comment")
    @classmethod
    def validate_comment(cls, v):
        if len(v.strip()) < 10:
            raise ValueError(
                "Comment must be at least 10 characters long"
            )
        return v


class ReviewUpdate(BaseModel):
    """Schéma pour modifier un avis"""
    rating: Optional[int] = Field(None, ge=1, le=5)
    title: Optional[str] = Field(None, min_length=3, max_length=200)
    comment: Optional[str] = Field(None, min_length=10, max_length=2000)
    criteria_ratings: Optional[dict] = None
    images: Optional[list[str]] = None
    videos: Optional[list[str]] = None


class ReviewOut(BaseModel):
    """Schéma de sortie pour un avis"""
    id: UUID
    reviewer_id: UUID
    reviewable_type: str
    reviewable_id: UUID
    order_id: Optional[UUID] = None
    booking_id: Optional[UUID] = None
    rating: int
    title: str
    comment: str
    criteria_ratings: Optional[dict] = None
    images: Optional[list[str]] = None
    videos: Optional[list[str]] = None
    status: str
    is_verified_purchase: bool
    helpful_count: int = 0
    flagged_count: int = 0
    created_at: datetime
    updated_at: Optional[datetime] = None
    reviewer_name: Optional[str] = None
    reviewer_avatar: Optional[str] = None

    class Config:
        from_attributes = True


class ReviewWithProductInfo(ReviewOut):
    """Avis avec info produit (pour liste artisan)"""
    product_name: Optional[str] = None
    product_image: Optional[str] = None


class PaginatedReviewsResponse(BaseModel):
    """Réponse paginée pour liste d'avis"""
    items: list[ReviewOut]
    total: int
    page: int
    page_size: int
    total_pages: int
    average_rating: Optional[float] = None
    rating_distribution: Optional[dict[int, int]] = None


class ReviewStatsOut(BaseModel):
    """Statistiques d'avis pour un produit/workshop"""
    total_reviews: int
    average_rating: float
    rating_distribution: dict[int, int]
    verified_purchases: int
    with_images: int
    with_videos: int


class ReviewHelpfulVoteCreate(BaseModel):
    """Voter pour un avis utile"""
    is_helpful: bool


class ReviewFlagCreate(BaseModel):
    """Signaler un avis"""
    reason: str = Field(
        ..., description="Reason: spam, inappropriate, fake"
    )
    description: Optional[str] = None


class ReviewModerationUpdate(BaseModel):
    """Modération d'un avis (admin)"""
    status: ReviewStatus
    moderation_notes: Optional[str] = None
