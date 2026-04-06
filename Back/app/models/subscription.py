"""SQLAlchemy models for Subscription management"""
from sqlalchemy import Column, String, Boolean, DateTime, Text, Integer, Numeric, JSON, ForeignKey, Enum, Date
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from datetime import datetime, date
import enum
from app.models.base import BaseModel, GUID

class SubscriptionPlan(str, enum.Enum):
    """Available subscription plans"""
    BASIC = "basic"
    PLUS = "plus"
    PRO = "pro"
    ENTERPRISE = "enterprise"

class SubscriptionStatus(str, enum.Enum):
    """Subscription status"""
    ACTIVE = "active"
    PAUSED = "paused"
    CANCELLED = "cancelled"
    EXPIRED = "expired"
    PENDING = "pending"

class Subscription(BaseModel):
    """Subscription model for managing user subscriptions"""
    __tablename__ = "subscriptions"
    
    user_id = Column(GUID(), ForeignKey("users.id"), nullable=False, index=True)
    plan = Column(String(50), nullable=False, index=True)
    status = Column(String(20), default='active', index=True)
    monthly_price = Column(Numeric(10, 2), nullable=False)
    billing_cycle = Column(String(20), default='monthly')
    start_date = Column(Date, nullable=False, index=True)
    end_date = Column(Date, nullable=False, index=True)
    renewal_date = Column(Date, index=True)
    features = Column(JSON, nullable=False)
    available_credits = Column(Numeric(12, 2), default=0)
    used_credits = Column(Numeric(12, 2), default=0)
    total_spent = Column(Numeric(12, 2), default=0)
    auto_renew = Column(Boolean, default=True)
    cancellation_reason = Column(Text)
    cancelled_at = Column(DateTime)
    cancelled_by = Column(GUID(), ForeignKey("users.id"))
    admin_notes = Column(Text)
    payment_method = Column(String(50))
    payment_method_details = Column(JSON)
    last_payment_at = Column(DateTime)
    next_verification_date = Column(DateTime)
    bonus_credits_added = Column(Numeric(12, 2), default=0)
    times_renewed = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    

    user = relationship("User", foreign_keys=[user_id], backref="subscriptions")
    cancelled_by_admin = relationship("User", foreign_keys=[cancelled_by])
    
    def __repr__(self):
        return f"<Subscription(user_id={self.user_id}, plan={self.plan}, status={self.status})>"

class SubscriptionHistory(BaseModel):
    """Track subscription changes for audit purposes"""
    __tablename__ = "subscription_history"
    
    subscription_id = Column(GUID(), ForeignKey("subscriptions.id"), nullable=False, index=True)
    action_type = Column(String(50), nullable=False)
    action_by = Column(GUID(), ForeignKey("users.id"), nullable=False)
    old_values = Column(JSON)
    new_values = Column(JSON)
    notes = Column(Text)
    action_at = Column(DateTime, default=datetime.utcnow, index=True)
    

    subscription = relationship("Subscription")
    acted_by = relationship("User", foreign_keys=[action_by])
    
    def __repr__(self):
        return f"<SubscriptionHistory(subscription_id={self.subscription_id}, action={self.action_type})>"
