"""
Schémas Pydantic pour les statistiques et analytics
"""
from pydantic import BaseModel, Field
from typing import Optional, List
from uuid import UUID
from datetime import datetime, date
from decimal import Decimal

class ArtisanStatsOut(BaseModel):
    """
    Statistiques complètes d'un artisan.
    Utilisé pour le dashboard artisan.
    """
    artisan_id: UUID
    total_products: int = 0
    total_sales: int = 0
    total_revenue: Decimal = Decimal("0.00")
    total_workshops: int = 0
    total_bookings: int = 0
    average_rating: Decimal = Decimal("0.00")
    total_reviews: int = 0
    last_updated: Optional[datetime] = None
    
    class Config:
        from_attributes = True

class DashboardStatsOut(BaseModel):
    """
    Statistiques pour le dashboard artisan (vue d'ensemble).
    Comprend les stats récentes + tendances.
    """

    total_products: int = 0
    active_products: int = 0
    total_workshops: int = 0
    

    total_sales: int = 0
    total_revenue: Decimal = Decimal("0.00")
    pending_orders: int = 0
    in_production_orders: int = 0
    

    monthly_sales: int = 0
    monthly_revenue: Decimal = Decimal("0.00")
    

    weekly_sales: int = 0
    weekly_revenue: Decimal = Decimal("0.00")
    

    average_rating: Decimal = Decimal("0.00")
    total_reviews: int = 0
    

    sales_trend: str = "neutral"
    revenue_trend: str = "neutral"
    
    class Config:
        from_attributes = True

class SalesChartData(BaseModel):
    """
    Données pour les graphiques de ventes.
    """
    date: date
    sales_count: int = 0
    revenue: Decimal = Decimal("0.00")
    
    class Config:
        from_attributes = True

class TopProduct(BaseModel):
    """
    Produit le plus vendu.
    """
    product_id: UUID
    title: str
    sales_count: int
    revenue: Decimal
    image_url: Optional[str] = None
    
    class Config:
        from_attributes = True

class RecentOrder(BaseModel):
    """
    Commande récente (résumé pour dashboard).
    """
    order_id: UUID
    order_number: str
    buyer_name: str
    total_amount: Decimal
    status: str
    created_at: datetime
    items_count: int = 1
    
    class Config:
        from_attributes = True

class MonthlyRevenue(BaseModel):
    """
    Revenu mensuel.
    """
    month: str
    revenue: Decimal
    sales_count: int
    
    class Config:
        from_attributes = True

class ArtisanDashboardData(BaseModel):
    """
    Toutes les données nécessaires pour le dashboard artisan.
    Agrège tous les stats, graphiques, etc.
    """
    stats: DashboardStatsOut
    recent_orders: List[RecentOrder] = []
    top_products: List[TopProduct] = []
    sales_chart: List[SalesChartData] = []
    monthly_revenues: List[MonthlyRevenue] = []
    
    class Config:
        from_attributes = True

class AnalyticsEventCreate(BaseModel):
    """
    Schéma pour créer un événement analytics.
    """
    event_type: str = Field(..., max_length=50)
    event_category: Optional[str] = Field(None, max_length=30)
    event_action: Optional[str] = Field(None, max_length=50)
    event_label: Optional[str] = Field(None, max_length=100)
    event_value: Optional[Decimal] = None
    properties: Optional[dict] = None
    page_url: Optional[str] = Field(None, max_length=500)
    referrer_url: Optional[str] = Field(None, max_length=500)
    
    class Config:
        from_attributes = True

class DailyStatsOut(BaseModel):
    """
    Statistiques quotidiennes globales de la plateforme.
    """
    date: date
    total_users: int = 0
    active_users: int = 0
    new_users: int = 0
    total_orders: int = 0
    total_revenue: Decimal = Decimal("0.00")
    total_products: int = 0
    total_workshops: int = 0
    page_views: int = 0
    unique_visitors: int = 0
    conversion_rate: Decimal = Decimal("0.00")
    average_order_value: Decimal = Decimal("0.00")
    
    class Config:
        from_attributes = True

class StatsDateRange(BaseModel):
    """
    Filtre de période pour les statistiques.
    """
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    period: Optional[str] = Field(
        "month",
        description="Période: day, week, month, year, all"
    )
    
    class Config:
        from_attributes = True
