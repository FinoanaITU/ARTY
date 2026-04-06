"""
Tests unitaires pour les endpoints de produits
"""
import pytest
from fastapi.testclient import TestClient
from fastapi import status
from sqlalchemy.orm import Session
from uuid import UUID
from app.models.product import Product, Category, ProductImage
from app.models.user import User, UserRole
from decimal import Decimal
import io


class TestGetProducts:
    """Tests pour GET /api/v1/products"""
    
    def test_get_products_empty_list(self, client: TestClient, db: Session):
        """Test de récupération d'une liste vide de produits"""
        response = client.get("/api/v1/products")
        
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        
        assert "items" in data
        assert "total" in data
        assert "page" in data
        assert "pages" in data
        assert "limit" in data
        assert data["items"] == []
        assert data["total"] == 0
        assert data["page"] == 1
        assert data["pages"] == 1
    
    def test_get_products_with_published_product(
        self, client: TestClient, db: Session, created_product: Product
    ):
        """Test de récupération d'une liste avec un produit publié"""
        response = client.get("/api/v1/products")
        
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        
        assert data["total"] == 1
        assert len(data["items"]) == 1
        assert data["items"][0]["name"] == "Masque traditionnel"
        assert data["items"][0]["status"] == "published"
    
    def test_get_products_filter_by_category(
        self, client: TestClient, db: Session, created_product: Product, test_category: Category
    ):
        """Test de filtrage par catégorie"""
        response = client.get(
            "/api/v1/products",
            params={"category": test_category.name}
        )
        
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["total"] >= 1
    
    def test_get_products_filter_by_price_range(
        self, client: TestClient, db: Session, created_product: Product
    ):
        """Test de filtrage par fourchette de prix"""
        response = client.get(
            "/api/v1/products",
            params={"min_price": 40000, "max_price": 50000}
        )
        
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        # Le produit créé a un prix de 45000, donc il doit être dans les résultats
        assert data["total"] >= 1
    
    def test_get_products_filter_by_stock(
        self, client: TestClient, db: Session, created_product: Product
    ):
        """Test de filtrage par disponibilité"""
        response = client.get(
            "/api/v1/products",
            params={"in_stock": True}
        )
        
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        # Le produit créé a un stock de 3, donc il doit être dans les résultats
        assert data["total"] >= 1
    
    def test_get_products_search(
        self, client: TestClient, db: Session, created_product: Product
    ):
        """Test de recherche textuelle"""
        response = client.get(
            "/api/v1/products",
            params={"search": "masque"}
        )
        
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["total"] >= 1
    
    def test_get_products_pagination(
        self, client: TestClient, db: Session, created_product: Product
    ):
        """Test de pagination"""
        response = client.get(
            "/api/v1/products",
            params={"page": 1, "limit": 10}
        )
        
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["page"] == 1
        assert data["limit"] == 10
        assert len(data["items"]) <= 10


