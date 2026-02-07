"""
Service métier pour les ateliers
Gère la logique métier : création, modification, filtrage, disponibilités, réservations
"""

from typing import List, Optional, Dict, Tuple
from datetime import datetime, timedelta
from uuid import UUID
from decimal import Decimal
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_

from app.models.workshop import (
    Workshop,
    WorkshopSession,
    WorkshopBooking,
)
from app.models.user import User
from app.schemas.workshop import (
    WorkshopCreate,
    WorkshopUpdate,
    WorkshopSessionCreate,
    WorkshopBookingCreate,
    WorkshopOut,
    WorkshopListItem,
    WorkshopSessionOut,
    WorkshopBookingOut,
    BookingConfirmation,
    SessionStatus,
    BookingStatus,
    PaymentStatus,
)
from app.core.exceptions import (
    ResourceNotFound,
    ValidationError,
    PermissionDenied,
    ConflictError,
)


class WorkshopService:
    """Service métier pour la gestion des ateliers"""

    # ============ WORKSHOP CRUD ============

    @staticmethod
    def create_workshop(
        db: Session,
        workshop_create: WorkshopCreate,
        artisan_id: UUID,
        publish: bool = False,
    ) -> Workshop:
        """Créer un nouvel atelier"""
        # Vérifier que l'artisan existe
        artisan = db.query(User).filter(User.id == artisan_id).first()
        if not artisan:
            raise ResourceNotFound("Artisan not found")

        # Générer slug
        slug = WorkshopService._generate_slug(workshop_create.title)

        # Déterminer le statut initial
        initial_status = "published" if publish else "draft"

        # Créer l'atelier
        workshop = Workshop(
            title=workshop_create.title,
            slug=slug,
            description=workshop_create.description,
            short_description=workshop_create.short_description,
            artisan_id=artisan_id,
            # category_id sera géré plus tard si nécessaire
            workshop_type=workshop_create.workshop_type.value if hasattr(workshop_create.workshop_type, 'value') else workshop_create.workshop_type,
            skill_level=workshop_create.skill_level.value if hasattr(workshop_create.skill_level, 'value') else workshop_create.skill_level,
            base_price=workshop_create.base_price,
            # foreign_price=workshop_create.foreign_price,  # Column doesn't exist
            max_participants=workshop_create.max_participants,
            min_participants=workshop_create.min_participants or 1,
            duration_minutes=workshop_create.duration_minutes,
            address=workshop_create.location,  # Map location to address
            room_details=workshop_create.room_details,
            materials_included=workshop_create.materials_included,
            materials_to_bring=workshop_create.materials_to_bring,
            prerequisites=workshop_create.prerequisites,
            what_you_will_learn=workshop_create.what_you_will_learn,
            # program=workshop_create.program,  # Column doesn't exist
            # privatization_enabled=workshop_create.privatization_enabled,  # Column doesn't exist
            featured_image_url=workshop_create.featured_image_url,
            gallery_images=workshop_create.gallery_images,
            video_preview_url=workshop_create.video_preview_url,
            tags=workshop_create.tags,
            status=initial_status,
        )

        # Les options de privatisation ne sont pas encore implémentées dans le modèle
        # Elles seront ajoutées dans une future migration

        db.add(workshop)
        db.commit()
        db.refresh(workshop)
        return workshop

    @staticmethod
    def get_workshop(db: Session, workshop_id: UUID) -> Workshop:
        """Récupérer un atelier par ID"""
        workshop = db.query(Workshop).filter(Workshop.id == workshop_id).first()
        if not workshop:
            raise ResourceNotFound("Workshop not found")
        return workshop

    @staticmethod
    def update_workshop(
        db: Session,
        workshop_id: UUID,
        workshop_update: WorkshopUpdate,
        artisan_id: UUID,
    ) -> Workshop:
        """Mettre à jour un atelier"""
        workshop = WorkshopService.get_workshop(db, workshop_id)

        # Vérifier la permission
        if workshop.artisan_id != artisan_id:
            raise PermissionDenied("You don't have permission to update this workshop")

        # Vérifier le statut (ne peut éditer que les brouillons et publiés)
        if workshop.status not in ["draft", "published"]:
            raise ValidationError("Cannot edit workshop in this status")

        # Mettre à jour les champs
        update_data = workshop_update.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            if hasattr(workshop, key):
                setattr(workshop, key, value)

        # Gérer les options de privatisation
        if "privatization_options" in update_data and update_data["privatization_options"]:
            opts = update_data["privatization_options"]
            workshop.privatization_min_participants = opts.min_participants
            workshop.privatization_max_participants = opts.max_participants
            workshop.privatization_base_price = opts.base_price
            workshop.privatization_price_per_participant = opts.price_per_participant

        workshop.updated_at = datetime.utcnow()
        db.commit()
        db.refresh(workshop)
        return workshop

    @staticmethod
    def delete_workshop(
        db: Session,
        workshop_id: UUID,
        artisan_id: UUID,
    ) -> None:
        """Supprimer un atelier (brouillons seulement)"""
        workshop = WorkshopService.get_workshop(db, workshop_id)

        # Vérifier la permission
        if workshop.artisan_id != artisan_id:
            raise PermissionDenied("You don't have permission to delete this workshop")

        # Vérifier le statut
        if workshop.status != "draft":
            raise ValidationError("Can only delete draft workshops")

        db.delete(workshop)
        db.commit()

    # ============ LISTING & FILTERING ============

    @staticmethod
    def list_workshops(
        db: Session,
        skip: int = 0,
        limit: int = 20,
        category: Optional[str] = None,
        skill_level: Optional[str] = None,
        workshop_type: Optional[str] = None,
        min_price: Optional[Decimal] = None,
        max_price: Optional[Decimal] = None,
        artisan_id: Optional[UUID] = None,
        status: Optional[str] = None,
        search: Optional[str] = None,
    ) -> Tuple[List[Workshop], int]:
        """Lister les ateliers avec filtrage"""
        query = db.query(Workshop)

        # Appliquer les filtres
        if category:
            query = query.filter(Workshop.category == category)
        if skill_level:
            query = query.filter(Workshop.skill_level == skill_level)
        if workshop_type:
            query = query.filter(Workshop.workshop_type == workshop_type)
        if artisan_id:
            query = query.filter(Workshop.artisan_id == artisan_id)
        if status:
            query = query.filter(Workshop.status == status)
        else:
            # Par défaut, afficher seulement les publiés
            query = query.filter(Workshop.status == "published")

        # Filtrage prix
        if min_price is not None:
            query = query.filter(Workshop.base_price >= min_price)
        if max_price is not None:
            query = query.filter(Workshop.base_price <= max_price)

        # Recherche textuelle
        if search:
            search_term = f"%{search}%"
            query = query.filter(
                or_(
                    Workshop.title.ilike(search_term),
                    Workshop.description.ilike(search_term),
                    Workshop.location.ilike(search_term),
                )
            )

        # Compter le total
        total = query.count()

        # Paginer
        workshops = query.offset(skip).limit(limit).all()

        return workshops, total

    # ============ STATUS MANAGEMENT ============

    @staticmethod
    def publish_workshop(
        db: Session,
        workshop_id: UUID,
        artisan_id: UUID,
    ) -> Workshop:
        """Publier un atelier"""
        workshop = WorkshopService.get_workshop(db, workshop_id)

        if workshop.artisan_id != artisan_id:
            raise PermissionDenied("You don't have permission to publish this workshop")

        if workshop.status != "draft":
            raise ValidationError("Can only publish draft workshops")

        workshop.status = "published"
        workshop.updated_at = datetime.utcnow()
        db.commit()
        db.refresh(workshop)
        return workshop

    @staticmethod
    def unpublish_workshop(
        db: Session,
        workshop_id: UUID,
        artisan_id: UUID,
    ) -> Workshop:
        """Dépublier un atelier (revenir au brouillon)"""
        workshop = WorkshopService.get_workshop(db, workshop_id)

        if workshop.artisan_id != artisan_id:
            raise PermissionDenied("You don't have permission to unpublish this workshop")

        if workshop.status != "published":
            raise ValidationError("Can only unpublish published workshops")

        workshop.status = "draft"
        workshop.updated_at = datetime.utcnow()
        db.commit()
        db.refresh(workshop)
        return workshop

    @staticmethod
    def archive_workshop(
        db: Session,
        workshop_id: UUID,
        artisan_id: UUID,
    ) -> Workshop:
        """Archiver un atelier"""
        workshop = WorkshopService.get_workshop(db, workshop_id)

        if workshop.artisan_id != artisan_id:
            raise PermissionDenied("You don't have permission to archive this workshop")

        workshop.status = "archived"
        workshop.updated_at = datetime.utcnow()
        db.commit()
        db.refresh(workshop)
        return workshop

    # ============ SESSIONS MANAGEMENT ============

    @staticmethod
    def create_session(
        db: Session,
        workshop_id: UUID,
        session_create: WorkshopSessionCreate,
        artisan_id: UUID,
    ) -> WorkshopSession:
        """Créer une session d'atelier"""
        workshop = WorkshopService.get_workshop(db, workshop_id)

        # Vérifier la permission
        if workshop.artisan_id != artisan_id:
            raise PermissionDenied("You don't have permission to create sessions for this workshop")

        # Validation
        if session_create.end_datetime <= session_create.start_datetime:
            raise ValidationError("End datetime must be after start datetime")

        # Vérifier qu'il n'y a pas de chevauchement
        overlap = db.query(WorkshopSession).filter(
            and_(
                WorkshopSession.workshop_id == workshop_id,
                WorkshopSession.start_datetime < session_create.end_datetime,
                WorkshopSession.end_datetime > session_create.start_datetime,
            )
        ).first()

        if overlap:
            raise ConflictError("Session overlaps with existing sessions")

        # Créer la session
        session = WorkshopSession(
            workshop_id=workshop_id,
            start_datetime=session_create.start_datetime,
            end_datetime=session_create.end_datetime,
            max_participants=session_create.max_participants or workshop.max_participants,
            session_price=session_create.session_price or workshop.base_price,
            is_private=session_create.is_private,
            status=SessionStatus.SCHEDULED,
            special_instructions=session_create.special_instructions,
        )

        db.add(session)
        db.commit()
        db.refresh(session)
        return session

    @staticmethod
    def get_session(db: Session, session_id: UUID) -> WorkshopSession:
        """Récupérer une session"""
        session = db.query(WorkshopSession).filter(WorkshopSession.id == session_id).first()
        if not session:
            raise ResourceNotFound("Workshop session not found")
        return session

    @staticmethod
    def list_sessions(
        db: Session,
        workshop_id: UUID,
        start_date: Optional[datetime] = None,
        end_date: Optional[datetime] = None,
        status: Optional[str] = None,
    ) -> List[WorkshopSession]:
        """Lister les sessions d'un atelier"""
        query = db.query(WorkshopSession).filter(WorkshopSession.workshop_id == workshop_id)

        if start_date:
            query = query.filter(WorkshopSession.start_datetime >= start_date)
        if end_date:
            query = query.filter(WorkshopSession.end_datetime <= end_date)
        if status:
            query = query.filter(WorkshopSession.status == status)

        return query.order_by(WorkshopSession.start_datetime).all()

    @staticmethod
    def delete_session(
        db: Session,
        session_id: UUID,
        artisan_id: UUID,
    ) -> None:
        """Supprimer une session (sans réservations)"""
        session = WorkshopService.get_session(db, session_id)

        # Vérifier la permission
        workshop = WorkshopService.get_workshop(db, session.workshop_id)
        if workshop.artisan_id != artisan_id:
            raise PermissionDenied("You don't have permission to delete this session")

        # Vérifier qu'il n'y a pas de réservations
        bookings = db.query(WorkshopBooking).filter(
            WorkshopBooking.session_id == session_id
        ).count()

        if bookings > 0:
            raise ValidationError("Cannot delete session with existing bookings")

        db.delete(session)
        db.commit()

    # ============ AVAILABILITY ============

    @staticmethod
    def get_available_spots(db: Session, session_id: UUID) -> int:
        """Obtenir le nombre de places disponibles"""
        session = WorkshopService.get_session(db, session_id)

        # Compter les réservations confirmées
        booked = db.query(WorkshopBooking).filter(
            and_(
                WorkshopBooking.session_id == session_id,
                WorkshopBooking.status.in_([BookingStatus.CONFIRMED, BookingStatus.ATTENDED]),
            )
        ).count()

        # Compter les participants
        from sqlalchemy import func
        total_participants = db.query(func.sum(WorkshopBooking.participants_count)).filter(
            and_(
                WorkshopBooking.session_id == session_id,
                WorkshopBooking.status.in_([BookingStatus.CONFIRMED, BookingStatus.ATTENDED]),
            )
        ).scalar()

        total_participants = total_participants or 0
        available = session.max_participants - total_participants

        return max(0, available)

    @staticmethod
    def is_session_available(db: Session, session_id: UUID, participants_count: int) -> bool:
        """Vérifier si une session a assez de places"""
        available = WorkshopService.get_available_spots(db, session_id)
        return available >= participants_count

    # ============ BOOKINGS ============

    @staticmethod
    def create_booking(
        db: Session,
        workshop_id: UUID,
        booking_create: WorkshopBookingCreate,
        user_id: UUID,
    ) -> WorkshopBooking:
        """Créer une réservation"""
        session = WorkshopService.get_session(db, booking_create.session_id)

        # Vérifier que la session appartient au bon atelier
        if session.workshop_id != workshop_id:
            raise ValidationError("Session does not belong to this workshop")

        # Vérifier la disponibilité
        if not WorkshopService.is_session_available(db, booking_create.session_id, booking_create.participants_count):
            raise ConflictError("Not enough available spots in this session")

        # Récupérer l'atelier pour le prix
        workshop = WorkshopService.get_workshop(db, workshop_id)

        # Calculer le prix total
        total_price = session.session_price * booking_create.participants_count

        # Générer le numéro de réservation
        booking_number = WorkshopService._generate_booking_number(db, workshop_id)

        # Créer la réservation
        booking = WorkshopBooking(
            workshop_id=workshop_id,
            session_id=booking_create.session_id,
            user_id=user_id,
            booking_number=booking_number,
            confirmation_code=WorkshopService._generate_confirmation_code(),
            participants_count=booking_create.participants_count,
            participant_names=booking_create.participant_names,
            total_price=total_price,
            status=BookingStatus.PENDING,
            payment_status=PaymentStatus.PENDING,
            special_requests=booking_create.special_requests,
            dietary_restrictions=booking_create.dietary_restrictions,
        )

        db.add(booking)
        db.commit()
        db.refresh(booking)
        return booking

    @staticmethod
    def get_booking(db: Session, booking_id: UUID) -> WorkshopBooking:
        """Récupérer une réservation"""
        booking = db.query(WorkshopBooking).filter(WorkshopBooking.id == booking_id).first()
        if not booking:
            raise ResourceNotFound("Booking not found")
        return booking

    @staticmethod
    def cancel_booking(
        db: Session,
        booking_id: UUID,
        user_id: Optional[UUID] = None,
    ) -> WorkshopBooking:
        """Annuler une réservation"""
        booking = WorkshopService.get_booking(db, booking_id)

        # Vérifier la permission (propriétaire ou admin)
        if user_id and booking.user_id != user_id:
            raise PermissionDenied("You don't have permission to cancel this booking")

        if booking.status == BookingStatus.CANCELLED:
            raise ValidationError("Booking is already cancelled")

        booking.status = BookingStatus.CANCELLED
        booking.cancelled_at = datetime.utcnow()
        db.commit()
        db.refresh(booking)
        return booking

    @staticmethod
    def confirm_booking(
        db: Session,
        booking_id: UUID,
        artisan_id: Optional[UUID] = None,
    ) -> WorkshopBooking:
        """Confirmer une réservation"""
        booking = WorkshopService.get_booking(db, booking_id)
        workshop = WorkshopService.get_workshop(db, booking.workshop_id)

        # Vérifier la permission
        if artisan_id and workshop.artisan_id != artisan_id:
            raise PermissionDenied("You don't have permission to confirm this booking")

        if booking.status != BookingStatus.PENDING:
            raise ValidationError("Can only confirm pending bookings")

        booking.status = BookingStatus.CONFIRMED
        booking.payment_status = PaymentStatus.PAID
        db.commit()
        db.refresh(booking)
        return booking

    @staticmethod
    def list_user_bookings(
        db: Session,
        user_id: UUID,
        skip: int = 0,
        limit: int = 20,
    ) -> Tuple[List[WorkshopBooking], int]:
        """Lister les réservations d'un utilisateur"""
        query = db.query(WorkshopBooking).filter(WorkshopBooking.user_id == user_id)
        total = query.count()
        bookings = query.offset(skip).limit(limit).order_by(WorkshopBooking.created_at.desc()).all()
        return bookings, total

    @staticmethod
    def list_workshop_bookings(
        db: Session,
        workshop_id: UUID,
        artisan_id: UUID,
        skip: int = 0,
        limit: int = 20,
    ) -> Tuple[List[WorkshopBooking], int]:
        """Lister les réservations d'un atelier"""
        workshop = WorkshopService.get_workshop(db, workshop_id)

        # Vérifier la permission
        if workshop.artisan_id != artisan_id:
            raise PermissionDenied("You don't have permission to view these bookings")

        query = db.query(WorkshopBooking).filter(WorkshopBooking.workshop_id == workshop_id)
        total = query.count()
        bookings = query.offset(skip).limit(limit).order_by(WorkshopBooking.created_at.desc()).all()
        return bookings, total

    # ============ HELPERS ============

    @staticmethod
    def _generate_slug(title: str) -> str:
        """Générer un slug à partir du titre"""
        import re
        slug = title.lower().strip()
        slug = re.sub(r"[àâä]", "a", slug)
        slug = re.sub(r"[èéêë]", "e", slug)
        slug = re.sub(r"[îï]", "i", slug)
        slug = re.sub(r"[ôö]", "o", slug)
        slug = re.sub(r"[ûü]", "u", slug)
        slug = re.sub(r"[ç]", "c", slug)
        slug = re.sub(r"\s+", "-", slug)
        slug = re.sub(r"[^a-z0-9-]", "", slug)
        slug = re.sub(r"-+", "-", slug)
        return slug.strip("-")

    @staticmethod
    def _generate_booking_number(db: Session, workshop_id: UUID) -> str:
        """Générer un numéro de réservation unique"""
        import secrets
        timestamp = datetime.utcnow().strftime("%Y%m%d")
        random_part = secrets.token_hex(3).upper()
        return f"BK-{timestamp}-{random_part}"

    @staticmethod
    def _generate_confirmation_code() -> str:
        """Générer un code de confirmation"""
        import secrets
        return secrets.token_hex(6).upper()

    @staticmethod
    def get_workshop_stats(db: Session, workshop_id: UUID) -> Dict:
        """Obtenir les statistiques d'un atelier"""
        workshop = WorkshopService.get_workshop(db, workshop_id)

        # Compter les réservations
        total_bookings = db.query(WorkshopBooking).filter(
            WorkshopBooking.workshop_id == workshop_id
        ).count()

        confirmed_bookings = db.query(WorkshopBooking).filter(
            and_(
                WorkshopBooking.workshop_id == workshop_id,
                WorkshopBooking.status == BookingStatus.CONFIRMED,
            )
        ).count()

        # Calculer le revenue
        from sqlalchemy import func
        revenue = db.query(func.sum(WorkshopBooking.total_price)).filter(
            and_(
                WorkshopBooking.workshop_id == workshop_id,
                WorkshopBooking.payment_status == PaymentStatus.PAID,
            )
        ).scalar()

        revenue = revenue or Decimal(0)

        # Compter les sessions
        total_sessions = db.query(WorkshopSession).filter(
            WorkshopSession.workshop_id == workshop_id
        ).count()

        upcoming_sessions = db.query(WorkshopSession).filter(
            and_(
                WorkshopSession.workshop_id == workshop_id,
                WorkshopSession.start_datetime > datetime.utcnow(),
            )
        ).count()

        return {
            "total_bookings": total_bookings,
            "confirmed_bookings": confirmed_bookings,
            "revenue": float(revenue),
            "total_sessions": total_sessions,
            "upcoming_sessions": upcoming_sessions,
        }
