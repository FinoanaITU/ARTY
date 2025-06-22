from sqlalchemy import Column, String, Boolean, DateTime, Text, ARRAY, Integer, Numeric, JSON, ForeignKey, Date
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.models.base import BaseModel


class Category(BaseModel):
    __tablename__ = "categories"
    
    name = Column(String(100), nullable=False)
    slug = Column(String(100), unique=True, nullable=False, index=True)
    description = Column(Text)
    parent_id = Column(UUID(as_uuid=True), ForeignKey("categories.id"), index=True)
    image_url = Column(String(500))
    icon = Column(String(50))
    sort_order = Column(Integer, default=0)
    is_active = Column(Boolean, default=True, index=True)
    meta_title = Column(String(160))
    meta_description = Column(String(320))
    level = Column(Integer, default=0)
    path = Column(String(255), index=True)
    
    # Relationships
    parent = relationship("Category", remote_side=[id])
    children = relationship("Category")
    products = relationship("Product", back_populates="category")


class Product(BaseModel):
    __tablename__ = "products"
    
    title = Column(String(200), nullable=False)
    slug = Column(String(200), unique=True, nullable=False, index=True)
    description = Column(Text, nullable=False)
    short_description = Column(String(500))
    price = Column(Numeric(10, 2), nullable=False)
    compare_at_price = Column(Numeric(10, 2))
    cost_price = Column(Numeric(10, 2))
    category_id = Column(UUID(as_uuid=True), ForeignKey("categories.id"), nullable=False, index=True)
    artisan_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False, index=True)
    stock_quantity = Column(Integer, default=0)
    track_inventory = Column(Boolean, default=True)
    allow_backorders = Column(Boolean, default=False)
    low_stock_threshold = Column(Integer, default=5)
    weight_grams = Column(Integer)
    dimensions = Column(JSON)
    materials = Column(ARRAY(Text))
    colors = Column(ARRAY(Text))
    techniques = Column(ARRAY(Text))
    origin_region = Column(String(100))
    status = Column(String(20), default='draft', index=True)
    visibility = Column(String(20), default='public')
    featured = Column(Boolean, default=False, index=True)
    handmade = Column(Boolean, default=True)
    customizable = Column(Boolean, default=False)
    made_to_order = Column(Boolean, default=False)
    production_time_days = Column(Integer)
    meta_title = Column(String(160))
    meta_description = Column(String(320))
    tags = Column(ARRAY(Text), index=True)
    view_count = Column(Integer, default=0)
    favorite_count = Column(Integer, default=0)
    sales_count = Column(Integer, default=0)
    rating_average = Column(Numeric(3, 2), default=0)
    rating_count = Column(Integer, default=0)
    published_at = Column(DateTime)
    
    # Relationships
    category = relationship("Category", back_populates="products")
    artisan = relationship("User", back_populates="products")
    images = relationship("ProductImage", back_populates="product")
    variants = relationship("ProductVariant", back_populates="product")
    favorites = relationship("ProductFavorite", back_populates="product")
    cart_items = relationship("CartItem", back_populates="product")
    order_items = relationship("OrderItem", back_populates="product")
    reviews = relationship("Review", back_populates="product")


class ProductImage(BaseModel):
    __tablename__ = "product_images"
    
    product_id = Column(UUID(as_uuid=True), ForeignKey("products.id"), nullable=False, index=True)
    image_url = Column(String(500), nullable=False)
    alt_text = Column(String(200))
    sort_order = Column(Integer, default=0, index=True)
    is_primary = Column(Boolean, default=False, index=True)
    width = Column(Integer)
    height = Column(Integer)
    file_size = Column(Integer)
    format = Column(String(10))
    
    # Relationships
    product = relationship("Product", back_populates="images")


class ProductVariant(BaseModel):
    __tablename__ = "product_variants"
    
    product_id = Column(UUID(as_uuid=True), ForeignKey("products.id"), nullable=False, index=True)
    sku = Column(String(50), unique=True, index=True)
    title = Column(String(100), nullable=False)
    price = Column(Numeric(10, 2))
    compare_at_price = Column(Numeric(10, 2))
    cost_price = Column(Numeric(10, 2))
    stock_quantity = Column(Integer, default=0)
    weight_grams = Column(Integer)
    variant_attributes = Column(JSON)
    image_url = Column(String(500))
    is_active = Column(Boolean, default=True, index=True)
    
    # Relationships
    product = relationship("Product", back_populates="variants")
    cart_items = relationship("CartItem", back_populates="variant")
    order_items = relationship("OrderItem", back_populates="variant")


class ProductFavorite(BaseModel):
    __tablename__ = "product_favorites"
    
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False, index=True)
    product_id = Column(UUID(as_uuid=True), ForeignKey("products.id"), nullable=False, index=True)
    
    # Relationships
    user = relationship("User")
    product = relationship("Product", back_populates="favorites") 