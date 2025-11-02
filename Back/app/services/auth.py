"""
Service d'authentification pour gérer la logique métier
"""
from datetime import datetime, timedelta
from typing import Optional
from sqlalchemy.orm import Session
from jose import JWTError, jwt
from app.core.config import settings
from app.core.security import get_password_hash, verify_password, create_access_token, create_refresh_token
from app.models.user import User, ArtisanProfile, ArtisanPhoto, UserRole, BuyerType, Nationality, ProfileStatus
from app.schemas.user import BuyerRegisterIn, ArtisanRegisterIn
from app.services.storage import StorageService
import uuid


class AuthService:
    """Service pour gérer l'authentification"""
    
    @staticmethod
    def detect_nationality(country: str) -> Nationality:
        """Détecte la nationalité selon le pays"""
        if country.lower() == "madagascar":
            return Nationality.LOCAL
        return Nationality.FOREIGN
    
    @staticmethod
    def create_buyer(db: Session, buyer_data: BuyerRegisterIn) -> User:
        """Crée un utilisateur acheteur"""
        # Vérifier si l'email existe déjà
        existing_user = db.query(User).filter(User.email == buyer_data.email).first()
        if existing_user:
            raise ValueError("Un compte avec cet email existe déjà")
        
        # Détecter la nationalité
        nationality = AuthService.detect_nationality(buyer_data.country)
        
        # Créer l'utilisateur
        user = User(
            email=buyer_data.email,
            password_hash=get_password_hash(buyer_data.password),
            name=buyer_data.name,
            phone=buyer_data.phone,
            address=buyer_data.address,
            city=buyer_data.city,
            country=buyer_data.country,
            role=UserRole.BUYER,
            buyer_type=buyer_data.buyer_type,
            nationality=nationality,
            company_name=buyer_data.company_name if buyer_data.buyer_type == BuyerType.ENTREPRISE else None,
            siret=buyer_data.siret if buyer_data.buyer_type == BuyerType.ENTREPRISE else None,
            is_active=True,
            is_email_verified=False
        )
        
        db.add(user)
        db.commit()
        db.refresh(user)
        
        return user
    
    @staticmethod
    def create_artisan(
        db: Session, 
        artisan_data: ArtisanRegisterIn,
        photos: Optional[list] = None
    ) -> tuple[User, ArtisanProfile]:
        """Crée un utilisateur artisan avec son profil"""
        # Vérifier si l'email existe déjà
        existing_user = db.query(User).filter(User.email == artisan_data.email).first()
        if existing_user:
            raise ValueError("Un compte avec cet email existe déjà")
        
        # Créer l'utilisateur
        user = User(
            email=artisan_data.email,
            password_hash=get_password_hash(artisan_data.password),
            name=artisan_data.name,
            phone=artisan_data.phone,
            address=artisan_data.address,
            city=artisan_data.city,
            country="madagascar",  # Artisans toujours de Madagascar
            role=UserRole.ARTISAN,
            nationality=Nationality.LOCAL,
            is_active=True,
            is_email_verified=False
        )
        
        db.add(user)
        db.flush()  # Pour obtenir l'ID de l'utilisateur
        
        # Créer le profil artisan
        artisan_profile = ArtisanProfile(
            user_id=user.id,
            region=artisan_data.region,
            languages=artisan_data.languages,
            company_name=artisan_data.company_name,
            main_specialty=artisan_data.main_specialty,
            other_skills=artisan_data.other_skills,
            years_experience=artisan_data.years_experience,
            activity_description=artisan_data.activity_description,
            brand_story=artisan_data.brand_story,
            offerings=artisan_data.offerings,
            nif=artisan_data.nif if not artisan_data.documents_not_available else None,
            stat=artisan_data.stat if not artisan_data.documents_not_available else None,
            documents_not_available=artisan_data.documents_not_available,
            status=ProfileStatus.PENDING_APPROVAL
        )
        
        db.add(artisan_profile)
        
        # Gérer les photos si fournies
        if photos:
            storage_service = StorageService()
            for index, photo_file in enumerate(photos[:5]):  # Max 5 photos
                try:
                    # Upload la photo
                    photo_url = storage_service.upload_file(
                        file=photo_file,
                        folder="artisans",
                        allowed_extensions=["jpg", "jpeg", "png", "webp"]
                    )
                    
                    # Créer l'enregistrement
                    artisan_photo = ArtisanPhoto(
                        artisan_profile_id=artisan_profile.id,
                        photo_url=photo_url,
                        order=index
                    )
                    db.add(artisan_photo)
                except Exception as e:
                    # Log l'erreur mais continue
                    print(f"Erreur lors de l'upload de la photo {index}: {e}")
        
        db.commit()
        db.refresh(user)
        db.refresh(artisan_profile)
        
        return user, artisan_profile
    
    @staticmethod
    def authenticate(db: Session, email: str, password: str) -> Optional[User]:
        """Authentifie un utilisateur avec email et mot de passe"""
        user = db.query(User).filter(User.email == email).first()
        if not user:
            return None
        
        if not verify_password(password, user.password_hash):
            return None
        
        if not user.is_active:
            return None
        
        # Mettre à jour la date de dernière connexion
        user.last_login_at = datetime.utcnow()
        db.commit()
        
        return user
    
    @staticmethod
    def generate_tokens(user: User) -> dict:
        """Génère les tokens d'accès et de refresh"""
        access_token = create_access_token(
            data={"sub": str(user.id), "role": user.role.value}
        )
        refresh_token = create_refresh_token(
            data={"sub": str(user.id)}
        )
        
        return {
            "access_token": access_token,
            "refresh_token": refresh_token,
            "token_type": "bearer"
        }
    
    @staticmethod
    def verify_token(token: str) -> Optional[dict]:
        """Vérifie et décode un token JWT"""
        try:
            payload = jwt.decode(
                token,
                settings.SECRET_KEY,
                algorithms=[settings.ALGORITHM]
            )
            return payload
        except JWTError:
            return None
    
    @staticmethod
    def get_current_user(db: Session, token: str) -> Optional[User]:
        """Récupère l'utilisateur actuel depuis le token"""
        payload = AuthService.verify_token(token)
        if not payload:
            return None
        
        user_id = payload.get("sub")
        if not user_id:
            return None
        
        try:
            user = db.query(User).filter(User.id == uuid.UUID(user_id)).first()
            return user if user and user.is_active else None
        except (ValueError, TypeError):
            return None


# Instance pour import facile
auth_service = AuthService()