class TestGetProduct:
    """Tests pour GET /api/v1/products/{product_id}"""
    
    def test_get_product_success(
        self, client: TestClient, db: Session, created_product: Product
    ):
        """Test de récupération d'un produit par ID"""
        response = client.get(f"/api/v1/products/{created_product.id}")
        
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        
        assert data["id"] == str(created_product.id)
        assert data["name"] == "Masque traditionnel"
        assert data["price"] == 45000
        assert "artisan" in data
        assert "images" in data
    
    def test_get_product_not_found(self, client: TestClient, db: Session):
        """Test de récupération d'un produit inexistant"""
        import uuid
        fake_id = uuid.uuid4()
        response = client.get(f"/api/v1/products/{fake_id}")
        
        assert response.status_code == status.HTTP_404_NOT_FOUND
        assert "non trouvé" in response.json()["detail"].lower() or "not found" in response.json()["detail"].lower()
    
    def test_get_product_with_min_bulk_quantity(
        self, client: TestClient, db: Session, created_product: Product
    ):
        """Test de récupération d'un produit avec min_bulk_quantity"""
        # Mettre à jour le produit pour avoir min_bulk_quantity
        from sqlalchemy import text
        db.execute(
            text("UPDATE products SET min_bulk_quantity = :min_bulk_quantity WHERE id = :id"),
            {
                "id": str(created_product.id),
                "min_bulk_quantity": 10
            }
        )
        db.commit()
        
        response = client.get(f"/api/v1/products/{created_product.id}")
        
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        
        assert data["min_bulk_quantity"] == 10
        assert data["bulk_order_enabled"] == True
    
    def test_get_product_with_subcategory(
        self, client: TestClient, db: Session, created_artisan: User, test_category: Category
    ):
        """Test de récupération d'un produit avec sous-catégorie"""
        from sqlalchemy import text
        import uuid
        
        # Créer une sous-catégorie
        subcategory_id = uuid.uuid4()
        db.execute(
            text("""
                INSERT INTO categories (id, name, slug, parent_id, is_active, created_at, updated_at)
                VALUES (:id, :name, :slug, :parent_id, :is_active, datetime('now'), datetime('now'))
            """),
            {
                "id": str(subcategory_id),
                "name": "Masques traditionnels",
                "slug": "masques-traditionnels",
                "parent_id": str(test_category.id),
                "is_active": True
            }
        )
        db.commit()
        
        # Créer un produit avec la sous-catégorie
        product_id = uuid.uuid4()
        db.execute(
            text("""
                INSERT INTO products (id, title, slug, description, price, category_id, artisan_id, stock_quantity, status, created_at, updated_at)
                VALUES (:id, :title, :slug, :description, :price, :category_id, :artisan_id, :stock_quantity, :status, datetime('now'), datetime('now'))
            """),
            {
                "id": str(product_id),
                "title": "Masque avec sous-catégorie",
                "slug": "masque-avec-sous-categorie",
                "description": "Masque dans une sous-catégorie",
                "price": 50000,
                "category_id": str(subcategory_id),
                "artisan_id": str(created_artisan.id),
                "stock_quantity": 5,
                "status": "published"
            }
        )
        db.commit()
        
        response = client.get(f"/api/v1/products/{product_id}")
        
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        
        assert data["category"] == test_category.name
        assert data["subcategory"] == "Masques traditionnels"


class TestCreateProduct:
    """Tests pour POST /api/v1/products"""
    
    def test_create_product_success(
        self, client: TestClient, db: Session, auth_headers_artisan: dict, test_product_data: dict
    ):
        """Test de création d'un produit réussie"""
        form_data = test_product_data.copy()
        
        response = client.post(
            "/api/v1/products",
            headers=auth_headers_artisan,
            data=form_data
        )
        
        assert response.status_code == status.HTTP_201_CREATED
        data = response.json()
        
        assert data["name"] == test_product_data["name"]
        assert data["price"] == 45000
        assert data["status"] == "draft"  # Statut par défaut
        assert "artisan" in data
        
        # Vérifier dans la base de données
        product = db.query(Product).filter(Product.title == test_product_data["name"]).first()
        assert product is not None
        assert product.status == "draft"
    
    def test_create_product_without_auth(
        self, client: TestClient, db: Session, test_product_data: dict
    ):
        """Test de création sans authentification"""
        response = client.post(
            "/api/v1/products",
            data=test_product_data
        )
        
        assert response.status_code == status.HTTP_401_UNAUTHORIZED
    
    def test_create_product_as_buyer(
        self, client: TestClient, db: Session, auth_headers_buyer: dict, test_product_data: dict
    ):
        """Test de création par un acheteur (doit échouer)"""
        response = client.post(
            "/api/v1/products",
            headers=auth_headers_buyer,
            data=test_product_data
        )
        
        assert response.status_code == status.HTTP_403_FORBIDDEN
    
    def test_create_product_missing_required_fields(
        self, client: TestClient, db: Session, auth_headers_artisan: dict
    ):
        """Test de création avec champs requis manquants"""
        incomplete_data = {
            "name": "Produit test",
            # description manquante
            # category manquante
        }
        
        response = client.post(
            "/api/v1/products",
            headers=auth_headers_artisan,
            data=incomplete_data
        )
        
        assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY
    
    def test_create_product_invalid_price(
        self, client: TestClient, db: Session, auth_headers_artisan: dict, test_product_data: dict
    ):
        """Test de création avec prix invalide"""
        invalid_data = test_product_data.copy()
        invalid_data["price"] = "-100"  # Prix négatif
        
        response = client.post(
            "/api/v1/products",
            headers=auth_headers_artisan,
            data=invalid_data
        )
        
        assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY
    
    def test_create_product_with_min_bulk_quantity(
        self, client: TestClient, db: Session, auth_headers_artisan: dict, test_product_data: dict
    ):
        """Test de création d'un produit avec min_bulk_quantity"""
        form_data = test_product_data.copy()
        form_data["min_bulk_quantity"] = "10"
        
        response = client.post(
            "/api/v1/products",
            headers=auth_headers_artisan,
            data=form_data
        )
        
        assert response.status_code == status.HTTP_201_CREATED
        data = response.json()
        
        assert data["min_bulk_quantity"] == 10
        assert data["bulk_order_enabled"] == True
        
        # Vérifier dans la base de données
        product = db.query(Product).filter(Product.title == test_product_data["name"]).first()
        assert product is not None
        assert product.min_bulk_quantity == 10
        assert product.made_to_order == True


