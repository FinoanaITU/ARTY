"""
Tests pour les fonctionnalités de payment tracking admin
"""
import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session
from uuid import uuid4, UUID
from datetime import datetime, timedelta
from decimal import Decimal

from app.models.user import User, UserRole
from app.models.payment import PaymentTracking, PaymentTrackingHistory, ArtisanPayout
from app.models.order import Order
from app.models.workshop import Workshop, WorkshopSession, WorkshopBooking
from app.schemas.admin import PaymentStatus, ArtisanPayoutStatus


class TestPaymentTracking:
    """Tests pour le payment tracking admin"""
    
    def test_get_payments_unauthorized(self, client: TestClient):
        """Test accès non autorisé aux paiements"""
        response = client.get("/api/v1/admin/payments")
        assert response.status_code == 401
    
    def test_get_payments_not_admin(self, client: TestClient, artisan_token: str):
        """Test accès refusé pour non-admin"""
        response = client.get(
            "/api/v1/admin/payments",
            headers={"Authorization": f"Bearer {artisan_token}"}
        )
        assert response.status_code == 403
    
    def test_get_payments_empty(self, client: TestClient, admin_token: str):
        """Test liste vide des paiements"""
        response = client.get(
            "/api/v1/admin/payments",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert response.status_code == 200
        data = response.json()
        assert "items" in data
        assert "total" in data
        assert "total_amount" in data
        assert "total_paid" in data
        assert "total_outstanding" in data
        assert data["total"] == 0
    
    def test_get_payments_with_data(
        self, client: TestClient, admin_token: str, db_session: Session
    ):
        """Test liste des paiements avec données"""
        # Créer un client
        customer = User(
            id=uuid4(),
            email=f"customer_{uuid4().hex[:8]}@test.com",
            password_hash="hashed",
            name="Test Customer",
            role=UserRole.CLIENT,
            is_active=True
        )
        db_session.add(customer)
        
        # Créer un artisan
        artisan = User(
            id=uuid4(),
            email=f"artisan_{uuid4().hex[:8]}@test.com",
            password_hash="hashed",
            name="Test Artisan",
            role=UserRole.ARTISAN,
            is_active=True
        )
        db_session.add(artisan)
        db_session.flush()
        
        # Créer une commande
        order = Order(
            id=uuid4(),
            order_number=f"ORD-{uuid4().hex[:8].upper()}",
            user_id=customer.id,
            status="confirmed",
            payment_status="pending",
            subtotal=Decimal("100.00"),
            total_amount=Decimal("100.00"),
            shipping_address={"address": "Test"}
        )
        db_session.add(order)
        db_session.flush()
        
        # Créer un paiement
        payment = PaymentTracking(
            id=uuid4(),
            order_id=order.id,
            user_id=customer.id,
            artisan_id=artisan.id,
            type="product",
            amount_total=Decimal("100.00"),
            amount_paid=Decimal("50.00"),
            payment_status=PaymentStatus.PARTIAL.value,
            payment_method="mvola",
            artisan_type="artizaho"
        )
        db_session.add(payment)
        db_session.commit()
        
        # Récupérer les paiements
        response = client.get(
            "/api/v1/admin/payments",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert response.status_code == 200
        data = response.json()
        assert data["total"] >= 1
        assert data["total_amount"] >= 100.00
        assert data["total_paid"] >= 50.00
        assert data["total_outstanding"] >= 50.00
        
        # Vérifier qu'on trouve notre paiement
        payment_items = [item for item in data["items"] if item["id"] == str(payment.id)]
        assert len(payment_items) == 1
        assert payment_items[0]["payment_status"] == PaymentStatus.PARTIAL.value
        assert payment_items[0]["user_name"] == "Test Customer"
        assert payment_items[0]["artisan_name"] == "Test Artisan"
    
    def test_get_payments_filter_by_status(
        self, client: TestClient, admin_token: str, db_session: Session
    ):
        """Test filtrage des paiements par statut"""
        # Créer des paiements avec différents statuts
        customer = User(
            id=uuid4(),
            email=f"customer_{uuid4().hex[:8]}@test.com",
            password_hash="hashed",
            name="Test Customer",
            role=UserRole.CLIENT,
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
        db_session.add_all([customer, artisan])
        db_session.flush()
        
        order1 = Order(
            id=uuid4(),
            order_number=f"ORD-{uuid4().hex[:8].upper()}",
            user_id=customer.id,
            status="confirmed",
            payment_status="pending",
            subtotal=Decimal("100.00"),
            total_amount=Decimal("100.00"),
            shipping_address={"address": "Test"}
        )
        order2 = Order(
            id=uuid4(),
            order_number=f"ORD-{uuid4().hex[:8].upper()}",
            user_id=customer.id,
            status="confirmed",
            payment_status="paid",
            subtotal=Decimal("200.00"),
            total_amount=Decimal("200.00"),
            shipping_address={"address": "Test"}
        )
        db_session.add_all([order1, order2])
        db_session.flush()
        
        payment_unpaid = PaymentTracking(
            id=uuid4(),
            order_id=order1.id,
            user_id=customer.id,
            artisan_id=artisan.id,
            type="product",
            amount_total=Decimal("100.00"),
            amount_paid=Decimal("0.00"),
            payment_status=PaymentStatus.UNPAID.value,
            artisan_type="artizaho"
        )
        payment_paid = PaymentTracking(
            id=uuid4(),
            order_id=order2.id,
            user_id=customer.id,
            artisan_id=artisan.id,
            type="product",
            amount_total=Decimal("200.00"),
            amount_paid=Decimal("200.00"),
            payment_status=PaymentStatus.PAID.value,
            payment_method="cash",
            artisan_type="artizaho"
        )
        db_session.add_all([payment_unpaid, payment_paid])
        db_session.commit()
        
        # Filtrer par unpaid
        response = client.get(
            "/api/v1/admin/payments?payment_status=unpaid",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert response.status_code == 200
        data = response.json()
        assert all(item["payment_status"] == "unpaid" for item in data["items"])
    
    def test_record_payment(
        self, client: TestClient, admin_token: str, db_session: Session
    ):
        """Test enregistrement d'un paiement"""
        # Créer paiement
        customer = User(
            id=uuid4(),
            email=f"customer_{uuid4().hex[:8]}@test.com",
            password_hash="hashed",
            name="Test Customer",
            role=UserRole.CLIENT,
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
        db_session.add_all([customer, artisan])
        db_session.flush()
        
        order = Order(
            id=uuid4(),
            order_number=f"ORD-{uuid4().hex[:8].upper()}",
            user_id=customer.id,
            status="confirmed",
            payment_status="pending",
            subtotal=Decimal("100.00"),
            total_amount=Decimal("100.00"),
            shipping_address={"address": "Test"}
        )
        db_session.add(order)
        db_session.flush()
        
        payment = PaymentTracking(
            id=uuid4(),
            order_id=order.id,
            user_id=customer.id,
            artisan_id=artisan.id,
            type="product",
            amount_total=Decimal("100.00"),
            amount_paid=Decimal("0.00"),
            payment_status=PaymentStatus.UNPAID.value,
            artisan_type="artizaho"
        )
        db_session.add(payment)
        db_session.commit()
        
        # Enregistrer un paiement partiel
        response = client.post(
            f"/api/v1/admin/payments/{payment.id}/record",
            headers={"Authorization": f"Bearer {admin_token}"},
            json={
                "amount": 50.00,
                "payment_method": "mvola",
                "transaction_ref": "MVOLA123",
                "notes": "Partial payment received"
            }
        )
        assert response.status_code == 200
        data = response.json()
        assert data["amount_paid"] == 50.00
        assert data["payment_status"] == PaymentStatus.PARTIAL.value
        assert data["payment_method"] == "mvola"
        
        # Vérifier que l'historique a été créé
        history_count = db_session.query(PaymentTrackingHistory).filter(
            PaymentTrackingHistory.payment_id == payment.id
        ).count()
        assert history_count == 1
    
    def test_record_payment_complete(
        self, client: TestClient, admin_token: str, db_session: Session
    ):
        """Test paiement complet change le statut"""
        # Créer paiement
        customer = User(
            id=uuid4(),
            email=f"customer_{uuid4().hex[:8]}@test.com",
            password_hash="hashed",
            name="Test Customer",
            role=UserRole.CLIENT,
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
        db_session.add_all([customer, artisan])
        db_session.flush()
        
        order = Order(
            id=uuid4(),
            order_number=f"ORD-{uuid4().hex[:8].upper()}",
            user_id=customer.id,
            status="confirmed",
            payment_status="pending",
            subtotal=Decimal("100.00"),
            total_amount=Decimal("100.00"),
            shipping_address={"address": "Test"}
        )
        db_session.add(order)
        db_session.flush()
        
        payment = PaymentTracking(
            id=uuid4(),
            order_id=order.id,
            user_id=customer.id,
            artisan_id=artisan.id,
            type="product",
            amount_total=Decimal("100.00"),
            amount_paid=Decimal("0.00"),
            payment_status=PaymentStatus.UNPAID.value,
            artisan_type="artizaho"
        )
        db_session.add(payment)
        db_session.commit()
        
        # Enregistrer le paiement complet
        response = client.post(
            f"/api/v1/admin/payments/{payment.id}/record",
            headers={"Authorization": f"Bearer {admin_token}"},
            json={
                "amount": 100.00,
                "payment_method": "cash"
            }
        )
        assert response.status_code == 200
        data = response.json()
        assert data["amount_paid"] == 100.00
        assert data["payment_status"] == PaymentStatus.PAID.value
    
    def test_record_payment_exceeds_balance(
        self, client: TestClient, admin_token: str, db_session: Session
    ):
        """Test paiement dépassant le solde est rejeté"""
        # Créer paiement
        customer = User(
            id=uuid4(),
            email=f"customer_{uuid4().hex[:8]}@test.com",
            password_hash="hashed",
            name="Test Customer",
            role=UserRole.CLIENT,
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
        db_session.add_all([customer, artisan])
        db_session.flush()
        
        order = Order(
            id=uuid4(),
            order_number=f"ORD-{uuid4().hex[:8].upper()}",
            user_id=customer.id,
            status="confirmed",
            payment_status="pending",
            subtotal=Decimal("100.00"),
            total_amount=Decimal("100.00"),
            shipping_address={"address": "Test"}
        )
        db_session.add(order)
        db_session.flush()
        
        payment = PaymentTracking(
            id=uuid4(),
            order_id=order.id,
            user_id=customer.id,
            artisan_id=artisan.id,
            type="product",
            amount_total=Decimal("100.00"),
            amount_paid=Decimal("0.00"),
            payment_status=PaymentStatus.UNPAID.value,
            artisan_type="artizaho"
        )
        db_session.add(payment)
        db_session.commit()
        
        # Tenter un paiement trop grand
        response = client.post(
            f"/api/v1/admin/payments/{payment.id}/record",
            headers={"Authorization": f"Bearer {admin_token}"},
            json={
                "amount": 150.00,
                "payment_method": "cash"
            }
        )
        assert response.status_code == 400
        assert "exceeds remaining balance" in response.json()["detail"]
    
    def test_get_pending_payouts_empty(self, client: TestClient, admin_token: str):
        """Test liste vide des payouts en attente"""
        response = client.get(
            "/api/v1/admin/payouts/pending",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert response.status_code == 200
        data = response.json()
        assert "items" in data
        assert "total" in data
        assert "total_net_payout" in data
        assert "total_commission" in data
    
    def test_generate_artisan_payout(
        self, client: TestClient, admin_token: str, db_session: Session
    ):
        """Test génération d'un payout artisan"""
        # Créer artisan avec paiements
        customer = User(
            id=uuid4(),
            email=f"customer_{uuid4().hex[:8]}@test.com",
            password_hash="hashed",
            name="Test Customer",
            role=UserRole.CLIENT,
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
        db_session.add_all([customer, artisan])
        db_session.flush()
        
        # Créer commande payée
        order = Order(
            id=uuid4(),
            order_number=f"ORD-{uuid4().hex[:8].upper()}",
            user_id=customer.id,
            status="confirmed",
            payment_status="paid",
            subtotal=Decimal("1000.00"),
            total_amount=Decimal("1000.00"),
            shipping_address={"address": "Test"}
        )
        db_session.add(order)
        db_session.flush()
        
        # Créer paiement payé
        payment = PaymentTracking(
            id=uuid4(),
            order_id=order.id,
            user_id=customer.id,
            artisan_id=artisan.id,
            type="product",
            amount_total=Decimal("1000.00"),
            amount_paid=Decimal("1000.00"),
            payment_status=PaymentStatus.PAID.value,
            payment_method="cash",
            artisan_type="artizaho"
        )
        db_session.add(payment)
        db_session.commit()
        
        # Générer payout
        period_start = (datetime.utcnow() - timedelta(days=30)).isoformat()
        period_end = datetime.utcnow().isoformat()
        
        response = client.post(
            "/api/v1/admin/payouts/generate",
            headers={"Authorization": f"Bearer {admin_token}"},
            json={
                "artisan_id": str(artisan.id),
                "period_start": period_start,
                "period_end": period_end
            }
        )
        assert response.status_code == 200
        data = response.json()
        assert data["artisan_id"] == str(artisan.id)
        assert data["total_sales"] == 1000.00
        assert data["commission_rate"] == 15.00  # artizaho
        assert data["commission_amount"] == 150.00  # 15% of 1000
        assert data["net_payout"] == 850.00  # 1000 - 150
        assert data["status"] == ArtisanPayoutStatus.PENDING.value
    
    def test_mark_payout_as_paid(
        self, client: TestClient, admin_token: str, db_session: Session
    ):
        """Test marquage d'un payout comme payé"""
        # Créer artisan et payout
        artisan = User(
            id=uuid4(),
            email=f"artisan_{uuid4().hex[:8]}@test.com",
            password_hash="hashed",
            name="Test Artisan",
            role=UserRole.ARTISAN,
            is_active=True
        )
        db_session.add(artisan)
        db_session.flush()
        
        payout = ArtisanPayout(
            id=uuid4(),
            artisan_id=artisan.id,
            period_start=(datetime.utcnow() - timedelta(days=30)).date(),
            period_end=datetime.utcnow().date(),
            total_sales=Decimal("1000.00"),
            commission_rate=Decimal("15.00"),
            commission_amount=Decimal("150.00"),
            net_payout=Decimal("850.00"),
            status=ArtisanPayoutStatus.PENDING.value
        )
        db_session.add(payout)
        db_session.commit()
        
        # Marquer comme payé
        response = client.post(
            f"/api/v1/admin/payouts/{payout.id}/mark-paid",
            headers={"Authorization": f"Bearer {admin_token}"},
            json={
                "payment_method": "bank_transfer",
                "payment_ref": "BANK123",
                "notes": "Paid successfully"
            }
        )
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == ArtisanPayoutStatus.PAID.value
        assert data["payment_method"] == "bank_transfer"
        assert data["payment_ref"] == "BANK123"
        assert data["paid_at"] is not None
    
    def test_get_artisan_payout_history(
        self, client: TestClient, admin_token: str, db_session: Session
    ):
        """Test récupération de l'historique des payouts"""
        # Créer artisan avec plusieurs payouts
        artisan = User(
            id=uuid4(),
            email=f"artisan_{uuid4().hex[:8]}@test.com",
            password_hash="hashed",
            name="Test Artisan",
            role=UserRole.ARTISAN,
            is_active=True
        )
        db_session.add(artisan)
        db_session.flush()
        
        # Créer plusieurs payouts
        for i in range(3):
            payout = ArtisanPayout(
                id=uuid4(),
                artisan_id=artisan.id,
                period_start=(datetime.utcnow() - timedelta(days=60 - i*30)).date(),
                period_end=(datetime.utcnow() - timedelta(days=30 - i*30)).date(),
                total_sales=Decimal("1000.00"),
                commission_rate=Decimal("15.00"),
                commission_amount=Decimal("150.00"),
                net_payout=Decimal("850.00"),
                status=ArtisanPayoutStatus.PAID.value if i < 2 else ArtisanPayoutStatus.PENDING.value
            )
            db_session.add(payout)
        db_session.commit()
        
        # Récupérer l'historique
        response = client.get(
            f"/api/v1/admin/payouts/{artisan.id}/history",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert response.status_code == 200
        data = response.json()
        assert data["total"] == 3
        assert len(data["items"]) == 3
        assert data["total_net_payout"] == 2550.00  # 850 * 3
