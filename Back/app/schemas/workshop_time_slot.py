from datetime import date, time, datetime
from decimal import Decimal
from typing import Optional
from pydantic import BaseModel, ConfigDict
from uuid import UUID


class WorkshopTimeSlotBase(BaseModel):
    workshop_id: UUID
    date: date
    start_time: time
    end_time: time
    max_participants: int = 10
    current_participants: int = 0
    min_participants: int = 4
    is_available: bool = True
    price_modifier: Optional[Decimal] = Decimal("1.0")


class WorkshopTimeSlotCreate(WorkshopTimeSlotBase):
    pass


class WorkshopTimeSlotUpdate(BaseModel):
    current_participants: Optional[int] = None
    is_available: Optional[bool] = None
    price_modifier: Optional[Decimal] = None


class WorkshopTimeSlotOut(WorkshopTimeSlotBase):
    model_config = ConfigDict(from_attributes=True)
    
    id: UUID
    created_at: datetime
    updated_at: datetime

    # Computed fields
    @property
    def available_spots(self) -> int:
        return max(0, self.max_participants - self.current_participants)
    
    @property
    def needs_participants(self) -> int:
        return max(0, self.min_participants - self.current_participants)
    
    @property
    def status(self) -> str:
        if not self.is_available:
            return 'unavailable'
        if self.current_participants >= self.max_participants:
            return 'full'
        if self.current_participants < self.min_participants:
            return 'needs_participants'
        if self.available_spots <= 2:
            return 'almost_full'
        return 'available'


class TimeSlotSummary(BaseModel):
    """Simplified time slot for calendar display"""
    time: str  # Format "HH:MM"
    available: bool
    maxParticipants: int
    currentParticipants: int
    minParticipants: int
    priceModifier: Optional[float] = 1.0
    status: str
    
    @classmethod
    def from_time_slot(cls, slot: WorkshopTimeSlotOut) -> "TimeSlotSummary":
        return cls(
            time=slot.start_time.strftime("%H:%M"),
            available=slot.is_available and slot.current_participants < slot.max_participants,
            maxParticipants=slot.max_participants,
            currentParticipants=slot.current_participants,
            minParticipants=slot.min_participants,
            priceModifier=float(slot.price_modifier) if slot.price_modifier else 1.0,
            status=slot.status
        )