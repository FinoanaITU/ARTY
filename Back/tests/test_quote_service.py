"""
Tests for quote management functionality
"""
import asyncio
import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session
from uuid import uuid4, UUID
from datetime import datetime
from decimal import Decimal

from app.models.user import User, UserRole
from app.models.quote import Quote
from app.schemas.admin import QuoteRequestIn, QuoteUpdateIn, QuoteType, ClientType


@pytest.fixture
def regular_user(db: Session) -> User:
    """Create a regular user for testing"""
    user = User(
        email="regular@example.com",
        name="Regular User",
        password_hash="hashed_password",
        role=UserRole.BUYER,
        is_email_verified=True
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


class TestQuoteService:
    """Tests for quote service"""

    def test_create_quote_request(self, db: Session, regular_user: User):
        """Test creating a new quote request"""
        from app.services.quote_service import QuoteService

        quote_data = QuoteRequestIn(
            quote_type=QuoteType.CUSTOM,
            title="Custom Leather Bag",
            description="A beautiful handcrafted leather bag for my travel",
            quantity=2,
            client_type=ClientType.PARTICULIER,
            client_name="Jean Dupont",
            client_email="jean@example.com",
            client_phone="+261234567890",
            company_name=None
        )

        quote = asyncio.run(
            QuoteService.create_quote_request(
                db=db,
                user_id=regular_user.id,
                quote_data=quote_data
            )
        )

        assert quote is not None
        assert quote.user_id == regular_user.id
        assert quote.title == "Custom Leather Bag"
        assert quote.status == "pending"
        assert quote.quantity == 2
        assert quote.client_type == ClientType.PARTICULIER

    def test_create_quote_user_not_found(self, db: Session):
        """Test creating quote with non-existent user"""
        from app.services.quote_service import QuoteService
        from fastapi import HTTPException

        quote_data = QuoteRequestIn(
            quote_type=QuoteType.PRODUCT,
            title="Test Product",
            description="Test Description",
            quantity=1,
            client_type=ClientType.PARTICULIER,
            client_name="John Doe",
            client_email="john@example.com",
            client_phone="+261234567890"
        )

        with pytest.raises(HTTPException) as exc_info:
            asyncio.run(
                QuoteService.create_quote_request(
                    db=db,
                    user_id=uuid4(),
                    quote_data=quote_data
                )
            )

        assert exc_info.value.status_code == 404

    def test_get_all_quotes(self, db: Session, regular_user: User):
        """Test retrieving all quotes"""
        from app.services.quote_service import QuoteService

        # Create test quotes
        for i in range(3):
            quote = Quote(
                user_id=regular_user.id,
                quote_type=QuoteType.CUSTOM,
                title=f"Quote {i+1}",
                description=f"Description {i+1}",
                quantity=1,
                client_type=ClientType.PARTICULIER,
                client_name=f"Client {i+1}",
                client_email=f"client{i+1}@example.com",
                client_phone="+261234567890",
                status="pending"
            )
            db.add(quote)
        db.commit()

        result = asyncio.run(
            QuoteService.get_all_quotes(
                db=db,
                skip=0,
                limit=50
            )
        )

        assert result["total"] == 3
        assert len(result["items"]) == 3
        assert result["pending_count"] == 3

    def test_get_quotes_with_status_filter(
        self, db: Session, regular_user: User
    ):
        """Test retrieving quotes with status filter"""
        from app.services.quote_service import QuoteService

        # Create quotes with different statuses
        for status in ["pending", "pending", "quoted", "approved"]:
            quote = Quote(
                user_id=regular_user.id,
                quote_type=QuoteType.CUSTOM,
                title=f"Quote {status}",
                description="Description",
                quantity=1,
                client_type=ClientType.PARTICULIER,
                client_name="Client",
                client_email="client@example.com",
                client_phone="+261234567890",
                status=status,
                final_price=Decimal("100.00") if status != "pending" else None
            )
            db.add(quote)
        db.commit()

        result = asyncio.run(
            QuoteService.get_all_quotes(
                db=db,
                status="pending"
            )
        )

        assert result["total"] == 2
        assert all(q.status == "pending" for q in result["items"])

    def test_get_user_quotes(self, db: Session, regular_user: User):
        """Test retrieving quotes for a specific user"""
        from app.services.quote_service import QuoteService

        # Create quotes for different users
        other_user = User(
            email="other@example.com",
            name="Other User",
            role=UserRole.BUYER,
            password_hash="hashed",
            is_email_verified=True
        )
        db.add(other_user)
        db.commit()

        # Add quotes to first user
        for i in range(2):
            quote = Quote(
                user_id=regular_user.id,
                quote_type=QuoteType.CUSTOM,
                title=f"Quote {i+1}",
                description="Description",
                quantity=1,
                client_type=ClientType.PARTICULIER,
                client_name="Client",
                client_email="client@example.com",
                client_phone="+261234567890",
                status="pending"
            )
            db.add(quote)

        # Add quote to second user
        quote = Quote(
            user_id=other_user.id,
            quote_type=QuoteType.WORKSHOP,
            title="Other Quote",
            description="Description",
            quantity=1,
            client_type=ClientType.PARTICULIER,
            client_name="Client",
            client_email="client2@example.com",
            client_phone="+261234567890",
            status="pending"
        )
        db.add(quote)
        db.commit()

        result = asyncio.run(
            QuoteService.get_user_quotes(
                db=db,
                user_id=regular_user.id
            )
        )

        assert result["total"] == 2
        assert all(q.user_id == regular_user.id for q in result["items"])

    def test_get_quote_by_id(self, db: Session, regular_user: User):
        """Test retrieving a specific quote"""
        from app.services.quote_service import QuoteService

        quote = Quote(
            user_id=regular_user.id,
            quote_type=QuoteType.CUSTOM,
            title="Test Quote",
            description="Test Description",
            quantity=1,
            client_type=ClientType.PARTICULIER,
            client_name="Client",
            client_email="client@example.com",
            client_phone="+261234567890",
            status="pending"
        )
        db.add(quote)
        db.commit()

        retrieved = asyncio.run(
            QuoteService.get_quote_by_id(db=db, quote_id=quote.id)
        )

        assert retrieved.id == quote.id
        assert retrieved.title == "Test Quote"

    def test_get_quote_not_found(self, db: Session):
        """Test retrieving non-existent quote"""
        from app.services.quote_service import QuoteService
        from fastapi import HTTPException

        with pytest.raises(HTTPException) as exc_info:
            asyncio.run(
                QuoteService.get_quote_by_id(db=db, quote_id=uuid4())
            )

        assert exc_info.value.status_code == 404

    def test_update_quote(self, db: Session, regular_user: User):
        """Test updating a quote with price and notes"""
        from app.services.quote_service import QuoteService

        quote = Quote(
            user_id=regular_user.id,
            quote_type=QuoteType.CUSTOM,
            title="Test Quote",
            description="Description",
            quantity=1,
            client_type=ClientType.PARTICULIER,
            client_name="Client",
            client_email="client@example.com",
            client_phone="+261234567890",
            status="pending"
        )
        db.add(quote)
        db.commit()

        update_data = QuoteUpdateIn(
            final_price=Decimal("250.00"),
            admin_notes="High quality leather requested"
        )

        updated = asyncio.run(
            QuoteService.update_quote(
                db=db,
                quote_id=quote.id,
                update_data=update_data
            )
        )

        assert updated.final_price == Decimal("250.00")
        assert updated.admin_notes == "High quality leather requested"
        assert updated.status == "quoted"
        assert updated.quoted_at is not None

    def test_update_quote_invalid_status(
        self, db: Session, regular_user: User
    ):
        """Test updating quote with invalid status"""
        from app.services.quote_service import QuoteService
        from fastapi import HTTPException

        quote = Quote(
            user_id=regular_user.id,
            quote_type=QuoteType.CUSTOM,
            title="Test Quote",
            description="Description",
            quantity=1,
            client_type=ClientType.PARTICULIER,
            client_name="Client",
            client_email="client@example.com",
            client_phone="+261234567890",
            status="approved"  # Already approved
        )
        db.add(quote)
        db.commit()

        update_data = QuoteUpdateIn(final_price=Decimal("250.00"))

        with pytest.raises(HTTPException) as exc_info:
            asyncio.run(
                QuoteService.update_quote(
                    db=db,
                    quote_id=quote.id,
                    update_data=update_data
                )
            )

        assert exc_info.value.status_code == 400

    def test_approve_quote(self, db: Session, regular_user: User):
        """Test approving a quoted quote"""
        from app.services.quote_service import QuoteService

        quote = Quote(
            user_id=regular_user.id,
            quote_type=QuoteType.CUSTOM,
            title="Test Quote",
            description="Description",
            quantity=1,
            client_type=ClientType.PARTICULIER,
            client_name="Client",
            client_email="client@example.com",
            client_phone="+261234567890",
            status="quoted",
            final_price=Decimal("250.00"),
            quoted_at=datetime.utcnow()
        )
        db.add(quote)
        db.commit()

        approved = asyncio.run(
            QuoteService.approve_quote(db=db, quote_id=quote.id)
        )

        assert approved.status == "approved"
        assert approved.responded_at is not None

    def test_approve_quote_not_quoted(self, db: Session, regular_user: User):
        """Test approving non-quoted quote"""
        from app.services.quote_service import QuoteService
        from fastapi import HTTPException

        quote = Quote(
            user_id=regular_user.id,
            quote_type=QuoteType.CUSTOM,
            title="Test Quote",
            description="Description",
            quantity=1,
            client_type=ClientType.PARTICULIER,
            client_name="Client",
            client_email="client@example.com",
            client_phone="+261234567890",
            status="pending"
        )
        db.add(quote)
        db.commit()

        with pytest.raises(HTTPException) as exc_info:
            asyncio.run(
                QuoteService.approve_quote(db=db, quote_id=quote.id)
            )

        assert exc_info.value.status_code == 400

    def test_reject_quote(self, db: Session, regular_user: User):
        """Test rejecting a quoted quote"""
        from app.services.quote_service import QuoteService

        quote = Quote(
            user_id=regular_user.id,
            quote_type=QuoteType.CUSTOM,
            title="Test Quote",
            description="Description",
            quantity=1,
            client_type=ClientType.PARTICULIER,
            client_name="Client",
            client_email="client@example.com",
            client_phone="+261234567890",
            status="quoted",
            final_price=Decimal("250.00"),
            quoted_at=datetime.utcnow()
        )
        db.add(quote)
        db.commit()

        rejected = asyncio.run(
            QuoteService.reject_quote(db=db, quote_id=quote.id)
        )

        assert rejected.status == "rejected"
        assert rejected.responded_at is not None

    def test_convert_quote_to_order(self, db: Session, regular_user: User):
        """Test converting approved quote to order"""
        from app.services.quote_service import QuoteService

        quote = Quote(
            user_id=regular_user.id,
            quote_type=QuoteType.CUSTOM,
            title="Test Quote",
            description="Description",
            quantity=2,
            client_type=ClientType.PARTICULIER,
            client_name="Client",
            client_email="client@example.com",
            client_phone="+261234567890",
            status="approved",
            final_price=Decimal("500.00"),
            responded_at=datetime.utcnow()
        )
        db.add(quote)
        db.commit()

        order_data = asyncio.run(
            QuoteService.convert_quote_to_order(db=db, quote_id=quote.id)
        )

        assert order_data["quote_id"] == str(quote.id)
        assert order_data["user_id"] == str(regular_user.id)
        assert order_data["quantity"] == 2
        assert order_data["price"] == 500.0

        # Verify quote is now completed
        db.refresh(quote)
        assert quote.status == "completed"
        assert quote.completed_at is not None

    def test_convert_quote_not_approved(
        self, db: Session, regular_user: User
    ):
        """Test converting non-approved quote"""
        from app.services.quote_service import QuoteService
        from fastapi import HTTPException

        quote = Quote(
            user_id=regular_user.id,
            quote_type=QuoteType.CUSTOM,
            title="Test Quote",
            description="Description",
            quantity=1,
            client_type=ClientType.PARTICULIER,
            client_name="Client",
            client_email="client@example.com",
            client_phone="+261234567890",
            status="quoted"
        )
        db.add(quote)
        db.commit()

        with pytest.raises(HTTPException) as exc_info:
            asyncio.run(
                QuoteService.convert_quote_to_order(db=db, quote_id=quote.id)
            )

        assert exc_info.value.status_code == 400

    def test_get_quote_stats(self, db: Session, regular_user: User):
        """Test retrieving quote statistics"""
        from app.services.quote_service import QuoteService

        # Create quotes with various statuses
        statuses = [
            ("pending", None),
            ("pending", None),
            ("quoted", Decimal("100.00")),
            ("quoted", Decimal("200.00")),
            ("approved", Decimal("300.00")),
            ("completed", Decimal("400.00")),
        ]

        for status, price in statuses:
            quote = Quote(
                user_id=regular_user.id,
                quote_type=QuoteType.CUSTOM,
                title=f"Quote {status}",
                description="Description",
                quantity=1,
                client_type=ClientType.PARTICULIER,
                client_name="Client",
                client_email="client@example.com",
                client_phone="+261234567890",
                status=status,
                final_price=price
            )
            db.add(quote)
        db.commit()

        stats = asyncio.run(QuoteService.get_quote_stats(db=db))

        assert stats["total_quotes"] == 6
        assert stats["pending_count"] == 2
        assert stats["quoted_count"] == 2
        assert stats["approved_count"] == 1
        assert stats["completed_count"] == 1
        assert stats["total_value"] == 1000.0  # 100 + 200 + 300 + 400

        """Test creating a new quote request"""
        from app.services.quote_service import QuoteService
        
        quote_data = QuoteRequestIn(
            quote_type=QuoteType.CUSTOM,
            title="Custom Leather Bag",
            description="A beautiful handcrafted leather bag for my travel",
            quantity=2,
            client_type=ClientType.PARTICULIER,
            client_name="Jean Dupont",
            client_email="jean@example.com",
            client_phone="+261234567890",
            company_name=None
        )
        
        quote = asyncio.run(
            QuoteService.create_quote_request(
                db=db_session,
                user_id=regular_user.id,
                quote_data=quote_data
            )
        )
        
        assert quote is not None
        assert quote.user_id == regular_user.id
        assert quote.title == "Custom Leather Bag"
        assert quote.status == "pending"
        assert quote.quantity == 2
        assert quote.client_type == ClientType.PARTICULIER
    
    def test_create_quote_user_not_found(self, db_session: Session):
        """Test creating quote with non-existent user"""
        from app.services.quote_service import QuoteService
        from fastapi import HTTPException
        
        quote_data = QuoteRequestIn(
            quote_type=QuoteType.PRODUCT,
            title="Test Product",
            description="Test Description",
            quantity=1,
            client_type=ClientType.PARTICULIER,
            client_name="John Doe",
            client_email="john@example.com",
            client_phone="+261234567890"
        )
        
        with pytest.raises(HTTPException) as exc_info:
            asyncio.run(
                QuoteService.create_quote_request(
                    db=db_session,
                    user_id=uuid4(),
                    quote_data=quote_data
                )
            )
        
        assert exc_info.value.status_code == 404
    
    def test_get_all_quotes(self, db_session: Session, regular_user: User):
        """Test retrieving all quotes"""
        from app.services.quote_service import QuoteService
        
        # Create test quotes
        for i in range(3):
            quote = Quote(
                user_id=regular_user.id,
                quote_type=QuoteType.CUSTOM,
                title=f"Quote {i+1}",
                description=f"Description {i+1}",
                quantity=1,
                client_type=ClientType.PARTICULIER,
                client_name=f"Client {i+1}",
                client_email=f"client{i+1}@example.com",
                client_phone="+261234567890",
                status="pending"
            )
            db_session.add(quote)
        db_session.commit()
        
        result = asyncio.run(
            QuoteService.get_all_quotes(
                db=db_session,
                skip=0,
                limit=50
            )
        )
        
        assert result["total"] == 3
        assert len(result["items"]) == 3
        assert result["pending_count"] == 3
    
    def test_get_quotes_with_status_filter(self, db_session: Session, regular_user: User):
        """Test retrieving quotes with status filter"""
        from app.services.quote_service import QuoteService
        
        # Create quotes with different statuses
        for status in ["pending", "pending", "quoted", "approved"]:
            quote = Quote(
                user_id=regular_user.id,
                quote_type=QuoteType.CUSTOM,
                title=f"Quote {status}",
                description="Description",
                quantity=1,
                client_type=ClientType.PARTICULIER,
                client_name="Client",
                client_email="client@example.com",
                client_phone="+261234567890",
                status=status,
                final_price=Decimal("100.00") if status != "pending" else None
            )
            db_session.add(quote)
        db_session.commit()
        
        result = asyncio.run(
            QuoteService.get_all_quotes(
                db=db_session,
                status="pending"
            )
        )
        
        assert result["total"] == 2
        assert all(q.status == "pending" for q in result["items"])
    
    def test_get_user_quotes(self, db_session: Session, regular_user: User):
        """Test retrieving quotes for a specific user"""
        from app.services.quote_service import QuoteService
        
        # Create quotes for different users
        other_user = User(
            email="other@example.com",
            name="Other User",
            password_hash="hashed",
            role=UserRole.BUYER
        )
        db_session.add(other_user)
        db_session.commit()
        
        # Add quotes to first user
        for i in range(2):
            quote = Quote(
                user_id=regular_user.id,
                quote_type=QuoteType.CUSTOM,
                title=f"Quote {i+1}",
                description="Description",
                quantity=1,
                client_type=ClientType.PARTICULIER,
                client_name="Client",
                client_email="client@example.com",
                client_phone="+261234567890",
                status="pending"
            )
            db_session.add(quote)
        
        # Add quote to second user
        quote = Quote(
            user_id=other_user.id,
            quote_type=QuoteType.WORKSHOP,
            title="Other Quote",
            description="Description",
            quantity=1,
            client_type=ClientType.PARTICULIER,
            client_name="Client",
            client_email="client2@example.com",
            client_phone="+261234567890",
            status="pending"
        )
        db_session.add(quote)
        db_session.commit()
        
        result = asyncio.run(
            QuoteService.get_user_quotes(
                db=db_session,
                user_id=regular_user.id
            )
        )
        
        assert result["total"] == 2
        assert all(q.user_id == regular_user.id for q in result["items"])
    
    def test_get_quote_by_id(self, db_session: Session, regular_user: User):
        """Test retrieving a specific quote"""
        from app.services.quote_service import QuoteService
        
        quote = Quote(
            user_id=regular_user.id,
            quote_type=QuoteType.CUSTOM,
            title="Test Quote",
            description="Test Description",
            quantity=1,
            client_type=ClientType.PARTICULIER,
            client_name="Client",
            client_email="client@example.com",
            client_phone="+261234567890",
            status="pending"
        )
        db_session.add(quote)
        db_session.commit()
        
        retrieved = asyncio.run(
            QuoteService.get_quote_by_id(db=db_session, quote_id=quote.id)
        )
        
        assert retrieved.id == quote.id
        assert retrieved.title == "Test Quote"
    
    def test_get_quote_not_found(self, db_session: Session):
        """Test retrieving non-existent quote"""
        from app.services.quote_service import QuoteService
        from fastapi import HTTPException
        
        with pytest.raises(HTTPException) as exc_info:
            asyncio.run(
                QuoteService.get_quote_by_id(db=db_session, quote_id=uuid4())
            )
        
        assert exc_info.value.status_code == 404
    
    def test_update_quote(self, db_session: Session, regular_user: User):
        """Test updating a quote with price and notes"""
        from app.services.quote_service import QuoteService
        
        quote = Quote(
            user_id=regular_user.id,
            quote_type=QuoteType.CUSTOM,
            title="Test Quote",
            description="Description",
            quantity=1,
            client_type=ClientType.PARTICULIER,
            client_name="Client",
            client_email="client@example.com",
            client_phone="+261234567890",
            status="pending"
        )
        db_session.add(quote)
        db_session.commit()
        
        update_data = QuoteUpdateIn(
            final_price=Decimal("250.00"),
            admin_notes="High quality leather requested"
        )
        
        updated = asyncio.run(
            QuoteService.update_quote(
                db=db_session,
                quote_id=quote.id,
                update_data=update_data
            )
        )
        
        assert updated.final_price == Decimal("250.00")
        assert updated.admin_notes == "High quality leather requested"
        assert updated.status == "quoted"
        assert updated.quoted_at is not None
    
    def test_update_quote_invalid_status(self, db_session: Session, regular_user: User):
        """Test updating quote with invalid status"""
        from app.services.quote_service import QuoteService
        from fastapi import HTTPException
        
        quote = Quote(
            user_id=regular_user.id,
            quote_type=QuoteType.CUSTOM,
            title="Test Quote",
            description="Description",
            quantity=1,
            client_type=ClientType.PARTICULIER,
            client_name="Client",
            client_email="client@example.com",
            client_phone="+261234567890",
            status="approved"  # Already approved
        )
        db_session.add(quote)
        db_session.commit()
        
        update_data = QuoteUpdateIn(final_price=Decimal("250.00"))
        
        with pytest.raises(HTTPException) as exc_info:
            asyncio.run(
                QuoteService.update_quote(
                    db=db_session,
                    quote_id=quote.id,
                    update_data=update_data
                )
            )
        
        assert exc_info.value.status_code == 400
    
    def test_approve_quote(self, db_session: Session, regular_user: User):
        """Test approving a quoted quote"""
        from app.services.quote_service import QuoteService
        
        quote = Quote(
            user_id=regular_user.id,
            quote_type=QuoteType.CUSTOM,
            title="Test Quote",
            description="Description",
            quantity=1,
            client_type=ClientType.PARTICULIER,
            client_name="Client",
            client_email="client@example.com",
            client_phone="+261234567890",
            status="quoted",
            final_price=Decimal("250.00"),
            quoted_at=datetime.utcnow()
        )
        db_session.add(quote)
        db_session.commit()
        
        approved = asyncio.run(
            QuoteService.approve_quote(db=db_session, quote_id=quote.id)
        )
        
        assert approved.status == "approved"
        assert approved.responded_at is not None
    
    def test_approve_quote_not_quoted(self, db_session: Session, regular_user: User):
        """Test approving non-quoted quote"""
        from app.services.quote_service import QuoteService
        from fastapi import HTTPException
        
        quote = Quote(
            user_id=regular_user.id,
            quote_type=QuoteType.CUSTOM,
            title="Test Quote",
            description="Description",
            quantity=1,
            client_type=ClientType.PARTICULIER,
            client_name="Client",
            client_email="client@example.com",
            client_phone="+261234567890",
            status="pending"
        )
        db_session.add(quote)
        db_session.commit()
        
        with pytest.raises(HTTPException) as exc_info:
            asyncio.run(
                QuoteService.approve_quote(db=db_session, quote_id=quote.id)
            )
        
        assert exc_info.value.status_code == 400
    
    def test_reject_quote(self, db_session: Session, regular_user: User):
        """Test rejecting a quoted quote"""
        from app.services.quote_service import QuoteService
        
        quote = Quote(
            user_id=regular_user.id,
            quote_type=QuoteType.CUSTOM,
            title="Test Quote",
            description="Description",
            quantity=1,
            client_type=ClientType.PARTICULIER,
            client_name="Client",
            client_email="client@example.com",
            client_phone="+261234567890",
            status="quoted",
            final_price=Decimal("250.00"),
            quoted_at=datetime.utcnow()
        )
        db_session.add(quote)
        db_session.commit()
        
        rejected = asyncio.run(
            QuoteService.reject_quote(db=db_session, quote_id=quote.id)
        )
        
        assert rejected.status == "rejected"
        assert rejected.responded_at is not None
    
    def test_convert_quote_to_order(self, db_session: Session, regular_user: User):
        """Test converting approved quote to order"""
        from app.services.quote_service import QuoteService
        
        quote = Quote(
            user_id=regular_user.id,
            quote_type=QuoteType.CUSTOM,
            title="Test Quote",
            description="Description",
            quantity=2,
            client_type=ClientType.PARTICULIER,
            client_name="Client",
            client_email="client@example.com",
            client_phone="+261234567890",
            status="approved",
            final_price=Decimal("500.00"),
            responded_at=datetime.utcnow()
        )
        db_session.add(quote)
        db_session.commit()
        
        order_data = asyncio.run(
            QuoteService.convert_quote_to_order(db=db_session, quote_id=quote.id)
        )
        
        assert order_data["quote_id"] == str(quote.id)
        assert order_data["user_id"] == str(regular_user.id)
        assert order_data["quantity"] == 2
        assert order_data["price"] == 500.0
        
        # Verify quote is now completed
        db_session.refresh(quote)
        assert quote.status == "completed"
        assert quote.completed_at is not None
    
    def test_convert_quote_not_approved(self, db_session: Session, regular_user: User):
        """Test converting non-approved quote"""
        from app.services.quote_service import QuoteService
        from fastapi import HTTPException
        
        quote = Quote(
            user_id=regular_user.id,
            quote_type=QuoteType.CUSTOM,
            title="Test Quote",
            description="Description",
            quantity=1,
            client_type=ClientType.PARTICULIER,
            client_name="Client",
            client_email="client@example.com",
            client_phone="+261234567890",
            status="quoted"
        )
        db_session.add(quote)
        db_session.commit()
        
        with pytest.raises(HTTPException) as exc_info:
            asyncio.run(
                QuoteService.convert_quote_to_order(db=db_session, quote_id=quote.id)
            )
        
        assert exc_info.value.status_code == 400
    
    def test_get_quote_stats(self, db_session: Session, regular_user: User):
        """Test retrieving quote statistics"""
        from app.services.quote_service import QuoteService
        
        # Create quotes with various statuses
        statuses = [
            ("pending", None),
            ("pending", None),
            ("quoted", Decimal("100.00")),
            ("quoted", Decimal("200.00")),
            ("approved", Decimal("300.00")),
            ("completed", Decimal("400.00")),
        ]
        
        for status, price in statuses:
            quote = Quote(
                user_id=regular_user.id,
                quote_type=QuoteType.CUSTOM,
                title=f"Quote {status}",
                description="Description",
                quantity=1,
                client_type=ClientType.PARTICULIER,
                client_name="Client",
                client_email="client@example.com",
                client_phone="+261234567890",
                status=status,
                final_price=price
            )
            db_session.add(quote)
        db_session.commit()
        
        stats = asyncio.run(QuoteService.get_quote_stats(db=db_session))
        
        assert stats["total_quotes"] == 6
        assert stats["pending_count"] == 2
        assert stats["quoted_count"] == 2
        assert stats["approved_count"] == 1
        assert stats["completed_count"] == 1
        assert stats["total_value"] == 1000.0  # 100 + 200 + 300 + 400
