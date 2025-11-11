"""
Configuration et fixtures partagées pour les tests
"""
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine, event
from sqlalchemy.orm import sessionmaker, Session
from sqlalchemy.pool import StaticPool
from typing import Generator
import os
import sys

# Ajouter le répertoire parent au PYTHONPATH
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.main import app
from app.core.database import get_db
from app.core.config import settings
from app.core.security import get_password_hash
from app.models.user import User, ArtisanProfile, ArtisanPhoto, UserSession, UserRole, BuyerType, Nationality, ProfileStatus
from app.models.base import BaseModel
import uuid

# Configuration de la base de données de test
# Utiliser PostgreSQL si disponible (recommandé), sinon SQLite en fallback
TEST_DB_URL = os.getenv("TEST_DATABASE_URL", settings.DATABASE_TEST_URL)
USE_POSTGRESQL = "postgresql" in TEST_DB_URL.lower()

# Tester la connexion PostgreSQL, fallback vers SQLite si échec
if USE_POSTGRESQL:
    try:
        # Tester la connexion PostgreSQL
        from sqlalchemy import text
        test_engine = create_engine(TEST_DB_URL, pool_pre_ping=True)
        with test_engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        USE_POSTGRESQL = True
        print(f"✅ Utilisation de PostgreSQL pour les tests: {TEST_DB_URL.split('@')[-1] if '@' in TEST_DB_URL else TEST_DB_URL}")
    except Exception as e:
        # Fallback vers SQLite si PostgreSQL n'est pas disponible
        USE_POSTGRESQL = False
        TEST_DB_URL = "sqlite:///:memory:"
        print(f"⚠️  PostgreSQL non disponible ({e}), utilisation de SQLite pour les tests")
else:
    TEST_DB_URL = "sqlite:///:memory:"
    print("⚠️  Utilisation de SQLite pour les tests (PostgreSQL recommandé)")

# Créer un engine de test
if USE_POSTGRESQL:
    # Configuration PostgreSQL
    engine = create_engine(
        TEST_DB_URL,
        pool_pre_ping=True,
        pool_recycle=300,
        echo=False
    )
else:
    # Configuration SQLite
    engine = create_engine(
        TEST_DB_URL,
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
        echo=False
    )

TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


@event.listens_for(engine, "connect")
def set_sqlite_pragma(dbapi_conn, connection_record):
    """Active le support JSON et les clés étrangères pour SQLite"""
    if not USE_POSTGRESQL:
        cursor = dbapi_conn.cursor()
        cursor.execute("PRAGMA foreign_keys=ON")
        cursor.close()


@pytest.fixture(scope="function")
def db() -> Generator[Session, None, None]:
    """
    Crée une nouvelle base de données de test pour chaque test.
    Les tables sont créées avant le test et supprimées après.
    """
    # Utiliser directement les modèles SQLAlchemy
    # SQLAlchemy devrait gérer la conversion des types pour SQLite
    # Si ça ne fonctionne pas, on créera les tables manuellement
    
    try:
        # Essayer de créer les tables avec les modèles
        BaseModel.metadata.drop_all(bind=engine)
        BaseModel.metadata.create_all(bind=engine)
    except Exception as e:
        # Si ça échoue (par exemple à cause d'ARRAY avec SQLite), créer les tables manuellement
        if not USE_POSTGRESQL:
            print(f"Warning: Could not create tables with models: {e}")
            print("Creating tables manually for SQLite compatibility...")
            _create_tables_manually(engine)
        else:
            # Avec PostgreSQL, cela ne devrait pas échouer
            raise e
    
    # Créer une session de test
    session = TestingSessionLocal()
    
    try:
        yield session
    finally:
        # Nettoyer après le test
        session.close()
        try:
            BaseModel.metadata.drop_all(bind=engine)
        except Exception:
            pass


