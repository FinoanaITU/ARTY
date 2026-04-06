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

        existing_user = db.query(User).filter(User.email == buyer_data.email).first()
        if existing_user:
            raise ValueError("Un compte avec cet email existe déjà")
        

        nationality = AuthService.detect_nationality(buyer_data.country)
        

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

            bind = db.get_bind() if hasattr(db, 'get_bind') else (db.bind if hasattr(db, 'bind') else None)
            if bind:
                dialect_name = getattr(bind.dialect, 'name', None)
                if dialect_name:
                    return dialect_name == 'sqlite'

                url = str(getattr(bind, 'url', ''))
                if url and 'sqlite' in url.lower():
                    return True
            return False
        except Exception:

            return False
    
    @staticmethod
    async def create_artisan(
        db: Session, 
        artisan_data: ArtisanRegisterIn,
        photos: Optional[list] = None
    ) -> tuple[User, ArtisanProfile]:
        """Crée un utilisateur artisan avec son profil"""

        is_sqlite = AuthService._is_sqlite(db)
        

        if is_sqlite:

            from sqlalchemy import text
            existing = db.execute(
                text("SELECT id FROM users WHERE email = :email"),
                {"email": artisan_data.email}
            ).fetchone()
            if existing:
                raise ValueError("Un compte avec cet email existe déjà")
        else:

            existing_user = db.query(User).filter(User.email == artisan_data.email).first()
            if existing_user:
                raise ValueError("Un compte avec cet email existe déjà")
        
        if is_sqlite:

            from sqlalchemy import text
            from sqlalchemy.exc import IntegrityError
            
            user_id = uuid.uuid4()
            profile_id = uuid.uuid4()
            
            try:

                db.execute(
                    text("""
                        INSERT INTO users (id, email, password_hash, name, phone, address, city, country, role, nationality, is_active, is_email_verified, created_at, updated_at)
                        VALUES (:id, :email, :password_hash, :name, :phone, :address, :city, :country, :role, :nationality, :is_active, :is_email_verified, datetime('now'), datetime('now'))
                    """),
                    {
                        "id": str(user_id),
                        "email": artisan_data.email,
                        "password_hash": get_password_hash(artisan_data.password),
                        "name": artisan_data.name,
                        "phone": artisan_data.phone,
                        "address": artisan_data.address,
                        "city": artisan_data.city,
                        "country": "madagascar",
                        "role": UserRole.ARTISAN.value,
                        "nationality": Nationality.LOCAL.value,
                        "is_active": 1,
                        "is_email_verified": 0
                    }
                )
                

                db.commit()
            except IntegrityError as e:
                db.rollback()

                if "UNIQUE constraint failed: users.email" in str(e) or "unique constraint" in str(e).lower():
                    raise ValueError("Un compte avec cet email existe déjà")
                raise
            
            try:

                db.execute(
                    text("""
                        INSERT INTO artisan_profiles (id, user_id, region, languages, company_name, main_specialty, other_skills, years_experience, activity_description, brand_story, offerings, nif, stat, documents_not_available, status, created_at, updated_at)
                        VALUES (:id, :user_id, :region, :languages, :company_name, :main_specialty, :other_skills, :years_experience, :activity_description, :brand_story, :offerings, :nif, :stat, :documents_not_available, :status, datetime('now'), datetime('now'))
                    """),
                    {
                        "id": str(profile_id),
                        "user_id": str(user_id),
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
                        "documents_not_available": 1 if artisan_data.documents_not_available else 0,
                        "status": ProfileStatus.PENDING_APPROVAL.value
                    }
                )
                
                db.commit()
            except IntegrityError as e:
                db.rollback()

                try:
                    db.execute(text("DELETE FROM users WHERE id = :id"), {"id": str(user_id)})
                    db.commit()
                except Exception:
                    pass
                raise ValueError(f"Échec de la création du profil artisan: {e}")
            

            db.commit()
            

            user_result = db.execute(
                text("SELECT * FROM users WHERE id = :id"),
                {"id": str(user_id)}
            ).fetchone()
            
            if not user_result:
                raise ValueError(f"Échec de la création de l'utilisateur: utilisateur non trouvé après insertion (id: {user_id})")
            
            profile_result = db.execute(
                text("SELECT * FROM artisan_profiles WHERE id = :id"),
                {"id": str(profile_id)}
            ).fetchone()
            
            if not profile_result:
                raise ValueError(f"Échec de la création du profil artisan: profil non trouvé après insertion (id: {profile_id})")
            

            try:

                if hasattr(user_result, '_mapping'):
                    user_dict = dict(user_result._mapping)
                elif hasattr(user_result, '_asdict'):
                    user_dict = user_result._asdict()
                else:

                    user_dict = {key: getattr(user_result, key, None) for key in user_result.keys()}
                
                if hasattr(profile_result, '_mapping'):
                    profile_dict = dict(profile_result._mapping)
                elif hasattr(profile_result, '_asdict'):
                    profile_dict = profile_result._asdict()
                else:
                    profile_dict = {key: getattr(profile_result, key, None) for key in profile_result.keys()}
            except Exception as e:
                raise ValueError(f"Erreur lors de la conversion des résultats SQL: {e}")
            

            user = User()
            user.id = uuid.UUID(user_dict['id']) if isinstance(user_dict['id'], str) else user_dict['id']
            user.email = user_dict['email']
            user.password_hash = user_dict['password_hash']
            user.name = user_dict['name']
            user.phone = user_dict.get('phone') if user_dict.get('phone') else None
            user.address = user_dict.get('address') if user_dict.get('address') else None
            user.city = user_dict['city']
            user.country = user_dict['country']

            role_value = user_dict['role']
            try:

                user.role = UserRole(role_value)
            except (ValueError, KeyError):

                user.role = UserRole.ARTISAN
            nationality_value = user_dict.get('nationality')
            if nationality_value:
                try:
                    user.nationality = Nationality(nationality_value)
                except (ValueError, KeyError):
                    user.nationality = Nationality.LOCAL
            else:
                user.nationality = None
            user.is_active = bool(user_dict['is_active'])
            user.is_email_verified = bool(user_dict['is_email_verified'])
            user.avatar = None
            user.buyer_type = None
            user.company_name = None
            user.siret = None
            user.created_at = user_dict.get('created_at')
            user.updated_at = user_dict.get('updated_at')
            
            artisan_profile = ArtisanProfile()
            artisan_profile.id = uuid.UUID(profile_dict['id']) if isinstance(profile_dict['id'], str) else profile_dict['id']
            artisan_profile.user_id = uuid.UUID(profile_dict['user_id']) if isinstance(profile_dict['user_id'], str) else profile_dict['user_id']
            artisan_profile.region = profile_dict.get('region')

            try:
                artisan_profile.languages = json.loads(profile_dict['languages']) if profile_dict.get('languages') else []
            except Exception:
                artisan_profile.languages = []
            artisan_profile.company_name = profile_dict['company_name']
            artisan_profile.main_specialty = profile_dict['main_specialty']
            try:
                artisan_profile.other_skills = json.loads(profile_dict['other_skills']) if profile_dict.get('other_skills') else []
            except Exception:
                artisan_profile.other_skills = []
            artisan_profile.years_experience = profile_dict.get('years_experience')
            artisan_profile.activity_description = profile_dict['activity_description']
            artisan_profile.brand_story = profile_dict.get('brand_story')
            try:
                artisan_profile.offerings = json.loads(profile_dict['offerings']) if profile_dict.get('offerings') else []
            except Exception:
                artisan_profile.offerings = []
            artisan_profile.nif = profile_dict.get('nif')
            artisan_profile.stat = profile_dict.get('stat')
            artisan_profile.documents_not_available = bool(profile_dict.get('documents_not_available', False))

            status_value = profile_dict.get('status')
            if status_value:
                try:
                    artisan_profile.status = ProfileStatus(status_value)
                except (ValueError, KeyError):
                    artisan_profile.status = ProfileStatus.PENDING_APPROVAL
            else:
                artisan_profile.status = ProfileStatus.PENDING_APPROVAL
            artisan_profile.created_at = profile_dict.get('created_at')
            artisan_profile.updated_at = profile_dict.get('updated_at')
            

            from sqlalchemy.orm import make_transient
            make_transient(user)
            make_transient(artisan_profile)
        else:

            user = User(
                email=artisan_data.email,
                password_hash=get_password_hash(artisan_data.password),
                name=artisan_data.name,
                phone=artisan_data.phone,
                address=artisan_data.address,
                city=artisan_data.city,
                country="madagascar",
                role=UserRole.ARTISAN,
                nationality=Nationality.LOCAL,
                is_active=True,
                is_email_verified=False
            )
            
            db.add(user)
            db.flush()
            
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
        

        if photos:
            storage_service = StorageService()
            for index, photo_file in enumerate(photos[:5]):
                try:

                    photo_url = await storage_service.upload_file(
                        file=photo_file,
                        folder="artisans",
                        allowed_extensions=["jpg", "jpeg", "png", "webp"]
                    )
                    

                    if is_sqlite:

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

                    import traceback
                    print(f"Erreur lors de l'upload de la photo {index}: {e}")
                    traceback.print_exc()

                    continue
        

        if photos:

            if not is_sqlite:

                db.commit()
                db.refresh(user)
                db.refresh(artisan_profile)
            else:

                db.commit()

                try:

                    if hasattr(user, '_sa_instance_state') and user._sa_instance_state.persistent:
                        db.refresh(user)
                    if hasattr(artisan_profile, '_sa_instance_state') and artisan_profile._sa_instance_state.persistent:
                        db.refresh(artisan_profile)
                except Exception:

                    pass
        elif not is_sqlite:

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
        

        try:
            user.last_login_at = datetime.utcnow()
            db.commit()

            try:
                db.refresh(user)
            except Exception:

                pass
        except Exception as e:

            print(f"Warning: Could not update last_login_at: {e}")
            db.rollback()
        
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

            is_sqlite = AuthService._is_sqlite(db)
            
            if is_sqlite:

                user = db.query(User).filter(User.id == user_id).first()
            else:

                user_uuid = uuid.UUID(user_id) if isinstance(user_id, str) else user_id
                user = db.query(User).filter(User.id == user_uuid).first()
            
            if not user or not user.is_active:
                raise ValueError("Utilisateur introuvable ou inactif")
            

            return AuthService.generate_tokens(user)
        except (ValueError, TypeError, AttributeError) as e:

            try:
                user = db.query(User).filter(User.id == user_id).first()
                if not user or not user.is_active:
                    raise ValueError("Utilisateur introuvable ou inactif")
                return AuthService.generate_tokens(user)
            except Exception:
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

            is_sqlite = AuthService._is_sqlite(db)
            
            if is_sqlite:

                user = db.query(User).filter(User.id == user_id).first()
            else:

                user_uuid = uuid.UUID(user_id) if isinstance(user_id, str) else user_id
                user = db.query(User).filter(User.id == user_uuid).first()
            
            return user if user and user.is_active else None
        except (ValueError, TypeError, AttributeError) as e:

            try:
                user = db.query(User).filter(User.id == user_id).first()
                return user if user and user.is_active else None
            except Exception:
                return None

auth_service = AuthService()
