"""
Tests unitaires pour les endpoints d'authentification API
"""
import pytest
from fastapi.testclient import TestClient
from fastapi import status
from sqlalchemy.orm import Session
from app.models.user import User, UserRole, BuyerType, Nationality
from app.core.security import verify_password, get_password_hash
import uuid
import io


class TestBuyerRegistrationAPI:
    """Tests pour l'endpoint d'inscription des acheteurs"""
    
    def test_register_buyer_particulier_success(
        self, client: TestClient, db: Session, test_buyer_data: dict
    ):
        """Test d'inscription réussie d'un acheteur particulier"""
        response = client.post(
            "/api/v1/auth/register/buyer",
            json=test_buyer_data
        )
        
        assert response.status_code == status.HTTP_201_CREATED
        data = response.json()
        
        # Vérifier la structure de la réponse
        assert "access_token" in data
        assert "refresh_token" in data
        assert "token_type" in data
        assert data["token_type"] == "bearer"
        assert "user" in data
        
        # Vérifier les données utilisateur
        user_data = data["user"]
        assert user_data["email"] == test_buyer_data["email"]
        assert user_data["name"] == test_buyer_data["name"]
        assert user_data["role"] == "buyer"
        assert user_data["buyer_type"] == "particulier"
        assert user_data["nationality"] == "local"
        
        # Vérifier que l'utilisateur existe dans la base de données
        user = db.query(User).filter(User.email == test_buyer_data["email"]).first()
        assert user is not None
        assert user.role == UserRole.BUYER
        assert user.buyer_type == BuyerType.PARTICULIER
        assert user.nationality == Nationality.LOCAL
        assert verify_password(test_buyer_data["password"], user.password_hash)
    
    def test_register_buyer_entreprise_success(
        self, client: TestClient, db: Session, test_buyer_entreprise_data: dict
    ):
        """Test d'inscription réussie d'un acheteur entreprise"""
        response = client.post(
            "/api/v1/auth/register/buyer",
            json=test_buyer_entreprise_data
        )
        
        assert response.status_code == status.HTTP_201_CREATED
        data = response.json()
        
        user_data = data["user"]
        assert user_data["email"] == test_buyer_entreprise_data["email"]
        assert user_data["buyer_type"] == "entreprise"
        assert user_data["company_name"] == test_buyer_entreprise_data["company_name"]
        assert user_data["siret"] == test_buyer_entreprise_data["siret"]
        
        # Vérifier dans la base de données
        user = db.query(User).filter(User.email == test_buyer_entreprise_data["email"]).first()
        assert user.company_name == test_buyer_entreprise_data["company_name"]
        assert user.siret == test_buyer_entreprise_data["siret"]
    
    def test_register_buyer_duplicate_email(
        self, client: TestClient, created_buyer: User, test_buyer_data: dict
    ):
        """Test d'inscription avec un email déjà existant"""
        # Utiliser l'email du buyer créé
        test_buyer_data["email"] = created_buyer.email
        response = client.post(
            "/api/v1/auth/register/buyer",
            json=test_buyer_data
        )
        
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert "existe déjà" in response.json()["detail"].lower() or "already exists" in response.json()["detail"].lower()
    
    def test_register_buyer_invalid_email(
        self, client: TestClient, test_buyer_data: dict
    ):
        """Test d'inscription avec un email invalide"""
        test_buyer_data["email"] = "invalid-email"
        response = client.post(
            "/api/v1/auth/register/buyer",
            json=test_buyer_data
        )
        
        assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY
    
    def test_register_buyer_missing_required_fields(
        self, client: TestClient, test_buyer_data: dict
    ):
        """Test d'inscription avec des champs requis manquants"""
        # Créer une copie pour ne pas modifier le fixture
        invalid_data = test_buyer_data.copy()
        del invalid_data["email"]
        response = client.post(
            "/api/v1/auth/register/buyer",
            json=invalid_data
        )
        
        assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY
    
    def test_register_buyer_empty_password(
        self, client: TestClient, test_buyer_data: dict
    ):
        """Test d'inscription avec mot de passe vide"""
        test_buyer_data["password"] = ""
        response = client.post(
            "/api/v1/auth/register/buyer",
            json=test_buyer_data
        )
        
        assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY
    
    def test_register_buyer_foreign_country(
        self, client: TestClient, db: Session, test_buyer_data: dict
    ):
        """Test d'inscription avec un pays étranger"""
        test_buyer_data["country"] = "france"
        response = client.post(
            "/api/v1/auth/register/buyer",
            json=test_buyer_data
        )
        
        assert response.status_code == status.HTTP_201_CREATED
        user = db.query(User).filter(User.email == test_buyer_data["email"]).first()
        assert user.nationality == Nationality.FOREIGN
    
    def test_register_buyer_entreprise_without_company_name(
        self, client: TestClient, test_buyer_data: dict
    ):
        """Test d'inscription entreprise sans company_name (doit échouer)"""
        invalid_data = test_buyer_data.copy()
        invalid_data["buyer_type"] = "entreprise"
        invalid_data["company_name"] = None  # Manquant
        invalid_data["siret"] = "12345678901234"
        
        response = client.post(
            "/api/v1/auth/register/buyer",
            json=invalid_data
        )
        
        assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY
    
    def test_register_buyer_entreprise_with_empty_company_name(
        self, client: TestClient, test_buyer_data: dict
    ):
        """Test d'inscription entreprise avec company_name vide (doit échouer)"""
        invalid_data = test_buyer_data.copy()
        invalid_data["buyer_type"] = "entreprise"
        invalid_data["company_name"] = "   "  # Espaces seulement
        invalid_data["siret"] = "12345678901234"
        
        response = client.post(
            "/api/v1/auth/register/buyer",
            json=invalid_data
        )
        
        assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY


class TestArtisanRegistrationAPI:
    """Tests pour l'endpoint d'inscription des artisans"""
    
    def test_register_artisan_success(
        self, client: TestClient, db: Session, test_artisan_data: dict
    ):
        """Test d'inscription réussie d'un artisan"""
        # Préparer les données pour multipart/form-data
        form_data = {
            "email": test_artisan_data["email"],
            "password": test_artisan_data["password"],
            "name": test_artisan_data["name"],
            "phone": test_artisan_data.get("phone", ""),
            "region": test_artisan_data["region"],
            "city": test_artisan_data["city"],
            "address": test_artisan_data.get("address", ""),
            "languages": ",".join(test_artisan_data["languages"]),
            "company_name": test_artisan_data["company_name"],
            "main_specialty": test_artisan_data["main_specialty"],
            "other_skills": ",".join(test_artisan_data["other_skills"]),
            "years_experience": test_artisan_data["years_experience"],
            "activity_description": test_artisan_data["activity_description"],
            "brand_story": test_artisan_data.get("brand_story", ""),
            "offerings": ",".join(test_artisan_data["offerings"]),
            "nif": test_artisan_data.get("nif", ""),
            "stat": test_artisan_data.get("stat", ""),
            "documents_not_available": str(test_artisan_data["documents_not_available"])
        }
        
        response = client.post(
            "/api/v1/auth/register/artisan",
            data=form_data
        )
        
        assert response.status_code == status.HTTP_201_CREATED
        data = response.json()
        
        assert "access_token" in data
        assert "refresh_token" in data
        assert "user" in data
        
        user_data = data["user"]
        assert user_data["email"] == test_artisan_data["email"]
        assert user_data["role"] == "artisan"
        
        # Vérifier dans la base de données
        user = db.query(User).filter(User.email == test_artisan_data["email"]).first()
        assert user is not None
        assert user.role == UserRole.ARTISAN
        assert user.artisan_profile is not None
        assert user.artisan_profile.company_name == test_artisan_data["company_name"]
        assert user.artisan_profile.main_specialty == test_artisan_data["main_specialty"]
    
    def test_register_artisan_duplicate_email(
        self, client: TestClient, created_artisan: User, test_artisan_data: dict
    ):
        """Test d'inscription artisan avec email déjà existant"""
        # Utiliser l'email de l'artisan créé
        test_artisan_data["email"] = created_artisan.email
        
        form_data = {
            "email": test_artisan_data["email"],
            "password": test_artisan_data["password"],
            "name": test_artisan_data["name"],
            "region": test_artisan_data["region"],
            "city": test_artisan_data["city"],
            "languages": ",".join(test_artisan_data["languages"]),
            "company_name": test_artisan_data["company_name"],
            "main_specialty": test_artisan_data["main_specialty"],
            "activity_description": test_artisan_data["activity_description"],
            "offerings": ",".join(test_artisan_data["offerings"]),
            "documents_not_available": "false"
        }
        
        response = client.post(
            "/api/v1/auth/register/artisan",
            data=form_data
        )
        
        assert response.status_code == status.HTTP_400_BAD_REQUEST
    
    def test_register_artisan_missing_required_fields(
        self, client: TestClient, test_artisan_data: dict
    ):
        """Test d'inscription artisan avec champs requis manquants"""
        form_data = {
            "email": test_artisan_data["email"],
            "password": test_artisan_data["password"],
            # company_name manquant
            # main_specialty manquant
            # activity_description manquant
            "region": test_artisan_data["region"],
            "city": test_artisan_data["city"],
            "languages": ",".join(test_artisan_data["languages"]),
            "offerings": ",".join(test_artisan_data["offerings"]),
            "documents_not_available": "false"
        }
        
        response = client.post(
            "/api/v1/auth/register/artisan",
            data=form_data
        )
        
        assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY


class TestLoginAPI:
    """Tests pour l'endpoint de connexion"""
    
    def test_login_success(
        self, client: TestClient, created_buyer: User, test_buyer_data: dict
    ):
        """Test de connexion réussie"""
        response = client.post(
            "/api/v1/auth/login",
            json={
                "email": test_buyer_data["email"],
                "password": test_buyer_data["password"]
            }
        )
        
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        
        assert "access_token" in data
        assert "refresh_token" in data
        assert "token_type" in data
        assert data["token_type"] == "bearer"
        assert "user" in data
        assert data["user"]["email"] == test_buyer_data["email"]
    
    def test_login_wrong_password(
        self, client: TestClient, created_buyer: User, test_buyer_data: dict
    ):
        """Test de connexion avec mot de passe incorrect"""
        response = client.post(
            "/api/v1/auth/login",
            json={
                "email": test_buyer_data["email"],
                "password": "wrongpassword"
            }
        )
        
        assert response.status_code == status.HTTP_401_UNAUTHORIZED
        assert "incorrect" in response.json()["detail"].lower() or "invalid" in response.json()["detail"].lower()
    
    def test_login_nonexistent_user(self, client: TestClient):
        """Test de connexion avec un utilisateur inexistant"""
        response = client.post(
            "/api/v1/auth/login",
            json={
                "email": "nonexistent@test.com",
                "password": "testpassword123"
            }
        )
        
        assert response.status_code == status.HTTP_401_UNAUTHORIZED
    
    def test_login_inactive_user(
        self, client: TestClient, db: Session, test_buyer_data: dict
    ):
        """Test de connexion avec un utilisateur inactif"""
        from app.models.user import UserRole, BuyerType, Nationality
        
        user = User(
            id=uuid.uuid4(),
            email="inactive@test.com",
            password_hash=get_password_hash(test_buyer_data["password"]),
            name="Inactive User",
            role=UserRole.BUYER,
            buyer_type=BuyerType.PARTICULIER,
            nationality=Nationality.LOCAL,
            is_active=False,
            is_email_verified=False
        )
        db.add(user)
        db.commit()
        
        response = client.post(
            "/api/v1/auth/login",
            json={
                "email": "inactive@test.com",
                "password": test_buyer_data["password"]
            }
        )
        
        assert response.status_code == status.HTTP_401_UNAUTHORIZED
    
    def test_login_invalid_email_format(self, client: TestClient):
        """Test de connexion avec un format d'email invalide"""
        response = client.post(
            "/api/v1/auth/login",
            json={
                "email": "invalid-email",
                "password": "testpassword123"
            }
        )
        
        assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY
    
    def test_login_empty_password(self, client: TestClient, created_buyer: User, test_buyer_data: dict):
        """Test de connexion avec mot de passe vide"""
        response = client.post(
            "/api/v1/auth/login",
            json={
                "email": test_buyer_data["email"],
                "password": ""
            }
        )
        
        assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY


class TestGetCurrentUserAPI:
    """Tests pour l'endpoint de récupération de l'utilisateur courant"""
    
    def test_get_me_success(
        self, client: TestClient, created_buyer: User, auth_headers_buyer: dict
    ):
        """Test de récupération de l'utilisateur courant avec token valide"""
        response = client.get(
            "/api/v1/auth/me",
            headers=auth_headers_buyer
        )
        
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["email"] == created_buyer.email
        assert data["name"] == created_buyer.name
        assert data["role"] == "buyer"
    
    def test_get_me_without_token(self, client: TestClient):
        """Test de récupération sans token"""
        response = client.get("/api/v1/auth/me")
        
        assert response.status_code == status.HTTP_401_UNAUTHORIZED
    
    def test_get_me_invalid_token(self, client: TestClient):
        """Test de récupération avec token invalide"""
        response = client.get(
            "/api/v1/auth/me",
            headers={"Authorization": "Bearer invalid_token"}
        )
        
        assert response.status_code == status.HTTP_401_UNAUTHORIZED
    
    def test_get_me_wrong_token_format(self, client: TestClient):
        """Test de récupération avec format de token incorrect"""
        response = client.get(
            "/api/v1/auth/me",
            headers={"Authorization": "InvalidFormat token"}
        )
        
        assert response.status_code == status.HTTP_401_UNAUTHORIZED
    
    def test_get_me_artisan_with_profile(
        self, client: TestClient, created_artisan: User, auth_headers_artisan: dict
    ):
        """Test de récupération d'un artisan avec profil"""
        response = client.get(
            "/api/v1/auth/me",
            headers=auth_headers_artisan
        )
        
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["role"] == "artisan"
        # Vérifier que les infos artisan sont présentes si disponibles
        if created_artisan.artisan_profile:
            assert data.get("specialty") is not None or data.get("description") is not None


class TestRefreshTokenAPI:
    """Tests pour l'endpoint de rafraîchissement du token"""
    
    def test_refresh_token_success(
        self, client: TestClient, created_buyer: User, test_buyer_data: dict
    ):
        """Test de rafraîchissement du token avec refresh token valide"""
        # D'abord, se connecter pour obtenir les tokens
        login_response = client.post(
            "/api/v1/auth/login",
            json={
                "email": test_buyer_data["email"],
                "password": test_buyer_data["password"]
            }
        )
        assert login_response.status_code == status.HTTP_200_OK
        refresh_token = login_response.json()["refresh_token"]
        
        # Utiliser le refresh token
        response = client.post(
            "/api/v1/auth/refresh",
            json={"refresh_token": refresh_token}
        )
        
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert "access_token" in data
        assert "refresh_token" in data
        # Les tokens doivent être différents (nouveau token généré)
        assert data["access_token"] != login_response.json()["access_token"]
        assert data["refresh_token"] != login_response.json()["refresh_token"]
        # Vérifier que les tokens sont valides (non vides)
        assert len(data["access_token"]) > 0
        assert len(data["refresh_token"]) > 0
    
    def test_refresh_token_invalid(self, client: TestClient):
        """Test de rafraîchissement avec token invalide"""
        response = client.post(
            "/api/v1/auth/refresh",
            json={"refresh_token": "invalid_refresh_token"}
        )
        
        assert response.status_code == status.HTTP_401_UNAUTHORIZED
    
    def test_refresh_token_missing(self, client: TestClient):
        """Test de rafraîchissement sans token"""
        response = client.post(
            "/api/v1/auth/refresh",
            json={}
        )
        
        assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY
    
    def test_refresh_token_wrong_type(self, client: TestClient, created_buyer: User, test_buyer_data: dict):
        """Test de rafraîchissement avec un access_token au lieu d'un refresh_token"""
        # Obtenir un access_token
        login_response = client.post(
            "/api/v1/auth/login",
            json={
                "email": test_buyer_data["email"],
                "password": test_buyer_data["password"]
            }
        )
        access_token = login_response.json()["access_token"]
        
        # Essayer d'utiliser l'access_token comme refresh_token
        response = client.post(
            "/api/v1/auth/refresh",
            json={"refresh_token": access_token}
        )
        
        assert response.status_code == status.HTTP_401_UNAUTHORIZED
    
    def test_refresh_token_empty_string(self, client: TestClient):
        """Test de rafraîchissement avec token vide"""
        response = client.post(
            "/api/v1/auth/refresh",
            json={"refresh_token": ""}
        )
        
        assert response.status_code in [status.HTTP_401_UNAUTHORIZED, status.HTTP_422_UNPROCESSABLE_ENTITY]