def _create_tables_manually(engine):
    """Crée les tables manuellement avec des types SQLite-compatibles"""
    from sqlalchemy import text
    
    with engine.connect() as conn:
        # Table users
        conn.execute(text("""
            CREATE TABLE IF NOT EXISTS users (
                id VARCHAR(36) PRIMARY KEY,
                email VARCHAR(255) UNIQUE NOT NULL,
                password_hash VARCHAR(255) NOT NULL,
                name VARCHAR(200) NOT NULL,
                phone VARCHAR(20),
                address TEXT,
                city VARCHAR(100),
                country VARCHAR(100),
                role VARCHAR(20) NOT NULL,
                avatar VARCHAR(500),
                buyer_type VARCHAR(20),
                nationality VARCHAR(20),
                company_name VARCHAR(200),
                siret VARCHAR(50),
                is_active BOOLEAN NOT NULL DEFAULT 1,
                is_email_verified BOOLEAN NOT NULL DEFAULT 0,
                last_login_at DATETIME,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        """))
        
        # Table artisan_profiles
        conn.execute(text("""
            CREATE TABLE IF NOT EXISTS artisan_profiles (
                id VARCHAR(36) PRIMARY KEY,
                user_id VARCHAR(36) UNIQUE NOT NULL,
                region VARCHAR(100),
                languages TEXT,
                company_name VARCHAR(200) NOT NULL,
                main_specialty VARCHAR(100) NOT NULL,
                other_skills TEXT,
                years_experience VARCHAR(50),
                activity_description TEXT NOT NULL,
                brand_story TEXT,
                offerings TEXT,
                nif VARCHAR(50),
                stat VARCHAR(50),
                documents_not_available BOOLEAN NOT NULL DEFAULT 0,
                status VARCHAR(20) NOT NULL,
                admin_notes TEXT,
                about TEXT,
                specialties TEXT,
                location_region VARCHAR(100),
                location_city VARCHAR(100),
                location_address VARCHAR(200),
                experience VARCHAR(200),
                artisan_type VARCHAR(20),
                business_info TEXT,
                certifications TEXT,
                awards TEXT,
                social_media TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id)
            )
        """))
        
        # Table artisan_photos
        # Note: Le modèle utilise "position" au lieu de "order" (mot-clé réservé SQL)
        conn.execute(text("""
            CREATE TABLE IF NOT EXISTS artisan_photos (
                id VARCHAR(36) PRIMARY KEY,
                artisan_profile_id VARCHAR(36) NOT NULL,
                photo_url VARCHAR(500) NOT NULL,
                position INTEGER NOT NULL DEFAULT 0,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (artisan_profile_id) REFERENCES artisan_profiles(id)
            )
        """))
        
        # Table user_sessions
        conn.execute(text("""
            CREATE TABLE IF NOT EXISTS user_sessions (
                id VARCHAR(36) PRIMARY KEY,
                user_id VARCHAR(36) NOT NULL,
                refresh_token VARCHAR(500) UNIQUE NOT NULL,
                access_token_jti VARCHAR(100) UNIQUE,
                device_info TEXT,
                is_active BOOLEAN NOT NULL DEFAULT 1,
                expires_at DATETIME NOT NULL,
                last_used_at DATETIME,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id)
            )
        """))
        
        # Table categories
        conn.execute(text("""
            CREATE TABLE IF NOT EXISTS categories (
                id VARCHAR(36) PRIMARY KEY,
                name VARCHAR(100) NOT NULL,
                slug VARCHAR(100) UNIQUE NOT NULL,
                description TEXT,
                parent_id VARCHAR(36),
                image_url VARCHAR(500),
                icon VARCHAR(50),
                sort_order INTEGER DEFAULT 0,
                is_active BOOLEAN DEFAULT 1,
                meta_title VARCHAR(160),
                meta_description VARCHAR(320),
                level INTEGER DEFAULT 0,
                path VARCHAR(255),
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (parent_id) REFERENCES categories(id)
            )
        """))
        
        # Table products
        conn.execute(text("""
            CREATE TABLE IF NOT EXISTS products (
                id VARCHAR(36) PRIMARY KEY,
                title VARCHAR(200) NOT NULL,
                slug VARCHAR(200) UNIQUE NOT NULL,
                description TEXT NOT NULL,
                short_description VARCHAR(500),
                price NUMERIC(10, 2) NOT NULL,
                compare_at_price NUMERIC(10, 2),
                cost_price NUMERIC(10, 2),
                category_id VARCHAR(36) NOT NULL,
                artisan_id VARCHAR(36) NOT NULL,
                stock_quantity INTEGER DEFAULT 0,
                track_inventory BOOLEAN DEFAULT 1,
                allow_backorders BOOLEAN DEFAULT 0,
                low_stock_threshold INTEGER DEFAULT 5,
                weight_grams INTEGER,
                dimensions TEXT,
                materials TEXT,
                colors TEXT,
                techniques TEXT,
                origin_region VARCHAR(100),
                status VARCHAR(20) DEFAULT 'draft',
                visibility VARCHAR(20) DEFAULT 'public',
                featured BOOLEAN DEFAULT 0,
                handmade BOOLEAN DEFAULT 1,
                customizable BOOLEAN DEFAULT 0,
                made_to_order BOOLEAN DEFAULT 0,
                min_bulk_quantity INTEGER,
                production_time_days INTEGER,
                meta_title VARCHAR(160),
                meta_description VARCHAR(320),
                tags TEXT,
                view_count INTEGER DEFAULT 0,
                favorite_count INTEGER DEFAULT 0,
                sales_count INTEGER DEFAULT 0,
                rating_average NUMERIC(3, 2) DEFAULT 0,
                rating_count INTEGER DEFAULT 0,
                published_at DATETIME,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (category_id) REFERENCES categories(id),
                FOREIGN KEY (artisan_id) REFERENCES users(id)
            )
        """))
        
        # Table product_images
        conn.execute(text("""
            CREATE TABLE IF NOT EXISTS product_images (
                id VARCHAR(36) PRIMARY KEY,
                product_id VARCHAR(36) NOT NULL,
                image_url VARCHAR(500) NOT NULL,
                alt_text VARCHAR(200),
                sort_order INTEGER DEFAULT 0,
                is_primary BOOLEAN DEFAULT 0,
                width INTEGER,
                height INTEGER,
                file_size INTEGER,
                format VARCHAR(10),
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (product_id) REFERENCES products(id)
            )
        """))
        
        # Table bulk_order_requests
        conn.execute(text("""
            CREATE TABLE IF NOT EXISTS bulk_order_requests (
                id VARCHAR(36) PRIMARY KEY,
                product_id VARCHAR(36) NOT NULL,
                quantity INTEGER NOT NULL,
                unit_price NUMERIC(10, 2) NOT NULL,
                discount_percentage NUMERIC(5, 2) DEFAULT 0,
                discount_amount NUMERIC(10, 2) DEFAULT 0,
                total_amount NUMERIC(10, 2) NOT NULL,
                customer_name VARCHAR(200) NOT NULL,
                customer_email VARCHAR(255) NOT NULL,
                customer_phone VARCHAR(50) NOT NULL,
                company VARCHAR(200),
                message TEXT,
                status VARCHAR(20) DEFAULT 'pending',
                artisan_notes TEXT,
                contacted_at DATETIME,
                confirmed_at DATETIME,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (product_id) REFERENCES products(id)
            )
        """))
        
        conn.commit()


