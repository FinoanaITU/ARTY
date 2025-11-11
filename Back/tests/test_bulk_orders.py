"""
Tests unitaires pour les fonctionnalités de commande en gros
"""
import pytest
from fastapi.testclient import TestClient
from fastapi import status
from sqlalchemy.orm import Session
from uuid import UUID
from decimal import Decimal
from app.models.product import Product, BulkOrderRequest
from app.models.user import User
from app.crud.bulk_order import bulk_order_crud, calculate_bulk_discount
from app.schemas.product import BulkOrderRequestIn
import uuid
import json


class TestBulkOrderDiscountCalculation:
    """Tests pour le calcul des remises progressives"""
    
    def test_calculate_discount_quantity_4(self):
        """Test de calcul de remise pour quantité < 5 (pas de remise)"""
        discount = calculate_bulk_discount(4)
        assert discount == Decimal('0.00')
    
    def test_calculate_discount_quantity_5(self):
        """Test de calcul de remise pour quantité 5-9 (-5%)"""
        discount = calculate_bulk_discount(5)
        assert discount == Decimal('5.00')
    
    def test_calculate_discount_quantity_9(self):
        """Test de calcul de remise pour quantité 5-9 (-5%)"""
        discount = calculate_bulk_discount(9)
        assert discount == Decimal('5.00')
    
    def test_calculate_discount_quantity_10(self):
        """Test de calcul de remise pour quantité 10-19 (-10%)"""
        discount = calculate_bulk_discount(10)
        assert discount == Decimal('10.00')
    
    def test_calculate_discount_quantity_19(self):
        """Test de calcul de remise pour quantité 10-19 (-10%)"""
        discount = calculate_bulk_discount(19)
        assert discount == Decimal('10.00')
    
    def test_calculate_discount_quantity_20(self):
        """Test de calcul de remise pour quantité 20-49 (-15%)"""
        discount = calculate_bulk_discount(20)
        assert discount == Decimal('15.00')
    
    def test_calculate_discount_quantity_49(self):
        """Test de calcul de remise pour quantité 20-49 (-15%)"""
        discount = calculate_bulk_discount(49)
        assert discount == Decimal('15.00')
    
    def test_calculate_discount_quantity_50(self):
        """Test de calcul de remise pour quantité >= 50 (-25%)"""
        discount = calculate_bulk_discount(50)
        assert discount == Decimal('25.00')
    
    def test_calculate_discount_quantity_100(self):
        """Test de calcul de remise pour quantité >= 50 (-25%)"""
        discount = calculate_bulk_discount(100)
        assert discount == Decimal('25.00')


class TestBulkOrderCRUD:
    """Tests pour le CRUD des commandes en gros"""
    
    def test_create_bulk_order_request(
        self, db: Session, created_product: Product
    ):
        """Test de création d'une demande de commande en gros"""
        bulk_order_data = BulkOrderRequestIn(
            quantity=10,
            customer_name="John Doe",
            customer_email="john@example.com",
            customer_phone="+261341234567",
            company="Test Company",
            message="Je souhaite commander en gros"
        )
        
        bulk_order = bulk_order_crud.create(
            db,
            product_id=created_product.id,
            obj_in=bulk_order_data,
            unit_price=created_product.price
        )
        
        assert bulk_order is not None
        assert bulk_order.quantity == 10
        assert bulk_order.unit_price == created_product.price
        assert bulk_order.discount_percentage == Decimal('10.00')  # 10-19: -10%
        assert bulk_order.customer_name == "John Doe"
        assert bulk_order.customer_email == "john@example.com"
        assert bulk_order.status == "pending"
        
        # Vérifier le calcul du montant total
        subtotal = created_product.price * 10
        expected_discount = (subtotal * Decimal('10.00')) / Decimal('100')
        expected_total = subtotal - expected_discount
        assert bulk_order.total_amount == expected_total
    
    def test_create_bulk_order_with_25_percent_discount(
        self, db: Session, created_product: Product
    ):
        """Test de création d'une commande avec remise de 25% (50+ pièces)"""
        bulk_order_data = BulkOrderRequestIn(
            quantity=50,
            customer_name="Jane Doe",
            customer_email="jane@example.com",
            customer_phone="+261341234567"
        )
        
        bulk_order = bulk_order_crud.create(
            db,
            product_id=created_product.id,
            obj_in=bulk_order_data,
            unit_price=created_product.price
        )
        
        assert bulk_order.discount_percentage == Decimal('25.00')
        
        # Vérifier le calcul
        subtotal = created_product.price * 50
        expected_discount = (subtotal * Decimal('25.00')) / Decimal('100')
        expected_total = subtotal - expected_discount
        assert abs(float(bulk_order.total_amount - expected_total)) < 0.01
    
    def test_get_bulk_order_by_id(
        self, db: Session, created_product: Product
    ):
        """Test de récupération d'une demande de commande par ID"""
        bulk_order_data = BulkOrderRequestIn(
            quantity=10,
            customer_name="John Doe",
            customer_email="john@example.com",
            customer_phone="+261341234567"
        )
        
        created_order = bulk_order_crud.create(
            db,
            product_id=created_product.id,
            obj_in=bulk_order_data,
            unit_price=created_product.price
        )
        
        retrieved_order = bulk_order_crud.get_by_id(db, created_order.id)
        
        assert retrieved_order is not None
        assert retrieved_order.id == created_order.id
        assert retrieved_order.quantity == 10
    
    def test_get_bulk_orders_by_product(
        self, db: Session, created_product: Product
    ):
        """Test de récupération des commandes en gros pour un produit"""
        # Créer plusieurs commandes
        for i in range(3):
            bulk_order_data = BulkOrderRequestIn(
                quantity=10 + i,
                customer_name=f"Customer {i}",
                customer_email=f"customer{i}@example.com",
                customer_phone="+261341234567"
            )
            bulk_order_crud.create(
                db,
                product_id=created_product.id,
                obj_in=bulk_order_data,
                unit_price=created_product.price
            )
        
        orders = bulk_order_crud.get_by_product(db, created_product.id)
        
        assert len(orders) >= 3
    
    def test_update_bulk_order_status(
        self, db: Session, created_product: Product
    ):
        """Test de mise à jour du statut d'une commande en gros"""
        bulk_order_data = BulkOrderRequestIn(
            quantity=10,
            customer_name="John Doe",
            customer_email="john@example.com",
            customer_phone="+261341234567"
        )
        
        bulk_order = bulk_order_crud.create(
            db,
            product_id=created_product.id,
            obj_in=bulk_order_data,
            unit_price=created_product.price
        )
        
        # Mettre à jour le statut
        updated_order = bulk_order_crud.update_status(
            db,
            bulk_order_id=bulk_order.id,
            status="contacted",
            artisan_notes="Client contacté par téléphone"
        )
        
        assert updated_order is not None
        assert updated_order.status == "contacted"
        assert updated_order.artisan_notes == "Client contacté par téléphone"
        assert updated_order.contacted_at is not None


