"""Service for admin subscription management"""
from sqlalchemy.orm import Session
from sqlalchemy import func, and_, cast, Integer
from datetime import datetime, timedelta, date
from uuid import UUID
from decimal import Decimal
from app.models.subscription import Subscription, SubscriptionHistory, SubscriptionPlan, SubscriptionStatus
from app.models.user import User
from fastapi import HTTPException

class AdminSubscriptionService:
    """Service for managing subscriptions from admin perspective"""

    PLANS_CONFIG = {
        "basic": {
            "name": "Basic",
            "monthly_price": Decimal("29.99"),
            "annual_price": Decimal("299.99"),
            "features": {
                "max_products": 10,
                "max_workshops": 2,
                "max_photos_per_product": 5,
                "analytics": False,
                "priority_support": False
            },
            "credits": Decimal("1000")
        },
        "plus": {
            "name": "Plus",
            "monthly_price": Decimal("79.99"),
            "annual_price": Decimal("799.99"),
            "features": {
                "max_products": 50,
                "max_workshops": 10,
                "max_photos_per_product": 20,
                "analytics": True,
                "priority_support": False
            },
            "credits": Decimal("5000")
        },
        "pro": {
            "name": "Pro",
            "monthly_price": Decimal("199.99"),
            "annual_price": Decimal("1999.99"),
            "features": {
                "max_products": 500,
                "max_workshops": 50,
                "max_photos_per_product": 50,
                "analytics": True,
                "priority_support": True
            },
            "credits": Decimal("20000")
        },
        "enterprise": {
            "name": "Enterprise",
            "monthly_price": Decimal("499.99"),
            "annual_price": Decimal("4999.99"),
            "features": {
                "max_products": -1,
                "max_workshops": -1,
                "max_photos_per_product": -1,
                "analytics": True,
                "priority_support": True
            },
            "credits": Decimal("100000")
        }
    }

    @staticmethod
    async def get_subscriptions_overview(db: Session, period: str = "current") -> dict:
        """
        Get overview of all subscriptions with statistics.
        
        Args:
            db: Database session
            period: 'current' (active only) or 'all'
            
        Returns:
            dict: Overview with counts by plan, status, and revenue stats
        """

        total_active = db.query(func.count(Subscription.id)).filter(
            Subscription.status == 'active'
        ).scalar() or 0
        

        by_plan = db.query(
            Subscription.plan,
            func.count(Subscription.id).label('count')
        ).filter(Subscription.status == 'active').group_by(Subscription.plan).all()
        
        plan_counts = {plan: 0 for plan in AdminSubscriptionService.PLANS_CONFIG.keys()}
        for plan, count in by_plan:
            plan_counts[plan] = count
        

        monthly_revenue = db.query(
            func.sum(Subscription.monthly_price)
        ).filter(Subscription.status == 'active').scalar() or 0
        

        by_status = db.query(
            Subscription.status,
            func.count(Subscription.id).label('count')
        ).group_by(Subscription.status).all()
        
        status_counts = {status: 0 for status in ['active', 'paused', 'cancelled', 'expired']}
        for status, count in by_status:
            status_counts[status] = count
        

        thirty_days_ago = datetime.utcnow() - timedelta(days=30)
        churned_count = db.query(func.count(Subscription.id)).filter(
            and_(
                Subscription.status == 'cancelled',
                Subscription.cancelled_at >= thirty_days_ago
            )
        ).scalar() or 0
        

        renewed_count = db.query(func.count(Subscription.id)).filter(
            Subscription.times_renewed > 0
        ).scalar() or 0
        
        renewal_rate = (renewed_count / total_active * 100) if total_active > 0 else 0
        
        return {
            "total_active": total_active,
            "total_by_plan": plan_counts,
            "total_by_status": status_counts,
            "monthly_recurring_revenue": float(monthly_revenue),
            "churned_this_month": churned_count,
            "renewal_rate_percent": round(renewal_rate, 2),
            "timestamp": datetime.utcnow().isoformat()
        }

    @staticmethod
    async def get_subscriptions_list(
        db: Session,
        status: str = None,
        plan: str = None,
        user_id: str = None,
        skip: int = 0,
        limit: int = 50
    ) -> dict:
        """
        Get list of subscriptions with filters and pagination.
        
        Args:
            db: Database session
            status: Filter by status (active/paused/cancelled/expired)
            plan: Filter by plan
            user_id: Filter by user
            skip: Pagination offset
            limit: Pagination limit
            
        Returns:
            dict: Total count and subscription list
        """
        query = db.query(Subscription)
        
        if status:
            query = query.filter(Subscription.status == status)
        if plan:
            query = query.filter(Subscription.plan == plan)
        if user_id:
            query = query.filter(Subscription.user_id == UUID(user_id))
        
        total = query.count()
        subscriptions = query.order_by(
            Subscription.created_at.desc()
        ).offset(skip).limit(limit).all()
        
        return {
            "total": total,
            "skip": skip,
            "limit": limit,
            "subscriptions": subscriptions
        }

    @staticmethod
    async def get_subscription_detail(db: Session, subscription_id: str) -> Subscription:
        """
        Get detailed information about a subscription.
        
        Args:
            db: Database session
            subscription_id: ID of subscription
            
        Returns:
            Subscription: Subscription object with related data
            
        Raises:
            HTTPException: If subscription not found
        """
        subscription = db.query(Subscription).filter(
            Subscription.id == UUID(subscription_id)
        ).first()
        
        if not subscription:
            raise HTTPException(status_code=404, detail="Subscription not found")
        
        return subscription

    @staticmethod
    async def cancel_subscription(
        db: Session,
        subscription_id: str,
        admin_id: str,
        reason: str = None
    ) -> Subscription:
        """
        Cancel a subscription (admin action).
        
        Args:
            db: Database session
            subscription_id: ID of subscription to cancel
            admin_id: ID of admin performing action
            reason: Cancellation reason
            
        Returns:
            Subscription: Updated subscription
            
        Raises:
            HTTPException: If subscription not found or already cancelled
        """
        subscription = db.query(Subscription).filter(
            Subscription.id == UUID(subscription_id)
        ).first()
        
        if not subscription:
            raise HTTPException(status_code=404, detail="Subscription not found")
        
        if subscription.status == 'cancelled':
            raise HTTPException(status_code=400, detail="Subscription already cancelled")
        

        old_values = {
            "status": subscription.status,
            "auto_renew": subscription.auto_renew,
            "end_date": subscription.end_date.isoformat()
        }
        

        subscription.status = 'cancelled'
        subscription.cancelled_at = datetime.utcnow()
        subscription.cancelled_by = UUID(admin_id)
        subscription.cancellation_reason = reason
        subscription.auto_renew = False
        
        db.add(subscription)
        db.flush()
        

        history = SubscriptionHistory(
            subscription_id=subscription.id,
            action_type='cancelled',
            action_by=UUID(admin_id),
            old_values=old_values,
            new_values={"status": "cancelled", "cancelled_at": subscription.cancelled_at.isoformat()},
            notes=reason
        )
        db.add(history)
        db.commit()
        db.refresh(subscription)
        
        return subscription

    @staticmethod
    async def extend_subscription(
        db: Session,
        subscription_id: str,
        admin_id: str,
        days: int = 30,
        notes: str = None
    ) -> Subscription:
        """
        Extend a subscription duration (commercial gesture).
        
        Args:
            db: Database session
            subscription_id: ID of subscription
            admin_id: ID of admin
            days: Number of days to extend
            notes: Admin notes on extension
            
        Returns:
            Subscription: Updated subscription
            
        Raises:
            HTTPException: If subscription not found
        """
        subscription = db.query(Subscription).filter(
            Subscription.id == UUID(subscription_id)
        ).first()
        
        if not subscription:
            raise HTTPException(status_code=404, detail="Subscription not found")
        
        if subscription.status not in ['active', 'paused']:
            raise HTTPException(
                status_code=400,
                detail="Can only extend active or paused subscriptions"
            )
        

        old_end_date = subscription.end_date
        old_values = {"end_date": old_end_date.isoformat()}
        

        new_end_date = subscription.end_date + timedelta(days=days)
        subscription.end_date = new_end_date
        

        if notes:
            subscription.admin_notes = (subscription.admin_notes or "") + f"\n[{datetime.utcnow().isoformat()}] Extended by {days} days: {notes}"
        
        db.add(subscription)
        db.flush()
        

        history = SubscriptionHistory(
            subscription_id=subscription.id,
            action_type='extended',
            action_by=UUID(admin_id),
            old_values=old_values,
            new_values={"end_date": new_end_date.isoformat()},
            notes=f"Extended by {days} days. {notes or ''}"
        )
        db.add(history)
        db.commit()
        db.refresh(subscription)
        
        return subscription

    @staticmethod
    async def add_bonus_credits(
        db: Session,
        subscription_id: str,
        admin_id: str,
        amount: Decimal,
        reason: str = None
    ) -> Subscription:
        """
        Add bonus credits to a subscription (promotional/customer service).
        
        Args:
            db: Database session
            subscription_id: ID of subscription
            admin_id: ID of admin
            amount: Amount of credits to add
            reason: Reason for adding credits (e.g., 'customer_support', 'promotion')
            
        Returns:
            Subscription: Updated subscription
            
        Raises:
            HTTPException: If subscription not found
        """
        subscription = db.query(Subscription).filter(
            Subscription.id == UUID(subscription_id)
        ).first()
        
        if not subscription:
            raise HTTPException(status_code=404, detail="Subscription not found")
        

        old_credits = subscription.available_credits
        

        subscription.available_credits += amount
        subscription.bonus_credits_added += amount
        

        if reason:
            subscription.admin_notes = (subscription.admin_notes or "") + f"\n[{datetime.utcnow().isoformat()}] Added {amount} bonus credits: {reason}"
        
        db.add(subscription)
        db.flush()
        

        history = SubscriptionHistory(
            subscription_id=subscription.id,
            action_type='credits_added',
            action_by=UUID(admin_id),
            old_values={"available_credits": float(old_credits)},
            new_values={"available_credits": float(subscription.available_credits)},
            notes=f"Added {amount} bonus credits. Reason: {reason or 'None'}"
        )
        db.add(history)
        db.commit()
        db.refresh(subscription)
        
        return subscription

    @staticmethod
    async def get_subscription_history(
        db: Session,
        subscription_id: str,
        skip: int = 0,
        limit: int = 50
    ) -> dict:
        """
        Get history/audit trail of a subscription.
        
        Args:
            db: Database session
            subscription_id: ID of subscription
            skip: Pagination offset
            limit: Pagination limit
            
        Returns:
            dict: History records
        """

        subscription = db.query(Subscription).filter(
            Subscription.id == UUID(subscription_id)
        ).first()
        
        if not subscription:
            raise HTTPException(status_code=404, detail="Subscription not found")
        

        query = db.query(SubscriptionHistory).filter(
            SubscriptionHistory.subscription_id == UUID(subscription_id)
        )
        
        total = query.count()
        history = query.order_by(
            SubscriptionHistory.action_at.desc()
        ).offset(skip).limit(limit).all()
        
        return {
            "total": total,
            "skip": skip,
            "limit": limit,
            "history": history
        }

    @staticmethod
    async def get_subscription_stats(db: Session) -> dict:
        """
        Get comprehensive subscription statistics.
        
        Args:
            db: Database session
            
        Returns:
            dict: Comprehensive statistics
        """
        total_all = db.query(func.count(Subscription.id)).scalar() or 0
        

        total_revenue = db.query(
            func.sum(Subscription.total_spent)
        ).filter(Subscription.status.in_(['active', 'cancelled', 'expired'])).scalar() or Decimal("0")
        

        avg_value = db.query(
            func.avg(Subscription.monthly_price)
        ).filter(Subscription.status == 'active').scalar() or Decimal("0")
        

        lifetime_subs = db.query(
            func.avg(
                cast(Subscription.end_date - Subscription.start_date, Integer)
            )
        ).scalar()
        
        return {
            "total_subscriptions": total_all,
            "total_revenue": float(total_revenue),
            "average_subscription_value": float(avg_value),
            "average_lifetime_days": lifetime_subs,
            "overview": await AdminSubscriptionService.get_subscriptions_overview(db)
        }
