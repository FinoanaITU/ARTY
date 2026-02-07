"""
Service de gestion des indisponibilités d'artisans
"""

from datetime import date, datetime
from typing import Optional
from uuid import UUID
from sqlalchemy import func, and_, or_
from sqlalchemy.orm import Session
from sqlalchemy.future import select
from fastapi import HTTPException, status

from app.models.unavailability import ArtisanUnavailability
from app.models.workshop import WorkshopAvailability
from app.models.user import ArtisanProfile
from app.schemas.unavailability import (
    UnavailabilityCreate,
    UnavailabilityUpdate,
    UnavailabilityOut,
    UnavailabilityListResponse,
)


class UnavailabilityService:
    """Service pour gérer les indisponibilités des artisans"""

    def __init__(self, db: Session):
        self.db = db

    async def _check_artisan_exists(self, artisan_id: UUID) -> bool:
        """Vérifie si l'artisan existe"""
        result = self.db.execute(
            select(ArtisanProfile).where(ArtisanProfile.id == artisan_id)
        )
        return result.scalar_one_or_none() is not None

    async def _check_date_conflict(
        self,
        artisan_id: UUID,
        start_date: date,
        end_date: Optional[date] = None,
        exclude_id: Optional[UUID] = None,
    ) -> bool:
        """
        Vérifie si une indisponibilité existe déjà sur cette période
        
        Args:
            artisan_id: ID de l'artisan
            start_date: Date de début
            end_date: Date de fin (optionnelle pour single day)
            exclude_id: ID de l'indisponibilité à exclure (pour update)
            
        Returns:
            True si conflit détecté, False sinon
        """
        end = end_date or start_date
        
        query = select(ArtisanUnavailability).where(
            and_(
                ArtisanUnavailability.artisan_id == artisan_id,
                ArtisanUnavailability.status != "rejected",
                or_(
                    # Cas 1: start_date dans une période existante
                    and_(
                        ArtisanUnavailability.start_date <= start_date,
                        or_(
                            ArtisanUnavailability.end_date >= start_date,
                            ArtisanUnavailability.end_date.is_(None),
                        ),
                    ),
                    # Cas 2: end_date dans une période existante
                    and_(
                        ArtisanUnavailability.start_date <= end,
                        or_(
                            ArtisanUnavailability.end_date >= end,
                            ArtisanUnavailability.end_date.is_(None),
                        ),
                    ),
                    # Cas 3: période englobante
                    and_(
                        ArtisanUnavailability.start_date >= start_date,
                        or_(
                            ArtisanUnavailability.end_date <= end,
                            ArtisanUnavailability.end_date.is_(None),
                        ),
                    ),
                ),
            )
        )
        
        if exclude_id:
            query = query.where(ArtisanUnavailability.id != exclude_id)
        
        result = self.db.execute(query)
        conflicts = result.scalars().all()
        return len(conflicts) > 0

    async def create_unavailability(
        self, artisan_id: UUID, data: UnavailabilityCreate
    ) -> UnavailabilityOut:
        """
        Crée une nouvelle indisponibilité pour un artisan
        
        Args:
            artisan_id: ID de l'artisan
            data: Données de l'indisponibilité
            
        Returns:
            Indisponibilité créée
            
        Raises:
            HTTPException 404: Artisan introuvable
            HTTPException 400: Dates invalides ou conflit détecté
        """
        # Vérifier que l'artisan existe
        if not await self._check_artisan_exists(artisan_id):
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Artisan not found",
            )

        # Valider les dates
        if data.type == "range" and not data.end_date:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="end_date is required for range type",
            )

        if data.end_date and data.end_date < data.start_date:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="end_date must be after start_date",
            )

        # Vérifier les conflits de dates
        has_conflict = await self._check_date_conflict(
            artisan_id, data.start_date, data.end_date
        )
        if has_conflict:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Date conflict with existing unavailability",
            )

        # Créer l'indisponibilité
        unavailability = ArtisanUnavailability(
            artisan_id=artisan_id,
            start_date=data.start_date,
            end_date=data.end_date,
            reason=data.reason,
            type=data.type.value,
            status=data.status.value,
        )

        self.db.add(unavailability)
        self.db.commit()
        self.db.refresh(unavailability)

        return UnavailabilityOut.model_validate(unavailability)

    async def get_unavailability(
        self, unavailability_id: UUID, artisan_id: UUID
    ) -> UnavailabilityOut:
        """
        Récupère une indisponibilité par son ID
        
        Args:
            unavailability_id: ID de l'indisponibilité
            artisan_id: ID de l'artisan (pour vérifier ownership)
            
        Returns:
            Indisponibilité trouvée
            
        Raises:
            HTTPException 404: Indisponibilité introuvable
        """
        result = self.db.execute(
            select(ArtisanUnavailability).where(
                and_(
                    ArtisanUnavailability.id == unavailability_id,
                    ArtisanUnavailability.artisan_id == artisan_id,
                )
            )
        )
        unavailability = result.scalar_one_or_none()

        if not unavailability:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Unavailability not found",
            )

        return UnavailabilityOut.model_validate(unavailability)

    async def get_artisan_unavailabilities(
        self,
        artisan_id: UUID,
        page: int = 1,
        page_size: int = 20,
        status_filter: Optional[str] = None,
        start_from: Optional[date] = None,
    ) -> UnavailabilityListResponse:
        """
        Liste les indisponibilités d'un artisan avec pagination
        
        Args:
            artisan_id: ID de l'artisan
            page: Numéro de page (1-based)
            page_size: Taille de page
            status_filter: Filtrer par statut (pending/approved/rejected)
            start_from: Filtrer les dates >= à cette date
            
        Returns:
            Liste paginée d'indisponibilités
        """
        # Construire la query de base
        query = select(ArtisanUnavailability).where(
            ArtisanUnavailability.artisan_id == artisan_id
        )

        # Filtres optionnels
        if status_filter:
            query = query.where(
                ArtisanUnavailability.status == status_filter
            )

        if start_from:
            query = query.where(
                or_(
                    ArtisanUnavailability.end_date >= start_from,
                    and_(
                        ArtisanUnavailability.end_date.is_(None),
                        ArtisanUnavailability.start_date >= start_from,
                    ),
                )
            )

        # Tri par date de début décroissante
        query = query.order_by(ArtisanUnavailability.start_date.desc())

        # Compter le total
        count_query = select(func.count()).select_from(query.subquery())
        total_result = self.db.execute(count_query)
        total = total_result.scalar() or 0

        # Pagination
        offset = (page - 1) * page_size
        query = query.offset(offset).limit(page_size)

        result = self.db.execute(query)
        unavailabilities = result.scalars().all()

        total_pages = (total + page_size - 1) // page_size

        return UnavailabilityListResponse(
            items=[
                UnavailabilityOut.model_validate(u)
                for u in unavailabilities
            ],
            total=total,
            page=page,
            page_size=page_size,
            total_pages=total_pages,
        )

    async def update_unavailability(
        self,
        unavailability_id: UUID,
        artisan_id: UUID,
        data: UnavailabilityUpdate,
    ) -> UnavailabilityOut:
        """
        Met à jour une indisponibilité
        
        Args:
            unavailability_id: ID de l'indisponibilité
            artisan_id: ID de l'artisan
            data: Données de mise à jour
            
        Returns:
            Indisponibilité mise à jour
            
        Raises:
            HTTPException 404: Indisponibilité introuvable
            HTTPException 400: Dates invalides ou conflit
        """
        # Récupérer l'indisponibilité existante
        result = self.db.execute(
            select(ArtisanUnavailability).where(
                and_(
                    ArtisanUnavailability.id == unavailability_id,
                    ArtisanUnavailability.artisan_id == artisan_id,
                )
            )
        )
        unavailability = result.scalar_one_or_none()

        if not unavailability:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Unavailability not found",
            )

        # Préparer les nouvelles dates
        new_start = data.start_date or unavailability.start_date
        new_end = data.end_date or unavailability.end_date
        new_type = data.type.value if data.type else unavailability.type

        # Valider les dates
        if new_type == "range" and not new_end:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="end_date is required for range type",
            )

        if new_end and new_end < new_start:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="end_date must be after start_date",
            )

        # Vérifier conflit (en excluant l'indisponibilité actuelle)
        if data.start_date or data.end_date:
            has_conflict = await self._check_date_conflict(
                artisan_id, new_start, new_end, exclude_id=unavailability_id
            )
            if has_conflict:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Date conflict with existing unavailability",
                )

        # Appliquer les modifications
        if data.start_date:
            unavailability.start_date = data.start_date
        if data.end_date is not None:
            unavailability.end_date = data.end_date
        if data.reason is not None:
            unavailability.reason = data.reason
        if data.type:
            unavailability.type = data.type.value
        if data.status:
            unavailability.status = data.status.value

        unavailability.updated_at = datetime.utcnow()

        self.db.commit()
        self.db.refresh(unavailability)

        return UnavailabilityOut.model_validate(unavailability)

    async def delete_unavailability(
        self, unavailability_id: UUID, artisan_id: UUID
    ) -> None:
        """
        Supprime une indisponibilité
        
        Args:
            unavailability_id: ID de l'indisponibilité
            artisan_id: ID de l'artisan
            
        Raises:
            HTTPException 404: Indisponibilité introuvable
        """
        result = self.db.execute(
            select(ArtisanUnavailability).where(
                and_(
                    ArtisanUnavailability.id == unavailability_id,
                    ArtisanUnavailability.artisan_id == artisan_id,
                )
            )
        )
        unavailability = result.scalar_one_or_none()

        if not unavailability:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Unavailability not found",
            )

        self.db.delete(unavailability)
        self.db.commit()

    async def get_upcoming_unavailabilities(
        self, artisan_id: UUID, limit: int = 5
    ) -> list[UnavailabilityOut]:
        """
        Récupère les prochaines indisponibilités d'un artisan
        
        Args:
            artisan_id: ID de l'artisan
            limit: Nombre maximum d'indisponibilités à retourner
            
        Returns:
            Liste des prochaines indisponibilités
        """
        today = date.today()

        result = self.db.execute(
            select(ArtisanUnavailability)
            .where(
                and_(
                    ArtisanUnavailability.artisan_id == artisan_id,
                    ArtisanUnavailability.status == "approved",
                    or_(
                        ArtisanUnavailability.start_date >= today,
                        and_(
                            ArtisanUnavailability.end_date.isnot(None),
                            ArtisanUnavailability.end_date >= today,
                        ),
                    ),
                )
            )
            .order_by(ArtisanUnavailability.start_date.asc())
            .limit(limit)
        )

        unavailabilities = result.scalars().all()

        return [
            UnavailabilityOut.model_validate(u)
            for u in unavailabilities
        ]
