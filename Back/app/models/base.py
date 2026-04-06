from sqlalchemy import Column, DateTime, func, String, TypeDecorator, Text
from sqlalchemy.dialects.postgresql import UUID as PostgresUUID, ARRAY as PostgresARRAY
import uuid
import json
from typing import List
from app.core.database import Base

class GUID(TypeDecorator):
    """
    Platform-independent GUID type.
    Uses PostgreSQL's UUID type when available, otherwise uses String(36).
    Handles conversion between UUID objects and strings for SQLite compatibility.
    """
    impl = String
    cache_ok = True
    
    def load_dialect_impl(self, dialect):
        if dialect.name == 'postgresql':
            return dialect.type_descriptor(PostgresUUID(as_uuid=True))
        else:

            return dialect.type_descriptor(String(36))
    
    def process_bind_param(self, value, dialect):
        if value is None:
            return value
        elif dialect.name == 'postgresql':

            if isinstance(value, str):
                try:
                    return uuid.UUID(value)
                except (ValueError, AttributeError, TypeError):
                    return value
            elif isinstance(value, uuid.UUID):
                return value

            try:
                return uuid.UUID(str(value))
            except (ValueError, AttributeError, TypeError):
                return value
        else:

            if isinstance(value, uuid.UUID):
                return str(value)
            elif isinstance(value, str):

                return value

            try:
                str_value = str(value)

                try:
                    uuid.UUID(str_value)
                except (ValueError, AttributeError, TypeError):
                    pass
                return str_value
            except Exception:
                return value
    
    def process_result_value(self, value, dialect):
        if value is None:
            return value
        elif dialect.name == 'postgresql':

            return value
        else:

            if isinstance(value, str):
                try:
                    return uuid.UUID(value)
                except (ValueError, AttributeError, TypeError):

                    return value
            elif isinstance(value, uuid.UUID):
                return value

            try:
                return uuid.UUID(str(value))
            except (ValueError, AttributeError, TypeError):
                return value
    
    def coerce_compared_value(self, op, value):
        """Ensure comparisons work correctly with both UUID and string values"""

        return self

class ArrayType(TypeDecorator):
    """
    Platform-independent ARRAY type.
    Uses PostgreSQL's ARRAY type when available, otherwise uses TEXT with JSON encoding for SQLite.
    """
    impl = Text
    cache_ok = True
    
    def __init__(self, item_type=String):
        super().__init__()
        self.item_type = item_type
    
    def load_dialect_impl(self, dialect):
        if dialect.name == 'postgresql':

            return dialect.type_descriptor(PostgresARRAY(self.item_type))
        else:

            return dialect.type_descriptor(Text())
    
    def process_bind_param(self, value, dialect):
        if value is None:
            return value
        elif dialect.name == 'postgresql':

            if isinstance(value, list):
                return value
            elif isinstance(value, str):
                try:
                    return json.loads(value)
                except (json.JSONDecodeError, ValueError, TypeError):
                    return value
            return value
        else:

            if isinstance(value, list):
                try:
                    return json.dumps(value)
                except (TypeError, ValueError):
                    return json.dumps([])
            elif isinstance(value, str):

                try:
                    json.loads(value)
                    return value
                except (json.JSONDecodeError, ValueError, TypeError):
                    return json.dumps([])
            return json.dumps([])
    
    def process_result_value(self, value, dialect):
        if value is None:
            return []
        elif dialect.name == 'postgresql':

            if isinstance(value, list):
                return value
            elif isinstance(value, str):
                try:
                    return json.loads(value)
                except (json.JSONDecodeError, ValueError, TypeError):
                    return []
            return []
        else:

            if isinstance(value, str):
                try:
                    return json.loads(value)
                except (json.JSONDecodeError, ValueError, TypeError):
                    return []
            elif isinstance(value, list):
                return value
            return []

class BaseModel(Base):
    """Base model with common fields"""
    __abstract__ = True
    
    id = Column(GUID(), primary_key=True, default=uuid.uuid4)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