@pytest.fixture(scope="function")
def client(db: Session) -> Generator[TestClient, None, None]:
    """
    Crée un client de test FastAPI avec une base de données de test.
    """
    def override_get_db():
        try:
            yield db
        finally:
            pass
    
    # Remplacer la dépendance get_db
    app.dependency_overrides[get_db] = override_get_db
    
    with TestClient(app) as test_client:
        yield test_client
    
    # Nettoyer les overrides
    app.dependency_overrides.clear()


@pytest.fixture
def test_buyer_data():
    """Données de test pour un acheteur particulier"""
    import time
    return {
        "email": f"buyer_{int(time.time() * 1000000)}@test.com",
        "password": "testpassword123",
        "name": "Test Buyer",
        "phone": "+261341234567",
        "city": "Antananarivo",
        "country": "madagascar",
        "buyer_type": "particulier"
    }


@pytest.fixture
def test_buyer_entreprise_data():
    """Données de test pour un acheteur entreprise"""
    import time
    return {
        "email": f"entreprise_{int(time.time() * 1000000)}@test.com",
        "password": "testpassword123",
        "name": "Test Company",
        "phone": "+261341234567",
        "city": "Antananarivo",
        "country": "madagascar",
        "buyer_type": "entreprise",
        "company_name": "Test Company SARL",
        "siret": "12345678901234"
    }


@pytest.fixture
def test_artisan_data():
    """Données de test pour un artisan"""
    import time
    return {
        "email": f"artisan_{int(time.time() * 1000000)}@test.com",
        "password": "testpassword123",
        "name": "Test Artisan",
        "phone": "+261341234567",
        "city": "Antananarivo",
        "country": "madagascar",
        "region": "Analamanga",
        "languages": ["fr", "mg"],
        "company_name": "Artisan Test",
        "main_specialty": "Pottery",
        "other_skills": ["Ceramics", "Painting"],
        "years_experience": "5-10",
        "activity_description": "I create beautiful pottery",
        "brand_story": "Started as a hobby",
        "offerings": ["products"],
        "nif": "123456789",
        "stat": "987654321",
        "documents_not_available": False
    }


