from sqlalchemy import Column, String, Boolean, DateTime, Text, ARRAY, Integer, Date, JSON, func, Enum as SQLEnum, ForeignKey, TypeDecorator
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.models.base import BaseModel, GUID
import enum

class UserRole(str, enum.Enum):
    BUYER = "buyer"
    ARTISAN = "artisan"
    ADMIN = "admin"

class BuyerType(str, enum.Enum):
    PARTICULIER = "particulier"
    ENTREPRISE = "entreprise"

class Nationality(str, enum.Enum):
    LOCAL = "local"
    FOREIGN = "foreign"

class ProfileStatus(str, enum.Enum):
    DRAFT = "draft"
    PENDING_APPROVAL = "pending_approval"
    PUBLISHED = "published"
    REJECTED = "rejected"

class EnumType(TypeDecorator):
    """
    TypeDecorator pour mapper les enums depuis SQLite VARCHAR.
    Pour SQLite, stocke les valeurs de l'enum comme strings et les convertit correctement.
    Pour PostgreSQL, utilise SQLEnum natif.
    """
    impl = String
    cache_ok = True
    
    def __init__(self, enum_class, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.enum_class = enum_class
    
    def load_dialect_impl(self, dialect):

        if dialect.name == 'postgresql':
            return dialect.type_descriptor(SQLEnum(self.enum_class, values_callable=lambda x: [e.value for e in x]))

        return dialect.type_descriptor(String(50))
    
    def process_bind_param(self, value, dialect):

        if value is None:
            return None
        if isinstance(value, self.enum_class):
            return value.value
        return value
    
    def process_result_value(self, value, dialect):

        if value is None:
            return None
        if isinstance(value, self.enum_class):
            return value
        try:

            return self.enum_class(value)
        except (ValueError, KeyError):

            return list(self.enum_class)[0]

class User(BaseModel):
    __tablename__ = "users"
    
    email = Column(String(255), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    name = Column(String(200), nullable=False)
    phone = Column(String(20), nullable=True)
    address = Column(Text, nullable=True)
    city = Column(String(100), nullable=True)
    country = Column(String(100), nullable=True, default="madagascar")
    role = Column(SQLEnum(UserRole, values_callable=lambda x: [e.value for e in x]), nullable=False, default=UserRole.BUYER.value, index=True, server_default='buyer')
    avatar = Column(String(500), nullable=True)
    

    buyer_type = Column(SQLEnum(BuyerType, values_callable=lambda x: [e.value for e in x]), nullable=True)
    nationality = Column(SQLEnum(Nationality, values_callable=lambda x: [e.value for e in x]), nullable=True)
    company_name = Column(String(200), nullable=True)
    siret = Column(String(50), nullable=True)
    

    is_active = Column(Boolean, default=True, nullable=False)
    is_email_verified = Column(Boolean, default=False, nullable=False)
    last_login_at = Column(DateTime, nullable=True)
    

    approved_by = Column(GUID(), ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True)
    approved_at = Column(DateTime, nullable=True)
    approval_notes = Column(Text, nullable=True)
    

    artisan_profile = relationship("ArtisanProfile", back_populates="user", uselist=False, lazy="select")

    sessions = relationship("UserSession", back_populates="user", lazy="dynamic")
    workshops = relationship(
        "Workshop",
        foreign_keys="Workshop.artisan_id",
        back_populates="artisan",
        lazy="dynamic"
    )
    workshop_bookings = relationship("WorkshopBooking", back_populates="user", lazy="dynamic")

class ArtisanProfile(BaseModel):
    __tablename__ = "artisan_profiles"
    
    user_id = Column(GUID(), ForeignKey("users.id"), unique=True, nullable=False, index=True)
    region = Column(String(100), nullable=True)
    languages = Column(ARRAY(String), nullable=True)
    company_name = Column(String(200), nullable=False)
    main_specialty = Column(String(100), nullable=False)
    other_skills = Column(ARRAY(String), nullable=True)
    years_experience = Column(String(50), nullable=True)
    activity_description = Column(Text, nullable=False)
    brand_story = Column(Text, nullable=True)
    offerings = Column(ARRAY(String), nullable=True)
    nif = Column(String(50), nullable=True)
    stat = Column(String(50), nullable=True)
    documents_not_available = Column(Boolean, default=False, nullable=False)
    status = Column(EnumType(ProfileStatus), default=ProfileStatus.PENDING_APPROVAL, nullable=False, index=True)
    admin_notes = Column(Text, nullable=True)
    

    about = Column(Text, nullable=True)
    specialties = Column(ARRAY(String), nullable=True)
    location_region = Column(String(100), nullable=True)
    location_city = Column(String(100), nullable=True)
    location_address = Column(String(200), nullable=True)
    experience = Column(String(200), nullable=True)
    artisan_type = Column(String(20), nullable=True)
    business_info = Column(JSON, nullable=True)
    certifications = Column(ARRAY(String), nullable=True)
    awards = Column(ARRAY(String), nullable=True)
    social_media = Column(JSON, nullable=True)
    

    user = relationship("User", back_populates="artisan_profile")
    artisan_photos = relationship("ArtisanPhoto", back_populates="artisan_profile", cascade="all, delete-orphan")

class ArtisanPhoto(BaseModel):
    __tablename__ = "artisan_photos"
    
    artisan_profile_id = Column(GUID(), ForeignKey("artisan_profiles.id"), nullable=False, index=True)
    photo_url = Column(String(500), nullable=False)

    position = Column(Integer, default=0, nullable=False)
    

    artisan_profile = relationship("ArtisanProfile", back_populates="artisan_photos")

class UserProfile(BaseModel):
    """Legacy UserProfile - kept for backward compatibility if needed"""
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
    

class SocialAccount(BaseModel):
    __tablename__ = "social_accounts"
    
    user_id = Column(GUID(), ForeignKey("users.id"), nullable=False, index=True)
    provider = Column(String(20), nullable=False)
    provider_id = Column(String(100), nullable=False)
    provider_email = Column(String(255))
    provider_data = Column(JSON)
    

class UserSession(BaseModel):
    __tablename__ = "user_sessions"
    
    user_id = Column(GUID(), ForeignKey("users.id"), nullable=False, index=True)
    refresh_token = Column(String(500), unique=True, nullable=False, index=True)
    access_token_jti = Column(String(100), unique=True, nullable=True)
    device_info = Column(JSON, nullable=True)
    is_active = Column(Boolean, default=True, index=True)
    expires_at = Column(DateTime, nullable=False, index=True)
    last_used_at = Column(DateTime, server_default=func.now())
    

    user = relationship("User", back_populates="sessions") 