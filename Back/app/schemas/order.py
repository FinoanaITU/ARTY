"""
Schémas Pydantic pour les commandes (orders)
"""

from typing import Optional, List
from pydantic import BaseModel, Field
from datetime import datetime
from uuid import UUID
from enum import Enum


class OrderStatus(str, Enum):
    """Statuts de commande"""
    PENDING = "pending"
    CONFIRMED = "confirmed"
    PROCESSING = "processing"
    SHIPPED = "shipped"
    DELIVERED = "delivered"
    CANCELLED = "cancelled"
    REFUNDED = "refunded"


class PaymentStatus(str, Enum):
    """Statuts de paiement"""
    PENDING = "pending"
    PAID = "paid"
    FAILED = "failed"
    REFUNDED = "refunded"


class PaymentMethod(str, Enum):
    """Méthodes de paiement"""
    CARD = "card"
    MOBILE_MONEY = "mobile_money"
    BANK_TRANSFER = "bank_transfer"
    CASH_ON_DELIVERY = "cash_on_delivery"


class AddressSchema(BaseModel):
    """Schéma d'adresse"""
    street: str
    city: str
    state: Optional[str] = None
    postal_code: Optional[str] = None
    country: str = "Madagascar"
    phone: str


class OrderCreate(BaseModel):
    """Schéma pour créer une commande"""
    shipping_address: AddressSchema
    billing_address: Optional[AddressSchema] = None
    payment_method: PaymentMethod
    notes: Optional[str] = None
    use_shipping_for_billing: bool = True


class OrderStatusUpdate(BaseModel):
    """Mise à jour du statut de commande"""
    status: OrderStatus
    notes: Optional[str] = None


class OrderItemOut(BaseModel):
    """Item de commande (output)"""
    id: UUID
    order_id: UUID
    product_id: UUID
    product_snapshot: dict
    quantity: int
    unit_price: float
    subtotal: float
    commission_amount: float
    artisan_payout: float
    created_at: datetime

    class Config:
        from_attributes = True


class PaymentOut(BaseModel):
    """Paiement (output)"""
    id: UUID
    order_id: UUID
    amount: float
    currency: str = "MGA"
    payment_method: str
    status: str
    transaction_id: Optional[str] = None
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class OrderOut(BaseModel):
    """Commande complète (output)"""
    id: UUID
    order_number: str
    user_id: UUID
    status: str
    payment_status: str
    subtotal: float
    shipping_cost: float
    tax_amount: float
    total_amount: float
    shipping_address: dict
    billing_address: Optional[dict] = None
    notes: Optional[str] = None
    items: List[OrderItemOut] = []
    payments: List[PaymentOut] = []
    created_at: datetime
    updated_at: Optional[datetime] = None
    shipped_at: Optional[datetime] = None
    delivered_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class OrderSummary(BaseModel):
    """Résumé de commande pour listes"""
    id: UUID
    order_number: str
    status: str
    payment_status: str
    total_amount: float
    items_count: int
    created_at: datetime

    class Config:
        from_attributes = True


class PaginatedOrdersResponse(BaseModel):
    """Réponse paginée pour liste de commandes"""
    items: List[OrderOut]
    total: int
    page: int
    page_size: int
    total_pages: int
