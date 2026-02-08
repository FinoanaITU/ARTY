from sqlalchemy import Column, String, DateTime, Text, ForeignKey, Enum as SQLEnum
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.models.base import BaseModel
import enum


class ValidationType(str, enum.Enum):
    """Type de validation"""
    PROFILE = "profile"
    PRODUCT = "product"
    WORKSHOP = "workshop"


class ValidationStatus(str, enum.Enum):
    """Statut de validation"""
    PENDING = "pending"
    APPROVED = "approved"
    REJECTED = "rejected"


class ArtisanValidation(BaseModel):
    """Historique des validations d'artisans et de leurs contenus"""
    __tablename__ = "artisan_validations"
    
    artisan_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    validation_type = Column(String(50), nullable=False, index=True, comment="profile/product/workshop")
    entity_id = Column(UUID(as_uuid=True), nullable=True, comment="ID of product/workshop if applicable")
    status = Column(String(20), nullable=False, index=True, comment="pending/approved/rejected")
    validated_by = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True)
    validation_notes = Column(Text, nullable=True)
    validated_at = Column(DateTime, nullable=True)
    
    # Relationships
    artisan = relationship("User", foreign_keys=[artisan_id], backref="validations")
    validator = relationship("User", foreign_keys=[validated_by])
