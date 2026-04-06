from sqlalchemy.orm import Session
from sqlalchemy import and_, func, or_
from typing import Optional, List, Dict
from datetime import datetime, timedelta
from uuid import UUID
import logging

from app.models.user import User, ArtisanProfile, UserRole, ProfileStatus
from app.models.product import Product
from app.models.workshop import Workshop
from app.models.validation import ArtisanValidation, ValidationType, ValidationStatus
from app.schemas.admin import (
    PendingValidationItem,
    PendingValidationsResponse,
    ValidationStatsOut,
    ValidationAction
)
from fastapi import HTTPException, status

logger = logging.getLogger(__name__)

class AdminValidationService:
    """Service pour gérer les validations admin"""
    
    @staticmethod
    async def get_pending_validations(
        db: Session,
        validation_type: Optional[str] = None,
        skip: int = 0,
        limit: int = 50
    ) -> PendingValidationsResponse:
        """
        Récupère tous les contenus en attente de validation
        
        Args:
            db: Session DB
            validation_type: Type de validation (profile/product/workshop/all)
            skip: Nombre d'items à sauter
            limit: Limite d'items à retourner
        
        Returns:
            PendingValidationsResponse avec la liste des items
        """
        items = []
        count_by_type = {
            "profile": 0,
            "product": 0,
            "workshop": 0
        }
        

        if validation_type in [None, "all", "profile"]:
            profiles_query = db.query(ArtisanProfile, User).join(
                User, ArtisanProfile.user_id == User.id
            ).filter(
                ArtisanProfile.status == ProfileStatus.PENDING_APPROVAL
            )
            
            profiles = profiles_query.all()
            count_by_type["profile"] = len(profiles)
            
            for profile, user in profiles:
                items.append(PendingValidationItem(
                    id=profile.id,
                    type=ValidationType.PROFILE,
                    entity_id=profile.id,
                    artisan_id=user.id,
                    artisan_name=user.name,
                    artisan_email=user.email,
                    title=f"Profil artisan: {profile.company_name}",
                    description=profile.activity_description,
                    status=profile.status.value,
                    created_at=profile.created_at,
                    details={
                        "company_name": profile.company_name,
                        "main_specialty": profile.main_specialty,
                        "region": profile.region,
                        "years_experience": profile.years_experience
                    }
                ))
        

        if validation_type in [None, "all", "product"]:
            products_query = db.query(Product, User).join(
                User, Product.artisan_id == User.id
            ).filter(
                Product.status.in_(["pending", "pending_approval"])
            )
            
            products = products_query.all()
            count_by_type["product"] = len(products)
            
            for product, user in products:
                items.append(PendingValidationItem(
                    id=product.id,
                    type=ValidationType.PRODUCT,
                    entity_id=product.id,
                    artisan_id=user.id,
                    artisan_name=user.name,
                    artisan_email=user.email,
                    title=product.title,
                    description=product.short_description or product.description[:200],
                    status=product.status,
                    created_at=product.created_at,
                    details={
                        "price": float(product.price),
                        "category_id": str(product.category_id),
                        "stock_quantity": product.stock_quantity
                    }
                ))
        

        if validation_type in [None, "all", "workshop"]:
            workshops_query = db.query(Workshop, User).join(
                User, Workshop.artisan_id == User.id
            ).filter(
                Workshop.status.in_(["pending", "pending_approval"])
            )
            
            workshops = workshops_query.all()
            count_by_type["workshop"] = len(workshops)
            
            for workshop, user in workshops:
                items.append(PendingValidationItem(
                    id=workshop.id,
                    type=ValidationType.WORKSHOP,
                    entity_id=workshop.id,
                    artisan_id=user.id,
                    artisan_name=user.name,
                    artisan_email=user.email,
                    title=workshop.title,
                    description=workshop.short_description or workshop.description[:200],
                    status=workshop.status,
                    created_at=workshop.created_at,
                    details={
                        "base_price": float(workshop.base_price),
                        "duration_minutes": workshop.duration_minutes,
                        "max_participants": workshop.max_participants,
                        "location_type": workshop.location_type
                    }
                ))
        

        items.sort(key=lambda x: x.created_at, reverse=True)
        

        total = len(items)
        items = items[skip:skip + limit]
        
        return PendingValidationsResponse(
            total=total,
            items=items,
            count_by_type=count_by_type
        )
    
    @staticmethod
    async def validate_artisan_profile(
        db: Session,
        artisan_id: UUID,
        action: ValidationAction,
        admin_id: UUID,
        notes: Optional[str] = None
    ) -> User:
        """
        Approuver ou rejeter un profil artisan
        
        Args:
            db: Session DB
            artisan_id: ID de l'artisan
            action: approve/reject
            admin_id: ID de l'admin qui valide
            notes: Notes de validation
        
        Returns:
            User mis à jour
        """

        user = db.query(User).filter(User.id == artisan_id).first()
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Artisan non trouvé"
            )
        
        if user.role != UserRole.ARTISAN:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="L'utilisateur n'est pas un artisan"
            )
        
        artisan_profile = user.artisan_profile
        if not artisan_profile:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Profil artisan non trouvé"
            )
        

        if artisan_profile.status != ProfileStatus.PENDING_APPROVAL:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Le profil n'est pas en attente de validation (statut actuel: {artisan_profile.status})"
            )
        

        if action == ValidationAction.APPROVE:
            artisan_profile.status = ProfileStatus.PUBLISHED
            user.approved_by = admin_id
            user.approved_at = datetime.utcnow()
            user.approval_notes = notes
            validation_status = ValidationStatus.APPROVED
            logger.info(f"Profil artisan {artisan_id} approuvé par admin {admin_id}")
        else:
            artisan_profile.status = ProfileStatus.REJECTED
            artisan_profile.admin_notes = notes
            validation_status = ValidationStatus.REJECTED
            logger.info(f"Profil artisan {artisan_id} rejeté par admin {admin_id}")
        

        validation = ArtisanValidation(
            artisan_id=artisan_id,
            validation_type=ValidationType.PROFILE.value,
            entity_id=artisan_profile.id,
            status=validation_status.value,
            validated_by=admin_id,
            validation_notes=notes,
            validated_at=datetime.utcnow()
        )
        db.add(validation)
        
        db.commit()
        db.refresh(user)
        db.refresh(artisan_profile)
        

        
        return user
    
    @staticmethod
    async def validate_product(
        db: Session,
        product_id: UUID,
        action: ValidationAction,
        admin_id: UUID,
        notes: Optional[str] = None
    ) -> Product:
        """
        Approuver ou rejeter un produit
        
        Args:
            db: Session DB
            product_id: ID du produit
            action: approve/reject
            admin_id: ID de l'admin qui valide
            notes: Notes de validation
        
        Returns:
            Product mis à jour
        """
        product = db.query(Product).filter(Product.id == product_id).first()
        if not product:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Produit non trouvé"
            )
        

        if product.status not in ["pending", "pending_approval"]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Le produit n'est pas en attente de validation (statut actuel: {product.status})"
            )
        

        if action == ValidationAction.APPROVE:
            product.status = "approved"
            product.approved_by = admin_id
            product.approved_at = datetime.utcnow()
            product.approval_notes = notes
            product.published_at = datetime.utcnow()
            validation_status = ValidationStatus.APPROVED
            logger.info(f"Produit {product_id} approuvé par admin {admin_id}")
        else:
            product.status = "rejected"
            product.approval_notes = notes
            validation_status = ValidationStatus.REJECTED
            logger.info(f"Produit {product_id} rejeté par admin {admin_id}")
        

        validation = ArtisanValidation(
            artisan_id=product.artisan_id,
            validation_type=ValidationType.PRODUCT.value,
            entity_id=product_id,
            status=validation_status.value,
            validated_by=admin_id,
            validation_notes=notes,
            validated_at=datetime.utcnow()
        )
        db.add(validation)
        
        db.commit()
        db.refresh(product)
        

        
        return product
    
    @staticmethod
    async def validate_workshop(
        db: Session,
        workshop_id: UUID,
        action: ValidationAction,
        admin_id: UUID,
        notes: Optional[str] = None
    ) -> Workshop:
        """
        Approuver ou rejeter un atelier
        
        Args:
            db: Session DB
            workshop_id: ID de l'atelier
            action: approve/reject
            admin_id: ID de l'admin qui valide
            notes: Notes de validation
        
        Returns:
            Workshop mis à jour
        """
        workshop = db.query(Workshop).filter(Workshop.id == workshop_id).first()
        if not workshop:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Atelier non trouvé"
            )
        

        if workshop.status not in ["pending", "pending_approval"]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"L'atelier n'est pas en attente de validation (statut actuel: {workshop.status})"
            )
        

        if action == ValidationAction.APPROVE:
            workshop.status = "approved"
            workshop.approved_by = admin_id
            workshop.approved_at = datetime.utcnow()
            workshop.approval_notes = notes
            validation_status = ValidationStatus.APPROVED
            logger.info(f"Atelier {workshop_id} approuvé par admin {admin_id}")
        else:
            workshop.status = "rejected"
            workshop.approval_notes = notes
            validation_status = ValidationStatus.REJECTED
            logger.info(f"Atelier {workshop_id} rejeté par admin {admin_id}")
        

        validation = ArtisanValidation(
            artisan_id=workshop.artisan_id,
            validation_type=ValidationType.WORKSHOP.value,
            entity_id=workshop_id,
            status=validation_status.value,
            validated_by=admin_id,
            validation_notes=notes,
            validated_at=datetime.utcnow()
        )
        db.add(validation)
        
        db.commit()
        db.refresh(workshop)
        

        
        return workshop
    
    @staticmethod
    async def get_validation_stats(
        db: Session,
        period: str = "month"
    ) -> ValidationStatsOut:
        """
        Récupère les statistiques de validation
        
        Args:
            db: Session DB
            period: Période (day/week/month/all)
        
        Returns:
            ValidationStatsOut avec les stats
        """

        now = datetime.utcnow()
        if period == "day":
            start_date = now - timedelta(days=1)
        elif period == "week":
            start_date = now - timedelta(weeks=1)
        elif period == "month":
            start_date = now - timedelta(days=30)
        else:
            start_date = None
        

        query = db.query(ArtisanValidation)
        if start_date:
            query = query.filter(ArtisanValidation.validated_at >= start_date)
        
        validations = query.all()
        

        total_validations = len(validations)
        approved_count = len([v for v in validations if v.status == ValidationStatus.APPROVED.value])
        rejected_count = len([v for v in validations if v.status == ValidationStatus.REJECTED.value])
        

        pending_profiles = db.query(ArtisanProfile).filter(
            ArtisanProfile.status == ProfileStatus.PENDING_APPROVAL
        ).count()
        pending_products = db.query(Product).filter(
            Product.status.in_(["pending", "pending_approval"])
        ).count()
        pending_workshops = db.query(Workshop).filter(
            Workshop.status.in_(["pending", "pending_approval"])
        ).count()
        pending_count = pending_profiles + pending_products + pending_workshops
        

        approval_rate = (approved_count / total_validations * 100) if total_validations > 0 else 0
        

        response_times = []
        for v in validations:
            if v.validated_at and v.created_at:
                delta = v.validated_at - v.created_at
                response_times.append(delta.total_seconds() / 3600)
        
        avg_response_time = sum(response_times) / len(response_times) if response_times else None
        

        by_type = {}
        for vtype in [ValidationType.PROFILE.value, ValidationType.PRODUCT.value, ValidationType.WORKSHOP.value]:
            type_validations = [v for v in validations if v.validation_type == vtype]
            by_type[vtype] = {
                "total": len(type_validations),
                "approved": len([v for v in type_validations if v.status == ValidationStatus.APPROVED.value]),
                "rejected": len([v for v in type_validations if v.status == ValidationStatus.REJECTED.value])
            }
        
        return ValidationStatsOut(
            period=period,
            total_validations=total_validations,
            approved_count=approved_count,
            rejected_count=rejected_count,
            pending_count=pending_count,
            approval_rate=round(approval_rate, 2),
            average_response_time_hours=round(avg_response_time, 2) if avg_response_time else None,
            by_type=by_type
        )
