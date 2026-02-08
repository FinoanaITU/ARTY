"""
Tests pour les fonctionnalités de validation admin
"""
import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session
from uuid import uuid4
from datetime import datetime

from app.models.user import User, ArtisanProfile, UserRole, ProfileStatus
from app.models.product import Product
from app.models.workshop import Workshop
from app.models.validation import ArtisanValidation, ValidationType, ValidationStatus
from app.schemas.admin import ValidationAction


class TestAdminValidation:
    """Tests pour la validation admin"""
    
    def test_get_pending_validations_empty(self, client: TestClient, admin_token: str):
        """Test liste vide des validations en attente"""
        response = client.get(
            "/api/v1/admin/validations/pending",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert response.status_code == 200
        data = response.json()
        assert "items" in data
        assert "total" in data
        assert "count_by_type" in data
    
    def test_get_pending_validations_unauthorized(self, client: TestClient):
        """Test accès non autorisé aux validations"""
        response = client.get("/api/v1/admin/validations/pending")
        assert response.status_code == 401
    
    def test_get_pending_validations_not_admin(
        self, client: TestClient, artisan_token: str
    ):
        """Test accès refusé pour non-admin"""
        response = client.get(
            "/api/v1/admin/validations/pending",
            headers={"Authorization": f"Bearer {artisan_token}"}
        )
        assert response.status_code == 403
    
    def test_get_pending_validations_with_artisan_profile(
        self, client: TestClient, admin_token: str, db_session: Session
    ):
        """Test liste avec un profil artisan en attente"""
        # Créer un artisan avec profil en attente
        user = User(
            id=uuid4(),
            email=f"pending_artisan_{uuid4().hex[:8]}@test.com",
            password_hash="hashed",
            name="Pending Artisan",
            role=UserRole.ARTISAN,
            is_active=True
        )
        db_session.add(user)
        db_session.flush()
        
        profile = ArtisanProfile(
            id=uuid4(),
            user_id=user.id,
            company_name="Test Artisan Co",
            main_specialty="Sculpture",
            activity_description="Test description",
            status=ProfileStatus.PENDING_APPROVAL
        )
        db_session.add(profile)
        db_session.commit()
        
        # Récupérer les validations
        response = client.get(
            "/api/v1/admin/validations/pending",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert response.status_code == 200
        data = response.json()
        assert data["total"] >= 1
        assert data["count_by_type"]["profile"] >= 1
        
        # Vérifier qu'on trouve notre profil
        profile_items = [
            item for item in data["items"] 
            if item["type"] == "profile" and item["artisan_id"] == str(user.id)
        ]
        assert len(profile_items) == 1
        assert profile_items[0]["artisan_name"] == "Pending Artisan"
    
    def test_validate_artisan_profile_approve(
        self, client: TestClient, admin_token: str, admin_user: User, db_session: Session
    ):
        """Test approbation d'un profil artisan"""
        # Créer un artisan avec profil en attente
        user = User(
            id=uuid4(),
            email=f"approve_artisan_{uuid4().hex[:8]}@test.com",
            password_hash="hashed",
            name="Artisan to Approve",
            role=UserRole.ARTISAN,
            is_active=True
        )
        db_session.add(user)
        db_session.flush()
        
        profile = ArtisanProfile(
            id=uuid4(),
            user_id=user.id,
            company_name="Test Artisan Co",
            main_specialty="Sculpture",
            activity_description="Test description",
            status=ProfileStatus.PENDING_APPROVAL
        )
        db_session.add(profile)
        db_session.commit()
        
        # Approuver le profil
        response = client.post(
            f"/api/v1/admin/validations/artisan/{user.id}",
            headers={"Authorization": f"Bearer {admin_token}"},
            json={"action": "approve", "notes": "Profil validé"}
        )
        assert response.status_code == 200
        data = response.json()
        assert "message" in data
        assert "approuvé" in data["message"]
        assert data["status"] == ProfileStatus.PUBLISHED.value
        
        # Vérifier en DB
        db_session.refresh(profile)
        assert profile.status == ProfileStatus.PUBLISHED
        db_session.refresh(user)
        assert user.approved_by == admin_user.id
        assert user.approved_at is not None
        assert user.approval_notes == "Profil validé"
        
        # Vérifier qu'une validation a été créée
        validation = db_session.query(ArtisanValidation).filter(
            ArtisanValidation.artisan_id == user.id,
            ArtisanValidation.validation_type == ValidationType.PROFILE.value
        ).first()
        assert validation is not None
        assert validation.status == ValidationStatus.APPROVED.value
        assert validation.validated_by == admin_user.id
    
    def test_validate_artisan_profile_reject(
        self, client: TestClient, admin_token: str, admin_user: User, db_session: Session
    ):
        """Test rejet d'un profil artisan"""
        # Créer un artisan avec profil en attente
        user = User(
            id=uuid4(),
            email=f"reject_artisan_{uuid4().hex[:8]}@test.com",
            password_hash="hashed",
            name="Artisan to Reject",
            role=UserRole.ARTISAN,
            is_active=True
        )
        db_session.add(user)
        db_session.flush()
        
        profile = ArtisanProfile(
            id=uuid4(),
            user_id=user.id,
            company_name="Test Artisan Co",
            main_specialty="Sculpture",
            activity_description="Test description",
            status=ProfileStatus.PENDING_APPROVAL
        )
        db_session.add(profile)
        db_session.commit()
        
        # Rejeter le profil
        response = client.post(
            f"/api/v1/admin/validations/artisan/{user.id}",
            headers={"Authorization": f"Bearer {admin_token}"},
            json={"action": "reject", "notes": "Documents incomplets"}
        )
        assert response.status_code == 200
        data = response.json()
        assert "message" in data
        assert "rejeté" in data["message"]
        assert data["status"] == ProfileStatus.REJECTED.value
        
        # Vérifier en DB
        db_session.refresh(profile)
        assert profile.status == ProfileStatus.REJECTED
        assert profile.admin_notes == "Documents incomplets"
        
        # Vérifier qu'une validation a été créée
        validation = db_session.query(ArtisanValidation).filter(
            ArtisanValidation.artisan_id == user.id,
            ArtisanValidation.validation_type == ValidationType.PROFILE.value
        ).first()
        assert validation is not None
        assert validation.status == ValidationStatus.REJECTED.value
    
    def test_validate_product_approve(
        self, client: TestClient, admin_token: str, admin_user: User, 
        artisan_user: User, db_session: Session
    ):
        """Test approbation d'un produit"""
        # Créer un produit en attente
        from app.models.product import Category
        
        # Créer une catégorie si nécessaire
        category = db_session.query(Category).first()
        if not category:
            category = Category(
                id=uuid4(),
                name="Test Category",
                slug="test-category"
            )
            db_session.add(category)
            db_session.flush()
        
        product = Product(
            id=uuid4(),
            title="Test Product",
            slug=f"test-product-{uuid4().hex[:8]}",
            description="Test product description",
            price=1000.00,
            artisan_id=artisan_user.id,
            category_id=category.id,
            status="pending"
        )
        db_session.add(product)
        db_session.commit()
        
        # Approuver le produit
        response = client.post(
            f"/api/v1/admin/validations/product/{product.id}",
            headers={"Authorization": f"Bearer {admin_token}"},
            json={"action": "approve", "notes": "Good product"}
        )
        assert response.status_code == 200
        data = response.json()
        assert "approuvé" in data["message"]
        assert data["status"] == "approved"
        
        # Vérifier en DB
        db_session.refresh(product)
        assert product.status == "approved"
        assert product.approved_by == admin_user.id
        assert product.approved_at is not None
    
    def test_validate_workshop_approve(
        self, client: TestClient, admin_token: str, admin_user: User,
        artisan_user: User, db_session: Session
    ):
        """Test approbation d'un atelier"""
        # Créer un atelier en attente
        workshop = Workshop(
            id=uuid4(),
            title="Test Workshop",
            slug=f"test-workshop-{uuid4().hex[:8]}",
            description="Test workshop description",
            artisan_id=artisan_user.id,
            base_price=5000.00,
            max_participants=10,
            duration_minutes=120,
            status="pending"
        )
        db_session.add(workshop)
        db_session.commit()
        
        # Approuver l'atelier
        response = client.post(
            f"/api/v1/admin/validations/workshop/{workshop.id}",
            headers={"Authorization": f"Bearer {admin_token}"},
            json={"action": "approve", "notes": "Great workshop"}
        )
        assert response.status_code == 200
        data = response.json()
        assert "approuvé" in data["message"]
        assert data["status"] == "approved"
        
        # Vérifier en DB
        db_session.refresh(workshop)
        assert workshop.status == "approved"
        assert workshop.approved_by == admin_user.id
        assert workshop.approved_at is not None
    
    def test_get_validation_stats(
        self, client: TestClient, admin_token: str, admin_user: User, db_session: Session
    ):
        """Test récupération des statistiques de validation"""
        # Créer quelques validations
        artisan = User(
            id=uuid4(),
            email=f"stats_artisan_{uuid4().hex[:8]}@test.com",
            password_hash="hashed",
            name="Stats Artisan",
            role=UserRole.ARTISAN,
            is_active=True
        )
        db_session.add(artisan)
        db_session.flush()
        
        # Créer des validations
        validations = [
            ArtisanValidation(
                artisan_id=artisan.id,
                validation_type=ValidationType.PROFILE.value,
                status=ValidationStatus.APPROVED.value,
                validated_by=admin_user.id,
                validated_at=datetime.utcnow()
            ),
            ArtisanValidation(
                artisan_id=artisan.id,
                validation_type=ValidationType.PRODUCT.value,
                status=ValidationStatus.APPROVED.value,
                validated_by=admin_user.id,
                validated_at=datetime.utcnow()
            ),
            ArtisanValidation(
                artisan_id=artisan.id,
                validation_type=ValidationType.WORKSHOP.value,
                status=ValidationStatus.REJECTED.value,
                validated_by=admin_user.id,
                validated_at=datetime.utcnow()
            )
        ]
        db_session.add_all(validations)
        db_session.commit()
        
        # Récupérer les stats
        response = client.get(
            "/api/v1/admin/validations/stats?period=month",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert response.status_code == 200
        data = response.json()
        assert "total_validations" in data
        assert "approved_count" in data
        assert "rejected_count" in data
        assert "pending_count" in data
        assert "approval_rate" in data
        assert "by_type" in data
        assert data["total_validations"] >= 3
        assert data["approved_count"] >= 2
        assert data["rejected_count"] >= 1
    
    def test_validate_nonexistent_artisan(
        self, client: TestClient, admin_token: str
    ):
        """Test validation d'un artisan inexistant"""
        fake_id = uuid4()
        response = client.post(
            f"/api/v1/admin/validations/artisan/{fake_id}",
            headers={"Authorization": f"Bearer {admin_token}"},
            json={"action": "approve"}
        )
        assert response.status_code == 404
    
    def test_validate_already_approved_profile(
        self, client: TestClient, admin_token: str, db_session: Session
    ):
        """Test validation d'un profil déjà approuvé"""
        # Créer un artisan avec profil déjà approuvé
        user = User(
            id=uuid4(),
            email=f"already_approved_{uuid4().hex[:8]}@test.com",
            password_hash="hashed",
            name="Already Approved",
            role=UserRole.ARTISAN,
            is_active=True
        )
        db_session.add(user)
        db_session.flush()
        
        profile = ArtisanProfile(
            id=uuid4(),
            user_id=user.id,
            company_name="Test Artisan Co",
            main_specialty="Sculpture",
            activity_description="Test description",
            status=ProfileStatus.PUBLISHED
        )
        db_session.add(profile)
        db_session.commit()
        
        # Tenter d'approuver à nouveau
        response = client.post(
            f"/api/v1/admin/validations/artisan/{user.id}",
            headers={"Authorization": f"Bearer {admin_token}"},
            json={"action": "approve"}
        )
        assert response.status_code == 400
        assert "n'est pas en attente" in response.json()["detail"]
