from fastapi import APIRouter, Depends, Query, Body, HTTPException, status
from sqlalchemy.orm import Session
from typing import Optional
from uuid import UUID
from datetime import date

from app.core.database import get_db
from app.core.dependencies import get_current_admin
from app.models.user import User
from app.schemas.admin import (
    ValidationRequest,
    PendingValidationsResponse,
    ValidationStatsOut,
    ArtisanProfileValidationOut,
    ProductValidationOut,
    WorkshopValidationOut,
    PlatformOverviewOut,
    RevenueStatsOut,
    ArtisanStatsOut,
    ConversionStatsOut,
    UserBehaviorStatsOut
)
from app.services.admin_validation_service import AdminValidationService
from app.services.admin_analytics_service import AdminAnalyticsService

router = APIRouter()


# ===== VALIDATION ENDPOINTS =====

@router.get(
    "/validations/pending",
    response_model=PendingValidationsResponse,
    summary="Liste des validations en attente",
    description="Récupère tous les contenus en attente de validation (profils, produits, ateliers)"
)
async def get_pending_validations(
    validation_type: Optional[str] = Query(None, description="Type de validation: profile/product/workshop/all"),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """
    Liste tous les contenus en attente de validation.
    Nécessite les permissions admin.
    """
    return await AdminValidationService.get_pending_validations(
        db=db,
        validation_type=validation_type,
        skip=skip,
        limit=limit
    )


@router.post(
    "/validations/artisan/{artisan_id}",
    response_model=dict,
    summary="Valider profil artisan",
    description="Approuver ou rejeter un profil artisan"
)
async def validate_artisan_profile(
    artisan_id: UUID,
    validation_request: ValidationRequest,
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """
    Approuver ou rejeter un profil artisan.
    
    - **action**: approve ou reject
    - **notes**: Notes optionnelles de l'administrateur
    """
    user = await AdminValidationService.validate_artisan_profile(
        db=db,
        artisan_id=artisan_id,
        action=validation_request.action,
        admin_id=current_admin.id,
        notes=validation_request.notes
    )
    
    return {
        "message": f"Profil artisan {'approuvé' if validation_request.action.value == 'approve' else 'rejeté'} avec succès",
        "artisan_id": str(user.id),
        "status": user.artisan_profile.status.value if user.artisan_profile else None
    }


@router.post(
    "/validations/product/{product_id}",
    response_model=dict,
    summary="Valider produit",
    description="Approuver ou rejeter un produit"
)
async def validate_product(
    product_id: UUID,
    validation_request: ValidationRequest,
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """
    Approuver ou rejeter un produit.
    
    - **action**: approve ou reject
    - **notes**: Notes optionnelles de l'administrateur
    """
    product = await AdminValidationService.validate_product(
        db=db,
        product_id=product_id,
        action=validation_request.action,
        admin_id=current_admin.id,
        notes=validation_request.notes
    )
    
    return {
        "message": f"Produit {'approuvé' if validation_request.action.value == 'approve' else 'rejeté'} avec succès",
        "product_id": str(product.id),
        "status": product.status
    }


@router.post(
    "/validations/workshop/{workshop_id}",
    response_model=dict,
    summary="Valider atelier",
    description="Approuver ou rejeter un atelier"
)
async def validate_workshop(
    workshop_id: UUID,
    validation_request: ValidationRequest,
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """
    Approuver ou rejeter un atelier.
    
    - **action**: approve ou reject
    - **notes**: Notes optionnelles de l'administrateur
    """
    workshop = await AdminValidationService.validate_workshop(
        db=db,
        workshop_id=workshop_id,
        action=validation_request.action,
        admin_id=current_admin.id,
        notes=validation_request.notes
    )
    
    return {
        "message": f"Atelier {'approuvé' if validation_request.action.value == 'approve' else 'rejeté'} avec succès",
        "workshop_id": str(workshop.id),
        "status": workshop.status
    }


@router.get(
    "/validations/stats",
    response_model=ValidationStatsOut,
    summary="Statistiques de validation",
    description="Récupère les statistiques des validations"
)
async def get_validation_stats(
    period: str = Query("month", description="Période: day/week/month/all"),
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """
    Récupère les statistiques de validation sur une période donnée.
    
    Inclut:
    - Nombre total de validations
    - Taux d'approbation
    - Temps moyen de réponse
    - Statistiques par type (profil/produit/atelier)
    """
    return await AdminValidationService.get_validation_stats(
        db=db,
        period=period
    )


# ===== ANALYTICS ENDPOINTS =====

@router.get(
    "/analytics/overview",
    response_model=PlatformOverviewOut,
    summary="Vue d'ensemble de la plateforme",
    description="Récupère les statistiques générales de la plateforme"
)
async def get_platform_overview(
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """
    Récupère une vue d'ensemble complète de la plateforme.
    
    Inclut:
    - Nombre total d'utilisateurs (par rôle)
    - Statistiques artisans (actifs, en attente)
    - Statistiques produits et ateliers
    - Nombre de commandes et réservations
    - Validations en attente
    """
    analytics_service = AdminAnalyticsService(db)
    return await analytics_service.get_platform_overview()


@router.get(
    "/analytics/revenue",
    response_model=RevenueStatsOut,
    summary="Statistiques de revenus",
    description="Récupère les statistiques de revenus pour une période donnée"
)
async def get_revenue_stats(
    period: str = Query("month", description="Période: day/week/month/year/all"),
    start_date: Optional[date] = Query(None, description="Date de début personnalisée"),
    end_date: Optional[date] = Query(None, description="Date de fin personnalisée"),
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """
    Récupère les statistiques de revenus.
    
    Inclut:
    - Revenus totaux (produits + ateliers)
    - Commissions Artizaho
    - Répartition par catégorie
    - Évolution journalière (pour période week/month)
    """
    analytics_service = AdminAnalyticsService(db)
    return await analytics_service.get_revenue_stats(
        period=period,
        start_date=start_date,
        end_date=end_date
    )


@router.get(
    "/analytics/artisans",
    response_model=ArtisanStatsOut,
    summary="Statistiques artisans",
    description="Récupère les statistiques complètes sur les artisans"
)
async def get_artisan_stats(
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """
    Récupère les statistiques sur les artisans.
    
    Inclut:
    - Nombre total et actifs
    - Répartition par spécialité et région
    - Top performers (par ventes)
    - Nouveaux artisans ce mois
    """
    analytics_service = AdminAnalyticsService(db)
    return await analytics_service.get_artisan_stats()


@router.get(
    "/analytics/conversion",
    response_model=ConversionStatsOut,
    summary="Taux de conversion",
    description="Récupère les taux de conversion de la plateforme"
)
async def get_conversion_stats(
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """
    Récupère les taux de conversion.
    
    Inclut:
    - Taux vue → vente (produits)
    - Taux vue → réservation (ateliers)
    - Taux visiteur → acheteur
    """
    analytics_service = AdminAnalyticsService(db)
    return await analytics_service.get_conversion_stats()


@router.get(
    "/analytics/users",
    response_model=UserBehaviorStatsOut,
    summary="Comportement utilisateurs",
    description="Récupère les statistiques de comportement utilisateurs"
)
async def get_user_behavior_stats(
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """
    Récupère les statistiques de comportement utilisateurs.
    
    Inclut:
    - Panier moyen (AOV)
    - Nombre moyen d'articles par commande
    - Taux de clients récurrents
    - Méthodes de paiement préférées
    """
    analytics_service = AdminAnalyticsService(db)
    return await analytics_service.get_user_behavior_stats()


@router.get("/")
async def get_admin_dashboard():
    return {"message": "Admin dashboard"}
 