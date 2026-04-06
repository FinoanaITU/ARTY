"""
Dépendances FastAPI pour l'authentification et l'autorisation
"""
from fastapi import Depends, HTTPException, status, Header
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from typing import Optional
from app.core.database import get_db
from app.models.user import User, UserRole
from app.services.auth import auth_service
from app.core.security import verify_token

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")

async def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
) -> User:
    """Récupère l'utilisateur actuel depuis le token JWT"""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Impossible de valider les identifiants",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    payload = verify_token(token)
    if payload is None:
        raise credentials_exception
    
    user_id: Optional[str] = payload.get("sub")
    if user_id is None:
        raise credentials_exception
    

    token_type = payload.get("type")
    if token_type != "access":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Type de token invalide"
        )
    
    user = auth_service.get_current_user(db, token)
    if user is None:
        raise credentials_exception
    
    return user

async def get_current_active_user(
    current_user: User = Depends(get_current_user)
) -> User:
    """Récupère l'utilisateur actuel et vérifie qu'il est actif"""
    if not current_user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Utilisateur inactif"
        )
    return current_user

def require_role(allowed_roles: list[UserRole]):
    """Décorateur/dépendance pour vérifier le rôle de l'utilisateur"""
    async def role_checker(current_user: User = Depends(get_current_active_user)):
        if current_user.role not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Permissions insuffisantes"
            )
        return current_user
    return role_checker

RequireBuyer = Depends(require_role([UserRole.BUYER]))
RequireArtisan = Depends(require_role([UserRole.ARTISAN]))
RequireAdmin = Depends(require_role([UserRole.ADMIN]))
RequireArtisanOrAdmin = Depends(require_role([UserRole.ARTISAN, UserRole.ADMIN]))
