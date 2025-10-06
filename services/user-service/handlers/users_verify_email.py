"""
Users Verify Email Handler for Gamarriando User Service
Handles email verification with token
"""

import json
import logging
import os
import sys
from typing import Dict, Any

sys.path.append('/var/task')
from db_utils import get_user_by_id, get_email_verification_token, mark_email_verification_token_verified, verify_user_email
from response_utils import (
    success_response, error_response, bad_request_response, not_found_response, unauthorized_response,
    cors_response, extract_request_data, validate_required_fields, get_user_id_from_path, log_request, log_response
)

logger = logging.getLogger()
logger.setLevel(logging.INFO)

def lambda_handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    try:
        log_request(event, context, 'users_verify_email')
        
        # Handle CORS preflight
        if event.get('httpMethod') == 'OPTIONS':
            return cors_response()
        
        # Get user ID from path parameters
        user_id = get_user_id_from_path(event)
        if not user_id:
            return error_response("User ID is required", 400)
        
        # Extract request data
        body = extract_request_data(event)
        
        # Validate required fields
        required_fields = ['token']
        validation_errors = validate_required_fields(body, required_fields)
        
        if validation_errors:
            return bad_request_response("Validation failed", {'errors': validation_errors})
        
        token = body['token'].strip()
        
        # Get user from database
        user = get_user_by_id(user_id)
        if not user:
            return not_found_response("User not found")
        
        # Check if user is already verified
        if user['is_verified']:
            return error_response("Email is already verified", 400)
        
        # Get email verification token from database
        token_data = get_email_verification_token(token)
        if not token_data:
            return unauthorized_response("Invalid or expired verification token")
        
        # Check if token belongs to the correct user
        if token_data['user_id'] != user_id:
            return unauthorized_response("Token does not match user")
        
        # Check if token has already been used
        if token_data['verified_at']:
            return unauthorized_response("Verification token has already been used")
        
        # Mark token as verified
        mark_email_verification_token_verified(token)
        
        # Mark user email as verified
        updated_rows = verify_user_email(user_id)
        
        if updated_rows == 0:
            return error_response("Failed to verify email", 500)
        
        # Prepare response data
        response_data = {
            'user_id': str(user_id),
            'email': user['email'],
            'username': user['username'],
            'is_verified': True,
            'message': 'Email has been verified successfully'
        }
        
        response = success_response(response_data, "Email verified successfully")
        log_response(response, 'users_verify_email')
        return response
        
    except ValueError as e:
        logger.error(f"Validation error in users_verify_email: {str(e)}")
        return bad_request_response(str(e))
    except Exception as e:
        logger.error(f"Error in users_verify_email: {str(e)}")
        return error_response("Failed to verify email", 500, str(e))
