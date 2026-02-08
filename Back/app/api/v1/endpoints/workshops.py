"""
Endpoints pour la gestion des ateliers
Routes: /api/v1/workshops
"""

from fastapi import APIRouter, Depends, Query, Path, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
from typing import Optional, List
from decimal import Decimal
from uuid import UUID
from datetime import datetime
import json

from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.models.user import User
from app.models.workshop import Workshop, WorkshopSession
from app.models.workshop_time_slot import WorkshopTimeSlot
from app.services.workshop_service import WorkshopService
from app.services.storage import StorageService
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
from app.schemas.unavailability import UnavailabilityOut
from app.models.unavailability import ArtisanUnavailability
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
    Récupérer les détails d'un atelier avec les informations de l'artisan
    """
    workshop = WorkshopService.get_workshop(db, workshop_id)
    
    # Enrichir les informations de l'instructeur depuis la relation artisan si vides
    if workshop.artisan:
        if not workshop.instructor_name:
            workshop.instructor_name = workshop.artisan.name
        if not workshop.instructor_image and workshop.artisan.avatar:
            workshop.instructor_image = workshop.artisan.avatar
        if not workshop.instructor_bio and hasattr(workshop.artisan, 'artisan_profile') and workshop.artisan.artisan_profile:
            # Utiliser about ou activity_description depuis le profil artisan
            workshop.instructor_bio = workshop.artisan.artisan_profile.about or workshop.artisan.artisan_profile.activity_description
    
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


@router.get("/{workshop_id}/artisan-unavailability")
async def get_artisan_unavailability(
    workshop_id: UUID = Path(...),
    db: Session = Depends(get_db),
):
    """
    Récupérer les indisponibilités de l'artisan pour un atelier donné
    """
    # Récupérer l'atelier pour obtenir l'ID de l'artisan
    workshop = WorkshopService.get_workshop(db, workshop_id)
    
    # Récupérer les indisponibilités de l'artisan
    unavailabilities = db.query(ArtisanUnavailability).filter(
        ArtisanUnavailability.artisan_id == workshop.artisan_id,
        ArtisanUnavailability.status == "approved"
    ).order_by(ArtisanUnavailability.start_date).all()
    
    return [UnavailabilityOut.model_validate(u) for u in unavailabilities]


# ============ ARTISAN ENDPOINTS ============

@router.post("", response_model=WorkshopOut, status_code=201)
async def create_workshop(
    # Données du formulaire
    title: str = Form(...),
    description: str = Form(...),
    short_description: Optional[str] = Form(None),
    category: str = Form(...),
    workshop_type: str = Form(...),
    skill_level: str = Form(...),
    base_price: float = Form(...),
    foreign_price: Optional[float] = Form(None),
    max_participants: int = Form(...),
    min_participants: int = Form(1),
    duration_minutes: int = Form(...),
    location: str = Form(...),
    address: Optional[str] = Form(None),
    materials_included: Optional[str] = Form(None),  # JSON string
    materials_to_bring: Optional[str] = Form(None),  # JSON string
    prerequisites: Optional[str] = Form(None),
    what_you_will_learn: Optional[str] = Form(None),  # JSON string
    tags: Optional[str] = Form(None),  # JSON string
    publish: bool = Query(False),  # Nouveau paramètre pour publication
    # Photos
    photos: Optional[List[UploadFile]] = File(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Créer un nouvel atelier avec upload de photos
    Réservé aux artisans authentifiés
    """
    if current_user.role.value != "artisan":
        raise PermissionDenied("Only artisans can create workshops")
    
    # Parse les champs JSON
    try:
        materials_included_list = json.loads(materials_included) if materials_included else None
        materials_to_bring_list = json.loads(materials_to_bring) if materials_to_bring else None
        what_you_will_learn_list = json.loads(what_you_will_learn) if what_you_will_learn else None
        tags_list = json.loads(tags) if tags else None
    except json.JSONDecodeError:
        raise HTTPException(status_code=400, detail="Invalid JSON format in array fields")
    
    # Upload des photos
    image_urls = []
    gallery_images = []
    if photos:
        storage_service = StorageService()
        for i, photo_file in enumerate(photos[:5]):  # Max 5 photos
            try:
                photo_url = await storage_service.upload_file(
                    file=photo_file,
                    folder="workshops",
                    allowed_extensions=["jpg", "jpeg", "png", "webp"]
                )
                if i == 0:
                    image_urls.append(photo_url)  # Première photo comme featured
                else:
                    gallery_images.append(photo_url)
            except Exception as e:
                print(f"Erreur lors de l'upload de la photo: {e}")
    
    # Créer l'objet WorkshopCreate
    workshop_create = WorkshopCreate(
        title=title,
        description=description,
        short_description=short_description,
        category=category,
        workshop_type=workshop_type,
        skill_level=skill_level,
        base_price=base_price,
        foreign_price=foreign_price,
        max_participants=max_participants,
        min_participants=min_participants,
        duration_minutes=duration_minutes,
        location=location,
        address=address,
        materials_included=materials_included_list,
        materials_to_bring=materials_to_bring_list,
        prerequisites=prerequisites,
        what_you_will_learn=what_you_will_learn_list,
        featured_image_url=image_urls[0] if image_urls else None,
        gallery_images=gallery_images if gallery_images else None,
        tags=tags_list,
    )
    
    workshop = WorkshopService.create_workshop(
        db=db,
        workshop_create=workshop_create,
        artisan_id=current_user.id,
        publish=publish,
    )
    
    return WorkshopOut.model_validate(workshop)


