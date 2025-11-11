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
            # For SQLite, use String type directly
            return dialect.type_descriptor(String(36))
    
    def process_bind_param(self, value, dialect):
        if value is None:
            return value
        elif dialect.name == 'postgresql':
            # For PostgreSQL, ensure we have a UUID object
            if isinstance(value, str):
                try:
                    return uuid.UUID(value)
                except (ValueError, AttributeError, TypeError):
                    return value
            elif isinstance(value, uuid.UUID):
                return value
            # Try to convert to UUID
            try:
                return uuid.UUID(str(value))
            except (ValueError, AttributeError, TypeError):
                return value
        else:
            # For SQLite, always convert to string
            # This is critical to avoid .hex errors
            if isinstance(value, uuid.UUID):
                return str(value)
            elif isinstance(value, str):
                # Already a string, validate format and return as-is
                # Don't try to convert or process it as UUID
                return value
            # For any other type, convert to string
            try:
                str_value = str(value)
                # Try to validate it's a valid UUID format (optional)
                try:
                    uuid.UUID(str_value)
                except (ValueError, AttributeError, TypeError):
                    pass  # Not a valid UUID, but that's okay for SQLite
                return str_value
            except Exception:
                return value
    
    def process_result_value(self, value, dialect):
        if value is None:
            return value
        elif dialect.name == 'postgresql':
            # PostgreSQL should already return UUID objects
            return value
        else:
            # For SQLite, convert string to UUID object
            # This ensures consistent type handling and avoids .hex errors
            if isinstance(value, str):
                try:
                    return uuid.UUID(value)
                except (ValueError, AttributeError, TypeError):
                    # If it's not a valid UUID string, return as-is
                    return value
            elif isinstance(value, uuid.UUID):
                return value
            # Try to convert to UUID
            try:
                return uuid.UUID(str(value))
            except (ValueError, AttributeError, TypeError):
                return value
    
    def coerce_compared_value(self, op, value):
        """Ensure comparisons work correctly with both UUID and string values"""
        # Allow comparisons with strings and UUIDs
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
            # For PostgreSQL, use native ARRAY type
            return dialect.type_descriptor(PostgresARRAY(self.item_type))
        else:
            # For SQLite, use TEXT to store JSON
            return dialect.type_descriptor(Text())
    
    def process_bind_param(self, value, dialect):
        if value is None:
            return value
        elif dialect.name == 'postgresql':
            # For PostgreSQL, return list as-is (ARRAY handles it)
            if isinstance(value, list):
                return value
            elif isinstance(value, str):
                try:
                    return json.loads(value)
                except (json.JSONDecodeError, ValueError, TypeError):
                    return value
            return value
        else:
            # For SQLite, convert list to JSON string
            if isinstance(value, list):
                try:
                    return json.dumps(value)
                except (TypeError, ValueError):
                    return json.dumps([])
            elif isinstance(value, str):
                # Already a JSON string, validate and return
                try:
                    json.loads(value)  # Validate it's valid JSON
                    return value
                except (json.JSONDecodeError, ValueError, TypeError):
                    return json.dumps([])
            return json.dumps([])
    
    def process_result_value(self, value, dialect):
        if value is None:
            return []
        elif dialect.name == 'postgresql':
            # PostgreSQL should already return a list
            if isinstance(value, list):
                return value
            elif isinstance(value, str):
                try:
                    return json.loads(value)
                except (json.JSONDecodeError, ValueError, TypeError):
                    return []
            return []
        else:
            # For SQLite, convert JSON string to list
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
