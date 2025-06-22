from sqlalchemy import Column, String, Boolean, DateTime, Text, ARRAY, Integer, JSON, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.models.base import BaseModel


class Review(BaseModel):
    __tablename__ = "reviews"
    
    reviewer_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False, index=True)
    reviewable_type = Column(String(20), nullable=False, index=True)
    reviewable_id = Column(UUID(as_uuid=True), nullable=False, index=True)
    order_id = Column(UUID(as_uuid=True), ForeignKey("orders.id"), index=True)
    booking_id = Column(UUID(as_uuid=True), ForeignKey("workshop_bookings.id"), index=True)
    rating = Column(Integer, nullable=False, index=True)
    title = Column(String(200))
    comment = Column(Text)
    criteria_ratings = Column(JSON)
    images = Column(ARRAY(Text))
    videos = Column(ARRAY(Text))
    status = Column(String(20), default='published', index=True)
    moderation_notes = Column(Text)
    moderated_by_user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), index=True)
    moderated_at = Column(DateTime)
    is_verified_purchase = Column(Boolean, default=False)
    helpful_count = Column(Integer, default=0)
    flagged_count = Column(Integer, default=0)
    
    # Relationships
    reviewer = relationship("User", back_populates="reviews")
    order = relationship("Order", back_populates="reviews")
    booking = relationship("WorkshopBooking", back_populates="reviews")
    moderated_by = relationship("User")
    helpful_votes = relationship("ReviewHelpfulVote", back_populates="review")
    flags = relationship("ReviewFlag", back_populates="review")
    
    # Polymorphic relationships
    @property
    def product(self):
        if self.reviewable_type == 'product':
            return self.reviewable
        return None
    
    @property
    def workshop(self):
        if self.reviewable_type == 'workshop':
            return self.reviewable
        return None


class ReviewHelpfulVote(BaseModel):
    __tablename__ = "review_helpful_votes"
    
    review_id = Column(UUID(as_uuid=True), ForeignKey("reviews.id"), nullable=False, index=True)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False, index=True)
    is_helpful = Column(Boolean, nullable=False)
    
    # Relationships
    review = relationship("Review", back_populates="helpful_votes")
    user = relationship("User")


class ReviewFlag(BaseModel):
    __tablename__ = "review_flags"
    
    review_id = Column(UUID(as_uuid=True), ForeignKey("reviews.id"), nullable=False, index=True)
    reporter_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False, index=True)
    reason = Column(String(50), nullable=False)
    description = Column(Text)
    status = Column(String(20), default='pending', index=True)
    reviewed_by_user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), index=True)
    reviewed_at = Column(DateTime)
    
    # Relationships
    review = relationship("Review", back_populates="flags")
    reporter = relationship("User", foreign_keys=[reporter_id])
    reviewed_by = relationship("User", foreign_keys=[reviewed_by_user_id]) 