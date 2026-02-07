"""
Endpoints pour la gestion des avis (reviews) de produits et ateliers
"""

from typing import Optional
from uuid import UUID
from fastapi import APIRouter, Depends, status, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.deps import get_db, get_current_active_user
from app.models.user import User
from app.services.review_service import ReviewService
from app.schemas.review import (
    ReviewCreate,
    ReviewUpdate,
    ReviewOut,
    PaginatedReviewsResponse,
    ReviewStatsOut,
    ReviewHelpfulVoteCreate,
)


router = APIRouter()


@router.post(
    "/products/{product_id}/reviews",
    response_model=ReviewOut,
    status_code=status.HTTP_201_CREATED,
    summary="Créer un avis sur un produit",
)
async def create_product_review(
    product_id: UUID,
    data: ReviewCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """
    Créer un nouvel avis sur un produit.
    
    - **product_id**: ID du produit
    - **order_id**: ID de la commande (optionnel, pour verified purchase)
    - **rating**: Note de 1 à 5
    - **title**: Titre de l'avis (3-200 caractères)
    - **comment**: Commentaire (10-2000 caractères)
    - **images**: URLs des images (optionnel)
    
    L'utilisateur ne peut laisser qu'un seul avis par produit.
    """
    # Forcer reviewable_type = product et reviewable_id = product_id
    data.reviewable_type = "product"
    data.reviewable_id = product_id

    service = ReviewService(db)
    return await service.create_review(
        user_id=current_user.id, data=data
    )


@router.get(
    "/products/{product_id}/reviews",
    response_model=PaginatedReviewsResponse,
    summary="Lister les avis d'un produit",
)
async def get_product_reviews(
    product_id: UUID,
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    rating_filter: Optional[int] = Query(None, ge=1, le=5),
    verified_only: bool = Query(False),
    db: AsyncSession = Depends(get_db),
):
    """
    Liste les avis publiés d'un produit avec pagination.
    
    - **page**: Numéro de page (défaut: 1)
    - **page_size**: Taille de page (défaut: 20, max: 100)
    - **rating_filter**: Filtrer par note spécifique (1-5)
    - **verified_only**: Ne retourner que les achats vérifiés
    
    Retourne aussi les statistiques (average_rating, distribution).
    """
    service = ReviewService(db)
    return await service.get_product_reviews(
        reviewable_id=product_id,
        reviewable_type="product",
        page=page,
        page_size=page_size,
        rating_filter=rating_filter,
        verified_only=verified_only,
    )


@router.get(
    "/products/{product_id}/reviews/stats",
    response_model=ReviewStatsOut,
    summary="Statistiques des avis d'un produit",
)
async def get_product_review_stats(
    product_id: UUID,
    db: AsyncSession = Depends(get_db),
):
    """
    Récupère les statistiques complètes des avis d'un produit.
    
    - **total_reviews**: Nombre total d'avis
    - **average_rating**: Note moyenne (0-5)
    - **rating_distribution**: Répartition par note (1-5 étoiles)
    - **verified_purchases**: Nombre d'achats vérifiés
    - **with_images**: Nombre d'avis avec photos
    - **with_videos**: Nombre d'avis avec vidéos
    """
    service = ReviewService(db)
    return await service.get_review_stats(
        reviewable_id=product_id, reviewable_type="product"
    )


@router.get(
    "/reviews/{review_id}",
    response_model=ReviewOut,
    summary="Détails d'un avis",
)
async def get_review(
    review_id: UUID,
    db: AsyncSession = Depends(get_db),
):
    """
    Récupère les détails d'un avis spécifique.
    """
    service = ReviewService(db)
    return await service.get_review(review_id=review_id)


@router.patch(
    "/reviews/{review_id}",
    response_model=ReviewOut,
    summary="Modifier un avis",
)
async def update_review(
    review_id: UUID,
    data: ReviewUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """
    Modifie un avis existant.
    
    L'utilisateur ne peut modifier que ses propres avis.
    Tous les champs sont optionnels.
    """
    service = ReviewService(db)
    return await service.update_review(
        review_id=review_id, user_id=current_user.id, data=data
    )


@router.delete(
    "/reviews/{review_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Supprimer un avis",
)
async def delete_review(
    review_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """
    Supprime un avis.
    
    L'utilisateur ne peut supprimer que ses propres avis.
    Le average_rating du produit sera automatiquement recalculé.
    """
    service = ReviewService(db)
    await service.delete_review(
        review_id=review_id, user_id=current_user.id
    )


@router.post(
    "/reviews/{review_id}/helpful",
    response_model=dict,
    summary="Voter pour un avis utile",
)
async def vote_review_helpful(
    review_id: UUID,
    data: ReviewHelpfulVoteCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """
    Vote pour indiquer si un avis est utile ou non.
    
    - **is_helpful**: true si utile, false sinon
    
    Un utilisateur peut voter une seule fois par avis.
    Le vote peut être modifié.
    """
    service = ReviewService(db)
    return await service.vote_helpful(
        review_id=review_id, user_id=current_user.id, data=data
    ) 