@pytest.fixture
def created_buyer(db: Session, test_buyer_data: dict) -> User:
    """Crée un acheteur dans la base de données de test"""
    # Utiliser SQL brut pour SQLite pour éviter les problèmes d'ID
    from sqlalchemy import text
    
    user_id = uuid.uuid4()
    
    # Créer l'utilisateur avec SQL brut
    db.execute(
        text("""
            INSERT INTO users (id, email, password_hash, name, phone, city, country, role, buyer_type, nationality, is_active, is_email_verified, created_at, updated_at)
            VALUES (:id, :email, :password_hash, :name, :phone, :city, :country, :role, :buyer_type, :nationality, :is_active, :is_email_verified, datetime('now'), datetime('now'))
        """),
        {
            "id": str(user_id),
            "email": test_buyer_data["email"],
            "password_hash": get_password_hash(test_buyer_data["password"]),
            "name": test_buyer_data["name"],
            "phone": test_buyer_data.get("phone"),
            "city": test_buyer_data["city"],
            "country": test_buyer_data["country"],
            "role": UserRole.BUYER.value,
            "buyer_type": BuyerType.PARTICULIER.value,
            "nationality": Nationality.LOCAL.value,
            "is_active": True,
            "is_email_verified": False
        }
    )
    db.commit()
    
    # Récupérer l'utilisateur créé
    user = db.query(User).filter(User.id == str(user_id)).first()
    if not user:
        # Essayer avec UUID directement
        try:
            user = db.query(User).filter(User.id == user_id).first()
        except:
            pass
    return user


@pytest.fixture
def created_artisan(db: Session, test_artisan_data: dict) -> User:
    """Crée un artisan dans la base de données de test"""
    import json
    from sqlalchemy import text
    
    user_id = uuid.uuid4()
    profile_id = uuid.uuid4()
    
    # Créer l'utilisateur avec SQL brut pour éviter les problèmes de type
    db.execute(
        text("""
            INSERT INTO users (id, email, password_hash, name, phone, city, country, role, nationality, is_active, is_email_verified, created_at, updated_at)
            VALUES (:id, :email, :password_hash, :name, :phone, :city, :country, :role, :nationality, :is_active, :is_email_verified, datetime('now'), datetime('now'))
        """),
        {
            "id": str(user_id),
            "email": test_artisan_data["email"],
            "password_hash": get_password_hash(test_artisan_data["password"]),
            "name": test_artisan_data["name"],
            "phone": test_artisan_data.get("phone"),
            "city": test_artisan_data["city"],
            "country": test_artisan_data["country"],
            "role": UserRole.ARTISAN.value,
            "nationality": Nationality.LOCAL.value,
            "is_active": True,
            "is_email_verified": False
        }
    )
    
    # Créer le profil artisan avec JSON sérialisé pour les listes
    db.execute(
        text("""
            INSERT INTO artisan_profiles (id, user_id, region, languages, company_name, main_specialty, other_skills, years_experience, activity_description, brand_story, offerings, nif, stat, documents_not_available, status, created_at, updated_at)
            VALUES (:id, :user_id, :region, :languages, :company_name, :main_specialty, :other_skills, :years_experience, :activity_description, :brand_story, :offerings, :nif, :stat, :documents_not_available, :status, datetime('now'), datetime('now'))
        """),
        {
            "id": str(profile_id),
            "user_id": str(user_id),
            "region": test_artisan_data.get("region"),
            "languages": json.dumps(test_artisan_data.get("languages", [])),
            "company_name": test_artisan_data["company_name"],
            "main_specialty": test_artisan_data["main_specialty"],
            "other_skills": json.dumps(test_artisan_data.get("other_skills", [])),
            "years_experience": test_artisan_data.get("years_experience"),
            "activity_description": test_artisan_data["activity_description"],
            "brand_story": test_artisan_data.get("brand_story"),
            "offerings": json.dumps(test_artisan_data.get("offerings", [])),
            "nif": test_artisan_data.get("nif"),
            "stat": test_artisan_data.get("stat"),
            "documents_not_available": test_artisan_data.get("documents_not_available", False),
            "status": ProfileStatus.PENDING_APPROVAL.value
        }
    )
    
    db.commit()
    
    # Récupérer l'utilisateur créé (utiliser string pour SQLite)
    user = db.query(User).filter(User.id == str(user_id)).first()
    if not user:
        # Essayer avec UUID directement
        try:
            user = db.query(User).filter(User.id == user_id).first()
        except:
            pass
    return user


