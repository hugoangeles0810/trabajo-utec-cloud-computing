"""
Authentication Login Handler for Gamarriando User Service
Handles user login with JWT token generation
"""

import json
import logging
import os
import sys
from datetime import datetime, timedelta
from typing import Dict, Any

sys.path.append('/var/task')
from db_utils import get_user_by_email, get_user_roles, create_user_session, update_user_last_login
from auth_utils import verify_password, generate_token, generate_session_token, generate_refresh_token
from response_utils import (
    success_response, error_response, bad_request_response, unauthorized_response,
    cors_response, extract_request_data, validate_required_fields, log_request, log_response
)

logger = logging.getLogger()
logger.setLevel(logging.INFO)

def lambda_handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    try:
        log_request(event, context, 'auth_login')
        
        # Handle CORS preflight
        if event.get('httpMethod') == 'OPTIONS':
            return cors_response()
        
        # Extract request data
        body = extract_request_data(event)
        
        # Validate required fields
        required_fields = ['email', 'password']
        validation_errors = validate_required_fields(body, required_fields)
        
        if validation_errors:
            return bad_request_response("Validation failed", {'errors': validation_errors})
        
        email = body['email'].strip().lower()
        password = body['password']
        
        # Get user by email
        user = get_user_by_email(email)
        if not user:
            return unauthorized_response("Invalid email or password")
        
        # Check if user is active
        if not user['is_active']:
            return unauthorized_response("Account is deactivated")
        
        # Verify password
        if not verify_password(password, user['password_hash']):
            return unauthorized_response("Invalid email or password")
        
        # Get user roles
        roles = get_user_roles(user['id'])
        role_names = [role['role_name'] for role in roles]
        
        # Generate tokens
        access_token = generate_token(
            user['id'], 
            user['email'], 
            user['username'], 
            role_names, 
            'access'
        )
        
        refresh_token = generate_token(
            user['id'], 
            user['email'], 
            user['username'], 
            role_names, 
            'refresh'
        )
        
        # Generate session tokens
        session_token = generate_session_token()
        refresh_session_token = generate_refresh_token()
        
        # Calculate token expiration times
        config = {
            'access_token_expire_minutes': int(os.getenv('JWT_ACCESS_TOKEN_EXPIRE_MINUTES', '15')),
            'refresh_token_expire_days': int(os.getenv('JWT_REFRESH_TOKEN_EXPIRE_DAYS', '7'))
        }
        
        access_expires_at = datetime.utcnow() + timedelta(minutes=config['access_token_expire_minutes'])
        refresh_expires_at = datetime.utcnow() + timedelta(days=config['refresh_token_expire_days'])
        
        # Extract device info from request
        headers = event.get('headers', {})
        user_agent = headers.get('User-Agent', '')
        ip_address = headers.get('X-Forwarded-For', headers.get('X-Real-IP', ''))
        
        # Create session in database
        session_data = {
            'user_id': user['id'],
            'session_token': session_token,
            'refresh_token': refresh_session_token,
            'device_info': {
                'user_agent': user_agent,
                'login_time': datetime.utcnow().isoformat()
            },
            'ip_address': ip_address,
            'user_agent': user_agent,
            'expires_at': refresh_expires_at
        }
        
        session_id = create_user_session(session_data)
        
        # Update last login timestamp
        update_user_last_login(user['id'])
        
        # Prepare response data
        response_data = {
            'access_token': access_token,
            'refresh_token': refresh_token,
            'token_type': 'bearer',
            'expires_in': config['access_token_expire_minutes'] * 60,  # seconds
            'user': {
                'id': str(user['id']),
                'email': user['email'],
                'username': user['username'],
                'first_name': user['first_name'],
                'last_name': user['last_name'],
                'is_verified': user['is_verified'],
                'is_admin': user['is_admin'],
                'roles': role_names
            },
            'session_id': str(session_id)
        }
        
        response = success_response(response_data, "Login successful")
        log_response(response, 'auth_login')
        return response
        
    except ValueError as e:
        logger.error(f"Validation error in auth_login: {str(e)}")
        return bad_request_response(str(e))
    except Exception as e:
        logger.error(f"Error in auth_login: {str(e)}")
        return error_response("Failed to login", 500, str(e))