class TestUserRolesAPI:
    """Tests pour les rôles utilisateurs via l'API"""
    
    def test_buyer_role_assigned(
        self, client: TestClient, db: Session, test_buyer_data: dict
    ):
        """Test que le rôle buyer est assigné correctement"""
        response = client.post(
            "/api/v1/auth/register/buyer",
            json=test_buyer_data
        )
        
        assert response.status_code == status.HTTP_201_CREATED
        user = db.query(User).filter(User.email == test_buyer_data["email"]).first()
        assert user.role == UserRole.BUYER
    
    def test_artisan_role_assigned(
        self, client: TestClient, db: Session, test_artisan_data: dict
    ):
        """Test que le rôle artisan est assigné correctement"""
        form_data = {
            "email": test_artisan_data["email"],
            "password": test_artisan_data["password"],
            "name": test_artisan_data["name"],
            "region": test_artisan_data["region"],
            "city": test_artisan_data["city"],
            "languages": ",".join(test_artisan_data["languages"]),
            "company_name": test_artisan_data["company_name"],
            "main_specialty": test_artisan_data["main_specialty"],
            "activity_description": test_artisan_data["activity_description"],
            "offerings": ",".join(test_artisan_data["offerings"]),
            "documents_not_available": "false"
        }
        
        response = client.post(
            "/api/v1/auth/register/artisan",
            data=form_data
        )
        
        assert response.status_code == status.HTTP_201_CREATED
        user = db.query(User).filter(User.email == test_artisan_data["email"]).first()
        assert user.role == UserRole.ARTISAN


class TestNationalityDetectionAPI:
    """Tests pour la détection de nationalité via l'API"""
    
    def test_madagascar_nationality_local(
        self, client: TestClient, db: Session, test_buyer_data: dict
    ):
        """Test que Madagascar est détecté comme local"""
        test_buyer_data["country"] = "madagascar"
        response = client.post(
            "/api/v1/auth/register/buyer",
            json=test_buyer_data
        )
        
        assert response.status_code == status.HTTP_201_CREATED
        user = db.query(User).filter(User.email == test_buyer_data["email"]).first()
        assert user.nationality == Nationality.LOCAL
    
    def test_foreign_country_nationality_foreign(
        self, client: TestClient, db: Session, test_buyer_data: dict
    ):
        """Test qu'un pays étranger est détecté comme foreign"""
        test_buyer_data["country"] = "france"
        response = client.post(
            "/api/v1/auth/register/buyer",
            json=test_buyer_data
        )
        
        assert response.status_code == status.HTTP_201_CREATED
        user = db.query(User).filter(User.email == test_buyer_data["email"]).first()
        assert user.nationality == Nationality.FOREIGN
