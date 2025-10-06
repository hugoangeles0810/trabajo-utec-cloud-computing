"""
Authentication Refresh Handler for Gamarriando User Service
Handles JWT token refresh using refresh token
"""

import json
import logging
import os
import sys
from datetime import datetime, timedelta
from typing import Dict, Any

sys.path.append('/var/task')
from db_utils import get_user_by_id, get_user_roles
from auth_utils import verify_token, generate_token, extract_token_from_header
from response_utils import (
    success_response, error_response, bad_request_response, unauthorized_response,
    cors_response, extract_request_data, validate_required_fields, log_request, log_response
)

logger = logging.getLogger()
logger.setLevel(logging.INFO)

def lambda_handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    try:
        log_request(event, context, 'auth_refresh')
        
        # Handle CORS preflight
        if event.get('httpMethod') == 'OPTIONS':
            return cors_response()
        
        # Extract request data
        body = extract_request_data(event)
        
        # Validate required fields
        required_fields = ['refresh_token']
        validation_errors = validate_required_fields(body, required_fields)
        
        if validation_errors:
            return bad_request_response("Validation failed", {'errors': validation_errors})
        
        refresh_token = body['refresh_token']
        
        # Verify refresh token
        payload = verify_token(refresh_token)
        if not payload:
            return unauthorized_response("Invalid or expired refresh token")
        
        # Check if token is a refresh token
        if payload.get('type') != 'refresh':
            return unauthorized_response("Invalid token type")
        
        # Get user ID from token
        user_id = int(payload['sub'])
        
        # Get user from database
        user = get_user_by_id(user_id)
        if not user:
            return unauthorized_response("User not found")
        
        # Check if user is still active
        if not user['is_active']:
            return unauthorized_response("Account is deactivated")
        
        # Get user roles
        roles = get_user_roles(user['id'])
        role_names = [role['role_name'] for role in roles]
        
        # Generate new access token
        new_access_token = generate_token(
            user['id'], 
            user['email'], 
            user['username'], 
            role_names, 
            'access'
        )
        
        # Generate new refresh token (token rotation)
        new_refresh_token = generate_token(
            user['id'], 
            user['email'], 
            user['username'], 
            role_names, 
            'refresh'
        )
        
        # Get token expiration time
        config = {
            'access_token_expire_minutes': int(os.getenv('JWT_ACCESS_TOKEN_EXPIRE_MINUTES', '15'))
        }
        
        # Prepare response data
        response_data = {
            'access_token': new_access_token,
            'refresh_token': new_refresh_token,
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
            }
        }
        
        response = success_response(response_data, "Token refreshed successfully")
        log_response(response, 'auth_refresh')
        return response
        
    except ValueError as e:
        logger.error(f"Validation error in auth_refresh: {str(e)}")
        return bad_request_response(str(e))
    except Exception as e:
        logger.error(f"Error in auth_refresh: {str(e)}")
        return error_response("Failed to refresh token", 500, str(e))
