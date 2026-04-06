"""
Endpoints pour la gestion du panier (Cart)
"""
from fastapi import APIRouter, Depends, HTTPException, status, Header
from sqlalchemy.orm import Session
from typing import Optional
from uuid import UUID

from app.core.database import get_db
from app.api.deps import get_current_active_user
from app.models.user import User
from app.models.order import CartItem
from app.schemas.cart import (
    CartItemCreate,
    CartItemUpdate,
    CartOut,
    CartItemOut,
    ApplyCouponRequest,
    CartItemAddedResponse,
    CartClearedResponse
)
from app.services.cart_service import CartService

router = APIRouter()

@router.get("/", response_model=CartOut)
async def get_current_cart(
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_active_user),
    session_id: Optional[str] = Header(None, alias="X-Session-ID")
):
    """
    Récupère le panier de l'utilisateur connecté ou du visiteur
    (via session_id).
    
    - Pour utilisateurs connectés: utilise automatiquement leur user_id
    - Pour visiteurs: utilise le header X-Session-ID
    """
    user_id = current_user.id if current_user else None
    

    cart = await CartService.get_or_create_cart(db, user_id=user_id, session_id=session_id)
    

    items = db.query(CartItem).filter(CartItem.cart_id == cart.id).all()
    
    return CartOut(
        id=cart.id,
        user_id=cart.user_id,
        session_id=cart.session_id,
        currency=cart.currency,
        total_amount=cart.total_amount,
        total_items=cart.total_items,
        applied_coupon_code=cart.applied_coupon_code,
        discount_amount=cart.discount_amount,
        expires_at=cart.expires_at,
        created_at=cart.created_at,
        updated_at=cart.updated_at,
        items=[CartItemOut(
            id=item.id,
            cart_id=item.cart_id,
            product_id=item.product_id,
            variant_id=item.variant_id,
            quantity=item.quantity,
            unit_price=item.unit_price,
            total_price=item.total_price,
            customization_notes=item.customization_notes,
            created_at=item.created_at,
            updated_at=item.updated_at
        ) for item in items]
    )

@router.post(
    "/items",
    response_model=CartItemAddedResponse,
    status_code=status.HTTP_201_CREATED
)
async def add_item_to_cart(
    item_data: CartItemCreate,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_active_user),
    session_id: Optional[str] = Header(None, alias="X-Session-ID")
):
    """
    Ajoute un produit au panier.
    
    Si le produit existe déjà, la quantité est additionnée.
    Valide le stock disponible avant d'ajouter.
    
    Body JSON:
    {
        "product_id": "uuid",
        "variant_id": "uuid" (optionnel),
        "quantity": 1,
        "customization_notes": "..." (optionnel)
    }
    """
    user_id = current_user.id if current_user else None
    

    cart = await CartService.get_or_create_cart(db, user_id=user_id, session_id=session_id)
    

    cart_item = await CartService.add_item(db, cart.id, item_data)
    

    db.refresh(cart)
    
    return CartItemAddedResponse(
        message="Produit ajouté au panier",
        cart=CartOut(
            id=cart.id,
            user_id=cart.user_id,
            session_id=cart.session_id,
            currency=cart.currency,
            total_amount=cart.total_amount,
            total_items=cart.total_items,
            applied_coupon_code=cart.applied_coupon_code,
            discount_amount=cart.discount_amount,
            expires_at=cart.expires_at,
            created_at=cart.created_at,
            updated_at=cart.updated_at,
            items=[]
        ),
        item=CartItemOut(
            id=cart_item.id,
            cart_id=cart_item.cart_id,
            product_id=cart_item.product_id,
            variant_id=cart_item.variant_id,
            quantity=cart_item.quantity,
            unit_price=cart_item.unit_price,
            total_price=cart_item.total_price,
            customization_notes=cart_item.customization_notes,
            created_at=cart_item.created_at,
            updated_at=cart_item.updated_at
        )
    )

