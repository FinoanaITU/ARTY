"""
Tests unitaires pour les schémas d'authentification
"""
import pytest
from pydantic import ValidationError
from app.schemas.user import (
    BuyerRegisterIn,
    ArtisanRegisterIn,
    LoginIn,
    UserOut,
    TokenOut,
    RefreshTokenIn
)
from app.models.user import UserRole, BuyerType, Nationality


class TestBuyerRegisterIn:
    """Tests pour le schéma BuyerRegisterIn"""
    
    def test_valid_buyer_particulier(self):
        """Test avec des données valides pour un particulier"""
        data = BuyerRegisterIn(
            email="test@example.com",
            password="testpassword123",
            name="Test User",
            city="Antananarivo",
            country="madagascar",
            buyer_type="particulier"
        )
        
        assert data.email == "test@example.com"
        assert data.password == "testpassword123"
        assert data.name == "Test User"
        assert data.buyer_type == BuyerType.PARTICULIER
    
    def test_valid_buyer_entreprise(self):
        """Test avec des données valides pour une entreprise"""
        data = BuyerRegisterIn(
            email="company@example.com",
            password="testpassword123",
            name="Test Company",
            city="Antananarivo",
            country="madagascar",
            buyer_type="entreprise",
            company_name="Test Company SARL",
            siret="12345678901234"
        )
        
        assert data.buyer_type == BuyerType.ENTREPRISE
        assert data.company_name == "Test Company SARL"
        assert data.siret == "12345678901234"
    
    def test_invalid_email(self):
        """Test avec un email invalide"""
        with pytest.raises(ValidationError):
            BuyerRegisterIn(
                email="invalid-email",
                password="testpassword123",
                name="Test User",
                city="Antananarivo",
                country="madagascar",
                buyer_type="particulier"
            )
    
    def test_missing_required_fields(self):
        """Test avec des champs requis manquants"""
        with pytest.raises(ValidationError):
            BuyerRegisterIn(
                email="test@example.com",
                # password manquant
                name="Test User",
                city="Antananarivo",
                country="madagascar",
                buyer_type="particulier"
            )


class TestArtisanRegisterIn:
    """Tests pour le schéma ArtisanRegisterIn"""
    
    def test_valid_artisan(self):
        """Test avec des données valides pour un artisan"""
        data = ArtisanRegisterIn(
            email="artisan@example.com",
            password="testpassword123",
            name="Test Artisan",
            city="Antananarivo",
            country="madagascar",
            region="Analamanga",
            languages=["fr", "mg"],
            company_name="Artisan Test",
            main_specialty="Pottery",
            activity_description="I create beautiful pottery",
            offerings=["products"]
        )
        
        assert data.email == "artisan@example.com"
        assert data.region == "Analamanga"
        assert data.languages == ["fr", "mg"]
        assert data.company_name == "Artisan Test"
        assert data.main_specialty == "Pottery"
    
    def test_artisan_with_optional_fields(self):
        """Test avec des champs optionnels"""
        data = ArtisanRegisterIn(
            email="artisan@example.com",
            password="testpassword123",
            name="Test Artisan",
            city="Antananarivo",
            country="madagascar",
            region="Analamanga",
            languages=["fr", "mg"],
            company_name="Artisan Test",
            main_specialty="Pottery",
            activity_description="I create beautiful pottery",
            offerings=["products"],
            other_skills=["Ceramics", "Painting"],
            years_experience="5-10",
            brand_story="Started as a hobby",
            nif="123456789",
            stat="987654321",
            documents_not_available=False
        )
        
        assert data.other_skills == ["Ceramics", "Painting"]
        assert data.years_experience == "5-10"
        assert data.brand_story == "Started as a hobby"
        assert data.nif == "123456789"
        assert data.stat == "987654321"
        assert data.documents_not_available is False
    
    def test_artisan_missing_required_fields(self):
        """Test avec des champs requis manquants"""
        with pytest.raises(ValidationError):
            ArtisanRegisterIn(
                email="artisan@example.com",
                password="testpassword123",
                name="Test Artisan",
                # company_name manquant
                # main_specialty manquant
                # activity_description manquant
                city="Antananarivo",
                country="madagascar",
                region="Analamanga",
                languages=["fr", "mg"],
                offerings=["products"]
            )


