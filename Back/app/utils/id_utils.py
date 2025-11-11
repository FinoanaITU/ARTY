"""
Utilitaires pour la gestion des IDs (UUID/string) pour compatibilité SQLite/PostgreSQL
"""
from uuid import UUID
from typing import Union, Any
from sqlalchemy.orm import Session


def normalize_id(id_value: Any) -> Any:
    """
    Normalise un ID pour les comparaisons dans les requêtes SQLAlchemy.
    Pour SQLite, retourne toujours une string.
    Pour PostgreSQL, retourne un UUID si possible.
    """
    if id_value is None:
        return None
    
    # Si c'est déjà une string, la retourner telle quelle
    if isinstance(id_value, str):
        return id_value
    
    # Si c'est un UUID, le convertir en string (pour compatibilité SQLite)
    if isinstance(id_value, UUID):
        return str(id_value)
    
    # Pour tout autre type, convertir en string
    return str(id_value)


def id_to_string(id_value: Any) -> str:
    """Convertit un ID en string pour les comparaisons SQLite"""
    if id_value is None:
        return None
    if isinstance(id_value, UUID):
        return str(id_value)
    return str(id_value)


def get_db_type(db: Session) -> str:
    """Détermine le type de base de données (sqlite ou postgresql)"""
    try:
        # Essayer d'accéder à l'URL de la base de données
        bind = db.bind if hasattr(db, 'bind') else (db.get_bind() if hasattr(db, 'get_bind') else None)
        if bind:
            db_url = str(bind.url) if hasattr(bind, 'url') else str(bind)
            if 'sqlite' in db_url.lower():
                return 'sqlite'
            elif 'postgresql' in db_url.lower() or 'postgres' in db_url.lower():
                return 'postgresql'
        # Si on ne peut pas déterminer, essayer de détecter via le dialect
        try:
            dialect_name = getattr(bind.dialect, 'name', None) if bind else None
            if dialect_name == 'sqlite':
                return 'sqlite'
            elif dialect_name in ('postgresql', 'postgres'):
                return 'postgresql'
        except:
            pass
        # Par défaut, supposer SQLite pour les tests
        return 'sqlite'
    except Exception:
        # En cas d'erreur, supposer SQLite (pour les tests)
        return 'sqlite'

