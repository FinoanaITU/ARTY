"""
Exceptions personnalisées de l'application
"""

from fastapi import HTTPException, status
from typing import Any, Dict, Optional

class AppException(HTTPException):
    """Classe de base pour les exceptions de l'application"""

    def __init__(
        self,
        detail: str,
        status_code: int = status.HTTP_500_INTERNAL_SERVER_ERROR,
        headers: Optional[Dict[str, Any]] = None,
    ):
        super().__init__(status_code=status_code, detail=detail, headers=headers)

class ResourceNotFound(AppException):
    """Ressource non trouvée"""

    def __init__(self, detail: str = "Resource not found"):
        super().__init__(detail=detail, status_code=status.HTTP_404_NOT_FOUND)

class ValidationError(AppException):
    """Erreur de validation"""

    def __init__(self, detail: str = "Validation error"):
        super().__init__(detail=detail, status_code=status.HTTP_400_BAD_REQUEST)

class PermissionDenied(AppException):
    """Permission refusée"""

    def __init__(self, detail: str = "Permission denied"):
        super().__init__(detail=detail, status_code=status.HTTP_403_FORBIDDEN)

class ConflictError(AppException):
    """Conflit (ressource existe déjà, etc.)"""

    def __init__(self, detail: str = "Conflict"):
        super().__init__(detail=detail, status_code=status.HTTP_409_CONFLICT)

class UnauthorizedError(AppException):
    """Non authentifié"""

    def __init__(self, detail: str = "Not authenticated"):
        super().__init__(detail=detail, status_code=status.HTTP_401_UNAUTHORIZED)

class InternalServerError(AppException):
    """Erreur interne du serveur"""

    def __init__(self, detail: str = "Internal server error"):
        super().__init__(detail=detail, status_code=status.HTTP_500_INTERNAL_SERVER_ERROR)
