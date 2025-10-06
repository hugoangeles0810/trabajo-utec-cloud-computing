"""
Authentication Forgot Password Handler for Gamarriando User Service
Handles password reset request generation
"""

import json
import logging
import os
import sys
from datetime import datetime, timedelta
from typing import Dict, Any

sys.path.append('/var/task')
from db_utils import get_user_by_email, create_password_reset_token
from auth_utils import generate_password_reset_token, validate_email
from response_utils import (
    success_response, error_response, bad_request_response,
    cors_response, extract_request_data, validate_required_fields, log_request, log_response
)

logger = logging.getLogger()
logger.setLevel(logging.INFO)

def lambda_handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    try:
        log_request(event, context, 'auth_forgot_password')
        
        # Handle CORS preflight
        if event.get('httpMethod') == 'OPTIONS':
            return cors_response()
        
        # Extract request data
        body = extract_request_data(event)
        
        # Validate required fields
        required_fields = ['email']
        validation_errors = validate_required_fields(body, required_fields)
        
        if validation_errors:
            return bad_request_response("Validation failed", {'errors': validation_errors})
        
        email = body['email'].strip().lower()
        
        # Validate email format
        if not validate_email(email):
            return bad_request_response("Invalid email format")
        
        # Get user by email
        user = get_user_by_email(email)
        
        # Always return success to prevent email enumeration attacks
        # In production, you would send an email regardless of whether the user exists
        if user and user['is_active']:
            # Generate password reset token
            reset_token = generate_password_reset_token()
            expires_at = datetime.utcnow() + timedelta(hours=1)  # Token expires in 1 hour
            
            # Create reset token in database
            create_password_reset_token(user['id'], reset_token, expires_at)
            
            # In production, you would send an email here with the reset token
            # For now, we'll include it in the response for testing
            logger.info(f"Password reset token for {email}: {reset_token}")
        
        # Always return the same response to prevent email enumeration
        response_data = {
            'message': 'If the email address exists in our system, a password reset link has been sent.',
            'email': email,
            'expires_in': 3600  # 1 hour in seconds
        }
        
        # In development/testing, include the token in response
        if os.getenv('DEBUG', 'false').lower() == 'true' and user:
            response_data['reset_token'] = reset_token
        
        response = success_response(response_data, "Password reset request processed")
        log_response(response, 'auth_forgot_password')
        return response
        
    except ValueError as e:
        logger.error(f"Validation error in auth_forgot_password: {str(e)}")
        return bad_request_response(str(e))
    except Exception as e:
        logger.error(f"Error in auth_forgot_password: {str(e)}")
        return error_response("Failed to process password reset request", 500, str(e))
