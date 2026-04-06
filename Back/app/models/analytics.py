from sqlalchemy import Column, String, Boolean, DateTime, Text, Integer, Numeric, JSON, ForeignKey, Date
from sqlalchemy.dialects.postgresql import INET
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.models.base import BaseModel, GUID


class AnalyticsEvent(BaseModel):
    __tablename__ = "analytics_events"
    
    user_id = Column(GUID(), ForeignKey("users.id"), index=True)
    session_id = Column(String(100), index=True)
    event_type = Column(String(50), nullable=False, index=True)
    event_category = Column(String(30))
    event_action = Column(String(50))
    event_label = Column(String(100))
    event_value = Column(Numeric(10, 2))
    properties = Column(JSON)
    page_url = Column(String(500))
    referrer_url = Column(String(500))
    ip_address = Column(INET, index=True)
    user_agent = Column(Text)
    device_type = Column(String(20))
    browser = Column(String(50))
    os = Column(String(50))
    country = Column(String(3))
    city = Column(String(100))
    
    # Relationships - ALL COMMENTED OUT to avoid circular dependency issues
    # user = relationship("User")


class DailyStats(BaseModel):
    __tablename__ = "daily_stats"
    
    date = Column(Date, unique=True, nullable=False, index=True)
    total_users = Column(Integer, default=0)
    active_users = Column(Integer, default=0)
    new_users = Column(Integer, default=0)
    total_orders = Column(Integer, default=0)
    total_revenue = Column(Numeric(10, 2), default=0)
    total_products = Column(Integer, default=0)
    total_workshops = Column(Integer, default=0)
    page_views = Column(Integer, default=0)
    unique_visitors = Column(Integer, default=0)
    conversion_rate = Column(Numeric(5, 4), default=0)
    average_order_value = Column(Numeric(10, 2), default=0)
    
    # No relationships


class ArtisanStats(BaseModel):
    __tablename__ = "artisan_stats"
    
    artisan_id = Column(GUID(), ForeignKey("users.id"), unique=True, nullable=False, index=True)
    total_products = Column(Integer, default=0)
    total_sales = Column(Integer, default=0)
    total_revenue = Column(Numeric(10, 2), default=0)
    total_workshops = Column(Integer, default=0)
    total_bookings = Column(Integer, default=0)
    average_rating = Column(Numeric(3, 2), default=0)
    total_reviews = Column(Integer, default=0)
    last_updated = Column(DateTime)
    
    # Relationships - ALL COMMENTED OUT
    # artisan = relationship("User")
