from sqlalchemy import Column, String, Date, Time, Integer, Boolean, Numeric, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.models.base import BaseModel
import uuid


class WorkshopTimeSlot(BaseModel):
    __tablename__ = "workshop_time_slots"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    workshop_id = Column(UUID(as_uuid=True), ForeignKey("workshops.id", ondelete="CASCADE"), nullable=False, index=True)
    date = Column(Date, nullable=False, index=True)
    start_time = Column(Time, nullable=False)
    end_time = Column(Time, nullable=False)
    max_participants = Column(Integer, nullable=False, default=10)
    current_participants = Column(Integer, nullable=False, default=0)
    min_participants = Column(Integer, nullable=False, default=4)
    is_available = Column(Boolean, nullable=False, default=True, index=True)
    price_modifier = Column(Numeric(5, 2), default=1.0)  # Multiplicateur de prix
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Relations
    workshop = relationship("Workshop", back_populates="time_slots")

    def __repr__(self):
        return f"<WorkshopTimeSlot {self.date} {self.start_time}-{self.end_time} ({self.current_participants}/{self.max_participants})>"