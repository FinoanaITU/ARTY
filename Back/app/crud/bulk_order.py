"""
CRUD operations pour les demandes de commande en gros
"""
from sqlalchemy.orm import Session
from typing import Optional, List
from uuid import UUID
from decimal import Decimal
from app.models.product import BulkOrderRequest, Product
from app.schemas.product import BulkOrderRequestIn
import uuid

def calculate_bulk_discount(quantity: int) -> Decimal:
    """
    Calcule le pourcentage de remise selon la quantité
    
    Remises progressives:
    - 5-9: -5%
    - 10-19: -10%
    - 20-49: -15%
    - 50+: -25%
    
    Returns:
        discount_percentage: Pourcentage de remise
    """
    if quantity >= 50:
        discount_percentage = Decimal('25.00')
    elif quantity >= 20:
        discount_percentage = Decimal('15.00')
    elif quantity >= 10:
        discount_percentage = Decimal('10.00')
    elif quantity >= 5:
        discount_percentage = Decimal('5.00')
    else:
        discount_percentage = Decimal('0.00')
    
    return discount_percentage

class BulkOrderCRUD:
    """CRUD pour les demandes de commande en gros"""
    
    def create(
        self,
        db: Session,
        *,
        product_id: UUID,
        obj_in: BulkOrderRequestIn,
        unit_price: Decimal
    ) -> BulkOrderRequest:
        """Crée une nouvelle demande de commande en gros"""

        discount_percentage = calculate_bulk_discount(obj_in.quantity)
        

        subtotal = unit_price * obj_in.quantity
        discount_amount = (subtotal * discount_percentage) / Decimal('100')
        total_amount = subtotal - discount_amount
        

        bulk_order = BulkOrderRequest(
            id=uuid.uuid4(),
            product_id=product_id,
            quantity=obj_in.quantity,
            unit_price=unit_price,
            discount_percentage=discount_percentage,
            discount_amount=discount_amount,
            total_amount=total_amount,
            customer_name=obj_in.customer_name,
            customer_email=obj_in.customer_email,
            customer_phone=obj_in.customer_phone,
            company=obj_in.company,
            message=obj_in.message,
            status='pending'
        )
        
        db.add(bulk_order)
        db.commit()
        db.refresh(bulk_order)
        return bulk_order
    
    def get_by_id(self, db: Session, bulk_order_id: UUID) -> Optional[BulkOrderRequest]:
        """Récupère une demande de commande en gros par son ID"""
        return db.query(BulkOrderRequest).filter(BulkOrderRequest.id == bulk_order_id).first()
    
    def get_by_product(
        self,
        db: Session,
        product_id: UUID,
        skip: int = 0,
        limit: int = 100
    ) -> List[BulkOrderRequest]:
        """Récupère les demandes de commande en gros pour un produit"""
        return db.query(BulkOrderRequest).filter(
            BulkOrderRequest.product_id == product_id
        ).order_by(BulkOrderRequest.created_at.desc()).offset(skip).limit(limit).all()
    
    def get_by_artisan(
        self,
        db: Session,
        artisan_id: UUID,
        skip: int = 0,
        limit: int = 100
    ) -> List[BulkOrderRequest]:
        """Récupère les demandes de commande en gros pour les produits d'un artisan"""
        return db.query(BulkOrderRequest).join(
            Product, BulkOrderRequest.product_id == Product.id
        ).filter(
            Product.artisan_id == artisan_id
        ).order_by(BulkOrderRequest.created_at.desc()).offset(skip).limit(limit).all()
    
    def update_status(
        self,
        db: Session,
        *,
        bulk_order_id: UUID,
        status: str,
        artisan_notes: Optional[str] = None
    ) -> Optional[BulkOrderRequest]:
        """Met à jour le statut d'une demande de commande en gros"""
        bulk_order = self.get_by_id(db, bulk_order_id)
        if not bulk_order:
            return None
        
        bulk_order.status = status
        if artisan_notes:
            bulk_order.artisan_notes = artisan_notes
        
        if status == 'contacted':
            from datetime import datetime
            bulk_order.contacted_at = datetime.utcnow()
        elif status == 'confirmed':
            from datetime import datetime
            bulk_order.confirmed_at = datetime.utcnow()
        
        db.add(bulk_order)
        db.commit()
        db.refresh(bulk_order)
        return bulk_order

bulk_order_crud = BulkOrderCRUD()

