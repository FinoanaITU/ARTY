"""
Service d'authentification pour gérer la logique métier
"""
from datetime import datetime, timedelta
from typing import Optional
from sqlalchemy.orm import Session
from sqlalchemy import inspect
from jose import JWTError, jwt
import json
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
    def _is_sqlite(db: Session) -> bool:
        """Vérifie si la base de données est SQLite"""
        try:
            # Accéder au dialect via la connexion de la session
            bind = db.get_bind() if hasattr(db, 'get_bind') else (db.bind if hasattr(db, 'bind') else None)
            if bind:
                return bind.dialect.name == 'sqlite'
            # Vérifier via l'URL de connexion
            if hasattr(db, 'bind') and hasattr(db.bind, 'url'):
                return 'sqlite' in str(db.bind.url)
            return False
        except Exception:
            # Si on ne peut pas déterminer, supposer PostgreSQL (production)
            return False
    
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
        
        # Vérifier si on est en mode SQLite (pour les tests)
        # Si oui, utiliser SQL brut pour éviter les problèmes avec ARRAY
        is_sqlite = AuthService._is_sqlite(db)
        
        if is_sqlite:
            # Pour SQLite, utiliser SQL brut avec JSON sérialisé
            from sqlalchemy import text
            profile_id = uuid.uuid4()
            
            db.execute(
                text("""
                    INSERT INTO artisan_profiles (id, user_id, region, languages, company_name, main_specialty, other_skills, years_experience, activity_description, brand_story, offerings, nif, stat, documents_not_available, status, created_at, updated_at)
                    VALUES (:id, :user_id, :region, :languages, :company_name, :main_specialty, :other_skills, :years_experience, :activity_description, :brand_story, :offerings, :nif, :stat, :documents_not_available, :status, datetime('now'), datetime('now'))
                """),
                {
                    "id": str(profile_id),
                    "user_id": str(user.id),
                    "region": artisan_data.region,
                    "languages": json.dumps(artisan_data.languages or []),
                    "company_name": artisan_data.company_name,
                    "main_specialty": artisan_data.main_specialty,
                    "other_skills": json.dumps(artisan_data.other_skills or []),
                    "years_experience": artisan_data.years_experience,
                    "activity_description": artisan_data.activity_description,
                    "brand_story": artisan_data.brand_story,
                    "offerings": json.dumps(artisan_data.offerings or []),
                    "nif": artisan_data.nif if not artisan_data.documents_not_available else None,
                    "stat": artisan_data.stat if not artisan_data.documents_not_available else None,
                    "documents_not_available": artisan_data.documents_not_available,
                    "status": ProfileStatus.PENDING_APPROVAL.value
                }
            )
            db.commit()
            db.refresh(user)
            artisan_profile = db.query(ArtisanProfile).filter(ArtisanProfile.id == profile_id).first()
        else:
            # Pour PostgreSQL, utiliser les modèles normalement
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
            db.flush()
            db.refresh(user)
        
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
                    if is_sqlite:
                        # Pour SQLite, utiliser SQL brut
                        from sqlalchemy import text
                        photo_id = uuid.uuid4()
                        db.execute(
                            text("""
                                INSERT INTO artisan_photos (id, artisan_profile_id, photo_url, position, created_at, updated_at)
                                VALUES (:id, :artisan_profile_id, :photo_url, :position, datetime('now'), datetime('now'))
                            """),
                            {
                                "id": str(photo_id),
                                "artisan_profile_id": str(artisan_profile.id),
                                "photo_url": photo_url,
                                "position": index
                            }
                        )
                    else:
                        artisan_photo = ArtisanPhoto(
                            artisan_profile_id=artisan_profile.id,
                            photo_url=photo_url,
                            position=index
                        )
                        db.add(artisan_photo)
                except Exception as e:
                    # Log l'erreur mais continue
                    print(f"Erreur lors de l'upload de la photo {index}: {e}")
        
        # Commit final
        if is_sqlite:
            # Pour SQLite, commit toutes les photos
            db.commit()
            db.refresh(user)
            if artisan_profile:
                db.refresh(artisan_profile)
        else:
            # Pour PostgreSQL, commit normal
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
    def refresh_access_token(db: Session, refresh_token: str) -> dict:
        """Rafraîchit le token d'accès avec un refresh token"""
        payload = AuthService.verify_token(refresh_token)
        
        if not payload or payload.get("type") != "refresh":
            raise ValueError("Token de refresh invalide")
        
        user_id = payload.get("sub")
        if not user_id:
            raise ValueError("Token invalide")
        
        try:
            user_uuid = uuid.UUID(user_id) if isinstance(user_id, str) else user_id
            user = db.query(User).filter(User.id == user_uuid).first()
            if not user or not user.is_active:
                raise ValueError("Utilisateur introuvable ou inactif")
            
            # Générer de nouveaux tokens
            return AuthService.generate_tokens(user)
        except (ValueError, TypeError, AttributeError) as e:
            raise ValueError(f"Erreur lors du rafraîchissement: {str(e)}")
    
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
            user_uuid = uuid.UUID(user_id) if isinstance(user_id, str) else user_id
            user = db.query(User).filter(User.id == user_uuid).first()
            return user if user and user.is_active else None
        except (ValueError, TypeError, AttributeError):
            return None


# Instance pour import facile
auth_service = AuthService()
