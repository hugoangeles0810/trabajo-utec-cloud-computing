"""
Users Create Handler for Gamarriando User Service
Handles user creation (admin only)
"""

import json
import logging
import os
import sys
from typing import Dict, Any

sys.path.append('/var/task')
from db_utils import get_user_by_email, get_user_by_username, create_user
from auth_utils import (
    hash_password, validate_password_strength, validate_email, validate_username,
    require_admin, format_user_response
)
from response_utils import (
    success_response, error_response, bad_request_response, conflict_response,
    cors_response, extract_request_data, validate_required_fields, log_request, log_response
)

logger = logging.getLogger()
logger.setLevel(logging.INFO)

@require_admin
def lambda_handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    try:
        log_request(event, context, 'users_create')
        
        # Handle CORS preflight
        if event.get('httpMethod') == 'OPTIONS':
            return cors_response()
        
        # Extract request data
        body = extract_request_data(event)
        
        # Validate required fields
        required_fields = ['email', 'username', 'password', 'first_name', 'last_name']
        validation_errors = validate_required_fields(body, required_fields)
        
        if validation_errors:
            return bad_request_response("Validation failed", {'errors': validation_errors})
        
        email = body['email'].strip().lower()
        username = body['username'].strip()
        password = body['password']
        first_name = body['first_name'].strip()
        last_name = body['last_name'].strip()
        
        # Validate email format
        if not validate_email(email):
            return bad_request_response("Invalid email format")
        
        # Validate username format
        username_validation = validate_username(username)
        if not username_validation['is_valid']:
            return bad_request_response("Invalid username", {'errors': username_validation['errors']})
        
        # Validate password strength
        password_validation = validate_password_strength(password)
        if not password_validation['is_valid']:
            return bad_request_response("Weak password", {'errors': password_validation['errors']})
        
        # Check if user already exists
        existing_user_by_email = get_user_by_email(email)
        if existing_user_by_email:
            return conflict_response("User with this email already exists")
        
        existing_user_by_username = get_user_by_username(username)
        if existing_user_by_username:
            return conflict_response("Username already taken")
        
        # Hash password
        password_hash = hash_password(password)
        
        # Prepare user data
        user_data = {
            'email': email,
            'username': username,
            'password_hash': password_hash,
            'first_name': first_name,
            'last_name': last_name,
            'phone': body.get('phone', '').strip() if body.get('phone') else None,
            'date_of_birth': body.get('date_of_birth') if body.get('date_of_birth') else None,
            'is_active': body.get('is_active', True),
            'is_verified': body.get('is_verified', False),
            'is_admin': body.get('is_admin', False),
            'profile_picture_url': body.get('profile_picture_url', '').strip() if body.get('profile_picture_url') else None,
            'preferences': body.get('preferences', {})
        }
        
        # Create user
        user_id = create_user(user_data)
        
        # Get the created user for response
        from db_utils import get_user_by_id
        created_user = get_user_by_id(user_id)
        
        # Format user response
        response_data = format_user_response(created_user)
        
        response = success_response(response_data, "User created successfully", 201)
        log_response(response, 'users_create')
        return response
        
    except ValueError as e:
        logger.error(f"Validation error in users_create: {str(e)}")
        return bad_request_response(str(e))
    except Exception as e:
        logger.error(f"Error in users_create: {str(e)}")
        return error_response("Failed to create user", 500, str(e))