class TestLoginIn:
    """Tests pour le schéma LoginIn"""
    
    def test_valid_login(self):
        """Test avec des données valides"""
        data = LoginIn(
            email="test@example.com",
            password="testpassword123"
        )
        
        assert data.email == "test@example.com"
        assert data.password == "testpassword123"
    
    def test_invalid_email(self):
        """Test avec un email invalide"""
        with pytest.raises(ValidationError):
            LoginIn(
                email="invalid-email",
                password="testpassword123"
            )
    
    def test_missing_password(self):
        """Test avec mot de passe manquant"""
        with pytest.raises(ValidationError):
            LoginIn(
                email="test@example.com"
                # password manquant
            )


class TestUserOut:
    """Tests pour le schéma UserOut"""
    
    def test_user_out_buyer(self):
        """Test avec un utilisateur acheteur"""
        import uuid
        from datetime import datetime
        
        user_data = {
            "id": str(uuid.uuid4()),
            "email": "buyer@example.com",
            "name": "Test Buyer",
            "role": "buyer",
            "avatar": None,
            "buyer_type": "particulier",
            "nationality": "local",
            "company_name": None,
            "siret": None,
            "is_active": True,
            "is_email_verified": False,
            "specialty": None,
            "description": None,
            "experience": None,
            "created_at": datetime.now(),
            "updated_at": datetime.now()
        }
        
        user_out = UserOut(**user_data)
        
        assert user_out.email == "buyer@example.com"
        assert user_out.role == "buyer"
        assert user_out.buyer_type == "particulier"
        assert user_out.nationality == "local"
    
    def test_user_out_artisan(self):
        """Test avec un utilisateur artisan"""
        import uuid
        from datetime import datetime
        
        user_data = {
            "id": str(uuid.uuid4()),
            "email": "artisan@example.com",
            "name": "Test Artisan",
            "role": "artisan",
            "avatar": None,
            "buyer_type": None,
            "nationality": "local",
            "company_name": None,
            "siret": None,
            "is_active": True,
            "is_email_verified": False,
            "specialty": "Pottery",
            "description": "I create beautiful pottery",
            "experience": "5-10 years",
            "created_at": datetime.now(),
            "updated_at": datetime.now()
        }
        
        user_out = UserOut(**user_data)
        
        assert user_out.role == "artisan"
        assert user_out.specialty == "Pottery"
        assert user_out.description == "I create beautiful pottery"
        assert user_out.experience == "5-10 years"


class TestTokenOut:
    """Tests pour le schéma TokenOut"""
    
    def test_token_out(self):
        """Test avec des tokens valides"""
        import uuid
        from datetime import datetime
        
        user_data = {
            "id": str(uuid.uuid4()),
            "email": "test@example.com",
            "name": "Test User",
            "role": "buyer",
            "avatar": None,
            "buyer_type": "particulier",
            "nationality": "local",
            "company_name": None,
            "siret": None,
            "is_active": True,
            "is_email_verified": False,
            "specialty": None,
            "description": None,
            "experience": None,
            "created_at": datetime.now(),
            "updated_at": datetime.now()
        }
        
        token_data = TokenOut(
            access_token="test_access_token",
            refresh_token="test_refresh_token",
            token_type="bearer",
            user=UserOut(**user_data)
        )
        
        assert token_data.access_token == "test_access_token"
        assert token_data.refresh_token == "test_refresh_token"
        assert token_data.token_type == "bearer"
        assert token_data.user.email == "test@example.com"


class TestRefreshTokenIn:
    """Tests pour le schéma RefreshTokenIn"""
    
    def test_valid_refresh_token(self):
        """Test avec un refresh token valide"""
        data = RefreshTokenIn(refresh_token="test_refresh_token")
        
        assert data.refresh_token == "test_refresh_token"
    
    def test_missing_refresh_token(self):
        """Test sans refresh token"""
        with pytest.raises(ValidationError):
            RefreshTokenIn()

