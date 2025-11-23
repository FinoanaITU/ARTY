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
                dialect_name = getattr(bind.dialect, 'name', None)
                if dialect_name:
                    return dialect_name == 'sqlite'
                # Vérifier via l'URL de connexion
                url = str(getattr(bind, 'url', ''))
                if url and 'sqlite' in url.lower():
                    return True
            return False
        except Exception:
            # Si on ne peut pas déterminer, supposer PostgreSQL (production)
            return False
    
    @staticmethod
    async def create_artisan(
        db: Session, 
        artisan_data: ArtisanRegisterIn,
        photos: Optional[list] = None
    ) -> tuple[User, ArtisanProfile]:
        """Crée un utilisateur artisan avec son profil"""
        # Vérifier si on est en mode SQLite (pour les tests)
        # Si oui, utiliser SQL brut pour éviter les problèmes avec ARRAY
        is_sqlite = AuthService._is_sqlite(db)
        
        # Vérifier si l'email existe déjà
        if is_sqlite:
            # Pour SQLite, utiliser SQL brut pour la vérification
            from sqlalchemy import text
            existing = db.execute(
                text("SELECT id FROM users WHERE email = :email"),
                {"email": artisan_data.email}
            ).fetchone()
            if existing:
                raise ValueError("Un compte avec cet email existe déjà")
        else:
            # Pour PostgreSQL, utiliser l'ORM
            existing_user = db.query(User).filter(User.email == artisan_data.email).first()
            if existing_user:
                raise ValueError("Un compte avec cet email existe déjà")
        
        if is_sqlite:
            # Pour SQLite, utiliser SQL brut pour tout (user + profile)
            # Cela garantit la cohérence des types et évite les problèmes de FK
            from sqlalchemy import text
            from sqlalchemy.exc import IntegrityError
            
            user_id = uuid.uuid4()
            profile_id = uuid.uuid4()
            
            try:
                # Insérer l'utilisateur avec SQL brut
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
                
                # Commit l'utilisateur avant d'insérer le profil (nécessaire pour FK)
                db.commit()
            except IntegrityError as e:
                db.rollback()
                # Vérifier si c'est une erreur d'email dupliqué
                if "UNIQUE constraint failed: users.email" in str(e) or "unique constraint" in str(e).lower():
                    raise ValueError("Un compte avec cet email existe déjà")
                raise
            
            try:
                # Insérer le profil artisan avec JSON sérialisé
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
                # Nettoyer l'utilisateur créé si le profil échoue
                try:
                    db.execute(text("DELETE FROM users WHERE id = :id"), {"id": str(user_id)})
                    db.commit()
                except Exception:
                    pass
                raise ValueError(f"Échec de la création du profil artisan: {e}")
            
            # Récupérer l'utilisateur et le profil créés depuis la base de données
            # Pour SQLite, utiliser SQL brut car l'ORM a des problèmes avec les enums stockés comme VARCHAR
            # S'assurer que le commit est fait avant de récupérer
            db.commit()
            
            # Pour SQLite, toujours utiliser SQL brut car l'ORM a des problèmes avec:
            # 1. Les UUIDs stockés comme strings
            # 2. Les enums stockés comme VARCHAR (SQLAlchemy ne peut pas les mapper correctement depuis SQLite)
            # Utiliser SQL brut pour récupérer les données
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
            
            # Créer les objets SQLAlchemy manuellement à partir des résultats SQL
            # Convertir les Row objects en dictionnaires
            try:
                # SQLAlchemy 2.0+ retourne des Row avec _mapping
                if hasattr(user_result, '_mapping'):
                    user_dict = dict(user_result._mapping)
                elif hasattr(user_result, '_asdict'):
                    user_dict = user_result._asdict()
                else:
                    # Fallback: créer un dict depuis les clés et valeurs
                    user_dict = {key: getattr(user_result, key, None) for key in user_result.keys()}
                
                if hasattr(profile_result, '_mapping'):
                    profile_dict = dict(profile_result._mapping)
                elif hasattr(profile_result, '_asdict'):
                    profile_dict = profile_result._asdict()
                else:
                    profile_dict = {key: getattr(profile_result, key, None) for key in profile_result.keys()}
            except Exception as e:
                raise ValueError(f"Erreur lors de la conversion des résultats SQL: {e}")
            
            # Créer les objets manuellement (non attachés à la session)
            user = User()
            user.id = uuid.UUID(user_dict['id']) if isinstance(user_dict['id'], str) else user_dict['id']
            user.email = user_dict['email']
            user.password_hash = user_dict['password_hash']
            user.name = user_dict['name']
            user.phone = user_dict.get('phone') if user_dict.get('phone') else None
            user.address = user_dict.get('address') if user_dict.get('address') else None
            user.city = user_dict['city']
            user.country = user_dict['country']
            # Convertir la valeur string de l'enum en enum
            # UserRole est un enum str, donc on peut créer l'enum directement depuis la valeur
            role_value = user_dict['role']
            try:
                # UserRole hérite de str et enum.Enum, donc on peut créer l'enum depuis la valeur
                # Par exemple: UserRole("artisan") -> UserRole.ARTISAN
                user.role = UserRole(role_value)
            except (ValueError, KeyError):
                # Si la conversion échoue (valeur invalide), utiliser ARTISAN par défaut
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
            # Pour les champs JSON, les parser depuis la string
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
            # Convertir la valeur string de l'enum en enum
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
            
            # Marquer ces objets comme "transient" (non persistants dans la session)
            # Cela évite les problèmes avec refresh() plus tard
            from sqlalchemy.orm import make_transient
            make_transient(user)
            make_transient(artisan_profile)
        else:
            # Pour PostgreSQL, utiliser les modèles normalement
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
                    # Upload la photo (await car upload_file est async)
                    photo_url = await storage_service.upload_file(
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
                    import traceback
                    print(f"Erreur lors de l'upload de la photo {index}: {e}")
                    traceback.print_exc()
                    # Ne pas échouer complètement si une photo ne peut pas être uploadée
                    continue
        
        # Commit final pour les photos (si nécessaire)
        # Note: Pour SQLite, les objets user et artisan_profile ont déjà été récupérés/créés plus haut
        # et commités. Pour PostgreSQL, ils doivent être commités ici.
        if photos:
            # Commit les photos
            if not is_sqlite:
                # Pour PostgreSQL, commit et refresh
                db.commit()
                db.refresh(user)
                db.refresh(artisan_profile)
            else:
                # Pour SQLite, commit seulement (les objets sont déjà récupérés)
                db.commit()
                # Vérifier si les objets sont dans la session avant de refresh
                try:
                    # Seulement refresh si les objets sont attachés à la session (via ORM)
                    if hasattr(user, '_sa_instance_state') and user._sa_instance_state.persistent:
                        db.refresh(user)
                    if hasattr(artisan_profile, '_sa_instance_state') and artisan_profile._sa_instance_state.persistent:
                        db.refresh(artisan_profile)
                except Exception:
                    # Si refresh échoue (objets non persistants), ce n'est pas grave
                    # Les objets ont déjà toutes les données nécessaires
                    pass
        elif not is_sqlite:
            # Pour PostgreSQL sans photos, commit et refresh
            db.commit()
            db.refresh(user)
            db.refresh(artisan_profile)
        # Pour SQLite sans photos, rien à faire (déjà commité et récupéré plus haut)
        
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
        # Vérifier si l'utilisateur est attaché à la session avant de le modifier
        try:
            user.last_login_at = datetime.utcnow()
            db.commit()
            # Refresh pour s'assurer que les changements sont persistés
            try:
                db.refresh(user)
            except Exception:
                # Si refresh échoue (objet non attaché), ce n'est pas grave
                pass
        except Exception as e:
            # En cas d'erreur, ne pas faire échouer l'authentification
            # L'utilisateur peut quand même être authentifié même si la mise à jour de last_login_at échoue
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
            # Vérifier si on est en SQLite
            is_sqlite = AuthService._is_sqlite(db)
            
            if is_sqlite:
                # Pour SQLite, utiliser string directement
                user = db.query(User).filter(User.id == user_id).first()
            else:
                # Pour PostgreSQL, convertir en UUID
                user_uuid = uuid.UUID(user_id) if isinstance(user_id, str) else user_id
                user = db.query(User).filter(User.id == user_uuid).first()
            
            if not user or not user.is_active:
                raise ValueError("Utilisateur introuvable ou inactif")
            
            # Générer de nouveaux tokens
            return AuthService.generate_tokens(user)
        except (ValueError, TypeError, AttributeError) as e:
            # En cas d'erreur, essayer avec string
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
            # Vérifier si on est en SQLite
            is_sqlite = AuthService._is_sqlite(db)
            
            if is_sqlite:
                # Pour SQLite, utiliser string directement
                user = db.query(User).filter(User.id == user_id).first()
            else:
                # Pour PostgreSQL, convertir en UUID
                user_uuid = uuid.UUID(user_id) if isinstance(user_id, str) else user_id
                user = db.query(User).filter(User.id == user_uuid).first()
            
            return user if user and user.is_active else None
        except (ValueError, TypeError, AttributeError) as e:
            # En cas d'erreur, essayer avec string
            try:
                user = db.query(User).filter(User.id == user_id).first()
                return user if user and user.is_active else None
            except Exception:
                return None


# Instance pour import facile
auth_service = AuthService()
