"""
Authentication Register Handler for Gamarriando User Service
Handles user registration with email verification
"""

import json
import logging
import os
import sys
from datetime import datetime, timedelta
from typing import Dict, Any

sys.path.append('/var/task')
from db_utils import get_user_by_email, get_user_by_username, create_user, create_email_verification_token
from auth_utils import hash_password, validate_password_strength, validate_email, validate_username, generate_email_verification_token
from response_utils import (
    success_response, error_response, bad_request_response, conflict_response, 
    cors_response, extract_request_data, validate_required_fields, log_request, log_response
)

logger = logging.getLogger()
logger.setLevel(logging.INFO)

def lambda_handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    try:
        log_request(event, context, 'auth_register')
        
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
            'is_active': True,
            'is_verified': False,
            'is_admin': False,
            'profile_picture_url': body.get('profile_picture_url', '').strip() if body.get('profile_picture_url') else None,
            'preferences': body.get('preferences', {})
        }
        
        # Create user
        user_id = create_user(user_data)
        
        # Generate email verification token
        verification_token = generate_email_verification_token()
        expires_at = datetime.utcnow() + timedelta(hours=24)  # Token expires in 24 hours
        
        # Create verification token in database
        create_email_verification_token(user_id, verification_token, expires_at)
        
        # Prepare response data (without sensitive information)
        response_data = {
            'user_id': str(user_id),
            'email': email,
            'username': username,
            'first_name': first_name,
            'last_name': last_name,
            'is_verified': False,
            'verification_token': verification_token,  # In production, this would be sent via email
            'message': 'User registered successfully. Please verify your email address.'
        }
        
        response = success_response(response_data, "User registered successfully", 201)
        log_response(response, 'auth_register')
        return response
        
    except ValueError as e:
        logger.error(f"Validation error in auth_register: {str(e)}")
        return bad_request_response(str(e))
    except Exception as e:
        logger.error(f"Error in auth_register: {str(e)}")
        return error_response("Failed to register user", 500, str(e))
