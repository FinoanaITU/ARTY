"""
Service de gestion des utilisateurs et profils
"""
from typing import Optional
from uuid import UUID
from sqlalchemy.orm import Session
from sqlalchemy import text
from fastapi import HTTPException, status

from app.models.user import User, ArtisanProfile, UserRole
from app.schemas.user import UserUpdate, ArtisanProfileUpdate, UserWithArtisanUpdate, UserOut
from app.services.storage import StorageService

class UserService:
    """Service pour gérer les utilisateurs et leurs profils"""
    
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
    async def get_user_by_id(db: Session, user_id: UUID) -> Optional[User]:
        """Récupère un utilisateur par son ID"""
        return db.query(User).filter(User.id == user_id).first()
    
    @staticmethod
    async def get_user_with_profile(db: Session, user_id: UUID) -> Optional[User]:
        """Récupère un utilisateur avec son profil artisan si applicable"""
        user = db.query(User).filter(User.id == user_id).first()
        if user and user.role == UserRole.ARTISAN:

            if not user.artisan_profile:
                artisan_profile = db.query(ArtisanProfile).filter(
                    ArtisanProfile.user_id == user_id
                ).first()
                if artisan_profile:
                    user.artisan_profile = artisan_profile
        return user
    
    @staticmethod
    async def update_profile(
        db: Session,
        user_id: UUID,
        update_data: UserUpdate
    ) -> User:
        """
        Met à jour le profil utilisateur de base.
        Gère la validation de l'email unique et l'upload d'avatar.
        """

        user = await UserService.get_user_by_id(db, user_id)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Utilisateur non trouvé"
            )
        

        if update_data.email and update_data.email != user.email:
            existing_user = db.query(User).filter(
                User.email == update_data.email,
                User.id != user_id
            ).first()
            if existing_user:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Cet email est déjà utilisé"
                )
        

        update_dict = update_data.model_dump(exclude_unset=True)
        
        for field, value in update_dict.items():
            if hasattr(user, field):
                setattr(user, field, value)
        
        db.commit()
        db.refresh(user)
        
        return user
    
    @staticmethod
    async def update_artisan_profile(
        db: Session,
        user_id: UUID,
        profile_update: ArtisanProfileUpdate
    ) -> ArtisanProfile:
        """
        Met à jour le profil artisan.
        Vérifie que l'utilisateur est bien un artisan.
        """

        user = await UserService.get_user_by_id(db, user_id)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Utilisateur non trouvé"
            )
        
        if user.role != UserRole.ARTISAN:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Seuls les artisans peuvent modifier ce profil"
            )
        

        artisan_profile = db.query(ArtisanProfile).filter(
            ArtisanProfile.user_id == user_id
        ).first()
        
        if not artisan_profile:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Profil artisan non trouvé"
            )
        

        is_sqlite = UserService._is_sqlite(db)
        update_dict = profile_update.model_dump(exclude_unset=True)
        
        if is_sqlite:

            import json
            for field, value in update_dict.items():
                if isinstance(value, list):
                    update_dict[field] = json.dumps(value)
                elif isinstance(value, dict):
                    update_dict[field] = json.dumps(value)
        

        for field, value in update_dict.items():
            if hasattr(artisan_profile, field):
                setattr(artisan_profile, field, value)
        
        db.commit()
        db.refresh(artisan_profile)
        
        return artisan_profile
    
    @staticmethod
    async def update_user_and_artisan(
        db: Session,
        user_id: UUID,
        combined_update: UserWithArtisanUpdate
    ) -> tuple[User, Optional[ArtisanProfile]]:
        """
        Met à jour à la fois l'utilisateur et son profil artisan.
        Pratique pour un seul appel API.
        """
        user = None
        artisan_profile = None
        

        if combined_update.user:
            user = await UserService.update_profile(db, user_id, combined_update.user)
        else:
            user = await UserService.get_user_by_id(db, user_id)
        

        if combined_update.artisan_profile:
            artisan_profile = await UserService.update_artisan_profile(
                db, user_id, combined_update.artisan_profile
            )
        
        return user, artisan_profile
    
    @staticmethod
    async def delete_user(db: Session, user_id: UUID) -> bool:
        """
        Supprime un utilisateur (soft delete - désactivation).
        """
        user = await UserService.get_user_by_id(db, user_id)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Utilisateur non trouvé"
            )
        

        user.is_active = False
        db.commit()
        
        return True
    
    @staticmethod
    async def upload_avatar(
        db: Session,
        user_id: UUID,
        file_content: bytes,
        filename: str
    ) -> str:
        """
        Upload l'avatar d'un utilisateur et met à jour son profil.
        Retourne l'URL de l'avatar uploadé.
        """
        storage_service = StorageService()
        

        avatar_url = await storage_service.upload_file(
            file_content=file_content,
            filename=filename,
            folder="avatars"
        )
        

        user = await UserService.get_user_by_id(db, user_id)
        if user:
            user.avatar = avatar_url
            db.commit()
        
        return avatar_url
