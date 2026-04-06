"""
Service de gestion des commandes (Order, OrderItem, Payment)
"""
from typing import Optional, List, Tuple
from uuid import UUID
from decimal import Decimal
from datetime import datetime, timedelta, date
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import and_, or_, func, desc
from fastapi import HTTPException, status
import json

from app.models.order import (
    Order, OrderItem, Payment, OrderStatusHistory, Cart, CartItem
)
from app.models.product import Product, ProductVariant
from app.models.user import User
from app.schemas.order import (
    OrderCreate,
    OrderOut,
    OrderSummary,
    OrderStatusUpdate,
    PaginatedOrdersResponse
)

class OrderService:
    """Service pour gérer les commandes"""
    

    COMMISSION_RATE = Decimal("0.10")
    SHIPPING_BASE_COST = Decimal("5000.00")
    TAX_RATE = Decimal("0.00")
    
    @staticmethod
    def _generate_order_number() -> str:
        """
        Génère un numéro de commande unique.
        Format: ORD-YYYY-NNNNNN
        """
        now = datetime.utcnow()
        year = now.year
        timestamp = int(now.timestamp() * 1000) % 1000000
        return f"ORD-{year}-{timestamp:06d}"
    
    @staticmethod
    def _calculate_commission(
        unit_price: Decimal,
        quantity: int
    ) -> Tuple[Decimal, Decimal]:
        """
        Calcule la commission et le payout artisan.
        Retourne (commission_amount, artisan_payout)
        """
        total_price = unit_price * quantity
        commission_amount = total_price * OrderService.COMMISSION_RATE
        artisan_payout = total_price - commission_amount
        
        return (
            commission_amount.quantize(Decimal("0.01")),
            artisan_payout.quantize(Decimal("0.01"))
        )
    
    @staticmethod
    async def create_order(
        db: Session,
        user_id: UUID,
        order_data: OrderCreate
    ) -> Order:
        """
        Crée une commande depuis un panier.
        
        Étapes:
        1. Valider le panier et le stock
        2. Générer numéro de commande unique
        3. Créer l'Order
        4. Créer les OrderItems depuis CartItems
        5. Calculer commissions
        6. Créer product snapshots
        7. Diminuer le stock
        8. Vider le panier
        9. Créer historique de statut
        """

        cart = db.query(Cart).filter(
            and_(
                Cart.id == order_data.cart_id,
                Cart.user_id == user_id
            )
        ).first()
        
        if not cart:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Panier non trouvé"
            )
        
        cart_items = db.query(CartItem).filter(
            CartItem.cart_id == cart.id
        ).all()
        
        if not cart_items:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Le panier est vide"
            )
        

        for cart_item in cart_items:
            product = db.query(Product).filter(
                Product.id == cart_item.product_id
            ).first()
            
            if not product:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"Produit {cart_item.product_id} non trouvé"
                )
            
            if product.track_inventory:
                if cart_item.quantity > product.stock_quantity:
                    if not product.allow_backorders:
                        raise HTTPException(
                            status_code=status.HTTP_400_BAD_REQUEST,
                            detail=f"Stock insuffisant pour {product.title}"
                        )
        

        subtotal = Decimal("0.00")
        for item in cart_items:
            subtotal += item.total_price
        
        discount_amount = cart.discount_amount or Decimal("0.00")
        shipping_amount = OrderService.SHIPPING_BASE_COST
        tax_amount = Decimal("0.00")
        total_amount = subtotal - discount_amount + shipping_amount + tax_amount
        

        order_number = OrderService._generate_order_number()
        

        order = Order(
            order_number=order_number,
            user_id=user_id,
            status="pending",
            payment_status="pending",
            fulfillment_status="unfulfilled",
            currency="MGA",
            subtotal=subtotal,
            discount_amount=discount_amount,
            shipping_amount=shipping_amount,
            tax_amount=tax_amount,
            total_amount=total_amount,
            shipping_address=order_data.shipping_address.model_dump(),
            billing_address=(
                order_data.billing_address.model_dump()
                if order_data.billing_address else None
            ),
            shipping_method=order_data.shipping_method,
            customer_notes=order_data.customer_notes,
            coupon_code=cart.applied_coupon_code,
            estimated_delivery_date=date.today() + timedelta(days=7)
        )
        
        db.add(order)
        db.flush()
        

        for cart_item in cart_items:
            product = db.query(Product).filter(
                Product.id == cart_item.product_id
            ).first()
            

            commission_amount, artisan_payout = (
                OrderService._calculate_commission(
                    cart_item.unit_price,
                    cart_item.quantity
                )
            )
            

            product_snapshot = {
                "title": product.title,
                "description": product.description,
                "price": str(cart_item.unit_price),
                "image_url": None,
                "captured_at": datetime.utcnow().isoformat()
            }
            

            order_item = OrderItem(
                order_id=order.id,
                product_id=cart_item.product_id,
                variant_id=cart_item.variant_id,
                artisan_id=product.artisan_id,
                title=product.title,
                sku=None,
                quantity=cart_item.quantity,
                unit_price=cart_item.unit_price,
                total_price=cart_item.total_price,
                commission_rate=OrderService.COMMISSION_RATE,
                commission_amount=commission_amount,
                artisan_payout=artisan_payout,
                product_snapshot=product_snapshot,
                customization_notes=cart_item.customization_notes
            )
            
            db.add(order_item)
            

            if product.track_inventory:
                product.stock_quantity -= cart_item.quantity
                product.sales_count = (product.sales_count or 0) + 1
        

        status_history = OrderStatusHistory(
            order_id=order.id,
            status="pending",
            comment="Commande créée",
            notified_customer=True,
            changed_by_user_id=user_id
        )
        db.add(status_history)
        

        db.query(CartItem).filter(CartItem.cart_id == cart.id).delete()
        cart.total_amount = Decimal("0.00")
        cart.total_items = 0
        cart.discount_amount = Decimal("0.00")
        cart.applied_coupon_code = None
        
        db.commit()
        db.refresh(order)
        
        return order
    
    @staticmethod
    async def get_order(
        db: Session,
        order_id: UUID,
        user_id: UUID
    ) -> Optional[Order]:
        """
        Récupère une commande avec vérification des permissions.
        L'utilisateur doit être soit l'acheteur, soit un artisan avec items.
        """
        order = db.query(Order).filter(Order.id == order_id).first()
        
        if not order:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Commande non trouvée"
            )
        

        if order.user_id == user_id:

            return order
        

        artisan_has_items = db.query(OrderItem).filter(
            and_(
                OrderItem.order_id == order_id,
                OrderItem.artisan_id == user_id
            )
        ).first()
        
        if artisan_has_items:
            return order
        

        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Vous n'avez pas accès à cette commande"
        )
    
    @staticmethod
    async def get_user_orders(
        db: Session,
        user_id: UUID,
        status_filter: Optional[str] = None,
        page: int = 1,
        limit: int = 20
    ) -> PaginatedOrdersResponse:
        """
        Récupère les commandes d'un utilisateur (acheteur).
        """
        query = db.query(Order).filter(Order.user_id == user_id)
        
        if status_filter:
            query = query.filter(Order.status == status_filter)
        

        total = query.count()
        

        orders = query.order_by(desc(Order.created_at)).offset(
            (page - 1) * limit
        ).limit(limit).all()
        

        items = []
        for order in orders:
            items_count = db.query(OrderItem).filter(
                OrderItem.order_id == order.id
            ).count()
            
            items.append(OrderSummary(
                id=order.id,
                order_number=order.order_number,
                status=order.status,
                payment_status=order.payment_status,
                total_amount=order.total_amount,
                currency=order.currency,
                items_count=items_count,
                created_at=order.created_at
            ))
        
        total_pages = (total + limit - 1) // limit
        
        return PaginatedOrdersResponse(
            items=items,
            total=total,
            page=page,
            page_size=limit,
            total_pages=total_pages
        )
    
    @staticmethod
    async def get_artisan_orders(
        db: Session,
        artisan_id: UUID,
        status_filter: Optional[str] = None,
        page: int = 1,
        limit: int = 20
    ) -> PaginatedOrdersResponse:
        """
        Récupère les commandes où l'artisan a au moins un item.
        """

        order_ids_query = db.query(OrderItem.order_id).filter(
            OrderItem.artisan_id == artisan_id
        ).distinct()
        
        order_ids = [row[0] for row in order_ids_query.all()]
        
        if not order_ids:
            return PaginatedOrdersResponse(
                items=[],
                total=0,
                page=page,
                page_size=limit,
                total_pages=0
            )
        

        query = db.query(Order).filter(Order.id.in_(order_ids))
        
        if status_filter:
            query = query.filter(Order.status == status_filter)
        
        total = query.count()
        
        orders = query.order_by(desc(Order.created_at)).offset(
            (page - 1) * limit
        ).limit(limit).all()
        

        items = []
        for order in orders:

            items_count = db.query(OrderItem).filter(
                and_(
                    OrderItem.order_id == order.id,
                    OrderItem.artisan_id == artisan_id
                )
            ).count()
            
            items.append(OrderSummary(
                id=order.id,
                order_number=order.order_number,
                status=order.status,
                payment_status=order.payment_status,
                total_amount=order.total_amount,
                currency=order.currency,
                items_count=items_count,
                created_at=order.created_at
            ))
        
        total_pages = (total + limit - 1) // limit
        
        return PaginatedOrdersResponse(
            items=items,
            total=total,
            page=page,
            page_size=limit,
            total_pages=total_pages
        )
    
    @staticmethod
    async def update_order_status(
        db: Session,
        order_id: UUID,
        artisan_id: UUID,
        status_update: OrderStatusUpdate
    ) -> Order:
        """
        Met à jour le statut d'une commande.
        Seul un artisan ayant des items peut

 mettre à jour.
        """

        artisan_has_items = db.query(OrderItem).filter(
            and_(
                OrderItem.order_id == order_id,
                OrderItem.artisan_id == artisan_id
            )
        ).first()
        
        if not artisan_has_items:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Vous n'avez pas d'items dans cette commande"
            )
        

        order = db.query(Order).filter(Order.id == order_id).first()
        
        if not order:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Commande non trouvée"
            )
        

        old_status = order.status
        order.status = status_update.status
        

        status_history = OrderStatusHistory(
            order_id=order.id,
            status=status_update.status,
            comment=status_update.comment,
            notified_customer=status_update.notify_customer,
            changed_by_user_id=artisan_id
        )
        db.add(status_history)
        

        if status_update.status == "delivered":
            order.delivered_at = datetime.utcnow()
            order.fulfillment_status = "fulfilled"
        
        db.commit()
        db.refresh(order)
        
        return order
