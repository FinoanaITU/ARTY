"""
Endpoints pour la gestion des profils utilisateurs
"""
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from sqlalchemy.orm import Session
from uuid import UUID

from app.core.database import get_db
from app.api.deps import get_current_active_user
from app.models.user import User, UserRole
from app.schemas.user import (
    UserOut,
    UserUpdate,
    ArtisanProfileUpdate,
    UserWithArtisanUpdate,
    ArtisanProfileOut
)
from app.services.user_service import UserService

router = APIRouter()

@router.get("/me", response_model=UserOut)
async def get_current_user_profile(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Récupère le profil de l'utilisateur connecté.
    """
    user = await UserService.get_user_with_profile(db, current_user.id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Utilisateur non trouvé"
        )
    
    return user

@router.put("/me", response_model=UserOut)
async def update_current_user_profile(
    user_update: UserUpdate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Met à jour le profil de base de l'utilisateur connecté.
    Tous les champs sont optionnels (mise à jour partielle).
    
    Champs modifiables:
    - email (vérifie l'unicité)
    - phone
    - name
    - address
    - city
    - country
    - avatar (URL ou UUID)
    - company_name (pour acheteurs entreprise)
    - siret (pour acheteurs entreprise)
    """
    updated_user = await UserService.update_profile(db, current_user.id, user_update)
    return updated_user

@router.put("/me/artisan", response_model=ArtisanProfileOut)
async def update_artisan_profile(
    profile_update: ArtisanProfileUpdate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Met à jour le profil artisan de l'utilisateur connecté.
    Vérifie que l'utilisateur est bien un artisan.
    
    Champs modifiables:
    - region, languages
    - company_name, main_specialty, other_skills
    - years_experience, activity_description, brand_story
    - offerings (products/workshops/both)
    - nif, stat, documents_not_available
    - about, location_*, experience
    - certifications, awards, social_media
    """
    if current_user.role != UserRole.ARTISAN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Seuls les artisans peuvent accéder à ce endpoint"
        )
    
    updated_profile = await UserService.update_artisan_profile(
        db, current_user.id, profile_update
    )
    return updated_profile

@router.put("/me/complete", response_model=UserOut)
async def update_user_and_artisan_combined(
    combined_update: UserWithArtisanUpdate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Met à jour à la fois le profil utilisateur et le profil artisan
    en une seule requête. Pratique pour le formulaire d'édition
    du dashboard artisan.
    
    Body JSON:
    {
        "user": { ... },  // Champs UserUpdate (optionnel)
        "artisan_profile": { ... }  // Champs ArtisanProfileUpdate (optionnel)
    }
    """
    if current_user.role != UserRole.ARTISAN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Seuls les artisans peuvent accéder à ce endpoint"
        )
    
    user, artisan_profile = await UserService.update_user_and_artisan(
        db, current_user.id, combined_update
    )
    

    updated_user = await UserService.get_user_with_profile(db, current_user.id)
    return updated_user

@router.post("/me/avatar", response_model=dict)
async def upload_user_avatar(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Upload l'avatar de l'utilisateur connecté.
    Accepte les formats: jpg, jpeg, png, gif, webp
    Taille max: 5MB
    """

    allowed_types = [
        "image/jpeg", "image/jpg", "image/png",
        "image/gif", "image/webp"
    ]
    if file.content_type not in allowed_types:
        formats = ', '.join(allowed_types)
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Type de fichier non autorisé. Formats: {formats}"
        )
    

    file_content = await file.read()
    if len(file_content) > 5 * 1024 * 1024:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Le fichier est trop volumineux. Taille max: 5MB"
        )
    

    avatar_url = await UserService.upload_avatar(
        db, current_user.id, file_content, file.filename
    )
    
    return {
        "message": "Avatar uploadé avec succès",
        "avatar_url": avatar_url
    }

@router.delete("/me")
async def delete_current_user(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Désactive le compte de l'utilisateur connecté (soft delete).
    Le compte n'est pas supprimé mais désactivé.
    """
    await UserService.delete_user(db, current_user.id)
    
    return {
        "message": "Compte désactivé avec succès"
    }

@router.get("/artisan/{artisan_id}", response_model=UserOut)
async def get_artisan_public_profile(
    artisan_id: UUID,
    db: Session = Depends(get_db)
):
    """
    Récupère le profil public d'un artisan par son ID.
    Endpoint public - pas d'authentification requise.
    """
    user = await UserService.get_user_with_profile(db, artisan_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Artisan non trouvé"
        )
    

    if user.role != UserRole.ARTISAN:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Artisan non trouvé"
        )
    
    return user

@router.get("/{user_id}", response_model=UserOut)
async def get_user_by_id(
    user_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Récupère un utilisateur par son ID.
    Accessible uniquement aux utilisateurs connectés.
    """
    user = await UserService.get_user_with_profile(db, user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Utilisateur non trouvé"
        )
    
    return user 