@router.put("/items/{item_id}", response_model=CartItemOut)
async def update_cart_item(
    item_id: UUID,
    update_data: CartItemUpdate,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_active_user)
):
    """
    Met à jour un item du panier (quantité ou notes).
    
    Si quantity = 0, l'item est supprimé.
    
    Body JSON:
    {
        "quantity": 2,
        "customization_notes": "..." (optionnel)
    }
    """
    cart_item = await CartService.update_item(db, item_id, update_data)
    
    return CartItemOut(
        id=cart_item.id,
        cart_id=cart_item.cart_id,
        product_id=cart_item.product_id,
        variant_id=cart_item.variant_id,
        quantity=cart_item.quantity,
        unit_price=cart_item.unit_price,
        total_price=cart_item.total_price,
        customization_notes=cart_item.customization_notes,
        created_at=cart_item.created_at,
        updated_at=cart_item.updated_at
    )

@router.delete("/items/{item_id}")
async def remove_cart_item(
    item_id: UUID,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_active_user)
):
    """
    Supprime un item du panier.
    """
    await CartService.remove_item(db, item_id)
    
    return {
        "message": "Item supprimé du panier",
        "item_id": str(item_id)
    }

@router.delete("/", response_model=CartClearedResponse)
async def clear_cart(
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_active_user),
    session_id: Optional[str] = Header(None, alias="X-Session-ID")
):
    """
    Vide complètement le panier.
    """
    user_id = current_user.id if current_user else None
    

    cart = await CartService.get_cart(db, user_id=user_id, session_id=session_id)
    if not cart:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Panier non trouvé"
        )
    

    items_removed = await CartService.clear_cart(db, cart.id)
    
    return CartClearedResponse(
        message="Panier vidé avec succès",
        items_removed=items_removed
    )

@router.post("/coupon", response_model=CartOut)
async def apply_coupon(
    coupon_request: ApplyCouponRequest,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_active_user),
    session_id: Optional[str] = Header(None, alias="X-Session-ID")
):
    """
    Applique un code promo au panier.
    
    Body JSON:
    {
        "coupon_code": "PROMO2026"
    }
    """
    user_id = current_user.id if current_user else None
    

    cart = await CartService.get_cart(db, user_id=user_id, session_id=session_id)
    if not cart:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Panier non trouvé"
        )
    

    updated_cart = await CartService.apply_coupon(db, cart.id, coupon_request.coupon_code)
    

    items = db.query(CartItem).filter(CartItem.cart_id == updated_cart.id).all()
    
    return CartOut(
        id=updated_cart.id,
        user_id=updated_cart.user_id,
        session_id=updated_cart.session_id,
        currency=updated_cart.currency,
        total_amount=updated_cart.total_amount,
        total_items=updated_cart.total_items,
        applied_coupon_code=updated_cart.applied_coupon_code,
        discount_amount=updated_cart.discount_amount,
        expires_at=updated_cart.expires_at,
        created_at=updated_cart.created_at,
        updated_at=updated_cart.updated_at,
        items=[CartItemOut(
            id=item.id,
            cart_id=item.cart_id,
            product_id=item.product_id,
            variant_id=item.variant_id,
            quantity=item.quantity,
            unit_price=item.unit_price,
            total_price=item.total_price,
            customization_notes=item.customization_notes,
            created_at=item.created_at,
            updated_at=item.updated_at
        ) for item in items]
    )

@router.post("/merge")
async def merge_carts_on_login(
    session_id: str = Header(..., alias="X-Session-ID"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Endpoint appelé après login pour fusionner le panier invité avec le panier utilisateur.
    Utilise le header X-Session-ID pour identifier le panier invité.
    """
    merged_cart = await CartService.merge_carts(db, current_user.id, session_id)
    

    items = db.query(CartItem).filter(CartItem.cart_id == merged_cart.id).all()
    
    return CartOut(
        id=merged_cart.id,
        user_id=merged_cart.user_id,
        session_id=merged_cart.session_id,
        currency=merged_cart.currency,
        total_amount=merged_cart.total_amount,
        total_items=merged_cart.total_items,
        applied_coupon_code=merged_cart.applied_coupon_code,
        discount_amount=merged_cart.discount_amount,
        expires_at=merged_cart.expires_at,
        created_at=merged_cart.created_at,
        updated_at=merged_cart.updated_at,
        items=[CartItemOut(
            id=item.id,
            cart_id=item.cart_id,
            product_id=item.product_id,
            variant_id=item.variant_id,
            quantity=item.quantity,
            unit_price=item.unit_price,
            total_price=item.total_price,
            customization_notes=item.customization_notes,
            created_at=item.created_at,
            updated_at=item.updated_at
        ) for item in items]
    ) 