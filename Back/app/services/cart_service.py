"""
Service de gestion du panier (Cart) et des items du panier (CartItem)
"""
from typing import Optional, List
from uuid import UUID
from decimal import Decimal
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from sqlalchemy import and_
from fastapi import HTTPException, status

from app.models.order import Cart, CartItem
from app.models.product import Product, ProductVariant
from app.models.user import User
from app.schemas.cart import (
    CartItemCreate,
    CartItemUpdate,
    CartOut,
    CartItemOut,
    CartSummary,
    ApplyCouponRequest
)


class CartService:
    """Service pour gérer les paniers et leurs items"""
    
    @staticmethod
    def _calculate_cart_totals(cart: Cart, db: Session) -> dict:
        """
        Calcule les totaux du panier (subtotal, discount, total).
        Retourne un dictionnaire avec les montants.
        """
        # Récupérer tous les items du panier
        items = db.query(CartItem).filter(CartItem.cart_id == cart.id).all()
        
        subtotal = Decimal("0.00")
        total_items = 0
        
        for item in items:
            subtotal += item.total_price
            total_items += item.quantity
        
        # Appliquer la réduction si un coupon est appliqué
        discount_amount = cart.discount_amount or Decimal("0.00")
        total_amount = subtotal - discount_amount
        
        # S'assurer que le total n'est jamais négatif
        if total_amount < 0:
            total_amount = Decimal("0.00")
        
        return {
            "subtotal": subtotal,
            "discount_amount": discount_amount,
            "total_amount": total_amount,
            "total_items": total_items
        }
    
    @staticmethod
    async def get_or_create_cart(
        db: Session,
        user_id: Optional[UUID] = None,
        session_id: Optional[str] = None
    ) -> Cart:
        """
        Récupère le panier existant ou en crée un nouveau.
        Pour utilisateurs connectés: utilise user_id
        Pour invités: utilise session_id
        """
        if not user_id and not session_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="user_id ou session_id requis"
            )
        
        # Chercher le panier existant
        query = db.query(Cart)
        if user_id:
            cart = query.filter(Cart.user_id == user_id).first()
        else:
            cart = query.filter(Cart.session_id == session_id).first()
        
        # Créer un nouveau panier si nécessaire
        if not cart:
            cart = Cart(
                user_id=user_id,
                session_id=session_id,
                currency="MGA",
                total_amount=Decimal("0.00"),
                total_items=0,
                discount_amount=Decimal("0.00"),
                expires_at=datetime.utcnow() + timedelta(days=30)  # Expire après 30 jours
            )
            db.add(cart)
            db.commit()
            db.refresh(cart)
        
        return cart
    
    @staticmethod
    async def get_cart(
        db: Session,
        user_id: Optional[UUID] = None,
        session_id: Optional[str] = None
    ) -> Optional[Cart]:
        """
        Récupère le panier sans le créer.
        Retourne None si aucun panier n'existe.
        """
        if not user_id and not session_id:
            return None
        
        query = db.query(Cart)
        if user_id:
            return query.filter(Cart.user_id == user_id).first()
        else:
            return query.filter(Cart.session_id == session_id).first()
    
    @staticmethod
    async def add_item(
        db: Session,
        cart_id: UUID,
        item_data: CartItemCreate
    ) -> CartItem:
        """
        Ajoute un item au panier ou met à jour la quantité si déjà présent.
        Valide que le produit existe et a du stock disponible.
        """
        # Vérifier que le panier existe
        cart = db.query(Cart).filter(Cart.id == cart_id).first()
        if not cart:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Panier non trouvé"
            )
        
        # Vérifier que le produit existe
        product = db.query(Product).filter(Product.id == item_data.product_id).first()
        if not product:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Produit non trouvé"
            )
        
        # Vérifier le stock si inventory tracking est activé
        if product.track_inventory:
            available_stock = product.stock_quantity
            if item_data.quantity > available_stock and not product.allow_backorders:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Stock insuffisant. Disponible: {available_stock}"
                )
        
        # Déterminer le prix (variant ou product)
        unit_price = product.price
        if item_data.variant_id:
            variant = db.query(ProductVariant).filter(
                ProductVariant.id == item_data.variant_id
            ).first()
            if variant:
                unit_price = variant.price
        
        # Vérifier si l'item existe déjà dans le panier
        existing_item = db.query(CartItem).filter(
            and_(
                CartItem.cart_id == cart_id,
                CartItem.product_id == item_data.product_id,
                CartItem.variant_id == item_data.variant_id
            )
        ).first()
        
        if existing_item:
            # Mettre à jour la quantité
            new_quantity = existing_item.quantity + item_data.quantity
            
            # Vérifier à nouveau le stock
            if product.track_inventory and new_quantity > product.stock_quantity:
                if not product.allow_backorders:
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail=f"Stock insuffisant. Disponible: {product.stock_quantity}"
                    )
            
            existing_item.quantity = new_quantity
            existing_item.total_price = unit_price * new_quantity
            if item_data.customization_notes:
                existing_item.customization_notes = item_data.customization_notes
            
            cart_item = existing_item
        else:
            # Créer un nouvel item
            cart_item = CartItem(
                cart_id=cart_id,
                product_id=item_data.product_id,
                variant_id=item_data.variant_id,
                quantity=item_data.quantity,
                unit_price=unit_price,
                total_price=unit_price * item_data.quantity,
                customization_notes=item_data.customization_notes
            )
            db.add(cart_item)
        
        db.commit()
        db.refresh(cart_item)
        
        # Mettre à jour les totaux du panier
        await CartService._update_cart_totals(db, cart)
        
        return cart_item
    
    @staticmethod
    async def update_item(
        db: Session,
        cart_item_id: UUID,
        update_data: CartItemUpdate
    ) -> CartItem:
        """
        Met à jour un item du panier (quantité ou notes de personnalisation).
        Si quantité = 0, supprime l'item.
        """
        cart_item = db.query(CartItem).filter(CartItem.id == cart_item_id).first()
        if not cart_item:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Item du panier non trouvé"
            )
        
        # Si quantité = 0, supprimer l'item
        if update_data.quantity == 0:
            return await CartService.remove_item(db, cart_item_id)
        
        # Vérifier le stock
        product = db.query(Product).filter(Product.id == cart_item.product_id).first()
        if product and product.track_inventory:
            if update_data.quantity > product.stock_quantity and not product.allow_backorders:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Stock insuffisant. Disponible: {product.stock_quantity}"
                )
        
        # Mettre à jour
        cart_item.quantity = update_data.quantity
        cart_item.total_price = cart_item.unit_price * update_data.quantity
        if update_data.customization_notes is not None:
            cart_item.customization_notes = update_data.customization_notes
        
        db.commit()
        db.refresh(cart_item)
        
        # Mettre à jour les totaux du panier
        cart = db.query(Cart).filter(Cart.id == cart_item.cart_id).first()
        if cart:
            await CartService._update_cart_totals(db, cart)
        
        return cart_item
    
    @staticmethod
    async def remove_item(db: Session, cart_item_id: UUID) -> bool:
        """
        Supprime un item du panier.
        """
        cart_item = db.query(CartItem).filter(CartItem.id == cart_item_id).first()
        if not cart_item:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Item du panier non trouvé"
            )
        
        cart_id = cart_item.cart_id
        db.delete(cart_item)
        db.commit()
        
        # Mettre à jour les totaux du panier
        cart = db.query(Cart).filter(Cart.id == cart_id).first()
        if cart:
            await CartService._update_cart_totals(db, cart)
        
        return True
    
    @staticmethod
    async def clear_cart(db: Session, cart_id: UUID) -> int:
        """
        Vide complètement le panier.
        Retourne le nombre d'items supprimés.
        """
        cart = db.query(Cart).filter(Cart.id == cart_id).first()
        if not cart:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Panier non trouvé"
            )
        
        # Compter les items avant suppression
        items_count = db.query(CartItem).filter(CartItem.cart_id == cart_id).count()
        
        # Supprimer tous les items
        db.query(CartItem).filter(CartItem.cart_id == cart_id).delete()
        
        # Réinitialiser les totaux
        cart.total_amount = Decimal("0.00")
        cart.total_items = 0
        cart.discount_amount = Decimal("0.00")
        cart.applied_coupon_code = None
        
        db.commit()
        
        return items_count
    
    @staticmethod
    async def _update_cart_totals(db: Session, cart: Cart) -> None:
        """
        Recalcule et met à jour les totaux du panier.
        Méthode interne.
        """
        totals = CartService._calculate_cart_totals(cart, db)
        
        cart.total_amount = totals["total_amount"]
        cart.total_items = totals["total_items"]
        
        db.commit()
    
    @staticmethod
    async def apply_coupon(
        db: Session,
        cart_id: UUID,
        coupon_code: str
    ) -> Cart:
        """
        Applique un code promo au panier.
        TODO: Implémenter la validation du coupon et le calcul de la réduction.
        Pour l'instant, retourne le panier sans modification.
        """
        cart = db.query(Cart).filter(Cart.id == cart_id).first()
        if not cart:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Panier non trouvé"
            )
        
        # TODO: Vérifier la validité du coupon
        # TODO: Calculer la réduction
        # Pour l'instant, on stocke juste le code
        cart.applied_coupon_code = coupon_code
        
        db.commit()
        db.refresh(cart)
        
        return cart
    
    @staticmethod
    async def merge_carts(
        db: Session,
        user_id: UUID,
        session_id: str
    ) -> Cart:
        """
        Fusionne le panier invité (session) avec le panier utilisateur lors de la connexion.
        """
        # Récupérer les deux paniers
        user_cart = await CartService.get_cart(db, user_id=user_id)
        session_cart = await CartService.get_cart(db, session_id=session_id)
        
        if not session_cart:
            # Pas de panier session, retourner le panier user ou en créer un
            if not user_cart:
                user_cart = await CartService.get_or_create_cart(db, user_id=user_id)
            return user_cart
        
        if not user_cart:
            # Pas de panier user, transférer le panier session
            session_cart.user_id = user_id
            session_cart.session_id = None
            db.commit()
            return session_cart
        
        # Fusionner les items du panier session dans le panier user
        session_items = db.query(CartItem).filter(CartItem.cart_id == session_cart.id).all()
        
        for session_item in session_items:
            # Vérifier si l'item existe déjà dans le panier user
            existing_item = db.query(CartItem).filter(
                and_(
                    CartItem.cart_id == user_cart.id,
                    CartItem.product_id == session_item.product_id,
                    CartItem.variant_id == session_item.variant_id
                )
            ).first()
            
            if existing_item:
                # Additionner les quantités
                existing_item.quantity += session_item.quantity
                existing_item.total_price = existing_item.unit_price * existing_item.quantity
            else:
                # Transférer l'item
                session_item.cart_id = user_cart.id
        
        # Supprimer le panier session
        db.delete(session_cart)
        db.commit()
        
        # Recalculer les totaux
        await CartService._update_cart_totals(db, user_cart)
        
        return user_cart
