"""Payment tracking service for admin panel"""
from sqlalchemy.orm import Session
from sqlalchemy import and_, func, or_, desc
from typing import Optional, List, Dict
from datetime import datetime, date, timedelta
from uuid import UUID
from decimal import Decimal
import logging

from app.models.payment import PaymentTracking, PaymentTrackingHistory, ArtisanPayout
from app.models.order import Order
from app.models.workshop import WorkshopBooking
from app.models.user import User
from app.schemas.admin import (
    PaymentOut,
    PaymentHistoryOut,
    PaymentListResponse,
    RecordPaymentRequest,
    ArtisanPayoutOut,
    PayoutListResponse,
    GeneratePayoutRequest,
    MarkPayoutPaidRequest,
    CommissionCalculation,
    PaymentStatus,
    ArtisanPayoutStatus
)
from fastapi import HTTPException, status

logger = logging.getLogger(__name__)

class PaymentTrackingService:
    """Service pour gérer le tracking des paiements et payouts artisans"""
    

    COMMISSION_ARTIZAHO = Decimal("15.00")
    COMMISSION_UBER = Decimal("20.00")
    
    @staticmethod
    async def get_all_payments(
        db: Session,
        payment_status: Optional[str] = None,
        artisan_type: Optional[str] = None,
        skip: int = 0,
        limit: int = 50
    ) -> PaymentListResponse:
        """
        Récupère tous les paiements avec filtres optionnels
        
        Args:
            db: Session DB
            payment_status: Filtre par statut (unpaid/partial/paid/pending_collection)
            artisan_type: Filtre par type artisan (artizaho/uber)
            skip: Nombre d'items à sauter
            limit: Limite d'items
        
        Returns:
            PaymentListResponse avec liste paiements et totaux
        """
        query = db.query(PaymentTracking)
        

        if payment_status:
            query = query.filter(PaymentTracking.payment_status == payment_status)
        if artisan_type:
            query = query.filter(PaymentTracking.artisan_type == artisan_type)
        

        total = query.count()
        

        payments = query.order_by(desc(PaymentTracking.created_at)).offset(skip).limit(limit).all()
        

        items = []
        total_amount = Decimal(0)
        total_paid = Decimal(0)
        
        for payment in payments:

            user = db.query(User).filter(User.id == payment.user_id).first()
            artisan = db.query(User).filter(User.id == payment.artisan_id).first()
            
            order_number = None
            booking_number = None
            
            if payment.order_id:
                order = db.query(Order).filter(Order.id == payment.order_id).first()
                if order:
                    order_number = order.order_number
            
            if payment.booking_id:
                booking = db.query(WorkshopBooking).filter(WorkshopBooking.id == payment.booking_id).first()
                if booking:
                    booking_number = booking.booking_number
            
            items.append(PaymentOut(
                id=payment.id,
                order_id=payment.order_id,
                booking_id=payment.booking_id,
                user_id=payment.user_id,
                artisan_id=payment.artisan_id,
                type=payment.type,
                amount_total=float(payment.amount_total),
                amount_paid=float(payment.amount_paid),
                payment_status=payment.payment_status,
                payment_method=payment.payment_method,
                artisan_type=payment.artisan_type,
                created_at=payment.created_at,
                updated_at=payment.updated_at,
                user_name=user.name if user else None,
                artisan_name=artisan.name if artisan else None,
                order_number=order_number,
                booking_number=booking_number
            ))
            
            total_amount += payment.amount_total
            total_paid += payment.amount_paid
        
        total_outstanding = total_amount - total_paid
        
        return PaymentListResponse(
            total=total,
            items=items,
            total_amount=float(total_amount),
            total_paid=float(total_paid),
            total_outstanding=float(total_outstanding)
        )
    
    @staticmethod
    async def get_payment_by_id(db: Session, payment_id: UUID) -> Optional[PaymentOut]:
        """
        Récupère un paiement par son ID avec données enrichies
        
        Args:
            db: Session DB
            payment_id: ID du paiement
        
        Returns:
            PaymentOut ou None
        """
        payment = db.query(PaymentTracking).filter(PaymentTracking.id == payment_id).first()
        
        if not payment:
            return None
        

        user = db.query(User).filter(User.id == payment.user_id).first()
        artisan = db.query(User).filter(User.id == payment.artisan_id).first()
        
        order_number = None
        booking_number = None
        
        if payment.order_id:
            order = db.query(Order).filter(Order.id == payment.order_id).first()
            if order:
                order_number = order.order_number
        
        if payment.booking_id:
            booking = db.query(WorkshopBooking).filter(WorkshopBooking.id == payment.booking_id).first()
            if booking:
                booking_number = booking.booking_number
        
        return PaymentOut(
            id=payment.id,
            order_id=payment.order_id,
            booking_id=payment.booking_id,
            user_id=payment.user_id,
            artisan_id=payment.artisan_id,
            type=payment.type,
            amount_total=float(payment.amount_total),
            amount_paid=float(payment.amount_paid),
            payment_status=payment.payment_status,
            payment_method=payment.payment_method,
            artisan_type=payment.artisan_type,
            created_at=payment.created_at,
            updated_at=payment.updated_at,
            user_name=user.name if user else None,
            artisan_name=artisan.name if artisan else None,
            order_number=order_number,
            booking_number=booking_number
        )
    
    @staticmethod
    async def record_payment(
        db: Session,
        payment_id: UUID,
        request: RecordPaymentRequest,
        admin_id: Optional[UUID] = None
    ) -> PaymentOut:
        """
        Enregistre un paiement (total ou partiel)
        
        Args:
            db: Session DB
            payment_id: ID du paiement
            request: Détails du paiement (montant, méthode, etc.)
            admin_id: ID de l'admin qui enregistre
        
        Returns:
            PaymentOut mis à jour
        
        Raises:
            HTTPException si paiement non trouvé ou montant invalide
        """
        payment = db.query(PaymentTracking).filter(PaymentTracking.id == payment_id).first()
        
        if not payment:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Payment not found"
            )
        

        remaining = payment.amount_total - payment.amount_paid
        if request.amount > float(remaining):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Amount exceeds remaining balance. Remaining: {remaining}"
            )
        

        payment_hist = PaymentTrackingHistory(
            payment_id=payment.id,
            amount=Decimal(str(request.amount)),
            payment_method=request.payment_method.value,
            transaction_ref=request.transaction_ref,
            notes=request.notes,
            recorded_by=admin_id
        )
        db.add(payment_hist)
        

        payment.amount_paid += Decimal(str(request.amount))
        if not payment.payment_method:
            payment.payment_method = request.payment_method.value
        

        if payment.amount_paid >= payment.amount_total:
            payment.payment_status = PaymentStatus.PAID.value
        elif payment.amount_paid > 0:
            payment.payment_status = PaymentStatus.PARTIAL.value
        
        payment.updated_at = datetime.utcnow()
        
        db.commit()
        db.refresh(payment)
        
        logger.info(f"Payment {payment_id} recorded: {request.amount} via {request.payment_method}")
        
        return await PaymentTrackingService.get_payment_by_id(db, payment_id)
    
    @staticmethod
    def calculate_artisan_commission(
        artisan_type: str,
        sale_amount: float
    ) -> CommissionCalculation:
        """
        Calcule la commission pour un artisan
        
        Args:
            artisan_type: Type artisan (artizaho/uber)
            sale_amount: Montant de la vente
        
        Returns:
            CommissionCalculation avec détails
        """
        sale_amount_decimal = Decimal(str(sale_amount))
        
        if artisan_type.lower() == "artizaho":
            commission_rate = PaymentTrackingService.COMMISSION_ARTIZAHO
        elif artisan_type.lower() == "uber":
            commission_rate = PaymentTrackingService.COMMISSION_UBER
        else:

            commission_rate = PaymentTrackingService.COMMISSION_ARTIZAHO
        
        commission_amount = (sale_amount_decimal * commission_rate / Decimal(100)).quantize(Decimal("0.01"))
        net_to_artisan = sale_amount_decimal - commission_amount
        
        return CommissionCalculation(
            sale_amount=float(sale_amount_decimal),
            commission_rate=float(commission_rate),
            commission_amount=float(commission_amount),
            net_to_artisan=float(net_to_artisan),
            artisan_type=artisan_type
        )
    
    @staticmethod
    async def generate_artisan_payout(
        db: Session,
        request: GeneratePayoutRequest
    ) -> ArtisanPayoutOut:
        """
        Génère un payout pour un artisan pour une période donnée
        
        Args:
            db: Session DB
            request: Détails (artisan_id, période)
        
        Returns:
            ArtisanPayoutOut créé
        
        Raises:
            HTTPException si artisan non trouvé ou données invalides
        """

        artisan = db.query(User).filter(User.id == request.artisan_id).first()
        if not artisan:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Artisan not found"
            )
        

        artisan_type = "artizaho"
        if artisan.artisan_profile:

            artisan_type = "artizaho"
        

        payments = db.query(PaymentTracking).filter(
            and_(
                PaymentTracking.artisan_id == request.artisan_id,
                PaymentTracking.payment_status == PaymentStatus.PAID.value,
                PaymentTracking.created_at >= request.period_start,
                PaymentTracking.created_at <= request.period_end
            )
        ).all()
        
        total_sales = sum([payment.amount_total for payment in payments])
        
        if total_sales == 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No sales found for this period"
            )
        

        commission_calc = PaymentTrackingService.calculate_artisan_commission(
            artisan_type=artisan_type,
            sale_amount=float(total_sales)
        )
        

        payout = ArtisanPayout(
            artisan_id=request.artisan_id,
            period_start=request.period_start.date() if isinstance(request.period_start, datetime) else request.period_start,
            period_end=request.period_end.date() if isinstance(request.period_end, datetime) else request.period_end,
            total_sales=Decimal(str(commission_calc.sale_amount)),
            commission_rate=Decimal(str(commission_calc.commission_rate)),
            commission_amount=Decimal(str(commission_calc.commission_amount)),
            net_payout=Decimal(str(commission_calc.net_to_artisan)),
            status=ArtisanPayoutStatus.PENDING.value
        )
        
        db.add(payout)
        db.commit()
        db.refresh(payout)
        
        logger.info(f"Payout generated for artisan {request.artisan_id}: {payout.net_payout}")
        
        return ArtisanPayoutOut(
            id=payout.id,
            artisan_id=payout.artisan_id,
            period_start=datetime.combine(payout.period_start, datetime.min.time()),
            period_end=datetime.combine(payout.period_end, datetime.min.time()),
            total_sales=float(payout.total_sales),
            commission_rate=float(payout.commission_rate),
            commission_amount=float(payout.commission_amount),
            net_payout=float(payout.net_payout),
            status=payout.status,
            payment_method=payout.payment_method,
            payment_ref=payout.payment_ref,
            paid_at=payout.paid_at,
            notes=payout.notes,
            created_at=payout.created_at,
            updated_at=payout.updated_at,
            artisan_name=artisan.name,
            artisan_email=artisan.email
        )
    
    @staticmethod
    async def get_pending_payouts(
        db: Session,
        skip: int = 0,
        limit: int = 50
    ) -> PayoutListResponse:
        """
        Récupère tous les payouts en attente
        
        Args:
            db: Session DB
            skip: Nombre d'items à sauter
            limit: Limite d'items
        
        Returns:
            PayoutListResponse avec liste payouts
        """
        query = db.query(ArtisanPayout).filter(
            ArtisanPayout.status.in_([
                ArtisanPayoutStatus.PENDING.value,
                ArtisanPayoutStatus.PROCESSING.value
            ])
        )
        
        total = query.count()
        payouts = query.order_by(desc(ArtisanPayout.created_at)).offset(skip).limit(limit).all()
        
        items = []
        total_net_payout = Decimal(0)
        total_commission = Decimal(0)
        
        for payout in payouts:
            artisan = db.query(User).filter(User.id == payout.artisan_id).first()
            
            items.append(ArtisanPayoutOut(
                id=payout.id,
                artisan_id=payout.artisan_id,
                period_start=datetime.combine(payout.period_start, datetime.min.time()),
                period_end=datetime.combine(payout.period_end, datetime.min.time()),
                total_sales=float(payout.total_sales),
                commission_rate=float(payout.commission_rate),
                commission_amount=float(payout.commission_amount),
                net_payout=float(payout.net_payout),
                status=payout.status,
                payment_method=payout.payment_method,
                payment_ref=payout.payment_ref,
                paid_at=payout.paid_at,
                notes=payout.notes,
                created_at=payout.created_at,
                updated_at=payout.updated_at,
                artisan_name=artisan.name if artisan else None,
                artisan_email=artisan.email if artisan else None
            ))
            
            total_net_payout += payout.net_payout
            total_commission += payout.commission_amount
        
        return PayoutListResponse(
            total=total,
            items=items,
            total_net_payout=float(total_net_payout),
            total_commission=float(total_commission)
        )
    
    @staticmethod
    async def mark_payout_as_paid(
        db: Session,
        payout_id: UUID,
        request: MarkPayoutPaidRequest
    ) -> ArtisanPayoutOut:
        """
        Marque un payout comme payé
        
        Args:
            db: Session DB
            payout_id: ID du payout
            request: Détails du paiement (méthode, référence, notes)
        
        Returns:
            ArtisanPayoutOut mis à jour
        
        Raises:
            HTTPException si payout non trouvé ou déjà payé
        """
        payout = db.query(ArtisanPayout).filter(ArtisanPayout.id == payout_id).first()
        
        if not payout:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Payout not found"
            )
        
        if payout.status == ArtisanPayoutStatus.PAID.value:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Payout already marked as paid"
            )
        

        payout.status = ArtisanPayoutStatus.PAID.value
        payout.payment_method = request.payment_method.value
        payout.payment_ref = request.payment_ref
        payout.paid_at = datetime.utcnow()
        if request.notes:
            payout.notes = request.notes
        payout.updated_at = datetime.utcnow()
        
        db.commit()
        db.refresh(payout)
        
        logger.info(f"Payout {payout_id} marked as paid")
        
        artisan = db.query(User).filter(User.id == payout.artisan_id).first()
        
        return ArtisanPayoutOut(
            id=payout.id,
            artisan_id=payout.artisan_id,
            period_start=datetime.combine(payout.period_start, datetime.min.time()),
            period_end=datetime.combine(payout.period_end, datetime.min.time()),
            total_sales=float(payout.total_sales),
            commission_rate=float(payout.commission_rate),
            commission_amount=float(payout.commission_amount),
            net_payout=float(payout.net_payout),
            status=payout.status,
            payment_method=payout.payment_method,
            payment_ref=payout.payment_ref,
            paid_at=payout.paid_at,
            notes=payout.notes,
            created_at=payout.created_at,
            updated_at=payout.updated_at,
            artisan_name=artisan.name if artisan else None,
            artisan_email=artisan.email if artisan else None
        )

    @staticmethod
    async def get_payment_history(
        db: Session,
        payment_id: str,
    ) -> List[PaymentHistoryOut]:
        """
        Récupère l'historique des transactions pour un paiement
        
        Args:
            db: Session DB
            payment_id: ID du paiement
        
        Returns:
            Liste des transactions de paiement
        """
        history = db.query(PaymentTrackingHistory).filter(
            PaymentTrackingHistory.payment_id == payment_id
        ).order_by(desc(PaymentTrackingHistory.created_at)).all()
        
        items = []
        for h in history:
            recorder = db.query(User).filter(User.id == h.recorded_by).first() if h.recorded_by else None
            
            items.append(PaymentHistoryOut(
                id=h.id,
                payment_id=h.payment_id,
                amount=float(h.amount),
                payment_method=h.payment_method,
                transaction_ref=h.transaction_ref,
                notes=h.notes,
                paid_at=h.paid_at,
                recorded_by=h.recorded_by,
                created_at=h.created_at,
                recorder_name=recorder.name if recorder else None
            ))
        
        return items

    
    @staticmethod
    async def get_artisan_payout_history(
        db: Session,
        artisan_id: UUID,
        skip: int = 0,
        limit: int = 50
    ) -> PayoutListResponse:
        """
        Récupère l'historique des payouts d'un artisan
        
        Args:
            db: Session DB
            artisan_id: ID de l'artisan
            skip: Nombre d'items à sauter
            limit: Limite d'items
        
        Returns:
            PayoutListResponse avec historique
        """
        query = db.query(ArtisanPayout).filter(
            ArtisanPayout.artisan_id == artisan_id
        )
        
        total = query.count()
        payouts = query.order_by(desc(ArtisanPayout.created_at)).offset(skip).limit(limit).all()
        
        items = []
        total_net_payout = Decimal(0)
        total_commission = Decimal(0)
        
        artisan = db.query(User).filter(User.id == artisan_id).first()
        
        for payout in payouts:
            items.append(ArtisanPayoutOut(
                id=payout.id,
                artisan_id=payout.artisan_id,
                period_start=datetime.combine(payout.period_start, datetime.min.time()),
                period_end=datetime.combine(payout.period_end, datetime.min.time()),
                total_sales=float(payout.total_sales),
                commission_rate=float(payout.commission_rate),
                commission_amount=float(payout.commission_amount),
                net_payout=float(payout.net_payout),
                status=payout.status,
                payment_method=payout.payment_method,
                payment_ref=payout.payment_ref,
                paid_at=payout.paid_at,
                notes=payout.notes,
                created_at=payout.created_at,
                updated_at=payout.updated_at,
                artisan_name=artisan.name if artisan else None,
                artisan_email=artisan.email if artisan else None
            ))
            
            total_net_payout += payout.net_payout
            total_commission += payout.commission_amount
        
        return PayoutListResponse(
            total=total,
            items=items,
            total_net_payout=float(total_net_payout),
            total_commission=float(total_commission)
        )
