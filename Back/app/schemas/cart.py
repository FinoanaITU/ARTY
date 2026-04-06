"""
Schémas Pydantic pour le panier (Cart) et les items du panier (CartItem)
"""
from pydantic import BaseModel, Field, field_validator
from typing import Optional, List
from uuid import UUID
from datetime import datetime
from decimal import Decimal

class CartItemCreate(BaseModel):
    """
    Schema pour ajouter un item au panier.
    """
    product_id: UUID
    variant_id: Optional[UUID] = None
    quantity: int = Field(default=1, ge=1, description="Quantité (minimum 1)")
    customization_notes: Optional[str] = Field(None, max_length=1000)
    
    class Config:
        from_attributes = True

class CartItemUpdate(BaseModel):
    """
    Schema pour modifier un item du panier (généralement la quantité).
    """
    quantity: int = Field(..., ge=0, description="Quantité (0 pour supprimer)")
    customization_notes: Optional[str] = Field(None, max_length=1000)
    
    class Config:
        from_attributes = True

class ApplyCouponRequest(BaseModel):
    """
    Schema pour appliquer un code promo au panier.
    """
    coupon_code: str = Field(..., min_length=1, max_length=50)
    
    class Config:
        from_attributes = True

class ProductMinimal(BaseModel):
    """
    Informations minimales du produit pour affichage dans le panier.
    """
    id: UUID
    title: str
    image_url: Optional[str] = None
    artisan_id: UUID
    artisan_name: Optional[str] = None
    
    class Config:
        from_attributes = True

class CartItemOut(BaseModel):
    """
    Schema de sortie pour un item du panier avec informations complètes.
    """
    id: UUID
    cart_id: UUID
    product_id: UUID
    variant_id: Optional[UUID] = None
    quantity: int
    unit_price: Decimal
    total_price: Decimal
    customization_notes: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    

    product: Optional[ProductMinimal] = None
    
    class Config:
        from_attributes = True

class CartSummary(BaseModel):
    """
    Résumé du panier (montants calculés).
    """
    subtotal: Decimal = Field(description="Sous-total avant réductions")
    discount_amount: Decimal = Field(default=Decimal("0.00"), description="Montant de la réduction")
    total_amount: Decimal = Field(description="Total après réductions")
    total_items: int = Field(description="Nombre total d'items")
    applied_coupon_code: Optional[str] = None
    
    class Config:
        from_attributes = True

class CartOut(BaseModel):
    """
    Schema de sortie complet du panier avec tous ses items.
    """
    id: UUID
    user_id: Optional[UUID] = None
    session_id: Optional[str] = None
    currency: str = "MGA"
    total_amount: Decimal
    total_items: int
    applied_coupon_code: Optional[str] = None
    discount_amount: Decimal = Decimal("0.00")
    expires_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime
    

    items: List[CartItemOut] = []
    

    summary: Optional[CartSummary] = None
    
    class Config:
        from_attributes = True

class CartItemAddedResponse(BaseModel):
    """
    Réponse après ajout d'un item au panier.
    """
    message: str = "Produit ajouté au panier"
    cart: CartOut
    item: CartItemOut
    
    class Config:
        from_attributes = True

class CartClearedResponse(BaseModel):
    """
    Réponse après vidage du panier.
    """
    message: str = "Panier vidé avec succès"
    items_removed: int
    
    class Config:
        from_attributes = True
