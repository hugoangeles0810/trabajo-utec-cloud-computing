from pydantic import BaseModel, EmailStr
from typing import Optional


class Token(BaseModel):
    """Token response schema"""
    access_token: str
    token_type: str = "bearer"
    expires_in: int


class TokenData(BaseModel):
    """Token data schema"""
    user_id: Optional[int] = None
    vendor_id: Optional[int] = None
    roles: Optional[list] = None


class LoginRequest(BaseModel):
    """Login request schema"""
    email: EmailStr
    password: str


class LoginResponse(BaseModel):
    """Login response schema"""
    access_token: str
    token_type: str = "bearer"
    expires_in: int
    user_id: int
    vendor_id: Optional[int] = None
    roles: list = []


class RefreshTokenRequest(BaseModel):
    """Refresh token request schema"""
    refresh_token: str


class ChangePasswordRequest(BaseModel):
    """Change password request schema"""
    current_password: str
    new_password: str


class ResetPasswordRequest(BaseModel):
    """Reset password request schema"""
    email: EmailStr


class ResetPasswordConfirmRequest(BaseModel):
    """Reset password confirm request schema"""
    token: str
    new_password: str
