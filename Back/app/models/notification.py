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
    data = Column(JSON)
    is_read = Column(Boolean, default=False, index=True)
    read_at = Column(DateTime)
    action_url = Column(String(500))
    priority = Column(String(20), default='normal', index=True)
    expires_at = Column(DateTime, index=True)
    
    # Relationships - ALL COMMENTED OUT to avoid circular dependency issues
    # user = relationship("User", back_populates="notifications")


class NotificationPreference(BaseModel):
    __tablename__ = "notification_preferences"
    
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), unique=True, nullable=False, index=True)
    email_enabled = Column(Boolean, default=True)
    push_enabled = Column(Boolean, default=True)
    sms_enabled = Column(Boolean, default=False)
    preferences = Column(JSON)
    
    # Relationships - ALL COMMENTED OUT
    # user = relationship("User")
