from sqlalchemy import Column, String, Boolean, DateTime, Text, JSON, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.models.base import BaseModel


class Notification(BaseModel):
    __tablename__ = "notifications"
    
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False, index=True)
    type = Column(String(50), nullable=False, index=True)
    title = Column(String(200), nullable=False)
    message = Column(Text, nullable=False)
    action_url = Column(String(500))
    action_data = Column(JSON)
    is_read = Column(Boolean, default=False, index=True)
    is_pushed = Column(Boolean, default=False)
    is_emailed = Column(Boolean, default=False)
    related_object_type = Column(String(20))
    related_object_id = Column(UUID(as_uuid=True))
    read_at = Column(DateTime)
    expires_at = Column(DateTime, index=True)
    
    # Relationships
    user = relationship("User", back_populates="notifications")


class NotificationPreference(BaseModel):
    __tablename__ = "notification_preferences"
    
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), unique=True, nullable=False, index=True)
    email_orders = Column(Boolean, default=True)
    email_messages = Column(Boolean, default=True)
    email_workshops = Column(Boolean, default=True)
    email_marketing = Column(Boolean, default=False)
    push_orders = Column(Boolean, default=True)
    push_messages = Column(Boolean, default=True)
    push_workshops = Column(Boolean, default=True)
    push_marketing = Column(Boolean, default=False)
    sms_orders = Column(Boolean, default=False)
    sms_workshops = Column(Boolean, default=False)
    
    # Relationships
    user = relationship("User", back_populates="notification_preferences") 