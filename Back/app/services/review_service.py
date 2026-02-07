"""
Service de gestion des avis (reviews) de produits et ateliers
"""

from datetime import datetime
from typing import Optional
from uuid import UUID
from sqlalchemy import func, and_, or_, case
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from fastapi import HTTPException, status

from app.models.review import Review, ReviewHelpfulVote
from app.models.order import Order, OrderItem
from app.models.product import Product
from app.models.user import User
from app.schemas.review import (
    ReviewCreate,
    ReviewUpdate,
    ReviewOut,
    ReviewWithProductInfo,
    PaginatedReviewsResponse,
    ReviewStatsOut,
    ReviewHelpfulVoteCreate,
)


class ReviewService:
    """Service pour gérer les avis de produits et ateliers"""

    def __init__(self, db: AsyncSession):
        self.db = db

    async def _verify_purchase(
        self, user_id: UUID, reviewable_id: UUID, 
        reviewable_type: str, order_id: Optional[UUID] = None
    ) -> tuple[bool, Optional[UUID]]:
        """
        Vérifie si l'utilisateur a acheté le produit/atelier
        
        Returns:
            (is_verified, order_id)
        """
        if reviewable_type == "product":
            # Chercher une commande avec ce produit
            query = (
                select(Order.id)
                .join(OrderItem)
                .where(
                    and_(
                        Order.user_id == user_id,
                        OrderItem.product_id == reviewable_id,
                        Order.status.in_(["delivered", "completed"]),
                    )
                )
            )
            
            if order_id:
                query = query.where(Order.id == order_id)
            
            result = await self.db.execute(query.limit(1))
            found_order_id = result.scalar_one_or_none()
            
            return (found_order_id is not None, found_order_id)
        
        # Pour workshop, vérifier booking
        # TODO: Implement workshop booking verification
        return (False, None)

    async def _check_duplicate_review(
        self, user_id: UUID, reviewable_id: UUID, 
        reviewable_type: str
    ) -> bool:
        """Vérifie si l'utilisateur a déjà reviewé ce produit/workshop"""
        result = await self.db.execute(
            select(Review).where(
                and_(
                    Review.reviewer_id == user_id,
                    Review.reviewable_id == reviewable_id,
                    Review.reviewable_type == reviewable_type,
                )
            )
        )
        return result.scalar_one_or_none() is not None

    async def _update_product_average_rating(
        self, product_id: UUID
    ) -> None:
        """
        Recalcule et met à jour le average_rating d'un produit
        """
        result = await self.db.execute(
            select(func.avg(Review.rating))
            .where(
                and_(
                    Review.reviewable_id == product_id,
                    Review.reviewable_type == "product",
                    Review.status == "published",
                )
            )
        )
        avg_rating = result.scalar_one_or_none() or 0.0

        # Mettre à jour le produit
        product_result = await self.db.execute(
            select(Product).where(Product.id == product_id)
        )
        product = product_result.scalar_one_or_none()
        
        if product:
            product.average_rating = round(avg_rating, 2)
            await self.db.commit()

    def _enrich_review_with_user_info(
        self, review: Review, user: Optional[User] = None
    ) -> ReviewOut:
        """
        Enrichit un Review avec les infos utilisateur
        """
        review_out = ReviewOut.model_validate(review)
        
        if user:
            review_out.reviewer_name = user.full_name or user.email
            review_out.reviewer_avatar = user.avatar_url
        
        return review_out

    async def create_review(
        self, user_id: UUID, data: ReviewCreate
    ) -> ReviewOut:
        """
        Crée un nouvel avis
        
        Args:
            user_id: ID de l'utilisateur
            data: Données de l'avis
            
        Returns:
            Avis créé
            
        Raises:
            HTTPException 400: Duplicate review ou achat non vérifié
        """
        # Vérifier duplicate
        has_duplicate = await self._check_duplicate_review(
            user_id, data.reviewable_id, data.reviewable_type.value
        )
        if has_duplicate:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=(
                    "You have already reviewed this "
                    f"{data.reviewable_type.value}"
                ),
            )

        # Vérifier achat (verified purchase)
        is_verified, verified_order_id = await self._verify_purchase(
            user_id,
            data.reviewable_id,
            data.reviewable_type.value,
            data.order_id,
        )

        # Si order_id fourni mais pas vérifié, erreur
        if data.order_id and not is_verified:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Order not found or not completed",
            )

        # Créer la review
        review = Review(
            reviewer_id=user_id,
            reviewable_type=data.reviewable_type.value,
            reviewable_id=data.reviewable_id,
            order_id=verified_order_id or data.order_id,
            booking_id=data.booking_id,
            rating=data.rating,
            title=data.title,
            comment=data.comment,
            criteria_ratings=data.criteria_ratings,
            images=data.images or [],
            videos=data.videos or [],
            status="published",
            is_verified_purchase=is_verified,
        )

        self.db.add(review)
        await self.db.commit()
        await self.db.refresh(review)

        # Recalculer average_rating du produit/workshop
        if data.reviewable_type.value == "product":
            await self._update_product_average_rating(data.reviewable_id)

        # Récupérer l'utilisateur pour enrichir
        user_result = await self.db.execute(
            select(User).where(User.id == user_id)
        )
        user = user_result.scalar_one_or_none()

        return self._enrich_review_with_user_info(review, user)

    async def get_review(
        self, review_id: UUID
    ) -> ReviewOut:
        """
        Récupère un avis par son ID
        
        Args:
            review_id: ID de l'avis
            
        Returns:
            Avis trouvé
            
        Raises:
            HTTPException 404: Avis introuvable
        """
        result = await self.db.execute(
            select(Review, User)
            .join(User, Review.reviewer_id == User.id)
            .where(Review.id == review_id)
        )
        row = result.one_or_none()

        if not row:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Review not found",
            )

        review, user = row
        return self._enrich_review_with_user_info(review, user)

    async def get_product_reviews(
        self,
        reviewable_id: UUID,
        reviewable_type: str = "product",
        page: int = 1,
        page_size: int = 20,
        rating_filter: Optional[int] = None,
        verified_only: bool = False,
    ) -> PaginatedReviewsResponse:
        """
        Liste les avis d'un produit/workshop avec pagination
        
        Args:
            reviewable_id: ID du produit/workshop
            reviewable_type: Type (product/workshop)
            page: Numéro de page (1-based)
            page_size: Taille de page
            rating_filter: Filtrer par note spécifique (1-5)
            verified_only: Ne retourner que les achats vérifiés
            
        Returns:
            Liste paginée d'avis avec stats
        """
        # Query de base
        query = (
            select(Review, User)
            .join(User, Review.reviewer_id == User.id)
            .where(
                and_(
                    Review.reviewable_id == reviewable_id,
                    Review.reviewable_type == reviewable_type,
                    Review.status == "published",
                )
            )
        )

        # Filtres optionnels
        if rating_filter:
            query = query.where(Review.rating == rating_filter)

        if verified_only:
            query = query.where(Review.is_verified_purchase == True)

        # Tri par date décroissante (plus récents en premier)
        query = query.order_by(Review.created_at.desc())

        # Compter le total
        count_query = select(func.count()).select_from(
            query.subquery()
        )
        total_result = await self.db.execute(count_query)
        total = total_result.scalar() or 0

        # Pagination
        offset = (page - 1) * page_size
        query = query.offset(offset).limit(page_size)

        result = await self.db.execute(query)
        rows = result.all()

        items = [
            self._enrich_review_with_user_info(review, user)
            for review, user in rows
        ]

        # Calculer stats (average rating et distribution)
        stats = await self.get_review_stats(
            reviewable_id, reviewable_type
        )

        total_pages = (total + page_size - 1) // page_size

        return PaginatedReviewsResponse(
            items=items,
            total=total,
            page=page,
            page_size=page_size,
            total_pages=total_pages,
            average_rating=stats.average_rating,
            rating_distribution=stats.rating_distribution,
        )

    async def get_review_stats(
        self, reviewable_id: UUID, reviewable_type: str = "product"
    ) -> ReviewStatsOut:
        """
        Statistiques des avis pour un produit/workshop
        
        Args:
            reviewable_id: ID du produit/workshop
            reviewable_type: Type (product/workshop)
            
        Returns:
            Statistiques complètes
        """
        base_filter = and_(
            Review.reviewable_id == reviewable_id,
            Review.reviewable_type == reviewable_type,
            Review.status == "published",
        )

        # Total reviews et average rating
        stats_result = await self.db.execute(
            select(
                func.count(Review.id).label("total"),
                func.avg(Review.rating).label("avg_rating"),
                func.sum(
                    case((Review.is_verified_purchase == True, 1), else_=0)
                ).label("verified"),
                func.sum(
                    case(
                        (
                            func.cardinality(Review.images) > 0, 1
                        ), else_=0
                    )
                ).label("with_images"),
                func.sum(
                    case(
                        (
                            func.cardinality(Review.videos) > 0, 1
                        ), else_=0
                    )
                ).label("with_videos"),
            ).where(base_filter)
        )
        stats_row = stats_result.one()

        # Distribution par note (1-5 étoiles)
        distribution_result = await self.db.execute(
            select(
                Review.rating, func.count(Review.id).label("count")
            )
            .where(base_filter)
            .group_by(Review.rating)
        )
        distribution_rows = distribution_result.all()

        rating_distribution = {i: 0 for i in range(1, 6)}
        for row in distribution_rows:
            rating_distribution[row.rating] = row.count

        return ReviewStatsOut(
            total_reviews=stats_row.total or 0,
            average_rating=round(stats_row.avg_rating or 0.0, 2),
            rating_distribution=rating_distribution,
            verified_purchases=stats_row.verified or 0,
            with_images=stats_row.with_images or 0,
            with_videos=stats_row.with_videos or 0,
        )

    async def update_review(
        self, review_id: UUID, user_id: UUID, data: ReviewUpdate
    ) -> ReviewOut:
        """
        Met à jour un avis existant
        
        Args:
            review_id: ID de l'avis
            user_id: ID de l'utilisateur (pour vérifier ownership)
            data: Données de mise à jour
            
        Returns:
            Avis mis à jour
            
        Raises:
            HTTPException 404: Avis introuvable
            HTTPException 403: Pas le propriétaire
        """
        result = await self.db.execute(
            select(Review).where(Review.id == review_id)
        )
        review = result.scalar_one_or_none()

        if not review:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Review not found",
            )

        if review.reviewer_id != user_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You can only edit your own reviews",
            )

        # Appliquer les modifications
        update_data = data.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(review, field, value)

        review.updated_at = datetime.utcnow()

        await self.db.commit()
        await self.db.refresh(review)

        # Recalculer average_rating si rating changé
        if data.rating is not None and review.reviewable_type == "product":
            await self._update_product_average_rating(
                review.reviewable_id
            )

        user_result = await self.db.execute(
            select(User).where(User.id == user_id)
        )
        user = user_result.scalar_one_or_none()

        return self._enrich_review_with_user_info(review, user)

    async def delete_review(
        self, review_id: UUID, user_id: UUID
    ) -> None:
        """
        Supprime un avis
        
        Args:
            review_id: ID de l'avis
            user_id: ID de l'utilisateur
            
        Raises:
            HTTPException 404: Avis introuvable
            HTTPException 403: Pas le propriétaire
        """
        result = await self.db.execute(
            select(Review).where(Review.id == review_id)
        )
        review = result.scalar_one_or_none()

        if not review:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Review not found",
            )

        if review.reviewer_id != user_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You can only delete your own reviews",
            )

        reviewable_id = review.reviewable_id
        reviewable_type = review.reviewable_type

        await self.db.delete(review)
        await self.db.commit()

        # Recalculer average_rating
        if reviewable_type == "product":
            await self._update_product_average_rating(reviewable_id)

    async def vote_helpful(
        self, review_id: UUID, user_id: UUID, 
        data: ReviewHelpfulVoteCreate
    ) -> dict:
        """
        Voter pour un avis (helpful/not helpful)
        
        Args:
            review_id: ID de l'avis
            user_id: ID de l'utilisateur
            data: Vote (is_helpful: bool)
            
        Returns:
            Message de confirmation
        """
        # Vérifier que la review existe
        review_result = await self.db.execute(
            select(Review).where(Review.id == review_id)
        )
        review = review_result.scalar_one_or_none()

        if not review:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Review not found",
            )

        # Vérifier si déjà voté
        vote_result = await self.db.execute(
            select(ReviewHelpfulVote).where(
                and_(
                    ReviewHelpfulVote.review_id == review_id,
                    ReviewHelpfulVote.user_id == user_id,
                )
            )
        )
        existing_vote = vote_result.scalar_one_or_none()

        if existing_vote:
            # Mettre à jour le vote existant
            old_is_helpful = existing_vote.is_helpful
            existing_vote.is_helpful = data.is_helpful

            # Ajuster helpful_count
            if old_is_helpful and not data.is_helpful:
                review.helpful_count = max(0, review.helpful_count - 1)
            elif not old_is_helpful and data.is_helpful:
                review.helpful_count += 1
        else:
            # Créer un nouveau vote
            vote = ReviewHelpfulVote(
                review_id=review_id,
                user_id=user_id,
                is_helpful=data.is_helpful,
            )
            self.db.add(vote)

            # Incrémenter helpful_count si is_helpful
            if data.is_helpful:
                review.helpful_count += 1

        await self.db.commit()

        return {
            "message": "Vote recorded successfully",
            "helpful_count": review.helpful_count,
        }
