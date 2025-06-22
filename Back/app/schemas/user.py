from pydantic import BaseModel, EmailStr
from typing import Optional
from uuid import UUID


class UserBase(BaseModel):
    email: EmailStr
    username: str
    first_name: Optional[str] = None
    last_name: Optional[str] = None


class UserCreate(UserBase):
    password: str


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class Token(BaseModel):
    access_token: str
    token_type: str


class User(UserBase):
    id: UUID
    is_active: bool
    
    class Config:
        from_attributes = True 