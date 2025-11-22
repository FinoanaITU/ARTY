"""
Schemas Pydantic pour les produits artisanaux
"""
from pydantic import BaseModel, Field, EmailStr
from typing import Optional, List
from uuid import UUID
from datetime import datetime
from decimal import Decimal


# ============ INPUT SCHEMAS ============

class ProductDimensions(BaseModel):
    """Dimensions d'un produit"""
    length: Optional[float] = None  # en cm
    width: Optional[float] = None  # en cm
    height: Optional[float] = None  # en cm
    weight: Optional[float] = None  # en kg


class ProductCreate(BaseModel):
    """Schema pour la création d'un produit"""
    name: str = Field(..., min_length=1, max_length=200, description="Nom du produit")
    description: str = Field(..., min_length=0, description="Description détaillée")
    category: str = Field(..., description="Catégorie du produit")
    subcategory: Optional[str] = Field(None, description="Sous-catégorie (optionnel)")
    price: float = Field(..., gt=0, description="Prix en Ariary")
    materials: List[str] = Field(default_factory=list, description="Liste des matériaux")
    available_colors: List[str] = Field(default_factory=list, description="Couleurs disponibles")
    dimensions: Optional[ProductDimensions] = None
    stock: int = Field(default=0, ge=0, description="Quantité en stock")
    customizable: bool = Field(default=False, description="Produit personnalisable")
    production_time_days: int = Field(..., ge=1, description="Temps de fabrication en jours")
    bulk_order_enabled: bool = Field(default=False, description="Autorise les commandes en gros")
    min_bulk_quantity: Optional[int] = Field(None, ge=1, description="Quantité minimum pour commande en gros")


class ProductUpdate(BaseModel):
    """Schema pour la mise à jour d'un produit"""
    name: Optional[str] = Field(None, min_length=1, max_length=200)
    description: Optional[str] = Field(None, min_length=10)
    category: Optional[str] = None
    subcategory: Optional[str] = None
    price: Optional[Decimal] = Field(None, gt=0)
    materials: Optional[List[str]] = None
    available_colors: Optional[List[str]] = None
    dimensions: Optional[ProductDimensions] = None
    stock: Optional[int] = Field(None, ge=0)
    customizable: Optional[bool] = None
    production_time_days: Optional[int] = Field(None, ge=1)
    bulk_order_enabled: Optional[bool] = None
    min_bulk_quantity: Optional[int] = Field(None, ge=1)
    status: Optional[str] = Field(None, description="draft, pending_approval, published, rejected")


class BulkOrderRequestIn(BaseModel):
    """Schema pour une demande de commande en gros"""
    quantity: int = Field(..., ge=1, description="Quantité demandée")
    customer_name: str = Field(..., min_length=2)
    customer_email: EmailStr = Field(..., description="Email du client")
    customer_phone: str = Field(..., description="Téléphone du client")
    company: Optional[str] = None
    message: Optional[str] = None


# ============ OUTPUT SCHEMAS ============

class ArtisanBasic(BaseModel):
    """Schema basique pour un artisan (utilisé dans ProductOut)"""
    id: UUID
    name: str
    
    class Config:
        from_attributes = True


class ProductOut(BaseModel):
    """Schema de sortie pour un produit"""
    id: UUID
    name: str
    description: str
    category: str
    subcategory: Optional[str] = None
    price: float
    images: List[str] = Field(default_factory=list, description="URLs des images")
    artisan: ArtisanBasic
    materials: List[str] = Field(default_factory=list)
    available_colors: List[str] = Field(default_factory=list)
    dimensions: Optional[ProductDimensions] = None
    stock: int
    customizable: bool
    production_time_days: int
    bulk_order_enabled: bool
    min_bulk_quantity: Optional[int] = None
    status: str  # draft, pending_approval, published, rejected
    rating: Optional[float] = Field(None, ge=0, le=5, description="Note moyenne")
    review_count: int = Field(default=0, ge=0)
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


class ProductListItem(BaseModel):
    """Schema pour un produit dans une liste (version allégée)"""
    id: UUID
    name: str
    price: float
    images: List[str] = Field(default_factory=list)
    artisan: ArtisanBasic
    stock: int
    status: str
    rating: Optional[float] = None
    review_count: int = Field(default=0)
    created_at: datetime
    
    class Config:
        from_attributes = True


class ProductListResponse(BaseModel):
    """Schema de réponse pour la liste paginée de produits"""
    items: List[ProductListItem]
    total: int
    page: int
    pages: int
    limit: int


class CategoryOut(BaseModel):
    """Schema pour une catégorie"""
    name: str
    subcategories: List[str] = Field(default_factory=list)
    
    class Config:
        from_attributes = True


class CategoriesResponse(BaseModel):
    """Schema de réponse pour les catégories"""
    categories: List[CategoryOut]


class BulkOrderRequestOut(BaseModel):
    """Schema de sortie pour une demande de commande en gros"""
    id: UUID
    product_id: UUID
    quantity: int
    unit_price: float
    discount_percentage: float
    discount_amount: float
    total_amount: float
    customer_name: str
    customer_email: str
    customer_phone: str
    company: Optional[str] = None
    message: Optional[str] = None
    status: str
    artisan_notes: Optional[str] = None
    contacted_at: Optional[datetime] = None
    confirmed_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True
