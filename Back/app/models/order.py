from sqlalchemy import Column, String, Boolean, DateTime, Text, Integer, Numeric, JSON, ForeignKey, Date, Inet
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.models.base import BaseModel


class Cart(BaseModel):
    __tablename__ = "carts"
    
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), unique=True, index=True)
    session_id = Column(String(100), index=True)
    currency = Column(String(3), default='MGA')
    total_amount = Column(Numeric(10, 2), default=0)
    total_items = Column(Integer, default=0)
    applied_coupon_code = Column(String(50))
    discount_amount = Column(Numeric(10, 2), default=0)
    expires_at = Column(DateTime, index=True)
    
    # Relationships
    user = relationship("User")
    items = relationship("CartItem", back_populates="cart")


class CartItem(BaseModel):
    __tablename__ = "cart_items"
    
    cart_id = Column(UUID(as_uuid=True), ForeignKey("carts.id"), nullable=False, index=True)
    product_id = Column(UUID(as_uuid=True), ForeignKey("products.id"), nullable=False, index=True)
    variant_id = Column(UUID(as_uuid=True), ForeignKey("product_variants.id"), index=True)
    quantity = Column(Integer, nullable=False, default=1)
    unit_price = Column(Numeric(10, 2), nullable=False)
    total_price = Column(Numeric(10, 2), nullable=False)
    customization_notes = Column(Text)
    
    # Relationships
    cart = relationship("Cart", back_populates="items")
    product = relationship("Product", back_populates="cart_items")
    variant = relationship("ProductVariant", back_populates="cart_items")


class Order(BaseModel):
    __tablename__ = "orders"
    
    order_number = Column(String(20), unique=True, nullable=False, index=True)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False, index=True)
    status = Column(String(20), default='pending', index=True)
    payment_status = Column(String(20), default='pending', index=True)
    fulfillment_status = Column(String(20), default='unfulfilled')
    currency = Column(String(3), default='MGA')
    subtotal = Column(Numeric(10, 2), nullable=False)
    discount_amount = Column(Numeric(10, 2), default=0)
    shipping_amount = Column(Numeric(10, 2), default=0)
    tax_amount = Column(Numeric(10, 2), default=0)
    total_amount = Column(Numeric(10, 2), nullable=False)
    shipping_address = Column(JSON, nullable=False)
    billing_address = Column(JSON)
    shipping_method = Column(String(50))
    tracking_number = Column(String(100))
    estimated_delivery_date = Column(Date)
    delivered_at = Column(DateTime)
    coupon_code = Column(String(50))
    discount_type = Column(String(20))
    discount_value = Column(Numeric(10, 2))
    customer_notes = Column(Text)
    admin_notes = Column(Text)
    device_info = Column(JSON)
    ip_address = Column(Inet)
    user_agent = Column(Text)
    
    # Relationships
    user = relationship("User", back_populates="orders")
    items = relationship("OrderItem", back_populates="order")
    payments = relationship("Payment", back_populates="order")
    status_history = relationship("OrderStatusHistory", back_populates="order")
    reviews = relationship("Review", back_populates="order")


class OrderItem(BaseModel):
    __tablename__ = "order_items"
    
    order_id = Column(UUID(as_uuid=True), ForeignKey("orders.id"), nullable=False, index=True)
    product_id = Column(UUID(as_uuid=True), ForeignKey("products.id"), nullable=False, index=True)
    variant_id = Column(UUID(as_uuid=True), ForeignKey("product_variants.id"), index=True)
    artisan_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False, index=True)
    title = Column(String(200), nullable=False)
    sku = Column(String(50))
    quantity = Column(Integer, nullable=False)
    unit_price = Column(Numeric(10, 2), nullable=False)
    total_price = Column(Numeric(10, 2), nullable=False)
    commission_rate = Column(Numeric(5, 4), default=0.1)
    commission_amount = Column(Numeric(10, 2), default=0)
    artisan_payout = Column(Numeric(10, 2), default=0)
    product_snapshot = Column(JSON)
    customization_notes = Column(Text)
    
    # Relationships
    order = relationship("Order", back_populates="items")
    product = relationship("Product", back_populates="order_items")
    variant = relationship("ProductVariant", back_populates="order_items")
    artisan = relationship("User")


class Payment(BaseModel):
    __tablename__ = "payments"
    
    order_id = Column(UUID(as_uuid=True), ForeignKey("orders.id"), nullable=False, index=True)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False, index=True)
    payment_method = Column(String(30), nullable=False, index=True)
    payment_provider = Column(String(20), nullable=False)
    provider_payment_id = Column(String(100), index=True)
    provider_transaction_id = Column(String(100))
    amount = Column(Numeric(10, 2), nullable=False)
    currency = Column(String(3), default='MGA')
    status = Column(String(20), default='pending', index=True)
    provider_response = Column(JSON)
    failure_reason = Column(Text)
    gateway_fees = Column(Numeric(10, 2), default=0)
    processed_at = Column(DateTime)
    failed_at = Column(DateTime)
    refunded_at = Column(DateTime)
    
    # Relationships
    order = relationship("Order", back_populates="payments")
    user = relationship("User")


class OrderStatusHistory(BaseModel):
    __tablename__ = "order_status_history"
    
    order_id = Column(UUID(as_uuid=True), ForeignKey("orders.id"), nullable=False, index=True)
    status = Column(String(20), nullable=False)
    comment = Column(Text)
    notified_customer = Column(Boolean, default=False)
    changed_by_user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), index=True)
    
    # Relationships
    order = relationship("Order", back_populates="status_history")
    changed_by = relationship("User") 