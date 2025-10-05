from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from typing import Optional
from .jwt_handler import verify_token, get_user_id_from_token, get_vendor_id_from_token

# Security scheme
security = HTTPBearer()


def get_current_user_id(
    credentials: HTTPAuthorizationCredentials = Depends(security)
) -> int:
    """Get current user ID from JWT token"""
    token = credentials.credentials
    return get_user_id_from_token(token)


def get_current_vendor_id(
    credentials: HTTPAuthorizationCredentials = Depends(security)
) -> int:
    """Get current vendor ID from JWT token"""
    token = credentials.credentials
    return get_vendor_id_from_token(token)


def get_optional_current_user_id(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security)
) -> Optional[int]:
    """Get current user ID from JWT token (optional)"""
    if not credentials:
        return None
    
    try:
        token = credentials.credentials
        return get_user_id_from_token(token)
    except HTTPException:
        return None


def get_optional_current_vendor_id(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security)
) -> Optional[int]:
    """Get current vendor ID from JWT token (optional)"""
    if not credentials:
        return None
    
    try:
        token = credentials.credentials
        return get_vendor_id_from_token(token)
    except HTTPException:
        return None


def verify_admin_role(
    credentials: HTTPAuthorizationCredentials = Depends(security)
) -> int:
    """Verify that the current user has admin role"""
    token = credentials.credentials
    payload = verify_token(token)
    
    # Check if user has admin role
    user_roles = payload.get("roles", [])
    if "admin" not in user_roles:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    return payload.get("sub")


def verify_vendor_role(
    credentials: HTTPAuthorizationCredentials = Depends(security)
) -> int:
    """Verify that the current user has vendor role"""
    token = credentials.credentials
    payload = verify_token(token)
    
    # Check if user has vendor role or is a vendor
    user_roles = payload.get("roles", [])
    vendor_id = payload.get("vendor_id")
    
    if "vendor" not in user_roles and not vendor_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    return payload.get("sub")
