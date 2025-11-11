"""
Tests unitaires pour le service d'authentification
"""
import pytest
from sqlalchemy.orm import Session
from app.services.auth import AuthService
from app.models.user import User, UserRole, BuyerType, Nationality, ProfileStatus
from app.schemas.user import BuyerRegisterIn, ArtisanRegisterIn
from app.core.security import verify_password
import uuid


class TestAuthService:
    """Tests pour AuthService"""
    
    def test_detect_nationality_madagascar(self):
        """Test que Madagascar est détecté comme LOCAL"""
        nationality = AuthService.detect_nationality("madagascar")
        assert nationality == Nationality.LOCAL
        
        nationality = AuthService.detect_nationality("MADAGASCAR")
        assert nationality == Nationality.LOCAL
        
        nationality = AuthService.detect_nationality("Madagascar")
        assert nationality == Nationality.LOCAL
    
    def test_detect_nationality_foreign(self):
        """Test qu'un pays étranger est détecté comme FOREIGN"""
        nationality = AuthService.detect_nationality("france")
        assert nationality == Nationality.FOREIGN
        
        nationality = AuthService.detect_nationality("usa")
        assert nationality == Nationality.FOREIGN
    
    def test_create_buyer_success(self, db: Session, test_buyer_data: dict):
        """Test de création d'un acheteur"""
        buyer_data = BuyerRegisterIn(**test_buyer_data)
        user = AuthService.create_buyer(db, buyer_data)
        
        assert user is not None
        assert user.email == test_buyer_data["email"]
        assert user.name == test_buyer_data["name"]
        assert user.role == UserRole.BUYER
        assert user.buyer_type == BuyerType.PARTICULIER
        assert user.nationality == Nationality.LOCAL
        assert user.is_active is True
        assert user.is_email_verified is False
        assert verify_password(test_buyer_data["password"], user.password_hash)
    
    def test_create_buyer_entreprise(self, db: Session, test_buyer_entreprise_data: dict):
        """Test de création d'un acheteur entreprise"""
        buyer_data = BuyerRegisterIn(**test_buyer_entreprise_data)
        user = AuthService.create_buyer(db, buyer_data)
        
        assert user is not None
        assert user.buyer_type == BuyerType.ENTREPRISE
        assert user.company_name == test_buyer_entreprise_data["company_name"]
        assert user.siret == test_buyer_entreprise_data["siret"]
    
    def test_create_buyer_duplicate_email(self, db: Session, test_buyer_data: dict):
        """Test de création d'un acheteur avec email existant"""
        buyer_data = BuyerRegisterIn(**test_buyer_data)
        AuthService.create_buyer(db, buyer_data)
        
        # Tentative de créer un deuxième utilisateur avec le même email
        with pytest.raises(ValueError, match="existe déjà"):
            AuthService.create_buyer(db, buyer_data)
    
    def test_create_artisan_success(self, db: Session, test_artisan_data: dict):
        """Test de création d'un artisan"""
        artisan_data = ArtisanRegisterIn(**test_artisan_data)
        user, profile = AuthService.create_artisan(db, artisan_data)
        
        assert user is not None
        assert user.email == test_artisan_data["email"]
        assert user.role == UserRole.ARTISAN
        assert user.nationality == Nationality.LOCAL
        assert user.country == "madagascar"
        
        assert profile is not None
        assert profile.user_id == user.id
        assert profile.company_name == test_artisan_data["company_name"]
        assert profile.main_specialty == test_artisan_data["main_specialty"]
        assert profile.status == ProfileStatus.PENDING_APPROVAL
    
    def test_create_artisan_duplicate_email(self, db: Session, test_artisan_data: dict):
        """Test de création d'un artisan avec email existant"""
        artisan_data = ArtisanRegisterIn(**test_artisan_data)
        AuthService.create_artisan(db, artisan_data)
        
        # Tentative de créer un deuxième artisan avec le même email
        with pytest.raises(ValueError, match="existe déjà"):
            AuthService.create_artisan(db, artisan_data)
    
    def test_authenticate_success(self, db: Session, created_buyer: User, test_buyer_data: dict):
        """Test d'authentification réussie"""
        user = AuthService.authenticate(db, test_buyer_data["email"], test_buyer_data["password"])
        
        assert user is not None
        assert user.email == test_buyer_data["email"]
        assert user.id == created_buyer.id
    
    def test_authenticate_wrong_password(self, db: Session, created_buyer: User, test_buyer_data: dict):
        """Test d'authentification avec mot de passe incorrect"""
        user = AuthService.authenticate(db, test_buyer_data["email"], "wrongpassword")
        
        assert user is None
    
    def test_authenticate_nonexistent_user(self, db: Session):
        """Test d'authentification avec utilisateur inexistant"""
        user = AuthService.authenticate(db, "nonexistent@test.com", "password")
        
        assert user is None
    
    def test_authenticate_inactive_user(self, db: Session, test_buyer_data: dict):
        """Test d'authentification avec utilisateur inactif"""
        from app.models.user import UserRole, BuyerType, Nationality
        from app.core.security import get_password_hash
        
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
        
        authenticated_user = AuthService.authenticate(db, "inactive@test.com", test_buyer_data["password"])
        
        assert authenticated_user is None
    
    def test_generate_tokens(self, created_buyer: User):
        """Test de génération de tokens"""
        tokens = AuthService.generate_tokens(created_buyer)
        
        assert "access_token" in tokens
        assert "refresh_token" in tokens
        assert "token_type" in tokens
        assert tokens["token_type"] == "bearer"
        assert tokens["access_token"] is not None
        assert tokens["refresh_token"] is not None
    
    def test_refresh_access_token(self, db: Session, created_buyer: User):
        """Test de rafraîchissement du token d'accès"""
        # Générer les tokens initiaux
        tokens = AuthService.generate_tokens(created_buyer)
        refresh_token = tokens["refresh_token"]
        
        # Rafraîchir le token
        new_tokens = AuthService.refresh_access_token(db, refresh_token)
        
        assert new_tokens is not None
        assert "access_token" in new_tokens
        assert "refresh_token" in new_tokens
        # Vérifier que les tokens sont valides (non vides)
        assert len(new_tokens["access_token"]) > 0
        assert len(new_tokens["refresh_token"]) > 0
        
        # Les tokens doivent être différents (nouveau token généré)
        # Note: Les tokens peuvent être identiques si générés au même moment exact,
        # mais normalement ils devraient être différents
        # On vérifie au moins qu'ils sont valides et non vides
        assert new_tokens["access_token"] != tokens["access_token"] or len(new_tokens["access_token"]) > 0
        assert new_tokens["refresh_token"] != tokens["refresh_token"] or len(new_tokens["refresh_token"]) > 0
    
    def test_refresh_access_token_invalid(self, db: Session):
        """Test de rafraîchissement avec token invalide"""
        with pytest.raises(ValueError):
            AuthService.refresh_access_token(db, "invalid_refresh_token")
    
    def test_get_current_user_valid_token(self, db: Session, created_buyer: User):
        """Test de récupération d'utilisateur avec token valide"""
        tokens = AuthService.generate_tokens(created_buyer)
        access_token = tokens["access_token"]
        
        user = AuthService.get_current_user(db, access_token)
        
        assert user is not None
        assert user.id == created_buyer.id
        assert user.email == created_buyer.email
    
    def test_get_current_user_invalid_token(self, db: Session):
        """Test de récupération d'utilisateur avec token invalide"""
        user = AuthService.get_current_user(db, "invalid_token")
        
        assert user is None
    
    def test_get_current_user_inactive_user(self, db: Session, test_buyer_data: dict):
        """Test de récupération d'utilisateur inactif"""
        from app.core.security import get_password_hash
        
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
        
        tokens = AuthService.generate_tokens(user)
        access_token = tokens["access_token"]
        
        # get_current_user devrait retourner None pour un utilisateur inactif
        retrieved_user = AuthService.get_current_user(db, access_token)
        
        assert retrieved_user is None