class TestUpdateProduct:
    """Tests pour PATCH /api/v1/products/{product_id}"""
    
    def test_update_product_success(
        self, client: TestClient, db: Session, created_product: Product, auth_headers_artisan: dict
    ):
        """Test de mise à jour réussie"""
        update_data = {
            "name": "Masque traditionnel modifié",
            "price": "50000",
            "stock": "5"
        }
        
        response = client.patch(
            f"/api/v1/products/{created_product.id}",
            headers=auth_headers_artisan,
            data=update_data
        )
        
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        
        assert data["name"] == "Masque traditionnel modifié"
        assert data["price"] == 50000
        assert data["stock"] == 5
        
        # Vérifier dans la base de données
        db.refresh(created_product)
        assert created_product.title == "Masque traditionnel modifié"
    
    def test_update_product_not_owner(
        self, client: TestClient, db: Session, created_product: Product, auth_headers_buyer: dict
    ):
        """Test de mise à jour par un non-propriétaire (doit échouer)"""
        update_data = {"name": "Tentative de modification"}
        
        response = client.patch(
            f"/api/v1/products/{created_product.id}",
            headers=auth_headers_buyer,
            data=update_data
        )
        
        # Doit échouer car l'acheteur n'est pas artisan
        assert response.status_code in [status.HTTP_403_FORBIDDEN, status.HTTP_401_UNAUTHORIZED]
    
    def test_update_product_not_found(
        self, client: TestClient, db: Session, auth_headers_artisan: dict
    ):
        """Test de mise à jour d'un produit inexistant"""
        import uuid
        from fastapi import status as http_status
        fake_id = uuid.uuid4()
        update_data = {"name": "Test"}
        
        response = client.patch(
            f"/api/v1/products/{fake_id}",
            headers=auth_headers_artisan,
            data=update_data
        )
        
        assert response.status_code == 404
    
    def test_update_product_min_bulk_quantity(
        self, client: TestClient, db: Session, created_product: Product, auth_headers_artisan: dict
    ):
        """Test de mise à jour de min_bulk_quantity"""
        update_data = {
            "min_bulk_quantity": "15"
        }
        
        response = client.patch(
            f"/api/v1/products/{created_product.id}",
            headers=auth_headers_artisan,
            data=update_data
        )
        
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        
        assert data["min_bulk_quantity"] == 15
        
        # Vérifier dans la base de données
        db.refresh(created_product)
        assert created_product.min_bulk_quantity == 15


class TestDeleteProduct:
    """Tests pour DELETE /api/v1/products/{product_id}"""
    
    def test_delete_product_success(
        self, client: TestClient, db: Session, created_product: Product, auth_headers_artisan: dict
    ):
        """Test de suppression réussie"""
        product_id = created_product.id
        
        response = client.delete(
            f"/api/v1/products/{product_id}",
            headers=auth_headers_artisan
        )
        
        assert response.status_code == status.HTTP_204_NO_CONTENT
        
        # Vérifier que le produit n'existe plus
        product = db.query(Product).filter(Product.id == product_id).first()
        assert product is None
    
    def test_delete_product_not_owner(
        self, client: TestClient, db: Session, created_product: Product, auth_headers_buyer: dict
    ):
        """Test de suppression par un non-propriétaire (doit échouer)"""
        response = client.delete(
            f"/api/v1/products/{created_product.id}",
            headers=auth_headers_buyer
        )
        
        assert response.status_code in [status.HTTP_403_FORBIDDEN, status.HTTP_401_UNAUTHORIZED]
    
    def test_delete_product_not_found(
        self, client: TestClient, db: Session, auth_headers_artisan: dict
    ):
        """Test de suppression d'un produit inexistant"""
        import uuid
        fake_id = uuid.uuid4()
        
        response = client.delete(
            f"/api/v1/products/{fake_id}",
            headers=auth_headers_artisan
        )
        
        assert response.status_code == status.HTTP_404_NOT_FOUND


