"""
Admin Analytics Service
Provides comprehensive analytics and statistics for the Artizaho platform.
"""
from datetime import datetime, timedelta, date
from typing import Optional, Dict, List, Any
from sqlalchemy import func, and_, or_, cast, Date, distinct, case, text
from sqlalchemy.orm import Session
from decimal import Decimal

from app.models.user import User, UserRole, ArtisanProfile, ProfileStatus
from app.models.product import Product
from app.models.workshop import Workshop, WorkshopBooking
from app.models.order import Order, OrderItem
from app.core.database import get_db

class AdminAnalyticsService:
    """Service for admin analytics and statistics"""
    
    def __init__(self, db: Session):
        self.db = db
    
    def _is_sqlite(self) -> bool:
        """Check if database is SQLite"""
        return self.db.bind.dialect.name == 'sqlite'
    
    async def get_platform_overview(self) -> Dict[str, Any]:
        """
        Get platform-wide overview statistics.
        Returns counts for users, artisans, products, workshops, orders, and validations.
        """

        total_users = self.db.query(func.count(User.id)).scalar() or 0
        total_buyers = self.db.query(func.count(User.id)).filter(
            User.role == UserRole.BUYER
        ).scalar() or 0
        total_admins = self.db.query(func.count(User.id)).filter(
            User.role == UserRole.ADMIN
        ).scalar() or 0
        

        total_artisans = self.db.query(func.count(User.id)).filter(
            User.role == UserRole.ARTISAN
        ).scalar() or 0
        

        active_artisans = self.db.query(func.count(distinct(User.id))).join(
            ArtisanProfile, ArtisanProfile.user_id == User.id
        ).filter(
            User.role == UserRole.ARTISAN,
            ArtisanProfile.status == ProfileStatus.PUBLISHED
        ).scalar() or 0
        

        pending_artisans = self.db.query(func.count(User.id)).join(
            ArtisanProfile, ArtisanProfile.user_id == User.id
        ).filter(
            User.role == UserRole.ARTISAN,
            ArtisanProfile.status == ProfileStatus.PENDING_APPROVAL
        ).scalar() or 0
        

        total_products = self.db.query(func.count(Product.id)).scalar() or 0
        published_products = self.db.query(func.count(Product.id)).filter(
            Product.status == "published"
        ).scalar() or 0
        pending_products = self.db.query(func.count(Product.id)).filter(
            Product.status == "pending"
        ).scalar() or 0
        

        total_workshops = self.db.query(func.count(Workshop.id)).scalar() or 0
        published_workshops = self.db.query(func.count(Workshop.id)).filter(
            Workshop.status == "published"
        ).scalar() or 0
        pending_workshops = self.db.query(func.count(Workshop.id)).filter(
            Workshop.status == "pending"
        ).scalar() or 0
        

        total_orders = self.db.query(func.count(Order.id)).scalar() or 0
        total_bookings = self.db.query(func.count(WorkshopBooking.id)).scalar() or 0
        

        pending_validations = pending_artisans + pending_products + pending_workshops
        
        return {
            "total_users": total_users,
            "users_by_role": {
                "buyers": total_buyers,
                "artisans": total_artisans,
                "admins": total_admins
            },
            "total_artisans": {
                "active": active_artisans,
                "pending": pending_artisans,
                "total": total_artisans
            },
            "total_products": {
                "published": published_products,
                "pending": pending_products,
                "total": total_products
            },
            "total_workshops": {
                "published": published_workshops,
                "pending": pending_workshops,
                "total": total_workshops
            },
            "total_orders": total_orders,
            "total_bookings": total_bookings,
            "pending_validations": pending_validations
        }
    
    async def get_revenue_stats(
        self,
        period: str = "month",
        start_date: Optional[date] = None,
        end_date: Optional[date] = None
    ) -> Dict[str, Any]:
        """
        Get revenue statistics for specified period.
        
        Args:
            period: "day", "week", "month", "year", or "all"
            start_date: Custom start date (optional)
            end_date: Custom end date (optional)
        """

        if start_date and end_date:
            date_filter_start = start_date
            date_filter_end = end_date
        else:
            today = datetime.now().date()
            if period == "day":
                date_filter_start = today
                date_filter_end = today
            elif period == "week":
                date_filter_start = today - timedelta(days=7)
                date_filter_end = today
            elif period == "month":
                date_filter_start = today - timedelta(days=30)
                date_filter_end = today
            elif period == "year":
                date_filter_start = today - timedelta(days=365)
                date_filter_end = today
            else:
                date_filter_start = None
                date_filter_end = None
        

        order_query = self.db.query(Order).filter(
            Order.payment_status.in_(["paid", "completed"])
        )
        
        if date_filter_start and date_filter_end:
            if self._is_sqlite():

                order_query = order_query.filter(
                    func.date(Order.created_at) >= date_filter_start,
                    func.date(Order.created_at) <= date_filter_end
                )
            else:
                order_query = order_query.filter(
                    cast(Order.created_at, Date) >= date_filter_start,
                    cast(Order.created_at, Date) <= date_filter_end
                )
        

        total_product_revenue = self.db.query(
            func.coalesce(func.sum(Order.total_amount), 0)
        ).filter(
            Order.id.in_([o.id for o in order_query.all()])
        ).scalar() or Decimal('0')
        

        booking_query = self.db.query(WorkshopBooking).filter(
            WorkshopBooking.payment_status.in_(["paid", "completed"])
        )
        
        if date_filter_start and date_filter_end:
            if self._is_sqlite():
                booking_query = booking_query.filter(
                    func.date(WorkshopBooking.created_at) >= date_filter_start,
                    func.date(WorkshopBooking.created_at) <= date_filter_end
                )
            else:
                booking_query = booking_query.filter(
                    cast(WorkshopBooking.created_at, Date) >= date_filter_start,
                    cast(WorkshopBooking.created_at, Date) <= date_filter_end
                )
        

        total_workshop_revenue = self.db.query(
            func.coalesce(func.sum(WorkshopBooking.total_price), 0)
        ).filter(
            WorkshopBooking.id.in_([b.id for b in booking_query.all()])
        ).scalar() or Decimal('0')
        

        total_revenue = float(total_product_revenue) + float(total_workshop_revenue)
        

        commission_rate = 0.15
        total_commission = total_revenue * commission_rate
        

        revenue_by_category = []
        

        daily_breakdown = []
        if period in ["week", "month"] and date_filter_start and date_filter_end:
            daily_breakdown = self._get_daily_revenue_breakdown(
                date_filter_start, date_filter_end
            )
        
        return {
            "total_revenue": round(total_revenue, 2),
            "product_sales": round(float(total_product_revenue), 2),
            "workshop_sales": round(float(total_workshop_revenue), 2),
            "commission_artizaho": round(total_commission, 2),
            "commission_rate": commission_rate,
            "period": period,
            "start_date": str(date_filter_start) if date_filter_start else None,
            "end_date": str(date_filter_end) if date_filter_end else None,
            "revenue_by_category": revenue_by_category,
            "daily_breakdown": daily_breakdown
        }
    
    def _get_daily_revenue_breakdown(
        self,
        start_date: date,
        end_date: date
    ) -> List[Dict[str, Any]]:
        """Get daily revenue breakdown for period"""
        breakdown = []
        current = start_date
        
        while current <= end_date:

            if self._is_sqlite():
                daily_orders_revenue = self.db.query(
                    func.coalesce(func.sum(Order.total_amount), 0)
                ).filter(
                    func.date(Order.created_at) == current,
                    Order.payment_status.in_(["paid", "completed"])
                ).scalar() or Decimal('0')
                
                daily_bookings_revenue = self.db.query(
                    func.coalesce(func.sum(WorkshopBooking.total_price), 0)
                ).filter(
                    func.date(WorkshopBooking.created_at) == current,
                    WorkshopBooking.payment_status.in_(["paid", "completed"])
                ).scalar() or Decimal('0')
            else:
                daily_orders_revenue = self.db.query(
                    func.coalesce(func.sum(Order.total_amount), 0)
                ).filter(
                    cast(Order.created_at, Date) == current,
                    Order.payment_status.in_(["paid", "completed"])
                ).scalar() or Decimal('0')
                
                daily_bookings_revenue = self.db.query(
                    func.coalesce(func.sum(WorkshopBooking.total_price), 0)
                ).filter(
                    cast(WorkshopBooking.created_at, Date) == current,
                    WorkshopBooking.payment_status.in_(["paid", "completed"])
                ).scalar() or Decimal('0')
            
            daily_total = float(daily_orders_revenue) + float(daily_bookings_revenue)
            
            breakdown.append({
                "date": str(current),
                "revenue": round(daily_total, 2),
                "orders_revenue": round(float(daily_orders_revenue), 2),
                "workshops_revenue": round(float(daily_bookings_revenue), 2)
            })
            
            current += timedelta(days=1)
        
        return breakdown
    
    async def get_artisan_stats(self) -> Dict[str, Any]:
        """Get comprehensive artisan statistics"""

        total_artisans = self.db.query(func.count(User.id)).filter(
            User.role == UserRole.ARTISAN
        ).scalar() or 0
        

        thirty_days_ago = datetime.now() - timedelta(days=30)
        

        artisans_with_orders = self.db.query(
            func.count(distinct(OrderItem.artisan_id))
        ).join(
            Order, Order.id == OrderItem.order_id
        ).filter(
            Order.created_at >= thirty_days_ago
        ).scalar() or 0
        

        artisans_with_bookings = self.db.query(
            func.count(distinct(Workshop.artisan_id))
        ).join(
            WorkshopBooking, WorkshopBooking.workshop_id == Workshop.id
        ).filter(
            WorkshopBooking.created_at >= thirty_days_ago
        ).scalar() or 0
        

        active_artisans = max(artisans_with_orders, artisans_with_bookings)
        

        pending_approval = self.db.query(func.count(User.id)).join(
            ArtisanProfile, ArtisanProfile.user_id == User.id
        ).filter(
            User.role == UserRole.ARTISAN,
            ArtisanProfile.status == ProfileStatus.PENDING_APPROVAL
        ).scalar() or 0
        

        by_specialty = self.db.query(
            ArtisanProfile.main_specialty,
            func.count(User.id).label('count')
        ).join(
            User, User.id == ArtisanProfile.user_id
        ).filter(
            User.role == UserRole.ARTISAN,
            ArtisanProfile.main_specialty.isnot(None)
        ).group_by(ArtisanProfile.main_specialty).order_by(
            func.count(User.id).desc()
        ).limit(5).all()
        
        specialty_stats = []
        for specialty, count in by_specialty:
            if specialty:
                specialty_stats.append({"specialty": specialty, "count": count})
        

        by_region = self.db.query(
            ArtisanProfile.region,
            func.count(User.id).label('count')
        ).join(
            User, User.id == ArtisanProfile.user_id
        ).filter(
            User.role == UserRole.ARTISAN,
            ArtisanProfile.region.isnot(None)
        ).group_by(ArtisanProfile.region).order_by(
            func.count(User.id).desc()
        ).limit(5).all()
        
        region_stats = [{"region": region, "count": count} for region, count in by_region if region]
        

        first_day_of_month = datetime.now().replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        new_this_month = self.db.query(func.count(User.id)).filter(
            User.role == UserRole.ARTISAN,
            User.created_at >= first_day_of_month
        ).scalar() or 0
        

        top_performers = self._get_top_artisans_by_sales(limit=10)
        
        return {
            "total_artisans": total_artisans,
            "active_artisans": active_artisans,
            "pending_approval": pending_approval,
            "by_specialty": specialty_stats,
            "by_region": region_stats,
            "new_this_month": new_this_month,
            "top_performers": top_performers
        }
    
    def _get_top_artisans_by_sales(self, limit: int = 10) -> List[Dict[str, Any]]:
        """Get top artisans ranked by sales revenue"""
        artisan_revenues = {}
        

        product_sales = self.db.query(
            OrderItem.artisan_id,
            func.sum(OrderItem.total_price).label('revenue')
        ).join(
            Order, Order.id == OrderItem.order_id
        ).filter(
            Order.payment_status.in_(["paid", "completed"])
        ).group_by(OrderItem.artisan_id).all()
        

        for artisan_id, revenue in product_sales:
            artisan_revenues[artisan_id] = float(revenue or 0)
        

        workshop_sales = self.db.query(
            Workshop.artisan_id,
            func.sum(WorkshopBooking.total_price).label('revenue')
        ).join(
            WorkshopBooking, WorkshopBooking.workshop_id == Workshop.id
        ).filter(
            WorkshopBooking.payment_status.in_(["paid", "completed"])
        ).group_by(Workshop.artisan_id).all()
        

        for artisan_id, revenue in workshop_sales:
            if artisan_id in artisan_revenues:
                artisan_revenues[artisan_id] += float(revenue or 0)
            else:
                artisan_revenues[artisan_id] = float(revenue or 0)
        

        sorted_artisans = sorted(
            artisan_revenues.items(),
            key=lambda x: x[1],
            reverse=True
        )[:limit]
        

        top_performers = []
        for artisan_id, revenue in sorted_artisans:
            artisan = self.db.query(User).filter(User.id == artisan_id).first()
            if artisan:
                top_performers.append({
                    "artisan_id": str(artisan.id),
                    "artisan_name": artisan.name,
                    "total_revenue": round(revenue, 2),
                    "email": artisan.email
                })
        
        return top_performers
    
    async def get_conversion_stats(self) -> Dict[str, Any]:
        """
        Get conversion rate statistics.
        Note: This requires view/click tracking which might not be fully implemented yet.
        Returns estimated/placeholder values where tracking is not available.
        """

        total_products = self.db.query(func.count(Product.id)).filter(
            Product.status == "published"
        ).scalar() or 0
        
        products_with_views = self.db.query(func.count(Product.id)).filter(
            Product.status == "published",
            Product.view_count > 0
        ).scalar() or 0
        
        products_with_sales = self.db.query(func.count(distinct(OrderItem.product_id))).scalar() or 0
        

        total_workshops = self.db.query(func.count(Workshop.id)).filter(
            Workshop.status == "published"
        ).scalar() or 0
        
        workshops_with_bookings = self.db.query(
            func.count(distinct(WorkshopBooking.workshop_id))
        ).scalar() or 0
        

        product_view_to_sale_rate = (
            (products_with_sales / products_with_views * 100)
            if products_with_views > 0 else 0
        )
        
        workshop_to_booking_rate = (
            (workshops_with_bookings / total_workshops * 100)
            if total_workshops > 0 else 0
        )
        

        total_users = self.db.query(func.count(User.id)).filter(
            User.role == UserRole.BUYER
        ).scalar() or 0
        
        users_with_orders = self.db.query(func.count(distinct(Order.user_id))).scalar() or 0
        
        visitor_to_buyer_rate = (
            (users_with_orders / total_users * 100)
            if total_users > 0 else 0
        )
        
        return {
            "product_view_to_sale_rate": round(product_view_to_sale_rate, 2),
            "workshop_to_booking_rate": round(workshop_to_booking_rate, 2),
            "visitor_to_buyer_conversion": round(visitor_to_buyer_rate, 2),
            "products_with_sales": products_with_sales,
            "products_with_views": products_with_views,
            "workshops_with_bookings": workshops_with_bookings,
            "users_with_orders": users_with_orders
        }
    
    async def get_user_behavior_stats(self) -> Dict[str, Any]:
        """Get user behavior and engagement statistics"""

        total_revenue = self.db.query(
            func.coalesce(func.sum(Order.total_amount), 0)
        ).filter(
            Order.payment_status.in_(["paid", "completed"])
        ).scalar() or Decimal('0')
        
        total_orders = self.db.query(func.count(Order.id)).filter(
            Order.payment_status.in_(["paid", "completed"])
        ).scalar() or 0
        
        avg_order_value = float(total_revenue) / total_orders if total_orders > 0 else 0
        

        total_items = self.db.query(
            func.coalesce(func.sum(OrderItem.quantity), 0)
        ).join(
            Order, Order.id == OrderItem.order_id
        ).filter(
            Order.payment_status.in_(["paid", "completed"])
        ).scalar() or 0
        
        avg_cart_size = total_items / total_orders if total_orders > 0 else 0
        

        repeat_customers = self.db.query(Order.user_id).filter(
            Order.payment_status.in_(["paid", "completed"])
        ).group_by(Order.user_id).having(
            func.count(Order.id) > 1
        ).count()
        
        total_customers = self.db.query(
            func.count(distinct(Order.user_id))
        ).filter(
            Order.payment_status.in_(["paid", "completed"])
        ).scalar() or 0
        
        repeat_customer_rate = (
            (repeat_customers / total_customers * 100)
            if total_customers > 0 else 0
        )
        

        payment_methods = self.db.query(
            Order.payment_status,
            func.count(Order.id).label('count')
        ).group_by(Order.payment_status).all()
        
        payment_stats = {method: count for method, count in payment_methods}
        
        return {
            "avg_order_value": round(avg_order_value, 2),
            "avg_cart_size": round(avg_cart_size, 2),
            "repeat_customers_rate": round(repeat_customer_rate, 2),
            "total_customers": total_customers,
            "repeat_customers": repeat_customers,
            "payment_method_stats": payment_stats
        }

async def get_analytics_service(db: Session = None) -> AdminAnalyticsService:
    """Get analytics service instance"""
    if db is None:
        db = next(get_db())
    return AdminAnalyticsService(db)
