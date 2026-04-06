"""
Endpoints pour les statistiques et analytics
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import Optional

from app.core.database import get_db
from app.api.deps import get_current_active_user
from app.models.user import User, UserRole
from app.schemas.analytics import (
    ArtisanStatsOut,
    DashboardStatsOut,
    ArtisanDashboardData
)
from app.services.artisan_stats_service import ArtisanStatsService

router = APIRouter()

@router.get("/artisan/dashboard", response_model=ArtisanDashboardData)
async def get_artisan_dashboard(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Récupère toutes les données pour le dashboard artisan.
    
    Inclut:
    - Statistiques générales (ventes, revenus, produits, etc.)
    - Commandes récentes (5 dernières)
    - Produits les plus vendus (top 5)
    - Graphique de ventes (30 derniers jours)
    - Revenus mensuels (12 derniers mois)
    
    Accessible uniquement aux artisans.
    """
    if current_user.role != UserRole.ARTISAN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Réservé aux artisans"
        )
    
    dashboard_data = await ArtisanStatsService.get_dashboard_data(
        db, current_user.id
    )
    
    return dashboard_data

@router.get("/artisan/stats", response_model=DashboardStatsOut)
async def get_artisan_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Récupère les statistiques détaillées d'un artisan.
    
    Inclut:
    - Total produits (actifs/inactifs)
    - Total ventes et revenu (all-time)
    - Stats mensuelles et hebdomadaires
    - Commandes en attente/production
    - Note moyenne et avis
    - Tendances
    
    Accessible uniquement aux artisans.
    """
    if current_user.role != UserRole.ARTISAN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Réservé aux artisans"
        )
    
    stats = await ArtisanStatsService.get_dashboard_stats(
        db, current_user.id
    )
    
    return stats

@router.post("/artisan/refresh", response_model=ArtisanStatsOut)
async def refresh_artisan_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Recalcule et met à jour les statistiques de l'artisan.
    
    Utilisé pour forcer un refresh des stats (par exemple après
    une mise à jour de produit ou commande).
    
    Accessible uniquement aux artisans.
    """
    if current_user.role != UserRole.ARTISAN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Réservé aux artisans"
        )
    
    stats = await ArtisanStatsService.refresh_artisan_stats(
        db, current_user.id
    )
    
    return ArtisanStatsOut(
        artisan_id=stats.artisan_id,
        total_products=stats.total_products,
        total_sales=stats.total_sales,
        total_revenue=stats.total_revenue,
        total_workshops=stats.total_workshops,
        total_bookings=stats.total_bookings,
        average_rating=stats.average_rating,
        total_reviews=stats.total_reviews,
        last_updated=stats.last_updated
    )
 