class TestGetCategories:
    """Tests pour GET /api/v1/products/categories"""
    
    def test_get_categories_success(
        self, client: TestClient, db: Session, test_category: Category
    ):
        """Test de récupération de la liste des catégories"""
        response = client.get("/api/v1/products/categories")
        
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        
        assert "categories" in data
        assert len(data["categories"]) >= 1
        
        # Vérifier que la catégorie de test est présente
        category_names = [cat["name"] for cat in data["categories"]]
        assert test_category.name in category_names
    
    def test_get_categories_with_subcategories(
        self, client: TestClient, db: Session, test_category: Category
    ):
        """Test de récupération des catégories avec sous-catégories"""
        from app.models.product import Category
        from sqlalchemy import text
        import uuid
        
        # Créer une sous-catégorie
        subcategory_id = uuid.uuid4()
        db.execute(
            text("""
                INSERT INTO categories (id, name, slug, parent_id, is_active, created_at, updated_at)
                VALUES (:id, :name, :slug, :parent_id, :is_active, datetime('now'), datetime('now'))
            """),
            {
                "id": str(subcategory_id),
                "name": "Masques traditionnels",
                "slug": "masques-traditionnels",
                "parent_id": str(test_category.id),
                "is_active": True
            }
        )
        db.commit()
        
        response = client.get("/api/v1/products/categories")
        
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        
        # Trouver la catégorie principale
        main_category = next(
            (cat for cat in data["categories"] if cat["name"] == test_category.name),
            None
        )
        assert main_category is not None
        assert "Masques traditionnels" in main_category["subcategories"]


class TestGetSimilarProducts:
    """Tests pour GET /api/v1/products/{product_id}/similar"""
    
    def test_get_similar_products_success(
        self, client: TestClient, db: Session, created_product: Product, test_category: Category
    ):
        """Test de récupération de produits similaires"""
        from sqlalchemy import text
        import uuid
        from app.models.user import User
        
        # Créer un autre produit dans la même catégorie
        artisan = db.query(User).filter(User.role == "artisan").first()
        similar_product_id = uuid.uuid4()
        
        db.execute(
            text("""
                INSERT INTO products (id, title, slug, description, price, category_id, artisan_id, stock_quantity, status, created_at, updated_at)
                VALUES (:id, :title, :slug, :description, :price, :category_id, :artisan_id, :stock_quantity, :status, datetime('now'), datetime('now'))
            """),
            {
                "id": str(similar_product_id),
                "title": "Masque similaire",
                "slug": "masque-similaire",
                "description": "Autre masque traditionnel",
                "price": 50000,
                "category_id": str(test_category.id),
                "artisan_id": str(artisan.id),
                "stock_quantity": 5,
                "status": "published"
            }
        )
        db.commit()
        
        response = client.get(f"/api/v1/products/{created_product.id}/similar")
        
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        
        assert "items" in data
        assert "total" in data
        assert data["total"] >= 1
        assert len(data["items"]) >= 1
    
    def test_get_similar_products_not_found(
        self, client: TestClient, db: Session
    ):
        """Test de récupération de produits similaires pour un produit inexistant"""
        import uuid
        fake_id = uuid.uuid4()
        
        response = client.get(f"/api/v1/products/{fake_id}/similar")
        
        assert response.status_code == status.HTTP_404_NOT_FOUND
    
    def test_get_similar_products_with_limit(
        self, client: TestClient, db: Session, created_product: Product, test_category: Category
    ):
        """Test de récupération de produits similaires avec limite"""
        from sqlalchemy import text
        import uuid
        from app.models.user import User
        
        # Créer plusieurs produits similaires
        artisan = db.query(User).filter(User.role == "artisan").first()
        for i in range(5):
            product_id = uuid.uuid4()
            db.execute(
                text("""
                    INSERT INTO products (id, title, slug, description, price, category_id, artisan_id, stock_quantity, status, created_at, updated_at)
                    VALUES (:id, :title, :slug, :description, :price, :category_id, :artisan_id, :stock_quantity, :status, datetime('now'), datetime('now'))
                """),
                {
                    "id": str(product_id),
                    "title": f"Produit similaire {i}",
                    "slug": f"produit-similaire-{i}",
                    "description": f"Description {i}",
                    "price": 40000 + i * 1000,
                    "category_id": str(test_category.id),
                    "artisan_id": str(artisan.id),
                    "stock_quantity": 5,
                    "status": "published"
                }
            )
        db.commit()
        
        response = client.get(
            f"/api/v1/products/{created_product.id}/similar",
            params={"limit": 3}
        )
        
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        
        assert len(data["items"]) <= 3
        assert data["limit"] == 3