@pytest.fixture
def auth_headers_buyer(client: TestClient, created_buyer: User, test_buyer_data: dict) -> dict:
    """Crée un token d'authentification pour un acheteur"""
    response = client.post(
        "/api/v1/auth/login",
        json={
            "email": test_buyer_data["email"],
            "password": test_buyer_data["password"]
        }
    )
    assert response.status_code == 200
    token = response.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture
def auth_headers_artisan(client: TestClient, created_artisan: User, test_artisan_data: dict) -> dict:
    """Crée un token d'authentification pour un artisan"""
    response = client.post(
        "/api/v1/auth/login",
        json={
            "email": test_artisan_data["email"],
            "password": test_artisan_data["password"]
        }
    )
    assert response.status_code == 200
    token = response.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture
def test_category(db: Session):
    """Crée une catégorie de test"""
    from app.models.product import Category
    from sqlalchemy import text
    
    category_id = uuid.uuid4()
    db.execute(
        text("""
            INSERT INTO categories (id, name, slug, is_active, created_at, updated_at)
            VALUES (:id, :name, :slug, :is_active, datetime('now'), datetime('now'))
        """),
        {
            "id": str(category_id),
            "name": "Sculpture et Bois",
            "slug": "sculpture-et-bois",
            "is_active": True
        }
    )
    db.commit()
    
    # Récupérer la catégorie créée en utilisant le bon type d'ID
    category = db.query(Category).filter(Category.id == str(category_id)).first()
    if not category:
        # Essayer avec UUID directement
        try:
            category = db.query(Category).filter(Category.id == category_id).first()
        except:
            pass
    
    return category


@pytest.fixture
def test_product_data():
    """Données de test pour un produit"""
    return {
        "name": "Masque traditionnel",
        "description": "Masque en bois sculpté à la main avec peinture naturelle",
        "category": "Sculpture et Bois",
        "subcategory": "Masques traditionnels",
        "price": "45000",
        "materials": "Bois,Peinture naturelle",
        "available_colors": "Rouge,Bleu",
        "stock": "3",
        "customizable": "true",
        "production_time_days": "15",
        "bulk_order_enabled": "true",
        "min_bulk_quantity": "5"
    }


@pytest.fixture
def created_product(db: Session, created_artisan: User, test_category):
    """Crée un produit dans la base de données de test"""
    from app.models.product import Product, ProductImage
    from sqlalchemy import text
    import json
    
    product_id = uuid.uuid4()
    
    # Créer le produit avec SQL brut
    db.execute(
        text("""
            INSERT INTO products (id, title, slug, description, price, category_id, artisan_id, stock_quantity, materials, colors, customizable, production_time_days, made_to_order, min_bulk_quantity, status, created_at, updated_at)
            VALUES (:id, :title, :slug, :description, :price, :category_id, :artisan_id, :stock_quantity, :materials, :colors, :customizable, :production_time_days, :made_to_order, :min_bulk_quantity, :status, datetime('now'), datetime('now'))
        """),
        {
            "id": str(product_id),
            "title": "Masque traditionnel",
            "slug": "masque-traditionnel",
            "description": "Masque en bois sculpté à la main",
            "price": 45000,
            "category_id": str(test_category.id),
            "artisan_id": str(created_artisan.id),
            "stock_quantity": 3,
            "materials": json.dumps(["Bois", "Peinture naturelle"]),
            "colors": json.dumps(["Rouge", "Bleu"]),
            "customizable": True,
            "production_time_days": 15,
            "made_to_order": True,
            "min_bulk_quantity": 5,
            "status": "published"
        }
    )
    
    # Ajouter une image
    image_id = uuid.uuid4()
    db.execute(
        text("""
            INSERT INTO product_images (id, product_id, image_url, sort_order, is_primary, created_at, updated_at)
            VALUES (:id, :product_id, :image_url, :sort_order, :is_primary, datetime('now'), datetime('now'))
        """),
        {
            "id": str(image_id),
            "product_id": str(product_id),
            "image_url": "https://example.com/image.jpg",
            "sort_order": 0,
            "is_primary": True
        }
    )
    
    db.commit()
    
    # Récupérer le produit créé en utilisant le bon type d'ID
    from app.models.product import Product
    product = db.query(Product).filter(Product.id == str(product_id)).first()
    if not product:
        # Essayer avec UUID directement
        try:
            product = db.query(Product).filter(Product.id == product_id).first()
        except:
            pass
    
    return product
