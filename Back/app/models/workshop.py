from sqlalchemy import Column, String, Boolean, DateTime, Text, ARRAY, Integer, Numeric, JSON, ForeignKey, Date, Time
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.models.base import BaseModel


class Workshop(BaseModel):
    __tablename__ = "workshops"
    
    title = Column(String(200), nullable=False)
    slug = Column(String(200), unique=True, nullable=False, index=True)
    description = Column(Text, nullable=False)
    short_description = Column(String(500))
    artisan_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False, index=True)
    category_id = Column(UUID(as_uuid=True), ForeignKey("categories.id"), index=True)
    workshop_type = Column(String(20), default='group', index=True)
    skill_level = Column(String(20), default='beginner')
    base_price = Column(Numeric(10, 2), nullable=False)
    private_price = Column(Numeric(10, 2))
    currency = Column(String(3), default='MGA')
    min_participants = Column(Integer, default=1)
    max_participants = Column(Integer, nullable=False)
    duration_minutes = Column(Integer, nullable=False)
    location_type = Column(String(20), default='physical', index=True)
    address = Column(Text)
    room_details = Column(Text)
    online_platform = Column(String(50))
    online_link = Column(String(500))
    materials_included = Column(ARRAY(Text))
    materials_to_bring = Column(ARRAY(Text))
    prerequisites = Column(Text)
    what_you_will_learn = Column(ARRAY(Text))
    featured_image_url = Column(String(500))
    gallery_images = Column(ARRAY(Text))
    video_preview_url = Column(String(500))
    status = Column(String(20), default='draft', index=True)
    is_featured = Column(Boolean, default=False, index=True)
    requires_approval = Column(Boolean, default=False)
    cancellation_policy = Column(Text)
    refund_policy = Column(Text)
    late_arrival_policy = Column(Text)
    tags = Column(ARRAY(Text), index=True)
    meta_title = Column(String(160))
    meta_description = Column(String(320))
    total_bookings = Column(Integer, default=0)
    rating_average = Column(Numeric(3, 2), default=0)
    rating_count = Column(Integer, default=0)
    
    # Relationships
    artisan = relationship("User", back_populates="workshops")
    category = relationship("Category")
    sessions = relationship("WorkshopSession", back_populates="workshop")
    bookings = relationship("WorkshopBooking", back_populates="workshop")
    reviews = relationship("Review", back_populates="workshop")


class WorkshopSession(BaseModel):
    __tablename__ = "workshop_sessions"
    
    workshop_id = Column(UUID(as_uuid=True), ForeignKey("workshops.id"), nullable=False, index=True)
    start_datetime = Column(DateTime, nullable=False, index=True)
    end_datetime = Column(DateTime, nullable=False)
    timezone = Column(String(50), default='Indian/Antananarivo')
    max_participants = Column(Integer)
    current_bookings = Column(Integer, default=0)
    available_spots = Column(Integer, default=0)
    session_price = Column(Numeric(10, 2))
    is_private = Column(Boolean, default=False)
    private_client_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), index=True)
    status = Column(String(20), default='scheduled', index=True)
    cancellation_reason = Column(Text)
    session_notes = Column(Text)
    special_instructions = Column(Text)
    
    # Relationships
    workshop = relationship("Workshop", back_populates="sessions")
    private_client = relationship("User")
    bookings = relationship("WorkshopBooking", back_populates="session")


class WorkshopBooking(BaseModel):
    __tablename__ = "workshop_bookings"
    
    booking_number = Column(String(20), unique=True, nullable=False, index=True)
    session_id = Column(UUID(as_uuid=True), ForeignKey("workshop_sessions.id"), nullable=False, index=True)
    workshop_id = Column(UUID(as_uuid=True), ForeignKey("workshops.id"), nullable=False, index=True)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False, index=True)
    participants_count = Column(Integer, default=1)
    total_price = Column(Numeric(10, 2), nullable=False)
    currency = Column(String(3), default='MGA')
    status = Column(String(20), default='pending', index=True)
    payment_status = Column(String(20), default='pending', index=True)
    participant_names = Column(ARRAY(Text))
    participant_info = Column(JSON)
    special_requests = Column(Text)
    dietary_restrictions = Column(Text)
    cancellation_reason = Column(Text)
    cancelled_at = Column(DateTime)
    refund_amount = Column(Numeric(10, 2), default=0)
    refunded_at = Column(DateTime)
    attended = Column(Boolean)
    attendance_notes = Column(Text)
    certificate_issued = Column(Boolean, default=False)
    certificate_url = Column(String(500))
    
    # Relationships
    session = relationship("WorkshopSession", back_populates="bookings")
    workshop = relationship("Workshop", back_populates="bookings")
    user = relationship("User", back_populates="workshop_bookings")
    reviews = relationship("Review", back_populates="booking")


class WorkshopAvailability(BaseModel):
    __tablename__ = "workshop_availability"
    
    artisan_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False, index=True)
    day_of_week = Column(Integer, nullable=False, index=True)
    start_time = Column(Time, nullable=False)
    end_time = Column(Time, nullable=False)
    is_available = Column(Boolean, default=True, index=True)
    max_sessions_per_day = Column(Integer, default=1)
    break_between_sessions_minutes = Column(Integer, default=30)
    valid_from = Column(Date)
    valid_until = Column(Date)
    
    # Relationships
    artisan = relationship("User") 