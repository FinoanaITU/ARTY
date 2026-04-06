"""
Tests pour les fonctionnalités d'analytics admin
"""
import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session
from uuid import uuid4
from datetime import datetime, timedelta
from decimal import Decimal

from app.models.user import User, UserRole, ArtisanProfile, ProfileStatus
from app.models.product import Product, Category
from app.models.workshop import Workshop, WorkshopBooking, WorkshopSession
from app.models.order import Order, OrderItem


class TestAdminAnalytics:
    """Tests pour les analytics admin"""
    
    def test_get_platform_overview_unauthorized(self, client: TestClient):
        """Test accès non autorisé aux analytics"""
        response = client.get("/api/v1/admin/analytics/overview")
        assert response.status_code == 401
    
    def test_get_platform_overview_not_admin(
        self, client: TestClient, artisan_token: str
    ):
        """Test accès refusé pour non-admin"""
        response = client.get(
            "/api/v1/admin/analytics/overview",
            headers={"Authorization": f"Bearer {artisan_token}"}
        )
        assert response.status_code == 403
    
    def test_get_platform_overview_empty(
        self, client: TestClient, admin_token: str
    ):
        """Test vue d'ensemble avec base de données vide"""
        response = client.get(
            "/api/v1/admin/analytics/overview",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert response.status_code == 200
        data = response.json()
        
        # Vérifier la structure
        assert "total_users" in data
        assert "users_by_role" in data
        assert "total_artisans" in data
        assert "total_products" in data
        assert "total_workshops" in data
        assert "total_orders" in data
        assert "total_bookings" in data
        assert "pending_validations" in data
        
        # Vérifier les sous-structures
        assert "buyers" in data["users_by_role"]
        assert "artisans" in data["users_by_role"]
        assert "admins" in data["users_by_role"]
        
        assert "active" in data["total_artisans"]
        assert "pending" in data["total_artisans"]
        assert "total" in data["total_artisans"]
    
    def test_get_platform_overview_with_data(
        self, client: TestClient, admin_token: str, db_session: Session
    ):
        """Test vue d'ensemble avec données"""
        # Créer quelques utilisateurs
        buyer1 = User(
            id=uuid4(),
            email=f"buyer1_{uuid4().hex[:8]}@test.com",
            password_hash="hashed",
            name="Buyer 1",
            role=UserRole.BUYER,
            is_active=True
        )
        buyer2 = User(
            id=uuid4(),
            email=f"buyer2_{uuid4().hex[:8]}@test.com",
            password_hash="hashed",
            name="Buyer 2",
            role=UserRole.BUYER,
            is_active=True
        )
        db_session.add_all([buyer1, buyer2])
        
        # Créer des artisans
        artisan_active = User(
            id=uuid4(),
            email=f"artisan_active_{uuid4().hex[:8]}@test.com",
            password_hash="hashed",
            name="Active Artisan",
            role=UserRole.ARTISAN,
            is_active=True
        )
        artisan_pending = User(
            id=uuid4(),
            email=f"artisan_pending_{uuid4().hex[:8]}@test.com",
            password_hash="hashed",
            name="Pending Artisan",
            role=UserRole.ARTISAN,
            is_active=True
        )
        db_session.add_all([artisan_active, artisan_pending])
        db_session.flush()
        
        # Profils artisans
        profile_active = ArtisanProfile(
            id=uuid4(),
            user_id=artisan_active.id,
            company_name="Active Co",
            main_specialty="Sculpture",
            activity_description="Test",
            status=ProfileStatus.PUBLISHED
        )
        profile_pending = ArtisanProfile(
            id=uuid4(),
            user_id=artisan_pending.id,
            company_name="Pending Co",
            main_specialty="Pottery",
            activity_description="Test",
            status=ProfileStatus.PENDING_APPROVAL
        )
        db_session.add_all([profile_active, profile_pending])
        
        # Créer une catégorie
        category = Category(
            id=uuid4(),
            name="Test Category",
            slug="test-category"
        )
        db_session.add(category)
        db_session.flush()
        
        # Créer des produits
        product_published = Product(
            id=uuid4(),
            title="Published Product",
            slug=f"published-product-{uuid4().hex[:8]}",
            description="Test product",
            price=Decimal("100.00"),
            artisan_id=artisan_active.id,
            category_id=category.id,
            status="published"
        )
        product_pending = Product(
            id=uuid4(),
            title="Pending Product",
            slug=f"pending-product-{uuid4().hex[:8]}",
            description="Test product",
            price=Decimal("150.00"),
            artisan_id=artisan_active.id,
            category_id=category.id,
            status="pending"
        )
        db_session.add_all([product_published, product_pending])
        db_session.commit()
        
        # Récupérer les stats
        response = client.get(
            "/api/v1/admin/analytics/overview",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert response.status_code == 200
        data = response.json()
        
        # Vérifier les nombres
        assert data["users_by_role"]["buyers"] >= 2
        assert data["total_artisans"]["total"] >= 2
        assert data["total_artisans"]["active"] >= 1
        assert data["total_artisans"]["pending"] >= 1
        assert data["total_products"]["total"] >= 2
        assert data["total_products"]["published"] >= 1
        assert data["total_products"]["pending"] >= 1
        assert data["pending_validations"] >= 1
    
    def test_get_revenue_stats_empty(
        self, client: TestClient, admin_token: str
    ):
        """Test stats revenus avec base vide"""
        response = client.get(
            "/api/v1/admin/analytics/revenue",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert response.status_code == 200
        data = response.json()
        
        assert "total_revenue" in data
        assert "product_sales" in data
        assert "workshop_sales" in data
        assert "commission_artizaho" in data
        assert "period" in data
        assert data["total_revenue"] == 0
        assert data["product_sales"] == 0
        assert data["workshop_sales"] == 0
    
    def test_get_revenue_stats_with_period(
        self, client: TestClient, admin_token: str
    ):
        """Test stats revenus avec différentes périodes"""
        periods = ["day", "week", "month", "year", "all"]
        
        for period in periods:
            response = client.get(
                f"/api/v1/admin/analytics/revenue?period={period}",
                headers={"Authorization": f"Bearer {admin_token}"}
            )
            assert response.status_code == 200
            data = response.json()
            assert data["period"] == period
    
    def test_get_revenue_stats_with_orders(
        self, client: TestClient, admin_token: str, db_session: Session
    ):
        """Test stats revenus avec données de commandes"""
        # Créer un buyer
        buyer = User(
            id=uuid4(),
            email=f"buyer_{uuid4().hex[:8]}@test.com",
            password_hash="hashed",
            name="Test Buyer",
            role=UserRole.BUYER,
            is_active=True
        )
        
        # Créer un artisan
        artisan = User(
            id=uuid4(),
            email=f"artisan_{uuid4().hex[:8]}@test.com",
            password_hash="hashed",
            name="Test Artisan",
            role=UserRole.ARTISAN,
            is_active=True
        )
        db_session.add_all([buyer, artisan])
        db_session.flush()
        
        # Créer une catégorie et produit
        category = Category(
            id=uuid4(),
            name="Test Category",
            slug=f"test-category-{uuid4().hex[:8]}"
        )
        db_session.add(category)
        db_session.flush()
        
        product = Product(
            id=uuid4(),
            title="Test Product",
            slug=f"test-product-{uuid4().hex[:8]}",
            description="Test",
            price=Decimal("1000.00"),
            artisan_id=artisan.id,
            category_id=category.id,
            status="published"
        )
        db_session.add(product)
        db_session.flush()
        
        # Créer une commande payée
        order = Order(
            id=uuid4(),
            order_number=f"ORD-{uuid4().hex[:8].upper()}",
            user_id=buyer.id,
            status="completed",
            payment_status="paid",
            subtotal=Decimal("1000.00"),
            total_amount=Decimal("1000.00"),
            shipping_address={"city": "Antananarivo"}
        )
        db_session.add(order)
        db_session.flush()
        
        order_item = OrderItem(
            id=uuid4(),
            order_id=order.id,
            product_id=product.id,
            artisan_id=artisan.id,
            title=product.title,
            quantity=1,
            unit_price=Decimal("1000.00"),
            total_price=Decimal("1000.00")
        )
        db_session.add(order_item)
        db_session.commit()
        
        # Récupérer les stats
        response = client.get(
            "/api/v1/admin/analytics/revenue?period=all",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert response.status_code == 200
        data = response.json()
        
        assert data["total_revenue"] >= 1000.00
        assert data["product_sales"] >= 1000.00
        assert data["commission_artizaho"] >= 150.00  # 15% de 1000
    
    def test_get_artisan_stats_empty(
        self, client: TestClient, admin_token: str
    ):
        """Test stats artisans avec base vide"""
        response = client.get(
            "/api/v1/admin/analytics/artisans",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert response.status_code == 200
        data = response.json()
        
        assert "total_artisans" in data
        assert "active_artisans" in data
        assert "pending_approval" in data
        assert "by_specialty" in data
        assert "by_region" in data
        assert "new_this_month" in data
        assert "top_performers" in data
        
        assert isinstance(data["by_specialty"], list)
        assert isinstance(data["by_region"], list)
        assert isinstance(data["top_performers"], list)
    
    def test_get_artisan_stats_with_data(
        self, client: TestClient, admin_token: str, db_session: Session
    ):
        """Test stats artisans avec données"""
        # Créer des artisans
        artisan1 = User(
            id=uuid4(),
            email=f"artisan1_{uuid4().hex[:8]}@test.com",
            password_hash="hashed",
            name="Artisan 1",
            role=UserRole.ARTISAN,
            is_active=True
        )
        artisan2 = User(
            id=uuid4(),
            email=f"artisan2_{uuid4().hex[:8]}@test.com",
            password_hash="hashed",
            name="Artisan 2",
            role=UserRole.ARTISAN,
            is_active=True
        )
        db_session.add_all([artisan1, artisan2])
        db_session.commit()
        
        response = client.get(
            "/api/v1/admin/analytics/artisans",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert response.status_code == 200
        data = response.json()
        assert data["total_artisans"] >= 2
    
    def test_get_conversion_stats(
        self, client: TestClient, admin_token: str
    ):
        """Test stats de conversion"""
        response = client.get(
            "/api/v1/admin/analytics/conversion",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert response.status_code == 200
        data = response.json()
        
        assert "product_view_to_sale_rate" in data
        assert "workshop_to_booking_rate" in data
        assert "visitor_to_buyer_conversion" in data
        assert "products_with_sales" in data
        assert "products_with_views" in data
        assert "workshops_with_bookings" in data
        assert "users_with_orders" in data
        
        # Vérifier que les taux sont des nombres valides
        assert isinstance(data["product_view_to_sale_rate"], (int, float))
        assert isinstance(data["workshop_to_booking_rate"], (int, float))
        assert isinstance(data["visitor_to_buyer_conversion"], (int, float))
    
    def test_get_user_behavior_stats(
        self, client: TestClient, admin_token: str
    ):
        """Test stats comportement utilisateurs"""
        response = client.get(
            "/api/v1/admin/analytics/users",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert response.status_code == 200
        data = response.json()
        
        assert "avg_order_value" in data
        assert "avg_cart_size" in data
        assert "repeat_customers_rate" in data
        assert "total_customers" in data
        assert "repeat_customers" in data
        assert "payment_method_stats" in data
        
        # Vérifier les types
        assert isinstance(data["avg_order_value"], (int, float))
        assert isinstance(data["avg_cart_size"], (int, float))
        assert isinstance(data["repeat_customers_rate"], (int, float))
        assert isinstance(data["payment_method_stats"], dict)
    
    def test_get_user_behavior_with_repeat_customers(
        self, client: TestClient, admin_token: str, db_session: Session
    ):
        """Test stats avec clients récurrents"""
        # Créer un buyer
        buyer = User(
            id=uuid4(),
            email=f"repeat_buyer_{uuid4().hex[:8]}@test.com",
            password_hash="hashed",
            name="Repeat Buyer",
            role=UserRole.BUYER,
            is_active=True
        )
        
        artisan = User(
            id=uuid4(),
            email=f"artisan_{uuid4().hex[:8]}@test.com",
            password_hash="hashed",
            name="Test Artisan",
            role=UserRole.ARTISAN,
            is_active=True
        )
        db_session.add_all([buyer, artisan])
        db_session.flush()
        
        category = Category(
            id=uuid4(),
            name="Test Category",
            slug=f"test-category-{uuid4().hex[:8]}"
        )
        db_session.add(category)
        db_session.flush()
        
        product = Product(
            id=uuid4(),
            title="Test Product",
            slug=f"test-product-{uuid4().hex[:8]}",
            description="Test",
            price=Decimal("500.00"),
            artisan_id=artisan.id,
            category_id=category.id,
            status="published"
        )
        db_session.add(product)
        db_session.flush()
        
        # Créer 2 commandes pour le même buyer
        for i in range(2):
            order = Order(
                id=uuid4(),
                order_number=f"ORD-{uuid4().hex[:8].upper()}",
                user_id=buyer.id,
                status="completed",
                payment_status="paid",
                subtotal=Decimal("500.00"),
                total_amount=Decimal("500.00"),
                shipping_address={"city": "Antananarivo"}
            )
            db_session.add(order)
            db_session.flush()
            
            order_item = OrderItem(
                id=uuid4(),
                order_id=order.id,
                product_id=product.id,
                artisan_id=artisan.id,
                title=product.title,
                quantity=1,
                unit_price=Decimal("500.00"),
                total_price=Decimal("500.00")
            )
            db_session.add(order_item)
        
        db_session.commit()
        
        response = client.get(
            "/api/v1/admin/analytics/users",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert response.status_code == 200
        data = response.json()
        
        assert data["total_customers"] >= 1
        assert data["repeat_customers"] >= 1
        assert data["avg_order_value"] >= 500.00
        assert data["repeat_customers_rate"] > 0