@router.post("/json", response_model=WorkshopOut, status_code=201)
async def create_workshop_json(
    workshop_create: WorkshopCreate,
    publish: bool = Query(False),  # Nouveau paramètre pour publication
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Créer un nouvel atelier via JSON (sans photos)
    Réservé aux artisans authentifiés
    """
    if current_user.role.value != "artisan":
        raise PermissionDenied("Only artisans can create workshops")
    
    workshop = WorkshopService.create_workshop(
        db=db,
        workshop_create=workshop_create,
        artisan_id=current_user.id,
        publish=publish,
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


@router.get("/{workshop_id}/time-slots")
async def get_workshop_time_slots(
    workshop_id: UUID = Path(...),
    date_param: Optional[str] = Query(None, alias="date"),
    db: Session = Depends(get_db),
):
    """
    Récupérer les créneaux horaires pour un atelier à une date donnée
    """
    from datetime import datetime
    from app.schemas.workshop_time_slot import TimeSlotSummary, WorkshopTimeSlotOut
    
    # Parser la date depuis le paramètre
    if date_param:
        try:
            target_date = datetime.strptime(date_param, "%Y-%m-%d").date()
        except ValueError:
            raise HTTPException(status_code=400, detail="Invalid date format. Use YYYY-MM-DD")
    else:
        from datetime import date as date_type
        target_date = date_type.today()
    
    # Récupérer les créneaux depuis la base de données
    time_slots = db.query(WorkshopTimeSlot).filter(
        WorkshopTimeSlot.workshop_id == workshop_id,
        WorkshopTimeSlot.date == target_date
    ).order_by(WorkshopTimeSlot.start_time).all()
    
    # Convertir au format attendu par le frontend
    result = []
    for slot in time_slots:
        slot_out = WorkshopTimeSlotOut.model_validate(slot)
        summary = TimeSlotSummary.from_time_slot(slot_out)
        result.append(summary.model_dump())
    
    return result


# ============ ATELIERS SUR INSCRIPTION ============

@router.get("/inscription/upcoming", response_model=List[dict])
async def get_upcoming_inscription_workshops(
    db: Session = Depends(get_db),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
):
    """
    Récupérer tous les ateliers sur inscription avec leurs sessions à venir
    """
    from app.models.workshop import WorkshopSession
    from sqlalchemy import and_
    from datetime import datetime
    
    # Récupérer les ateliers sur inscription avec leurs sessions futures
    query = (
        db.query(Workshop, WorkshopSession)
        .join(WorkshopSession, Workshop.id == WorkshopSession.workshop_id)
        .filter(
            and_(
                Workshop.workshop_type == "inscription",
                Workshop.status == "published",
                WorkshopSession.start_datetime > datetime.now(),
                WorkshopSession.status == "scheduled"
            )
        )
        .order_by(WorkshopSession.start_datetime)
        .offset(skip)
        .limit(limit)
    )
    
    results = query.all()
    
    # Grouper par atelier
    workshops_data = {}
    for workshop, session in results:
        if workshop.id not in workshops_data:
            # Récupérer l'artisan
            artisan = db.query(User).filter(User.id == workshop.artisan_id).first()
            
            workshops_data[workshop.id] = {
                "id": str(workshop.id),
                "title": workshop.title,
                "description": workshop.description,
                "short_description": workshop.short_description,
                "skill_level": workshop.skill_level,
                "base_price": float(workshop.base_price),
                "currency": workshop.currency,
                "min_participants": workshop.min_participants,
                "max_participants": workshop.max_participants,
                "duration_minutes": workshop.duration_minutes,
                "address": workshop.address,
                "featured_image_url": workshop.featured_image_url,
                "gallery_images": workshop.gallery_images or [],
                "materials_included": workshop.materials_included or [],
                "what_you_will_learn": workshop.what_you_will_learn or [],
                "tags": workshop.tags or [],
                "artisan": {
                    "id": str(artisan.id) if artisan else None,
                    "name": artisan.name if artisan else "Artisan inconnu",
                    "avatar": getattr(artisan, 'avatar_url', None) if artisan else None
                },
                "sessions": []
            }
        
        # Ajouter la session
        session_data = {
            "id": str(session.id),
            "start_datetime": session.start_datetime.isoformat(),
            "end_datetime": session.end_datetime.isoformat(),
            "current_bookings": session.current_bookings,
            "max_participants": session.max_participants or workshop.max_participants,
            "available_spots": session.available_spots,
            "session_price": float(session.session_price or workshop.base_price),
            "status": session.status,
            "is_full": session.current_bookings >= (session.max_participants or workshop.max_participants),
            "needs_min_participants": session.current_bookings < workshop.min_participants
        }
        
        workshops_data[workshop.id]["sessions"].append(session_data)
    
    return list(workshops_data.values())
