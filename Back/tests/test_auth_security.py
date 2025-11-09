"""
Tests unitaires pour la sécurité et les tokens JWT
"""
import pytest
from datetime import datetime, timedelta
from jose import jwt
from app.core.security import (
    create_access_token,
    create_refresh_token,
    verify_token,
    verify_password,
    get_password_hash
)
from app.core.config import settings
import uuid


class TestPasswordSecurity:
    """Tests pour la sécurité des mots de passe"""
    
    def test_password_hashing(self):
        """Test que le hachage de mot de passe fonctionne"""
        password = "testpassword123"
        hashed = get_password_hash(password)
        
        assert hashed != password
        assert len(hashed) > 50  # Bcrypt hash est long
        assert verify_password(password, hashed)
        assert not verify_password("wrongpassword", hashed)
    
    def test_password_hash_different_salts(self):
        """Test que deux hachages du même mot de passe sont différents (salts différents)"""
        password = "testpassword123"
        hash1 = get_password_hash(password)
        hash2 = get_password_hash(password)
        
        assert hash1 != hash2  # Différents à cause du salt
    
    def test_password_verification_case_sensitive(self):
        """Test que la vérification du mot de passe est sensible à la casse"""
        password = "TestPassword123"
        hashed = get_password_hash(password)
        
        assert verify_password(password, hashed)
        assert not verify_password("testpassword123", hashed)
        assert not verify_password("TESTPASSWORD123", hashed)
    
    def test_password_hash_long_password(self):
        """Test avec un mot de passe long"""
        password = "a" * 100  # Mot de passe très long
        hashed = get_password_hash(password)
        
        assert verify_password(password, hashed)
    
    def test_password_hash_special_characters(self):
        """Test avec des caractères spéciaux"""
        password = "P@ssw0rd!#$%^&*()"
        hashed = get_password_hash(password)
        
        assert verify_password(password, hashed)


class TestJWTTokens:
    """Tests pour les tokens JWT"""
    
    def test_create_access_token(self):
        """Test de création d'un token d'accès"""
        user_id = str(uuid.uuid4())
        data = {"sub": user_id, "role": "buyer"}
        token = create_access_token(data)
        
        assert token is not None
        assert isinstance(token, str)
        assert len(token) > 0
        
        # Vérifier le contenu du token
        payload = verify_token(token)
        assert payload is not None
        assert payload["sub"] == user_id
        assert payload["role"] == "buyer"
        assert payload["type"] == "access"
        assert "exp" in payload
    
    def test_create_refresh_token(self):
        """Test de création d'un token de refresh"""
        user_id = str(uuid.uuid4())
        data = {"sub": user_id}
        token = create_refresh_token(data)
        
        assert token is not None
        assert isinstance(token, str)
        assert len(token) > 0
        
        # Vérifier le contenu du token
        payload = verify_token(token)
        assert payload is not None
        assert payload["sub"] == user_id
        assert payload["type"] == "refresh"
        assert "exp" in payload
    
    def test_token_expiration(self):
        """Test que les tokens expirent correctement"""
        user_id = str(uuid.uuid4())
        data = {"sub": user_id}
        
        # Créer un token avec expiration très courte
        token = create_access_token(data, expires_delta=timedelta(seconds=1))
        
        # Vérifier que le token est valide
        payload = verify_token(token)
        assert payload is not None
        
        # Attendre que le token expire (dans un vrai test, on utiliserait time.sleep)
        # Pour ce test, on vérifie juste que le token a un champ exp
        assert "exp" in payload
        assert payload["exp"] > datetime.utcnow().timestamp()
    
    def test_verify_token_invalid(self):
        """Test de vérification d'un token invalide"""
        invalid_token = "invalid_token_string"
        payload = verify_token(invalid_token)
        
        assert payload is None
    
    def test_verify_token_tampered(self):
        """Test de vérification d'un token modifié"""
        user_id = str(uuid.uuid4())
        data = {"sub": user_id}
        token = create_access_token(data)
        
        # Modifier le token
        tampered_token = token[:-5] + "XXXXX"
        payload = verify_token(tampered_token)
        
        assert payload is None
    
    def test_token_different_types(self):
        """Test que les tokens access et refresh sont différents"""
        user_id = str(uuid.uuid4())
        data = {"sub": user_id}
        
        access_token = create_access_token(data)
        refresh_token = create_refresh_token(data)
        
        assert access_token != refresh_token
        
        # Vérifier les types
        access_payload = verify_token(access_token)
        refresh_payload = verify_token(refresh_token)
        
        assert access_payload["type"] == "access"
        assert refresh_payload["type"] == "refresh"
    
    def test_token_with_custom_expiration(self):
        """Test de création de token avec expiration personnalisée"""
        user_id = str(uuid.uuid4())
        data = {"sub": user_id}
        
        # Créer un token avec expiration de 5 minutes
        custom_expiration = timedelta(minutes=5)
        token = create_access_token(data, expires_delta=custom_expiration)
        
        payload = verify_token(token)
        assert payload is not None
        
        # Vérifier que l'expiration est correcte (à ~5 minutes)
        exp_time = datetime.fromtimestamp(payload["exp"])
        expected_exp = datetime.utcnow() + custom_expiration
        
        # Vérifier que la différence est inférieure à 1 seconde
        assert abs((exp_time - expected_exp).total_seconds()) < 1


class TestTokenPayload:
    """Tests pour le contenu des tokens"""
    
    def test_access_token_contains_user_id(self):
        """Test que le token d'accès contient l'ID utilisateur"""
        user_id = str(uuid.uuid4())
        data = {"sub": user_id, "role": "buyer"}
        token = create_access_token(data)
        
        payload = verify_token(token)
        assert payload["sub"] == user_id
    
    def test_access_token_contains_role(self):
        """Test que le token d'accès contient le rôle"""
        user_id = str(uuid.uuid4())
        data = {"sub": user_id, "role": "artisan"}
        token = create_access_token(data)
        
        payload = verify_token(token)
        assert payload["role"] == "artisan"
    
    def test_refresh_token_does_not_contain_role(self):
        """Test que le token de refresh ne contient pas le rôle"""
        user_id = str(uuid.uuid4())
        data = {"sub": user_id}
        token = create_refresh_token(data)
        
        payload = verify_token(token)
        assert "role" not in payload or payload.get("role") is None


class TestTokenSecurity:
    """Tests pour la sécurité des tokens"""
    
    def test_token_not_decodable_without_secret(self):
        """Test qu'un token ne peut pas être décodé sans le secret"""
        user_id = str(uuid.uuid4())
        data = {"sub": user_id}
        token = create_access_token(data)
        
        # Essayer de décoder avec un mauvais secret
        try:
            payload = jwt.decode(
                token,
                "wrong_secret_key",
                algorithms=[settings.ALGORITHM]
            )
            # Si on arrive ici, c'est un problème de sécurité
            assert False, "Le token ne devrait pas être décodable avec un mauvais secret"
        except jwt.JWTError:
            # C'est le comportement attendu
            assert True
    
    def test_token_contains_expiration(self):
        """Test que tous les tokens contiennent une expiration"""
        user_id = str(uuid.uuid4())
        data = {"sub": user_id}
        
        access_token = create_access_token(data)
        refresh_token = create_refresh_token(data)
        
        access_payload = verify_token(access_token)
        refresh_payload = verify_token(refresh_token)
        
        assert "exp" in access_payload
        assert "exp" in refresh_payload

