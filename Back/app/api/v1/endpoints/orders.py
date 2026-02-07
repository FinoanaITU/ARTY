"""
Endpoints pour la gestion des commandes (Orders)
"""
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import Optional
from uuid import UUID

from app.core.database import get_db
from app.api.deps import get_current_active_user
from app.models.user import User, UserRole
from app.models.order import Order, OrderItem, Payment
from app.schemas.order import (
    OrderCreate,
    OrderOut,
    OrderSummary,
    OrderStatusUpdate,
    OrderItemOut,
    PaymentOut,
    PaginatedOrdersResponse
)
from app.services.order_service import OrderService

router = APIRouter()


@router.post("/", response_model=OrderOut, status_code=status.HTTP_201_CREATED)
async def create_order(
    order_data: OrderCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Crée une nouvelle commande depuis un panier.
    
    Étapes:
    1. Valide le panier et le stock
    2. Génère un numéro de commande unique
    3. Crée les OrderItems depuis les CartItems
    4. Calcule les commissions artisan
    5. Diminue le stock des produits
    6. Vide le panier
    
    Body JSON:
    {
        "cart_id": "uuid",
        "shipping_address": {
            "street": "...",
            "city": "...",
            "postal_code": "...",
            "region": "...",
            "country": "Madagascar"
        },
        "billing_address": {...} (optionnel),
        "shipping_method": "standard",
        "customer_notes": "..." (optionnel),
        "payment_method": "cash_on_delivery"
    }
    """
    order = await OrderService.create_order(db, current_user.id, order_data)
    
    # Récupérer les items et payments
    items = db.query(OrderItem).filter(OrderItem.order_id == order.id).all()
    payments = db.query(Payment).filter(Payment.order_id == order.id).all()
    
    return OrderOut(
        id=order.id,
        order_number=order.order_number,
        user_id=order.user_id,
        status=order.status,
        payment_status=order.payment_status,
        currency=order.currency,
        subtotal=order.subtotal,
        discount_amount=order.discount_amount,
        shipping_amount=order.shipping_amount,
        tax_amount=order.tax_amount,
        total_amount=order.total_amount,
        shipping_address=order.shipping_address,
        customer_notes=order.customer_notes,
        created_at=order.created_at,
        updated_at=order.updated_at,
        estimated_delivery_date=order.estimated_delivery_date,
        items=[OrderItemOut(
            id=item.id,
            order_id=item.order_id,
            product_id=item.product_id,
            variant_id=item.variant_id,
            artisan_id=item.artisan_id,
            title=item.title,
            sku=item.sku,
            quantity=item.quantity,
            unit_price=item.unit_price,
            total_price=item.total_price,
            commission_rate=item.commission_rate,
            commission_amount=item.commission_amount,
            artisan_payout=item.artisan_payout,
            customization_notes=item.customization_notes,
            created_at=item.created_at,
            updated_at=item.updated_at
        ) for item in items],
        payments=[]
    )


@router.get("/", response_model=PaginatedOrdersResponse)
async def get_orders(
    status: Optional[str] = Query(None, description="Filtrer par statut"),
    page: int = Query(1, ge=1, description="Numéro de la page"),
    limit: int = Query(20, ge=1, le=100, description="Nombre d'items par page"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Récupère les commandes de l'utilisateur connecté.
    
    - Pour acheteurs (BUYER): retourne leurs commandes
    - Pour artisans (ARTISAN): retourne les commandes avec leurs items
    - Pour admins (ADMIN): retourne toutes les commandes (TODO)
    
    Query params:
    - status: Filtrer par statut (pending, confirmed, shipped, delivered, etc.)
    - page: Numéro de la page (défaut: 1)
    - limit: Items par page (défaut: 20, max: 100)
    """
    if current_user.role == UserRole.ARTISAN:
        # Récupérer les commandes où l'artisan a des items
        return await OrderService.get_artisan_orders(
            db, current_user.id, status, page, limit
        )
    else:
        # Récupérer les commandes de l'acheteur
        return await OrderService.get_user_orders(
            db, current_user.id, status, page, limit
        )


@router.get("/{order_id}", response_model=OrderOut)
async def get_order(
    order_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Récupère une commande spécifique par son ID.
    
    Permissions:
    - L'acheteur peut voir ses propres commandes
    - Un artisan peut voir les commandes contenant ses produits
    - Un admin peut voir toutes les commandes (TODO)
    """
    order = await OrderService.get_order(db, order_id, current_user.id)
    
    # Récupérer les items et payments
    items = db.query(OrderItem).filter(OrderItem.order_id == order.id).all()
    payments = db.query(Payment).filter(Payment.order_id == order.id).all()
    
    return OrderOut(
        id=order.id,
        order_number=order.order_number,
        user_id=order.user_id,
        status=order.status,
        payment_status=order.payment_status,
        currency=order.currency,
        subtotal=order.subtotal,
        discount_amount=order.discount_amount,
        shipping_amount=order.shipping_amount,
        tax_amount=order.tax_amount,
        total_amount=order.total_amount,
        shipping_address=order.shipping_address,
        customer_notes=order.customer_notes,
        created_at=order.created_at,
        updated_at=order.updated_at,
        estimated_delivery_date=order.estimated_delivery_date,
        items=[OrderItemOut(
            id=item.id,
            order_id=item.order_id,
            product_id=item.product_id,
            variant_id=item.variant_id,
            artisan_id=item.artisan_id,
            title=item.title,
            sku=item.sku,
            quantity=item.quantity,
            unit_price=item.unit_price,
            total_price=item.total_price,
            commission_rate=item.commission_rate,
            commission_amount=item.commission_amount,
            artisan_payout=item.artisan_payout,
            customization_notes=item.customization_notes,
            created_at=item.created_at,
            updated_at=item.updated_at
        ) for item in items],
        payments=[PaymentOut(
            id=payment.id,
            order_id=payment.order_id,
            user_id=payment.user_id,
            payment_method=payment.payment_method,
            payment_provider=payment.payment_provider,
            amount=payment.amount,
            currency=payment.currency,
            status=payment.status,
            processed_at=payment.processed_at,
            created_at=payment.created_at
        ) for payment in payments]
    )


@router.patch("/{order_id}/status", response_model=OrderOut)
async def update_order_status(
    order_id: UUID,
    status_update: OrderStatusUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Met à jour le statut d'une commande.
    
    Seuls les artisans ayant des items dans la commande peuvent
    mettre à jour le statut.
    
    Statuts possibles:
    - pending: En attente
    - confirmed: Confirmée
    - in_production: En production
    - ready_for_pickup: Prête pour enlèvement
    - shipped: Expédiée
    - delivered: Livrée
    - cancelled: Annulée
    
    Body JSON:
    {
        "status": "in_production",
        "comment": "Fabrication en cours",
        "notify_customer": true
    }
    """
    if current_user.role != UserRole.ARTISAN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Seuls les artisans peuvent mettre à jour le statut"
        )
    
    order = await OrderService.update_order_status(
        db, order_id, current_user.id, status_update
    )
    
    # Récupérer les items et payments
    items = db.query(OrderItem).filter(OrderItem.order_id == order.id).all()
    payments = db.query(Payment).filter(Payment.order_id == order.id).all()
    
    return OrderOut(
        id=order.id,
        order_number=order.order_number,
        user_id=order.user_id,
        status=order.status,
        payment_status=order.payment_status,
        currency=order.currency,
        subtotal=order.subtotal,
        discount_amount=order.discount_amount,
        shipping_amount=order.shipping_amount,
        tax_amount=order.tax_amount,
        total_amount=order.total_amount,
        shipping_address=order.shipping_address,
        customer_notes=order.customer_notes,
        created_at=order.created_at,
        updated_at=order.updated_at,
        estimated_delivery_date=order.estimated_delivery_date,
        items=[OrderItemOut(
            id=item.id,
            order_id=item.order_id,
            product_id=item.product_id,
            variant_id=item.variant_id,
            artisan_id=item.artisan_id,
            title=item.title,
            sku=item.sku,
            quantity=item.quantity,
            unit_price=item.unit_price,
            total_price=item.total_price,
            commission_rate=item.commission_rate,
            commission_amount=item.commission_amount,
            artisan_payout=item.artisan_payout,
            customization_notes=item.customization_notes,
            created_at=item.created_at,
            updated_at=item.updated_at
        ) for item in items],
        payments=[PaymentOut(
            id=payment.id,
            order_id=payment.order_id,
            user_id=payment.user_id,
            payment_method=payment.payment_method,
            payment_provider=payment.payment_provider,
            amount=payment.amount,
            currency=payment.currency,
            status=payment.status,
            processed_at=payment.processed_at,
            created_at=payment.created_at
        ) for payment in payments]
    )
 