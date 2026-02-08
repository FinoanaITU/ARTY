"""Service for quote management"""
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime
from uuid import UUID
from app.models.quote import Quote
from app.models.user import User
from app.schemas.admin import QuoteRequestIn, QuoteUpdateIn
from fastapi import HTTPException


class QuoteService:
    """Service for managing quotes"""

    @staticmethod
    async def create_quote_request(
        db: Session,
        user_id: UUID,
        quote_data: QuoteRequestIn,
    ) -> Quote:
        """
        Create a new quote request.
        
        Args:
            db: Database session
            user_id: ID of the user requesting the quote
            quote_data: Quote request data
            
        Returns:
            Quote: Created quote object
            
        Raises:
            HTTPException: If validation fails
        """
        # Verify user exists
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")

        # Create new quote
        quote = Quote(
            user_id=user_id,
            quote_type=quote_data.quote_type,
            title=quote_data.title,
            description=quote_data.description,
            quantity=quote_data.quantity,
            client_type=quote_data.client_type,
            client_name=quote_data.client_name,
            client_email=quote_data.client_email,
            client_phone=quote_data.client_phone,
            company_name=quote_data.company_name,
            status="pending",
            requested_at=datetime.utcnow(),
        )
        
        db.add(quote)
        db.commit()
        db.refresh(quote)
        
        return quote

    @staticmethod
    async def get_all_quotes(
        db: Session,
        status: str = None,
        quote_type: str = None,
        skip: int = 0,
        limit: int = 50,
    ) -> dict:
        """
        Get all quotes with optional filters.

        Args:
            db: Database session
            status: Filter by status
                (pending/quoted/approved/rejected/completed)
            quote_type: Filter by type (workshop/product/custom)
            skip: Offset for pagination
            limit: Number of results to return

        Returns:
            dict: Contains total count and list of quotes
        """
        query = db.query(Quote)

        if status:
            query = query.filter(Quote.status == status)

        if quote_type:
            query = query.filter(Quote.quote_type == quote_type)

        total = query.count()
        quotes = query.order_by(Quote.requested_at.desc()).offset(
            skip).limit(limit).all()

        pending_count = db.query(Quote).filter(
            Quote.status == "pending"
        ).count()
        quoted_count = db.query(Quote).filter(
            Quote.status == "quoted"
        ).count()

        return {
            "total": total,
            "items": quotes,
            "pending_count": pending_count,
            "quoted_count": quoted_count,
        }

    @staticmethod
    async def get_user_quotes(
        db: Session,
        user_id: UUID,
        skip: int = 0,
        limit: int = 50,
    ) -> dict:
        """
        Get quotes for a specific user.

        Args:
            db: Database session
            user_id: ID of the user
            skip: Offset for pagination
            limit: Number of results to return

        Returns:
            dict: Contains total count and list of quotes
        """
        query = db.query(Quote).filter(Quote.user_id == user_id)
        total = query.count()
        quotes = query.order_by(Quote.requested_at.desc()).offset(
            skip).limit(limit).all()

        return {
            "total": total,
            "items": quotes,
        }

    @staticmethod
    async def get_quote_by_id(
        db: Session,
        quote_id: UUID,
    ) -> Quote:
        """
        Get a specific quote by ID.
        
        Args:
            db: Database session
            quote_id: ID of the quote
            
        Returns:
            Quote: Quote object
            
        Raises:
            HTTPException: If quote not found
        """
        quote = db.query(Quote).filter(Quote.id == quote_id).first()
        if not quote:
            raise HTTPException(status_code=404, detail="Quote not found")
        
        return quote

    @staticmethod
    async def update_quote(
        db: Session,
        quote_id: UUID,
        update_data: QuoteUpdateIn,
    ) -> Quote:
        """
        Update a quote with new pricing and notes (admin action).
        
        Args:
            db: Database session
            quote_id: ID of the quote to update
            update_data: Updated quote data
            
        Returns:
            Quote: Updated quote object
            
        Raises:
            HTTPException: If quote not found or invalid status
        """
        quote = await QuoteService.get_quote_by_id(db, quote_id)
        
        # Only allow updating pending or quoted quotes
        if quote.status not in ["pending", "quoted"]:
            raise HTTPException(
                status_code=400,
                detail=f"Cannot update quote with status {quote.status}"
            )
        
        if update_data.final_price is not None:
            quote.final_price = update_data.final_price
            quote.status = "quoted"
            quote.quoted_at = datetime.utcnow()
        
        if update_data.admin_notes is not None:
            quote.admin_notes = update_data.admin_notes
        
        if update_data.artisan_id is not None:
            # Verify artisan exists
            artisan = db.query(User).filter(
                User.id == update_data.artisan_id
            ).first()
            if not artisan:
                raise HTTPException(
                    status_code=404,
                    detail="Artisan not found"
                )
            quote.artisan_id = update_data.artisan_id
        
        quote.updated_at = datetime.utcnow()
        db.commit()
        db.refresh(quote)
        
        return quote

    @staticmethod
    async def approve_quote(
        db: Session,
        quote_id: UUID,
    ) -> Quote:
        """
        Approve a quote (client action). Converts quote to order.
        
        Args:
            db: Database session
            quote_id: ID of the quote to approve
            
        Returns:
            Quote: Updated quote object
            
        Raises:
            HTTPException: If quote not found or invalid status
        """
        quote = await QuoteService.get_quote_by_id(db, quote_id)
        
        if quote.status != "quoted":
            raise HTTPException(
                status_code=400,
                detail="Only quoted quotes can be approved"
            )
        
        quote.status = "approved"
        quote.responded_at = datetime.utcnow()
        quote.updated_at = datetime.utcnow()
        
        db.commit()
        db.refresh(quote)
        
        return quote

    @staticmethod
    async def reject_quote(
        db: Session,
        quote_id: UUID,
    ) -> Quote:
        """
        Reject a quote (client action).
        
        Args:
            db: Database session
            quote_id: ID of the quote to reject
            
        Returns:
            Quote: Updated quote object
            
        Raises:
            HTTPException: If quote not found or invalid status
        """
        quote = await QuoteService.get_quote_by_id(db, quote_id)
        
        if quote.status != "quoted":
            raise HTTPException(
                status_code=400,
                detail="Only quoted quotes can be rejected"
            )
        
        quote.status = "rejected"
        quote.responded_at = datetime.utcnow()
        quote.updated_at = datetime.utcnow()
        
        db.commit()
        db.refresh(quote)
        
        return quote

    @staticmethod
    async def convert_quote_to_order(
        db: Session,
        quote_id: UUID,
    ) -> dict:
        """
        Convert an approved quote to an order.

        Args:
            db: Database session
            quote_id: ID of the quote to convert

        Returns:
            dict: Information for order creation

        Raises:
            HTTPException: If quote not found, not approved,
                or missing final price
        """
        quote = await QuoteService.get_quote_by_id(db, quote_id)
        
        if quote.status != "approved":
            raise HTTPException(
                status_code=400,
                detail="Only approved quotes can be converted to orders"
            )
        
        if not quote.final_price:
            raise HTTPException(
                status_code=400,
                detail="Quote must have a final price to convert to order"
            )
        
        # Mark quote as completed
        quote.status = "completed"
        quote.completed_at = datetime.utcnow()
        quote.updated_at = datetime.utcnow()
        
        db.commit()
        db.refresh(quote)
        
        # Return data for order creation
        return {
            "quote_id": str(quote.id),
            "user_id": str(quote.user_id),
            "artisan_id": str(quote.artisan_id) if quote.artisan_id else None,
            "title": quote.title,
            "description": quote.description,
            "quantity": quote.quantity,
            "price": float(quote.final_price),
            "quote_type": quote.quote_type,
        }

    @staticmethod
    async def get_quote_stats(
        db: Session,
    ) -> dict:
        """
        Get quote statistics for admin dashboard.

        Args:
            db: Database session

        Returns:
            dict: Statistics about quotes
        """
        total_quotes = db.query(Quote).count()
        pending_quotes = db.query(Quote).filter(
            Quote.status == "pending"
        ).count()
        quoted_quotes = db.query(Quote).filter(
            Quote.status == "quoted"
        ).count()
        approved_quotes = db.query(Quote).filter(
            Quote.status == "approved"
        ).count()
        rejected_quotes = db.query(Quote).filter(
            Quote.status == "rejected"
        ).count()
        completed_quotes = db.query(Quote).filter(
            Quote.status == "completed"
        ).count()

        # Average response time (from request to quote)
        avg_response_time = db.query(
            func.avg(
                func.extract(
                    'epoch',
                    Quote.quoted_at - Quote.requested_at
                ) / 3600
            )
        ).filter(Quote.quoted_at.isnot(None)).scalar()

        # Total value of quotes
        total_value = db.query(func.sum(Quote.final_price)).filter(
            Quote.final_price.isnot(None)
        ).scalar() or 0

        approval_rate = (
            (approved_quotes/quoted_quotes*100)
            if quoted_quotes > 0
            else 0
        )
        conversion_rate = (
            (completed_quotes/approved_quotes*100)
            if approved_quotes > 0
            else 0
        )

        return {
            "total_quotes": total_quotes,
            "pending_count": pending_quotes,
            "quoted_count": quoted_quotes,
            "approved_count": approved_quotes,
            "rejected_count": rejected_quotes,
            "completed_count": completed_quotes,
            "approval_rate": approval_rate,
            "conversion_rate": conversion_rate,
            "average_response_time_hours": avg_response_time,
            "total_value": float(total_value),
        }
