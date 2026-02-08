"""Payment tracking models for admin panel"""
from sqlalchemy import Column, String, Numeric, ForeignKey, DateTime, Date, Text, CheckConstraint
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import uuid
from app.models.base import BaseModel, GUID


class PaymentTracking(BaseModel):
    """
    Payment tracking records for orders and workshop bookings.
    Tracks payment status and associates with either an order or a booking.
    Used for admin monitoring and artisan commission calculations.
    """
    __tablename__ = "payment_tracking"

    id = Column(GUID, primary_key=True, default=uuid.uuid4, index=True)
    order_id = Column(GUID, ForeignKey("orders.id", ondelete="CASCADE"), nullable=True, index=True)
    booking_id = Column(GUID, ForeignKey("workshop_bookings.id", ondelete="CASCADE"), nullable=True, index=True)
    user_id = Column(GUID, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    artisan_id = Column(GUID, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    
    # Payment details
    type = Column(String(20), nullable=False)  # product/workshop
    amount_total = Column(Numeric(10, 2), nullable=False)
    amount_paid = Column(Numeric(10, 2), nullable=False, default=0)
    payment_status = Column(String(50), nullable=False, default="unpaid", index=True)
    # unpaid/partial/paid/pending_collection
    payment_method = Column(String(50), nullable=True)  # cash/mvola/orange_money/bank_transfer
    artisan_type = Column(String(20), nullable=False, index=True)  # artizaho/uber
    
    # Timestamps
    created_at = Column(DateTime, server_default=func.now(), nullable=False)
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now(), nullable=False)

    # Relationships
    order = relationship("Order", foreign_keys=[order_id], backref="payment_tracking_records")
    booking = relationship("WorkshopBooking", foreign_keys=[booking_id], backref="payment_tracking_records")
    user = relationship("User", foreign_keys=[user_id], backref="payment_trackings_as_customer")
    artisan = relationship("User", foreign_keys=[artisan_id], backref="payment_trackings_as_artisan")
    history = relationship("PaymentTrackingHistory", back_populates="payment", cascade="all, delete-orphan")

    __table_args__ = (
        CheckConstraint(
            '(order_id IS NOT NULL AND booking_id IS NULL) OR (order_id IS NULL AND booking_id IS NOT NULL)',
            name='check_payment_order_or_booking'
        ),
    )

    def __repr__(self):
        return f"<PaymentTracking {self.id} - {self.payment_status} - {self.amount_paid}/{self.amount_total}>"


class PaymentTrackingHistory(BaseModel):
    """
    History of payment transactions for admin tracking.
    Each entry represents a payment made towards a PaymentTracking record.
    """
    __tablename__ = "payment_tracking_history"

    id = Column(GUID, primary_key=True, default=uuid.uuid4, index=True)
    payment_id = Column(GUID, ForeignKey("payment_tracking.id", ondelete="CASCADE"), nullable=False, index=True)
    
    # Transaction details
    amount = Column(Numeric(10, 2), nullable=False)
    payment_method = Column(String(50), nullable=False)
    transaction_ref = Column(String(100), nullable=True)
    notes = Column(Text, nullable=True)
    
    # Tracking
    paid_at = Column(DateTime, server_default=func.now(), nullable=False, index=True)
    recorded_by = Column(GUID, ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True)
    created_at = Column(DateTime, server_default=func.now(), nullable=False)

    # Relationships
    payment = relationship("PaymentTracking", back_populates="history")
    recorder = relationship("User", foreign_keys=[recorded_by], backref="recorded_payment_trackings")

    def __repr__(self):
        return f"<PaymentTrackingHistory {self.id} - {self.amount} via {self.payment_method}>"


class ArtisanPayout(BaseModel):
    """
    Payout records for artisans.
    Represents commission calculations and payment tracking for artisan earnings.
    """
    __tablename__ = "artisan_payouts"

    id = Column(GUID, primary_key=True, default=uuid.uuid4, index=True)
    artisan_id = Column(GUID, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    
    # Period
    period_start = Column(Date, nullable=False, index=True)
    period_end = Column(Date, nullable=False, index=True)
    
    # Financial calculations
    total_sales = Column(Numeric(10, 2), nullable=False)
    commission_rate = Column(Numeric(5, 2), nullable=False)  # e.g., 15.00 or 20.00
    commission_amount = Column(Numeric(10, 2), nullable=False)
    net_payout = Column(Numeric(10, 2), nullable=False)  # total_sales - commission_amount
    
    # Status tracking
    status = Column(String(20), nullable=False, default="pending", index=True)
    # pending/processing/paid
    payment_method = Column(String(50), nullable=True)
    payment_ref = Column(String(100), nullable=True)
    paid_at = Column(DateTime, nullable=True, index=True)
    notes = Column(Text, nullable=True)
    
    # Timestamps
    created_at = Column(DateTime, server_default=func.now(), nullable=False)
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now(), nullable=False)

    # Relationships
    artisan = relationship("User", foreign_keys=[artisan_id], backref="payouts")

    def __repr__(self):
        return f"<ArtisanPayout {self.id} - {self.artisan_id} - {self.status} - {self.net_payout}>"
