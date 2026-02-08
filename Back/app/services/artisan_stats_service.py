"""
Service pour calculer et récupérer les statistiques des artisans
"""
from typing import Optional, List
from uuid import UUID
from decimal import Decimal
from datetime import datetime, date, timedelta
from sqlalchemy.orm import Session
from sqlalchemy import and_, func, desc
from fastapi import HTTPException, status

from app.models.analytics import ArtisanStats
from app.models.order import Order, OrderItem
from app.models.product import Product
from app.models.workshop import Workshop
from app.models.review import Review
from app.models.user import User
from app.schemas.analytics import (
    ArtisanStatsOut,
    DashboardStatsOut,
    ArtisanDashboardData,
    SalesChartData,
    TopProduct,
    RecentOrder,
    MonthlyRevenue
)


class ArtisanStatsService:
    """Service pour gérer les statistiques artisan"""
    
    @staticmethod
    async def get_or_create_stats(
        db: Session,
        artisan_id: UUID
    ) -> ArtisanStats:
        """
        Récupère ou crée les stats d'un artisan.
        """
        stats = db.query(ArtisanStats).filter(
            ArtisanStats.artisan_id == artisan_id
        ).first()
        
        if not stats:
            stats = ArtisanStats(
                artisan_id=artisan_id,
                total_products=0,
                total_sales=0,
                total_revenue=Decimal("0.00"),
                total_workshops=0,
                total_bookings=0,
                average_rating=Decimal("0.00"),
                total_reviews=0,
                last_updated=datetime.utcnow()
            )
            db.add(stats)
            db.commit()
            db.refresh(stats)
        
        return stats
    
    @staticmethod
    async def refresh_artisan_stats(
        db: Session,
        artisan_id: UUID
    ) -> ArtisanStats:
        """
        Recalcule toutes les statistiques d'un artisan.
        """
        stats = await ArtisanStatsService.get_or_create_stats(db, artisan_id)
        
        # Total produits
        stats.total_products = db.query(Product).filter(
            Product.artisan_id == artisan_id,
            Product.status == "published"
        ).count()
        
        # Total ventes et revenu
        sales_data = db.query(
            func.count(OrderItem.id).label("count"),
            func.sum(OrderItem.artisan_payout).label("revenue")
        ).filter(
            OrderItem.artisan_id == artisan_id
        ).first()
        
        stats.total_sales = sales_data.count or 0
        stats.total_revenue = sales_data.revenue or Decimal("0.00")
        
        # Total ateliers
        stats.total_workshops = db.query(Workshop).filter(
            Workshop.artisan_id == artisan_id
        ).count()
        
        # Avis et notation
        reviews_data = db.query(
            func.count(Review.id).label("count"),
            func.avg(Review.rating).label("avg_rating")
        ).join(Product, Review.reviewable_id == Product.id).filter(
            and_(
                Review.reviewable_type == 'product',
                Product.artisan_id == artisan_id
            )
        ).first()
        
        stats.total_reviews = reviews_data.count or 0
        stats.average_rating = (
            Decimal(str(reviews_data.avg_rating)).quantize(Decimal("0.01"))
            if reviews_data.avg_rating else Decimal("0.00")
        )
        
        stats.last_updated = datetime.utcnow()
        
        db.commit()
        db.refresh(stats)
        
        return stats
    
    @staticmethod
    async def get_dashboard_stats(
        db: Session,
        artisan_id: UUID
    ) -> DashboardStatsOut:
        """
        Récupère les statistiques pour le dashboard artisan.
        """
        # Dates de référence
        today = date.today()
        start_of_week = today - timedelta(days=today.weekday())
        start_of_month = today.replace(day=1)
        
        # Stats générales
        total_products = db.query(Product).filter(
            Product.artisan_id == artisan_id
        ).count()
        
        active_products = db.query(Product).filter(
            and_(
                Product.artisan_id == artisan_id,
                Product.status == "published"
            )
        ).count()
        
        total_workshops = db.query(Workshop).filter(
            Workshop.artisan_id == artisan_id
        ).count()
        
        # Stats de ventes (total)
        total_sales_data = db.query(
            func.count(OrderItem.id).label("count"),
            func.sum(OrderItem.artisan_payout).label("revenue")
        ).filter(
            OrderItem.artisan_id == artisan_id
        ).first()
        
        total_sales = total_sales_data.count or 0
        total_revenue = total_sales_data.revenue or Decimal("0.00")
        
        # Commandes en attente et en production
        pending_orders = db.query(Order.id).join(OrderItem, Order.id == OrderItem.order_id).filter(
            and_(
                OrderItem.artisan_id == artisan_id,
                Order.status.in_(["pending", "confirmed"])
            )
        ).distinct().count()
        
        in_production_orders = db.query(Order.id).join(OrderItem, Order.id == OrderItem.order_id).filter(
            and_(
                OrderItem.artisan_id == artisan_id,
                Order.status == "in_production"
            )
        ).distinct().count()
        
        # Stats mensuelles
        monthly_sales_data = db.query(
            func.count(OrderItem.id).label("count"),
            func.sum(OrderItem.artisan_payout).label("revenue")
        ).join(Order, OrderItem.order_id == Order.id).filter(
            and_(
                OrderItem.artisan_id == artisan_id,
                func.date(Order.created_at) >= start_of_month
            )
        ).first()
        
        monthly_sales = monthly_sales_data.count or 0
        monthly_revenue = monthly_sales_data.revenue or Decimal("0.00")
        
        # Stats hebdomadaires
        weekly_sales_data = db.query(
            func.count(OrderItem.id).label("count"),
            func.sum(OrderItem.artisan_payout).label("revenue")
        ).join(Order, OrderItem.order_id == Order.id).filter(
            and_(
                OrderItem.artisan_id == artisan_id,
                func.date(Order.created_at) >= start_of_week
            )
        ).first()
        
        weekly_sales = weekly_sales_data.count or 0
        weekly_revenue = weekly_sales_data.revenue or Decimal("0.00")
        
        # Avis et notation
        reviews_data = db.query(
            func.count(Review.id).label("count"),
            func.avg(Review.rating).label("avg_rating")
        ).join(Product, Review.reviewable_id == Product.id).filter(
            and_(
                Review.reviewable_type == 'product',
                Product.artisan_id == artisan_id
            )
        ).first()
        
        total_reviews = reviews_data.count or 0
        average_rating = (
            Decimal(str(reviews_data.avg_rating)).quantize(Decimal("0.01"))
            if reviews_data.avg_rating else Decimal("0.00")
        )
        
        # Tendances (comparaison avec mois précédent)
        # TODO: implémenter logique comparative
        sales_trend = "neutral"
        revenue_trend = "neutral"
        
        return DashboardStatsOut(
            total_products=total_products,
            active_products=active_products,
            total_workshops=total_workshops,
            total_sales=total_sales,
            total_revenue=total_revenue,
            pending_orders=pending_orders,
            in_production_orders=in_production_orders,
            monthly_sales=monthly_sales,
            monthly_revenue=monthly_revenue,
            weekly_sales=weekly_sales,
            weekly_revenue=weekly_revenue,
            average_rating=average_rating,
            total_reviews=total_reviews,
            sales_trend=sales_trend,
            revenue_trend=revenue_trend
        )
    
    @staticmethod
    async def get_recent_orders(
        db: Session,
        artisan_id: UUID,
        limit: int = 5
    ) -> List[RecentOrder]:
        """
        Récupère les commandes récentes de l'artisan.
        """
        # Récupérer les order_ids où l'artisan a des items
        order_ids = db.query(OrderItem.order_id).filter(
            OrderItem.artisan_id == artisan_id
        ).distinct().subquery()
        
        orders = db.query(Order).filter(
            Order.id.in_(order_ids)
        ).order_by(desc(Order.created_at)).limit(limit).all()
        
        recent = []
        for order in orders:
            # Récupérer le nom de l'acheteur
            buyer = db.query(User).filter(User.id == order.user_id).first()
            buyer_name = buyer.name if buyer else "Client"
            
            # Compter les items de cet artisan
            items_count = db.query(OrderItem).filter(
                and_(
                    OrderItem.order_id == order.id,
                    OrderItem.artisan_id == artisan_id
                )
            ).count()
            
            recent.append(RecentOrder(
                order_id=order.id,
                order_number=order.order_number,
                buyer_name=buyer_name,
                total_amount=order.total_amount,
                status=order.status,
                created_at=order.created_at,
                items_count=items_count
            ))
        
        return recent
    
    @staticmethod
    async def get_top_products(
        db: Session,
        artisan_id: UUID,
        limit: int = 5
    ) -> List[TopProduct]:
        """
        Récupère les produits les plus vendus de l'artisan.
        """
        top = db.query(
            OrderItem.product_id,
            Product.title,
            func.count(OrderItem.id).label("sales_count"),
            func.sum(OrderItem.artisan_payout).label("revenue")
        ).join(Product, OrderItem.product_id == Product.id).filter(
            OrderItem.artisan_id == artisan_id
        ).group_by(
            OrderItem.product_id,
            Product.title
        ).order_by(
            desc("sales_count")
        ).limit(limit).all()
        
        result = []
        for item in top:
            result.append(TopProduct(
                product_id=item.product_id,
                title=item.title,
                sales_count=item.sales_count,
                revenue=item.revenue or Decimal("0.00"),
                image_url=None  # TODO: récupérer image principale
            ))
        
        return result
    
    @staticmethod
    async def get_sales_chart_data(
        db: Session,
        artisan_id: UUID,
        days: int = 30
    ) -> List[SalesChartData]:
        """
        Récupère les données de ventes pour graphique (X derniers jours).
        """
        start_date = date.today() - timedelta(days=days)
        
        chart_data = db.query(
            func.date(Order.created_at).label("date"),
            func.count(OrderItem.id).label("sales_count"),
            func.sum(OrderItem.artisan_payout).label("revenue")
        ).join(OrderItem, Order.id == OrderItem.order_id).filter(
            and_(
                OrderItem.artisan_id == artisan_id,
                func.date(Order.created_at) >= start_date
            )
        ).group_by(
            func.date(Order.created_at)
        ).order_by(
            "date"
        ).all()
        
        result = []
        for item in chart_data:
            result.append(SalesChartData(
                date=item.date,
                sales_count=item.sales_count,
                revenue=item.revenue or Decimal("0.00")
            ))
        
        return result
    
    @staticmethod
    async def get_monthly_revenues(
        db: Session,
        artisan_id: UUID,
        months: int = 12
    ) -> List[MonthlyRevenue]:
        """
        Récupère les revenus mensuels (X derniers mois).
        """
        # TODO: Implémenter logique pour extraire mois
        # Pour l'instant, retourner liste vide
        return []
    
    @staticmethod
    async def get_dashboard_data(
        db: Session,
        artisan_id: UUID
    ) -> ArtisanDashboardData:
        """
        Récupère toutes les données nécessaires pour le dashboard artisan.
        """
        stats = await ArtisanStatsService.get_dashboard_stats(db, artisan_id)
        recent_orders = await ArtisanStatsService.get_recent_orders(
            db, artisan_id, limit=5
        )
        top_products = await ArtisanStatsService.get_top_products(
            db, artisan_id, limit=5
        )
        sales_chart = await ArtisanStatsService.get_sales_chart_data(
            db, artisan_id, days=30
        )
        monthly_revenues = await ArtisanStatsService.get_monthly_revenues(
            db, artisan_id, months=12
        )
        
        return ArtisanDashboardData(
            stats=stats,
            recent_orders=recent_orders,
            top_products=top_products,
            sales_chart=sales_chart,
            monthly_revenues=monthly_revenues
        )