class TestBulkOrderAPI:
    """Tests pour les endpoints API de commande en gros"""
    
    def test_create_bulk_order_request_success(
        self, client: TestClient, db: Session, created_product: Product
    ):
        """Test de création d'une demande de commande en gros via API"""
        # S'assurer que le produit autorise les commandes en gros
        from sqlalchemy import text
        db.execute(
            text("""
                UPDATE products 
                SET made_to_order = :made_to_order, min_bulk_quantity = :min_bulk_quantity
                WHERE id = :id
            """),
            {
                "id": str(created_product.id),
                "made_to_order": True,
                "min_bulk_quantity": 5
            }
        )
        db.commit()
        
        bulk_order_data = {
            "quantity": 10,
            "customer_name": "John Doe",
            "customer_email": "john@example.com",
            "customer_phone": "+261341234567",
            "company": "Test Company",
            "message": "Je souhaite commander en gros"
        }
        
        response = client.post(
            f"/api/v1/products/{created_product.id}/bulk-order-request",
            json=bulk_order_data
        )
        
        assert response.status_code == status.HTTP_201_CREATED
        data = response.json()
        
        assert data["quantity"] == 10
        assert data["customer_name"] == "John Doe"
        assert data["customer_email"] == "john@example.com"
        assert data["discount_percentage"] == 10.0  # 10-19: -10%
        assert data["status"] == "pending"
        assert "total_amount" in data
        assert data["total_amount"] > 0
    
    def test_create_bulk_order_request_product_not_found(
        self, client: TestClient, db: Session
    ):
        """Test de création d'une commande pour un produit inexistant"""
        fake_id = uuid.uuid4()
        bulk_order_data = {
            "quantity": 10,
            "customer_name": "John Doe",
            "customer_email": "john@example.com",
            "customer_phone": "+261341234567"
        }
        
        response = client.post(
            f"/api/v1/products/{fake_id}/bulk-order-request",
            json=bulk_order_data
        )
        
        assert response.status_code == status.HTTP_404_NOT_FOUND
    
    def test_create_bulk_order_request_product_not_enabled(
        self, client: TestClient, db: Session, created_product: Product
    ):
        """Test de création d'une commande pour un produit qui n'autorise pas les commandes en gros"""
        from sqlalchemy import text
        db.execute(
            text("UPDATE products SET made_to_order = :made_to_order WHERE id = :id"),
            {
                "id": str(created_product.id),
                "made_to_order": False
            }
        )
        db.commit()
        
        bulk_order_data = {
            "quantity": 10,
            "customer_name": "John Doe",
            "customer_email": "john@example.com",
            "customer_phone": "+261341234567"
        }
        
        response = client.post(
            f"/api/v1/products/{created_product.id}/bulk-order-request",
            json=bulk_order_data
        )
        
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert "commande en gros" in response.json()["detail"].lower()
    
    def test_create_bulk_order_request_quantity_too_low(
        self, client: TestClient, db: Session, created_product: Product
    ):
        """Test de création d'une commande avec quantité trop faible"""
        from sqlalchemy import text
        db.execute(
            text("""
                UPDATE products 
                SET made_to_order = :made_to_order, min_bulk_quantity = :min_bulk_quantity
                WHERE id = :id
            """),
            {
                "id": str(created_product.id),
                "made_to_order": True,
                "min_bulk_quantity": 10
            }
        )
        db.commit()
        
        bulk_order_data = {
            "quantity": 5,  # Moins que le minimum
            "customer_name": "John Doe",
            "customer_email": "john@example.com",
            "customer_phone": "+261341234567"
        }
        
        response = client.post(
            f"/api/v1/products/{created_product.id}/bulk-order-request",
            json=bulk_order_data
        )
        
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert "quantité minimum" in response.json()["detail"].lower()
    
    def test_create_bulk_order_request_minimum_quantity_5(
        self, client: TestClient, db: Session, created_product: Product
    ):
        """Test de création d'une commande avec quantité minimum de 5 (par défaut)"""
        from sqlalchemy import text
        db.execute(
            text("""
                UPDATE products 
                SET made_to_order = :made_to_order, min_bulk_quantity = NULL
                WHERE id = :id
            """),
            {
                "id": str(created_product.id),
                "made_to_order": True
            }
        )
        db.commit()
        
        # Tentative avec quantité < 5
        bulk_order_data = {
            "quantity": 3,
            "customer_name": "John Doe",
            "customer_email": "john@example.com",
            "customer_phone": "+261341234567"
        }
        
        response = client.post(
            f"/api/v1/products/{created_product.id}/bulk-order-request",
            json=bulk_order_data
        )
        
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert "quantité minimum" in response.json()["detail"].lower()
    
    def test_create_bulk_order_request_different_discount_levels(
        self, client: TestClient, db: Session, created_product: Product
    ):
        """Test de création de commandes avec différents niveaux de remise"""
        from sqlalchemy import text
        db.execute(
            text("""
                UPDATE products 
                SET made_to_order = :made_to_order, min_bulk_quantity = :min_bulk_quantity
                WHERE id = :id
            """),
            {
                "id": str(created_product.id),
                "made_to_order": True,
                "min_bulk_quantity": 5
            }
        )
        db.commit()
        
        # Test avec 5 pièces (-5%)
        bulk_order_5 = {
            "quantity": 5,
            "customer_name": "Customer 5",
            "customer_email": "customer5@example.com",
            "customer_phone": "+261341234567"
        }
        response = client.post(
            f"/api/v1/products/{created_product.id}/bulk-order-request",
            json=bulk_order_5
        )
        assert response.status_code == status.HTTP_201_CREATED
        assert response.json()["discount_percentage"] == 5.0
        
        # Test avec 20 pièces (-15%)
        bulk_order_20 = {
            "quantity": 20,
            "customer_name": "Customer 20",
            "customer_email": "customer20@example.com",
            "customer_phone": "+261341234567"
        }
        response = client.post(
            f"/api/v1/products/{created_product.id}/bulk-order-request",
            json=bulk_order_20
        )
        assert response.status_code == status.HTTP_201_CREATED
        assert response.json()["discount_percentage"] == 15.0
        
        # Test avec 50 pièces (-25%)
        bulk_order_50 = {
            "quantity": 50,
            "customer_name": "Customer 50",
            "customer_email": "customer50@example.com",
            "customer_phone": "+261341234567"
        }
        response = client.post(
            f"/api/v1/products/{created_product.id}/bulk-order-request",
            json=bulk_order_50
        )
        assert response.status_code == status.HTTP_201_CREATED
        assert response.json()["discount_percentage"] == 25.0
    
    def test_create_bulk_order_request_invalid_email(
        self, client: TestClient, db: Session, created_product: Product
    ):
        """Test de création d'une commande avec email invalide"""
        from sqlalchemy import text
        db.execute(
            text("UPDATE products SET made_to_order = :made_to_order WHERE id = :id"),
            {
                "id": str(created_product.id),
                "made_to_order": True
            }
        )
        db.commit()
        
        bulk_order_data = {
            "quantity": 10,
            "customer_name": "John Doe",
            "customer_email": "invalid-email",  # Email invalide
            "customer_phone": "+261341234567"
        }
        
        response = client.post(
            f"/api/v1/products/{created_product.id}/bulk-order-request",
            json=bulk_order_data
        )
        
        assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY
    
    def test_create_bulk_order_request_missing_fields(
        self, client: TestClient, db: Session, created_product: Product
    ):
        """Test de création d'une commande avec champs manquants"""
        from sqlalchemy import text
        db.execute(
            text("UPDATE products SET made_to_order = :made_to_order WHERE id = :id"),
            {
                "id": str(created_product.id),
                "made_to_order": True
            }
        )
        db.commit()
        
        incomplete_data = {
            "quantity": 10,
            # customer_name manquant
            "customer_email": "john@example.com"
        }
        
        response = client.post(
            f"/api/v1/products/{created_product.id}/bulk-order-request",
            json=incomplete_data
        )
        
        assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY

