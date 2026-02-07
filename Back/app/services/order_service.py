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
    
    # Configuration des commissions
    COMMISSION_RATE = Decimal("0.10")  # 10% de commission plateforme
    SHIPPING_BASE_COST = Decimal("5000.00")  # 5000 MGA
    TAX_RATE = Decimal("0.00")  # Pas de TVA pour l'instant
    
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
        # 1. Récupérer le panier avec ses items
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
        
        # 2. Valider le stock pour tous les produits
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
        
        # 3. Calculer les montants
        subtotal = Decimal("0.00")
        for item in cart_items:
            subtotal += item.total_price
        
        discount_amount = cart.discount_amount or Decimal("0.00")
        shipping_amount = OrderService.SHIPPING_BASE_COST
        tax_amount = Decimal("0.00")
        total_amount = subtotal - discount_amount + shipping_amount + tax_amount
        
        # 4. Générer numéro de commande unique
        order_number = OrderService._generate_order_number()
        
        # 5. Créer l'Order
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
        db.flush()  # Pour obtenir l'ID de l'order
        
        # 6. Créer les OrderItems depuis CartItems
        for cart_item in cart_items:
            product = db.query(Product).filter(
                Product.id == cart_item.product_id
            ).first()
            
            # Calculer commission et payout
            commission_amount, artisan_payout = (
                OrderService._calculate_commission(
                    cart_item.unit_price,
                    cart_item.quantity
                )
            )
            
            # Créer snapshot du produit (pour historique)
            product_snapshot = {
                "title": product.title,
                "description": product.description,
                "price": str(cart_item.unit_price),
                "image_url": None,  # TODO: récupérer image principale
                "captured_at": datetime.utcnow().isoformat()
            }
            
            # Créer OrderItem
            order_item = OrderItem(
                order_id=order.id,
                product_id=cart_item.product_id,
                variant_id=cart_item.variant_id,
                artisan_id=product.artisan_id,
                title=product.title,
                sku=None,  # TODO: gérer SKU
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
            
            # 7. Diminuer le stock
            if product.track_inventory:
                product.stock_quantity -= cart_item.quantity
                product.sales_count = (product.sales_count or 0) + 1
        
        # 8. Créer historique de statut initial
        status_history = OrderStatusHistory(
            order_id=order.id,
            status="pending",
            comment="Commande créée",
            notified_customer=True,
            changed_by_user_id=user_id
        )
        db.add(status_history)
        
        # 9. Vider le panier
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
        
        # Vérifier permissions
        if order.user_id == user_id:
            # L'acheteur peut voir sa commande
            return order
        
        # Vérifier si l'utilisateur est un artisan avec items dans cette commande
        artisan_has_items = db.query(OrderItem).filter(
            and_(
                OrderItem.order_id == order_id,
                OrderItem.artisan_id == user_id
            )
        ).first()
        
        if artisan_has_items:
            return order
        
        # Pas de permission
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
        
        # Compter le total
        total = query.count()
        
        # Paginer
        orders = query.order_by(desc(Order.created_at)).offset(
            (page - 1) * limit
        ).limit(limit).all()
        
        # Convertir en OrderSummary
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
            limit=limit,
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
        # Récupérer les order_ids où l'artisan a des items
        order_ids_query = db.query(OrderItem.order_id).filter(
            OrderItem.artisan_id == artisan_id
        ).distinct()
        
        order_ids = [row[0] for row in order_ids_query.all()]
        
        if not order_ids:
            return PaginatedOrdersResponse(
                items=[],
                total=0,
                page=page,
                limit=limit,
                total_pages=0
            )
        
        # Récupérer les commandes
        query = db.query(Order).filter(Order.id.in_(order_ids))
        
        if status_filter:
            query = query.filter(Order.status == status_filter)
        
        total = query.count()
        
        orders = query.order_by(desc(Order.created_at)).offset(
            (page - 1) * limit
        ).limit(limit).all()
        
        # Convertir en OrderSummary
        items = []
        for order in orders:
            # Compter seulement les items de cet artisan
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
            limit=limit,
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
        # Vérifier que l'artisan a des items dans cette commande
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
        
        # Récupérer la commande
        order = db.query(Order).filter(Order.id == order_id).first()
        
        if not order:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Commande non trouvée"
            )
        
        # Mettre à jour le statut
        old_status = order.status
        order.status = status_update.status
        
        # Créer historique
        status_history = OrderStatusHistory(
            order_id=order.id,
            status=status_update.status,
            comment=status_update.comment,
            notified_customer=status_update.notify_customer,
            changed_by_user_id=artisan_id
        )
        db.add(status_history)
        
        # Si delivered, enregistrer la date
        if status_update.status == "delivered":
            order.delivered_at = datetime.utcnow()
            order.fulfillment_status = "fulfilled"
        
        db.commit()
        db.refresh(order)
        
        return order
