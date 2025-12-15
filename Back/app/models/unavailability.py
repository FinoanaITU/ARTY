"""
Modèle SQLAlchemy pour les indisponibilités d'artisan
"""

from sqlalchemy import Column, String, Date, Text, DateTime
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy import ForeignKey
from sqlalchemy.orm import relationship
from app.models.base import BaseModel
from datetime import datetime


class ArtisanUnavailability(BaseModel):
    """Modèle pour les indisponibilités d'artisan"""
    __tablename__ = "artisan_unavailability"
    
    artisan_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False, index=True)
    start_date = Column(Date, nullable=False, index=True)
    end_date = Column(Date, nullable=True)
    reason = Column(Text, nullable=True)
    type = Column(String(20), default="single", nullable=False)  # 'single' or 'range'
    status = Column(String(20), default="approved", nullable=False)  # 'pending', 'approved', 'rejected'
    
    # Relationships
    artisan = relationship("User", foreign_keys=[artisan_id])