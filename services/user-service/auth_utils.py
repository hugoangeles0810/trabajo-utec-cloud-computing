"""
Authentication and JWT utilities for Gamarriando User Service
"""

import os
import secrets
import hashlib
from datetime import datetime, timedelta
from typing import Dict, Any, Optional
import jwt
from passlib.context import CryptContext
from passlib.hash import bcrypt
import logging

logger = logging.getLogger(__name__)

# Password hashing context
BCRYPT_ROUNDS = int(os.getenv('BCRYPT_ROUNDS', '12'))
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto", bcrypt__rounds=BCRYPT_ROUNDS)

def get_jwt_config() -> Dict[str, Any]:
    """Get JWT configuration from environment variables"""
    return {
        'secret_key': os.getenv('JWT_SECRET_KEY', 'default-secret-key'),
        'algorithm': os.getenv('JWT_ALGORITHM', 'HS256'),
        'access_token_expire_minutes': int(os.getenv('JWT_ACCESS_TOKEN_EXPIRE_MINUTES', '15')),
        'refresh_token_expire_days': int(os.getenv('JWT_REFRESH_TOKEN_EXPIRE_DAYS', '7'))
    }

def hash_password(password: str) -> str:
    """Hash a password using bcrypt"""
    # Truncate password to 72 bytes if it's too long (bcrypt limit)
    if len(password.encode('utf-8')) > 72:
        password = password[:72]
    # Use bcrypt directly with proper configuration
    return bcrypt.hash(password, rounds=BCRYPT_ROUNDS)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a password against its hash"""
    return pwd_context.verify(plain_password, hashed_password)

def generate_token(user_id: int, email: str, username: str, roles: list, 
                  token_type: str = 'access') -> str:
    """Generate JWT token"""
    config = get_jwt_config()
    
    now = datetime.utcnow()
    
    if token_type == 'access':
        expire = now + timedelta(minutes=config['access_token_expire_minutes'])
    else:  # refresh token
        expire = now + timedelta(days=config['refresh_token_expire_days'])
    
    payload = {
        'sub': str(user_id),
        'email': email,
        'username': username,
        'roles': roles,
        'type': token_type,
        'iat': now,
        'exp': expire
    }
    
    token = jwt.encode(payload, config['secret_key'], algorithm=config['algorithm'])
    return token

def verify_token(token: str) -> Optional[Dict[str, Any]]:
    """Verify and decode JWT token"""
    try:
        config = get_jwt_config()
        payload = jwt.decode(token, config['secret_key'], algorithms=[config['algorithm']])
        return payload
    except jwt.ExpiredSignatureError:
        logger.warning("Token has expired")
        return None
    except jwt.InvalidTokenError:
        logger.warning("Invalid token")
        return None

def generate_session_token() -> str:
    """Generate a secure session token"""
    return secrets.token_urlsafe(32)

def generate_refresh_token() -> str:
    """Generate a secure refresh token"""
    return secrets.token_urlsafe(32)

def generate_password_reset_token() -> str:
    """Generate a secure password reset token"""
    return secrets.token_urlsafe(32)

def generate_email_verification_token() -> str:
    """Generate a secure email verification token"""
    return secrets.token_urlsafe(32)

def validate_password_strength(password: str) -> Dict[str, Any]:
    """Validate password strength"""
    min_length = int(os.getenv('PASSWORD_MIN_LENGTH', '8'))
    
    errors = []
    
    if len(password) < min_length:
        errors.append(f"Password must be at least {min_length} characters long")
    
    if not any(c.isupper() for c in password):
        errors.append("Password must contain at least one uppercase letter")
    
    if not any(c.islower() for c in password):
        errors.append("Password must contain at least one lowercase letter")
    
    if not any(c.isdigit() for c in password):
        errors.append("Password must contain at least one number")
    
    if not any(c in "!@#$%^&*()_+-=[]{}|;:,.<>?" for c in password):
        errors.append("Password must contain at least one special character")
    
    return {
        'is_valid': len(errors) == 0,
        'errors': errors
    }

def validate_email(email: str) -> bool:
    """Validate email format"""
    import re
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return re.match(pattern, email) is not None

def validate_username(username: str) -> Dict[str, Any]:
    """Validate username format"""
    errors = []
    
    if len(username) < 3:
        errors.append("Username must be at least 3 characters long")
    
    if len(username) > 20:
        errors.append("Username must be no more than 20 characters long")
    
    if not username.replace('_', '').isalnum():
        errors.append("Username can only contain letters, numbers, and underscores")
    
    if username.startswith('_') or username.endswith('_'):
        errors.append("Username cannot start or end with underscore")
    
    return {
        'is_valid': len(errors) == 0,
        'errors': errors
    }

def extract_token_from_header(authorization_header: str) -> Optional[str]:
    """Extract JWT token from Authorization header"""
    if not authorization_header:
        return None
    
    try:
        scheme, token = authorization_header.split(' ', 1)
        if scheme.lower() != 'bearer':
            return None
        return token
    except ValueError:
        return None

def get_user_from_token(token: str) -> Optional[Dict[str, Any]]:
    """Get user information from JWT token"""
    payload = verify_token(token)
    if not payload:
        return None
    
    return {
        'user_id': int(payload['sub']),
        'email': payload['email'],
        'username': payload['username'],
        'roles': payload.get('roles', []),
        'token_type': payload.get('type', 'access')
    }

def require_roles(required_roles: list):
    """Decorator to require specific roles"""
    def decorator(func):
        def wrapper(event, context):
            # Extract token from Authorization header
            headers = event.get('headers', {})
            authorization = headers.get('Authorization') or headers.get('authorization')
            
            if not authorization:
                return {
                    'statusCode': 401,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'body': '{"message": "Authorization header required"}'
                }
            
            token = extract_token_from_header(authorization)
            if not token:
                return {
                    'statusCode': 401,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'body': '{"message": "Invalid authorization header format"}'
                }
            
            user = get_user_from_token(token)
            if not user:
                return {
                    'statusCode': 401,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'body': '{"message": "Invalid or expired token"}'
                }
            
            # Check if user has required roles
            user_roles = set(user['roles'])
            required_roles_set = set(required_roles)
            
            if not user_roles.intersection(required_roles_set):
                return {
                    'statusCode': 403,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'body': '{"message": "Insufficient permissions"}'
                }
            
            # Add user info to event for use in the function
            event['user'] = user
            
            return func(event, context)
        return wrapper
    return decorator

def require_auth(func):
    """Decorator to require authentication"""
    return require_roles([])(func)

def require_admin(func):
    """Decorator to require admin role"""
    return require_roles(['admin'])(func)

def sanitize_user_data(user_data: Dict[str, Any]) -> Dict[str, Any]:
    """Remove sensitive data from user object"""
    sensitive_fields = ['password_hash', 'password']
    return {k: v for k, v in user_data.items() if k not in sensitive_fields}

def format_user_response(user_data: Dict[str, Any]) -> Dict[str, Any]:
    """Format user data for API response"""
    # Convert Decimal to float for JSON serialization
    if 'id' in user_data:
        user_data['id'] = str(user_data['id'])
    
    # Convert datetime to ISO format
    datetime_fields = ['created_at', 'updated_at', 'last_login_at']
    for field in datetime_fields:
        if field in user_data and user_data[field]:
            if hasattr(user_data[field], 'isoformat'):
                user_data[field] = user_data[field].isoformat()
    
    # Ensure JSON fields are properly formatted
    json_fields = ['preferences']
    for field in json_fields:
        if field in user_data and user_data[field] is None:
            user_data[field] = {}
    
    return sanitize_user_data(user_data)
