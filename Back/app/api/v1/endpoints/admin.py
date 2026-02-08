from fastapi import APIRouter, Depends, Query, Body, HTTPException, status
from sqlalchemy.orm import Session
from typing import Optional
from uuid import UUID

from app.core.database import get_db
from app.core.dependencies import get_current_admin
from app.models.user import User
from app.schemas.admin import (
    ValidationRequest,
    PendingValidationsResponse,
    ValidationStatsOut,
    ArtisanProfileValidationOut,
    ProductValidationOut,
    WorkshopValidationOut
)
from app.services.admin_validation_service import AdminValidationService

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


@router.get("/")
async def get_admin_dashboard():
    return {"message": "Admin dashboard"}
 