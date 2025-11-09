from sqlalchemy import Column, String, Boolean, DateTime, Text, ARRAY, Integer, Date, JSON, func, Enum as SQLEnum, ForeignKey, TypeDecorator
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.models.base import BaseModel
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
        # Pour PostgreSQL, utiliser SQLEnum natif
        if dialect.name == 'postgresql':
            return dialect.type_descriptor(SQLEnum(self.enum_class))
        # Pour SQLite, utiliser String
        return dialect.type_descriptor(String(50))
    
    def process_bind_param(self, value, dialect):
        # Convertir l'enum en sa valeur string lors de l'insertion
        if value is None:
            return None
        if isinstance(value, self.enum_class):
            return value.value
        return value
    
    def process_result_value(self, value, dialect):
        # Convertir la valeur string en enum lors de la récupération
        if value is None:
            return None
        if isinstance(value, self.enum_class):
            return value
        try:
            # Créer l'enum depuis sa valeur (ex: "artisan" -> UserRole.ARTISAN)
            return self.enum_class(value)
        except (ValueError, KeyError):
            # Si la valeur n'est pas valide, retourner la première valeur de l'enum
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
    role = Column(EnumType(UserRole), nullable=False, default=UserRole.BUYER, index=True)
    avatar = Column(String(500), nullable=True)
    
    # Buyer specific fields
    buyer_type = Column(EnumType(BuyerType), nullable=True)
    nationality = Column(EnumType(Nationality), nullable=True)
    company_name = Column(String(200), nullable=True)
    siret = Column(String(50), nullable=True)
    
    # Common fields
    is_active = Column(Boolean, default=True, nullable=False)
    is_email_verified = Column(Boolean, default=False, nullable=False)
    last_login_at = Column(DateTime, nullable=True)
    
    # Relationships (using strings to avoid circular imports)
    artisan_profile = relationship("ArtisanProfile", back_populates="user", uselist=False, lazy="select")
    # Temporarily comment out relationships that cause circular import issues
    # These will be enabled when Order and CartItem models are properly configured
    # orders = relationship("Order", back_populates="buyer", lazy="dynamic")
    # cart_items = relationship("CartItem", back_populates="user", lazy="dynamic")
    sessions = relationship("UserSession", back_populates="user", lazy="dynamic")


class ArtisanProfile(BaseModel):
    __tablename__ = "artisan_profiles"
    
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), unique=True, nullable=False, index=True)
    region = Column(String(100), nullable=True)
    languages = Column(ARRAY(String), nullable=True)
    company_name = Column(String(200), nullable=False)
    main_specialty = Column(String(100), nullable=False)
    other_skills = Column(ARRAY(String), nullable=True)
    years_experience = Column(String(50), nullable=True)
    activity_description = Column(Text, nullable=False)
    brand_story = Column(Text, nullable=True)
    offerings = Column(ARRAY(String), nullable=True)  # ["products", "workshops", "both"]
    nif = Column(String(50), nullable=True)
    stat = Column(String(50), nullable=True)
    documents_not_available = Column(Boolean, default=False, nullable=False)
    status = Column(EnumType(ProfileStatus), default=ProfileStatus.PENDING_APPROVAL, nullable=False, index=True)
    admin_notes = Column(Text, nullable=True)
    
    # Additional fields from original UserProfile if needed
    about = Column(Text, nullable=True)
    specialties = Column(ARRAY(String), nullable=True)
    location_region = Column(String(100), nullable=True)
    location_city = Column(String(100), nullable=True)
    location_address = Column(String(200), nullable=True)
    experience = Column(String(200), nullable=True)
    artisan_type = Column(String(20), nullable=True)  # "artizaho" | "uber"
    business_info = Column(JSON, nullable=True)
    certifications = Column(ARRAY(String), nullable=True)
    awards = Column(ARRAY(String), nullable=True)
    social_media = Column(JSON, nullable=True)
    
    # Relationships
    user = relationship("User", back_populates="artisan_profile")
    artisan_photos = relationship("ArtisanPhoto", back_populates="artisan_profile", cascade="all, delete-orphan")
    # Temporarily comment out relationships that require models not yet fully configured
    # products = relationship("Product", back_populates="artisan")
    # workshops = relationship("Workshop", back_populates="artisan")
    # unavailability_periods = relationship("UnavailabilityPeriod", back_populates="artisan", cascade="all, delete-orphan")


class ArtisanPhoto(BaseModel):
    __tablename__ = "artisan_photos"
    
    artisan_profile_id = Column(UUID(as_uuid=True), ForeignKey("artisan_profiles.id"), nullable=False, index=True)
    photo_url = Column(String(500), nullable=False)
    # 'order' is a SQL reserved word in some dialects (e.g. SQLite). Use 'position'
    # to avoid SQL syntax errors during migrations / tests.
    position = Column(Integer, default=0, nullable=False)
    
    # Relationships
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
    
    # Relationships (if needed for backward compatibility)
    # user = relationship("User", back_populates="profile")


class SocialAccount(BaseModel):
    __tablename__ = "social_accounts"
    
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False, index=True)
    provider = Column(String(20), nullable=False)
    provider_id = Column(String(100), nullable=False)
    provider_email = Column(String(255))
    provider_data = Column(JSON)
    
    # Relationships (if needed)
    # user = relationship("User", back_populates="social_accounts")


class UserSession(BaseModel):
    __tablename__ = "user_sessions"
    
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False, index=True)
    refresh_token = Column(String(500), unique=True, nullable=False, index=True)
    access_token_jti = Column(String(100), unique=True, nullable=True)
    device_info = Column(JSON, nullable=True)
    is_active = Column(Boolean, default=True, index=True)
    expires_at = Column(DateTime, nullable=False, index=True)
    last_used_at = Column(DateTime, server_default=func.now())
    
    # Relationships
    user = relationship("User", back_populates="sessions") 