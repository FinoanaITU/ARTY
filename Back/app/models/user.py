from sqlalchemy import Column, String, Boolean, DateTime, Text, ARRAY, Integer, Date, JSON, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.models.base import BaseModel


class User(BaseModel):
    __tablename__ = "users"
    
    email = Column(String(255), unique=True, nullable=False, index=True)
    username = Column(String(50), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    first_name = Column(String(100))
    last_name = Column(String(100))
    phone_number = Column(String(20))
    user_type = Column(String(20), nullable=False, default='buyer', index=True)
    is_active = Column(Boolean, default=True)
    is_email_verified = Column(Boolean, default=False)
    email_verification_token = Column(String(255))
    password_reset_token = Column(String(255))
    password_reset_expires_at = Column(DateTime)
    last_login_at = Column(DateTime)
    
    # Relationships
    profile = relationship("UserProfile", back_populates="user", uselist=False)
    social_accounts = relationship("SocialAccount", back_populates="user")
    sessions = relationship("UserSession", back_populates="user")
    products = relationship("Product", back_populates="artisan")
    orders = relationship("Order", back_populates="user")
    reviews = relationship("Review", back_populates="reviewer")
    workshops = relationship("Workshop", back_populates="artisan")
    workshop_bookings = relationship("WorkshopBooking", back_populates="user")
    conversations_one = relationship("Conversation", foreign_keys="Conversation.participant_one_id", back_populates="participant_one")
    conversations_two = relationship("Conversation", foreign_keys="Conversation.participant_two_id", back_populates="participant_two")
    messages = relationship("Message", back_populates="sender")
    notifications = relationship("Notification", back_populates="user")
    notification_preferences = relationship("NotificationPreference", back_populates="user", uselist=False)


class UserProfile(BaseModel):
    __tablename__ = "user_profiles"
    
    user_id = Column(UUID(as_uuid=True), unique=True, nullable=False, index=True)
    avatar_url = Column(String(500))
    bio = Column(Text)
    birth_date = Column(Date)
    gender = Column(String(10))
    location = Column(String(100), index=True)
    address = Column(Text)
    postal_code = Column(String(20))
    city = Column(String(100))
    region = Column(String(100))
    country = Column(String(3), default='MDG')
    timezone = Column(String(50), default='Indian/Antananarivo')
    language = Column(String(5), default='fr')
    artisan_verified = Column(Boolean, default=False, index=True)
    artisan_verification_date = Column(DateTime)
    artisan_specialties = Column(ARRAY(Text))
    artisan_experience_years = Column(Integer)
    workshop_location = Column(String(200))
    social_media = Column(JSON)
    
    # Relationships
    user = relationship("User", back_populates="profile")


class SocialAccount(BaseModel):
    __tablename__ = "social_accounts"
    
    user_id = Column(UUID(as_uuid=True), nullable=False, index=True)
    provider = Column(String(20), nullable=False)
    provider_id = Column(String(100), nullable=False)
    provider_email = Column(String(255))
    provider_data = Column(JSON)
    
    # Relationships
    user = relationship("User", back_populates="social_accounts")


class UserSession(BaseModel):
    __tablename__ = "user_sessions"
    
    user_id = Column(UUID(as_uuid=True), nullable=False, index=True)
    refresh_token = Column(String(500), unique=True, nullable=False, index=True)
    access_token_jti = Column(String(100), unique=True)
    device_info = Column(JSON)
    is_active = Column(Boolean, default=True, index=True)
    expires_at = Column(DateTime, nullable=False, index=True)
    last_used_at = Column(DateTime, server_default=func.now())
    
    # Relationships
    user = relationship("User", back_populates="sessions") 