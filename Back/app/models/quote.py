"""Quote model for custom quotes management"""
from sqlalchemy import Column, String, Numeric, ForeignKey, DateTime
from sqlalchemy import Integer, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import uuid
from app.models.base import BaseModel, GUID


class Quote(BaseModel):
    """
    Quote records for custom product/workshop quotes.
    Allows users to request custom quotes for artisans.
    Admin can manage quotes and convert to orders.
    """
    __tablename__ = "quotes"

    id = Column(GUID, primary_key=True, default=uuid.uuid4, index=True)

    # Users involved
    user_id = Column(
        GUID,
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )
    artisan_id = Column(
        GUID,
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
        index=True
    )

    # Quote details
    quote_type = Column(String(50), nullable=False)  # workshop/product/custom
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=False)
    quantity = Column(Integer, nullable=False, default=1)

    # Client information
    client_type = Column(String(50), nullable=False)  # particulier/entreprise
    client_name = Column(String(255), nullable=False)
    client_email = Column(String(255), nullable=False)
    client_phone = Column(String(20), nullable=False)
    company_name = Column(String(255), nullable=True)

    # Quote status and pricing
    status = Column(String(50), nullable=False, default="pending", index=True)
    # pending/quoted/approved/rejected/completed
    estimated_price = Column(Numeric(10, 2), nullable=True)
    final_price = Column(Numeric(10, 2), nullable=True)
    admin_notes = Column(Text, nullable=True)

    # Timeline
    requested_at = Column(
        DateTime,
        server_default=func.now(),
        nullable=False,
        index=True
    )
    quoted_at = Column(DateTime, nullable=True)
    responded_at = Column(DateTime, nullable=True)
    completed_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, server_default=func.now(), nullable=False)
    updated_at = Column(
        DateTime,
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False
    )

    # Relationships
    user = relationship(
        "User",
        foreign_keys=[user_id],
        backref="quotes_as_requester"
    )
    artisan = relationship(
        "User",
        foreign_keys=[artisan_id],
        backref="quotes_as_provider"
    )

    def __repr__(self):
        return f"<Quote {self.id} - {self.status} - {self.title}>"

