"""
Endpoints pour la gestion des indisponibilités d'artisans
"""

from typing import Optional
from uuid import UUID
from datetime import date
from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.deps import get_db, get_current_active_user
from app.models.user import User
from app.services.unavailability_service import UnavailabilityService
from app.schemas.unavailability import (
    UnavailabilityCreate,
    UnavailabilityUpdate,
    UnavailabilityOut,
    UnavailabilityListResponse,
)


router = APIRouter()


@router.post(
    "/",
    response_model=UnavailabilityOut,
    status_code=status.HTTP_201_CREATED,
    summary="Créer une indisponibilité",
)
async def create_unavailability(
    data: UnavailabilityCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """
    Crée une nouvelle indisponibilité pour l'artisan connecté.
    
    - **start_date**: Date de début (obligatoire)
    - **end_date**: Date de fin (obligatoire si type=range)
    - **reason**: Raison de l'indisponibilité (optionnel)
    - **type**: Type single ou range
    - **status**: Statut pending/approved/rejected
    """
    # Vérifier que l'utilisateur est un artisan
    if not current_user.artisan_profile:
        from fastapi import HTTPException
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only artisans can create unavailabilities",
        )

    service = UnavailabilityService(db)
    return await service.create_unavailability(
        artisan_id=current_user.artisan_profile.id, data=data
    )


@router.get(
    "/",
    response_model=UnavailabilityListResponse,
    summary="Lister les indisponibilités",
)
async def list_unavailabilities(
    page: int = 1,
    page_size: int = 20,
    status_filter: Optional[str] = None,
    start_from: Optional[date] = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """
    Liste les indisponibilités de l'artisan connecté avec pagination.
    
    - **page**: Numéro de page (défaut: 1)
    - **page_size**: Taille de page (défaut: 20)
    - **status_filter**: Filtrer par statut (pending/approved/rejected)
    - **start_from**: Ne retourner que les indisponibilités >= à cette date
    """
    if not current_user.artisan_profile:
        from fastapi import HTTPException
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only artisans can access unavailabilities",
        )

    service = UnavailabilityService(db)
    return await service.get_artisan_unavailabilities(
        artisan_id=current_user.artisan_profile.id,
        page=page,
        page_size=page_size,
        status_filter=status_filter,
        start_from=start_from,
    )


@router.get(
    "/upcoming",
    response_model=list[UnavailabilityOut],
    summary="Prochaines indisponibilités",
)
async def get_upcoming_unavailabilities(
    limit: int = 5,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """
    Récupère les prochaines indisponibilités approuvées de l'artisan.
    
    - **limit**: Nombre max d'indisponibilités (défaut: 5)
    """
    if not current_user.artisan_profile:
        from fastapi import HTTPException
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only artisans can access unavailabilities",
        )

    service = UnavailabilityService(db)
    return await service.get_upcoming_unavailabilities(
        artisan_id=current_user.artisan_profile.id, limit=limit
    )


@router.get(
    "/{unavailability_id}",
    response_model=UnavailabilityOut,
    summary="Détails d'une indisponibilité",
)
async def get_unavailability(
    unavailability_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """
    Récupère les détails d'une indisponibilité spécifique.
    """
    if not current_user.artisan_profile:
        from fastapi import HTTPException
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only artisans can access unavailabilities",
        )

    service = UnavailabilityService(db)
    return await service.get_unavailability(
        unavailability_id=unavailability_id,
        artisan_id=current_user.artisan_profile.id,
    )


@router.patch(
    "/{unavailability_id}",
    response_model=UnavailabilityOut,
    summary="Modifier une indisponibilité",
)
async def update_unavailability(
    unavailability_id: UUID,
    data: UnavailabilityUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """
    Modifie une indisponibilité existante.
    
    Tous les champs sont optionnels.
    """
    if not current_user.artisan_profile:
        from fastapi import HTTPException
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only artisans can update unavailabilities",
        )

    service = UnavailabilityService(db)
    return await service.update_unavailability(
        unavailability_id=unavailability_id,
        artisan_id=current_user.artisan_profile.id,
        data=data,
    )


@router.delete(
    "/{unavailability_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Supprimer une indisponibilité",
)
async def delete_unavailability(
    unavailability_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """
    Supprime une indisponibilité.
    """
    if not current_user.artisan_profile:
        from fastapi import HTTPException
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only artisans can delete unavailabilities",
        )

    service = UnavailabilityService(db)
    await service.delete_unavailability(
        unavailability_id=unavailability_id,
        artisan_id=current_user.artisan_profile.id,
    )
