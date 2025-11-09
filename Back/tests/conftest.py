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
from app.core.security import get_password_hash
from app.models.user import User, ArtisanProfile, ArtisanPhoto, UserSession, UserRole, BuyerType, Nationality, ProfileStatus
from app.models.base import BaseModel
import uuid

# Base de données de test SQLite en mémoire
SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"

# Créer un engine de test
engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
    echo=False  # Désactiver les logs SQL pour les tests
)

TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


@event.listens_for(engine, "connect")
def set_sqlite_pragma(dbapi_conn, connection_record):
    """Active le support JSON et les clés étrangères pour SQLite"""
    cursor = dbapi_conn.cursor()
    cursor.execute("PRAGMA foreign_keys=ON")
    cursor.close()


# Patcher les types PostgreSQL pour SQLite
from sqlalchemy.dialects import registry

# Enregistrer un dialect SQLite personnalisé qui convertit ARRAY en JSON
# Pour l'instant, on utilise une approche plus simple : créer les tables manuellement


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
        # Si ça échoue (par exemple à cause d'ARRAY), créer les tables manuellement
        print(f"Warning: Could not create tables with models: {e}")
        _create_tables_manually(engine)
    
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
    # Utiliser directement les modèles SQLAlchemy
    # Les IDs seront stockés comme UUID mais SQLite les convertira en string
    user = User(
        id=uuid.uuid4(),
        email=test_buyer_data["email"],
        password_hash=get_password_hash(test_buyer_data["password"]),
        name=test_buyer_data["name"],
        phone=test_buyer_data.get("phone"),
        city=test_buyer_data["city"],
        country=test_buyer_data["country"],
        role=UserRole.BUYER,
        buyer_type=BuyerType.PARTICULIER,
        nationality=Nationality.LOCAL,
        is_active=True,
        is_email_verified=False
    )
    db.add(user)
    db.commit()
    db.refresh(user)
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
    
    # Récupérer l'utilisateur créé
    user = db.query(User).filter(User.id == user_id).first()
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
