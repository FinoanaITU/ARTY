"""
Endpoints pour la gestion des ateliers
Routes: /api/v1/workshops
"""

from fastapi import APIRouter, Depends, Query, Path, HTTPException
from sqlalchemy.orm import Session
from typing import Optional
from decimal import Decimal
from uuid import UUID

from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.models.user import User
from app.services.workshop_service import WorkshopService
from app.schemas.workshop import (
    WorkshopCreate,
    WorkshopUpdate,
    WorkshopOut,
    WorkshopListItem,
    WorkshopListResponse,
    WorkshopSessionCreate,
    WorkshopBookingCreate,
    AvailabilityResponse,
    BookingConfirmation,
    WorkshopSessionOut,
    WorkshopBookingOut,
)
from app.core.exceptions import (
    ResourceNotFound,
    ValidationError,
    PermissionDenied,
)

router = APIRouter(prefix="/workshops", tags=["workshops"])


# ============ PUBLIC ENDPOINTS ============

@router.get("", response_model=WorkshopListResponse)
async def list_workshops(
    db: Session = Depends(get_db),
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    category: Optional[str] = Query(None),
    skill_level: Optional[str] = Query(None),
    workshop_type: Optional[str] = Query(None),
    min_price: Optional[Decimal] = Query(None),
    max_price: Optional[Decimal] = Query(None),
    search: Optional[str] = Query(None),
):
    """
    Liste publique des ateliers publiés
    Retourne tous les ateliers disponibles avec filtrage optionnel
    """
    workshops, total = WorkshopService.list_workshops(
        db=db,
        skip=skip,
        limit=limit,
        category=category,
        skill_level=skill_level,
        workshop_type=workshop_type,
        min_price=min_price,
        max_price=max_price,
        search=search,
    )
    
    pages = (total + limit - 1) // limit
    
    return WorkshopListResponse(
        items=[WorkshopListItem.model_validate(w) for w in workshops],
        total=total,
        page=(skip // limit) + 1,
        pages=pages,
        limit=limit,
    )


@router.get("/{workshop_id}", response_model=WorkshopOut)
async def get_workshop(
    workshop_id: UUID = Path(...),
    db: Session = Depends(get_db),
):
    """
    Récupérer les détails d'un atelier
    """
    workshop = WorkshopService.get_workshop(db, workshop_id)
    return WorkshopOut.model_validate(workshop)


@router.get("/{workshop_id}/availability", response_model=AvailabilityResponse)
async def get_workshop_availability(
    workshop_id: UUID = Path(...),
    db: Session = Depends(get_db),
):
    """
    Obtenir la disponibilité d'un atelier
    Retourne les sessions disponibles et les dates de fermeture
    """
    workshop = WorkshopService.get_workshop(db, workshop_id)
    sessions = WorkshopService.list_sessions(db, workshop_id)
    
    available_sessions = [
        WorkshopSessionOut.model_validate(s) for s in sessions
        if WorkshopService.get_available_spots(db, s.id) > 0
    ]
    
    booked_dates = [s.start_datetime for s in sessions]
    unavailable_dates = []  # Could be extended based on artisan availability
    
    return AvailabilityResponse(
        workshop_id=workshop_id,
        available_sessions=available_sessions,
        booked_dates=booked_dates,
        unavailable_dates=unavailable_dates,
    )


# ============ ARTISAN ENDPOINTS ============

@router.post("", response_model=WorkshopOut, status_code=201)
async def create_workshop(
    workshop_create: WorkshopCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Créer un nouvel atelier
    Réservé aux artisans authentifiés
    """
    if current_user.role.value != "artisan":
        raise PermissionDenied("Only artisans can create workshops")
    
    workshop = WorkshopService.create_workshop(
        db=db,
        workshop_create=workshop_create,
        artisan_id=current_user.id,
    )
    
    return WorkshopOut.model_validate(workshop)


@router.patch("/{workshop_id}", response_model=WorkshopOut)
async def update_workshop(
    workshop_id: UUID = Path(...),
    workshop_update: WorkshopUpdate = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Mettre à jour un atelier
    Réservé à l'artisan propriétaire
    """
    workshop = WorkshopService.update_workshop(
        db=db,
        workshop_id=workshop_id,
        workshop_update=workshop_update,
        artisan_id=current_user.id,
    )
    
    return WorkshopOut.model_validate(workshop)


@router.delete("/{workshop_id}", status_code=204)
async def delete_workshop(
    workshop_id: UUID = Path(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Supprimer un atelier
    Seulement les brouillons peuvent être supprimés
    """
    WorkshopService.delete_workshop(
        db=db,
        workshop_id=workshop_id,
        artisan_id=current_user.id,
    )


@router.post("/{workshop_id}/publish", response_model=WorkshopOut)
async def publish_workshop(
    workshop_id: UUID = Path(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Publier un atelier
    L'atelier devient visible publiquement
    """
    workshop = WorkshopService.publish_workshop(
        db=db,
        workshop_id=workshop_id,
        artisan_id=current_user.id,
    )
    
    return WorkshopOut.model_validate(workshop)


@router.post("/{workshop_id}/unpublish", response_model=WorkshopOut)
async def unpublish_workshop(
    workshop_id: UUID = Path(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Dépublier un atelier
    L'atelier retourne au brouillon
    """
    workshop = WorkshopService.unpublish_workshop(
        db=db,
        workshop_id=workshop_id,
        artisan_id=current_user.id,
    )
    
    return WorkshopOut.model_validate(workshop)


@router.post("/{workshop_id}/archive", response_model=WorkshopOut)
async def archive_workshop(
    workshop_id: UUID = Path(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Archiver un atelier
    L'atelier est archivé et non visible publiquement
    """
    workshop = WorkshopService.archive_workshop(
        db=db,
        workshop_id=workshop_id,
        artisan_id=current_user.id,
    )
    
    return WorkshopOut.model_validate(workshop)


# ============ SESSION MANAGEMENT ============

@router.post("/{workshop_id}/sessions", response_model=WorkshopSessionOut, status_code=201)
async def create_session(
    workshop_id: UUID = Path(...),
    session_create: WorkshopSessionCreate = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Créer une session d'atelier
    Réservé à l'artisan propriétaire
    """
    session = WorkshopService.create_session(
        db=db,
        workshop_id=workshop_id,
        session_create=session_create,
        artisan_id=current_user.id,
    )
    
    return WorkshopSessionOut.model_validate(session)


@router.get("/{workshop_id}/sessions", response_model=list[WorkshopSessionOut])
async def list_workshop_sessions(
    workshop_id: UUID = Path(...),
    db: Session = Depends(get_db),
):
    """
    Lister les sessions d'un atelier
    """
    sessions = WorkshopService.list_sessions(db, workshop_id)
    return [WorkshopSessionOut.model_validate(s) for s in sessions]


@router.delete("/{workshop_id}/sessions/{session_id}", status_code=204)
async def delete_session(
    workshop_id: UUID = Path(...),
    session_id: UUID = Path(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Supprimer une session
    Ne peut être supprimée que s'il n'y a pas de réservations
    """
    WorkshopService.delete_session(
        db=db,
        session_id=session_id,
        artisan_id=current_user.id,
    )


# ============ BOOKING ENDPOINTS ============

@router.post("/{workshop_id}/book", response_model=BookingConfirmation, status_code=201)
async def create_booking(
    workshop_id: UUID = Path(...),
    booking_create: WorkshopBookingCreate = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Créer une réservation pour un atelier
    Réservé aux utilisateurs authentifiés
    """
    booking = WorkshopService.create_booking(
        db=db,
        workshop_id=workshop_id,
        booking_create=booking_create,
        user_id=current_user.id,
    )
    
    return BookingConfirmation(
        booking_id=booking.id,
        booking_number=booking.booking_number,
        confirmation_code=booking.confirmation_code,
        workshop_title=booking.workshop.title if booking.workshop else "Workshop",
        session_start=booking.session.start_datetime if booking.session else None,
        participants_count=booking.participants_count,
        total_price=booking.total_price,
        status=booking.status,
        created_at=booking.created_at,
    )


@router.get("/bookings/user", response_model=list[WorkshopBookingOut])
async def list_user_bookings(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
):
    """
    Lister les réservations de l'utilisateur authentifié
    """
    bookings, total = WorkshopService.list_user_bookings(
        db=db,
        user_id=current_user.id,
        skip=skip,
        limit=limit,
    )
    
    return [WorkshopBookingOut.model_validate(b) for b in bookings]


@router.get("/{workshop_id}/bookings", response_model=list[WorkshopBookingOut])
async def list_workshop_bookings(
    workshop_id: UUID = Path(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
):
    """
    Lister les réservations d'un atelier
    Réservé à l'artisan propriétaire
    """
    bookings, total = WorkshopService.list_workshop_bookings(
        db=db,
        workshop_id=workshop_id,
        artisan_id=current_user.id,
        skip=skip,
        limit=limit,
    )
    
    return [WorkshopBookingOut.model_validate(b) for b in bookings]


@router.post("/bookings/{booking_id}/cancel", response_model=WorkshopBookingOut)
async def cancel_booking(
    booking_id: UUID = Path(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Annuler une réservation
    L'utilisateur peut annuler ses propres réservations
    """
    booking = WorkshopService.cancel_booking(
        db=db,
        booking_id=booking_id,
        user_id=current_user.id,
    )
    
    return WorkshopBookingOut.model_validate(booking)


@router.post("/bookings/{booking_id}/confirm", response_model=WorkshopBookingOut)
async def confirm_booking(
    booking_id: UUID = Path(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Confirmer une réservation (mark as attended)
    Réservé à l'artisan propriétaire de l'atelier
    """
    booking = WorkshopService.confirm_booking(
        db=db,
        booking_id=booking_id,
        artisan_id=current_user.id,
    )
    
    return WorkshopBookingOut.model_validate(booking)
