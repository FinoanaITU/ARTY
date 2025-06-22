from sqlalchemy import Column, String, Boolean, DateTime, Text, Integer, Numeric, JSON, ForeignKey, Date, Inet
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.models.base import BaseModel


class AnalyticsEvent(BaseModel):
    __tablename__ = "analytics_events"
    
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), index=True)
    session_id = Column(String(100), index=True)
    event_type = Column(String(50), nullable=False, index=True)
    event_category = Column(String(30))
    event_action = Column(String(50))
    event_label = Column(String(100))
    event_value = Column(Numeric(10, 2))
    properties = Column(JSON)
    page_url = Column(String(500))
    referrer_url = Column(String(500))
    user_agent = Column(Text)
    ip_address = Column(Inet, index=True)
    device_type = Column(String(20))
    browser = Column(String(50))
    os = Column(String(50))
    country = Column(String(3))
    region = Column(String(100))
    city = Column(String(100))
    
    # Relationships
    user = relationship("User")


class DailyStats(BaseModel):
    __tablename__ = "daily_stats"
    
    date = Column(Date, nullable=False, unique=True, index=True)
    new_users_count = Column(Integer, default=0)
    active_users_count = Column(Integer, default=0)
    new_artisans_count = Column(Integer, default=0)
    new_products_count = Column(Integer, default=0)
    product_views_count = Column(Integer, default=0)
    products_added_to_cart = Column(Integer, default=0)
    orders_count = Column(Integer, default=0)
    orders_value = Column(Numeric(12, 2), default=0)
    average_order_value = Column(Numeric(10, 2), default=0)
    conversion_rate = Column(Numeric(5, 4), default=0)
    workshop_bookings_count = Column(Integer, default=0)
    workshop_revenue = Column(Numeric(12, 2), default=0)
    workshops_completed = Column(Integer, default=0)
    page_views_count = Column(Integer, default=0)
    unique_visitors_count = Column(Integer, default=0)
    bounce_rate = Column(Numeric(5, 4), default=0)


class ArtisanStats(BaseModel):
    __tablename__ = "artisan_stats"
    
    artisan_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False, index=True)
    date = Column(Date, nullable=False, index=True)
    products_sold = Column(Integer, default=0)
    products_revenue = Column(Numeric(10, 2), default=0)
    products_commission = Column(Numeric(10, 2), default=0)
    workshops_conducted = Column(Integer, default=0)
    workshop_revenue = Column(Numeric(10, 2), default=0)
    workshop_participants = Column(Integer, default=0)
    profile_views = Column(Integer, default=0)
    messages_received = Column(Integer, default=0)
    new_followers = Column(Integer, default=0)
    average_rating = Column(Numeric(3, 2), default=0)
    response_time_hours = Column(Numeric(5, 2), default=0)
    order_fulfillment_rate = Column(Numeric(5, 4), default=0)
    
    # Relationships
    artisan = relationship("User") 